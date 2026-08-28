const express = require('express');
const db = require('../db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

// GET /api/recipes?q=salata
router.get('/', (req, res) => {
  const q = (req.query.q || '').trim();
  const recipes = q
    ? db.prepare(`SELECT * FROM recipes WHERE title LIKE ? ORDER BY title ASC LIMIT 50`).all(`%${q}%`)
    : db.prepare(`SELECT * FROM recipes ORDER BY title ASC LIMIT 50`).all();
  res.json({ recipes });
});

// GET /api/recipes/:id - detaliu cu ingrediente
router.get('/:id', (req, res) => {
  const recipe = db.prepare('SELECT * FROM recipes WHERE id = ?').get(req.params.id);
  if (!recipe) return res.status(404).json({ error: 'Reteta negasita.' });

  const ingredients = db.prepare(`
    SELECT ri.quantity_g, f.id as food_id, f.name, f.calories_per_100g, f.protein_per_100g, f.carbs_per_100g, f.fat_per_100g
    FROM recipe_ingredients ri
    JOIN foods f ON ri.food_id = f.id
    WHERE ri.recipe_id = ?
  `).all(req.params.id);

  res.json({ recipe, ingredients });
});

// POST /api/recipes - creeaza reteta noua cu ingrediente
// body: { title, description, servings, prep_time_minutes, instructions, ingredients: [{food_id, quantity_g}] }
router.post('/', (req, res) => {
  const { title, description, servings, prep_time_minutes, instructions, ingredients } = req.body;
  if (!title || !ingredients || !ingredients.length) {
    return res.status(400).json({ error: 'Titlul si cel putin un ingredient sunt obligatorii.' });
  }

  // calculeaza totalurile nutritionale din ingrediente
  let totalCal = 0, totalProt = 0, totalCarbs = 0, totalFat = 0;
  const foodCache = ingredients.map(ing => {
    const food = db.prepare('SELECT * FROM foods WHERE id = ?').get(ing.food_id);
    if (!food) throw new Error(`Aliment ${ing.food_id} negasit`);
    const factor = ing.quantity_g / 100;
    totalCal += food.calories_per_100g * factor;
    totalProt += food.protein_per_100g * factor;
    totalCarbs += food.carbs_per_100g * factor;
    totalFat += food.fat_per_100g * factor;
    return { food_id: ing.food_id, quantity_g: ing.quantity_g };
  });

  const numServings = servings || 1;
  const info = db.prepare(`
    INSERT INTO recipes (title, description, servings, prep_time_minutes, instructions, calories_per_serving, protein_per_serving, carbs_per_serving, fat_per_serving, created_by_user_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(title, description || null, numServings, prep_time_minutes || null, instructions || null,
         totalCal / numServings, totalProt / numServings, totalCarbs / numServings, totalFat / numServings, req.userId);

  const insertIngredient = db.prepare('INSERT INTO recipe_ingredients (recipe_id, food_id, quantity_g) VALUES (?, ?, ?)');
  foodCache.forEach(ing => insertIngredient.run(info.lastInsertRowid, ing.food_id, ing.quantity_g));

  const recipe = db.prepare('SELECT * FROM recipes WHERE id = ?').get(info.lastInsertRowid);
  res.status(201).json({ recipe });
});

module.exports = router;
