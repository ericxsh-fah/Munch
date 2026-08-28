const express = require('express');
const db = require('../db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

// GET /api/diary/:date  (date = 'YYYY-MM-DD')  - toate intrarile + sumar zilei
router.get('/:date', (req, res) => {
  const { date } = req.params;

  const entries = db.prepare(`
    SELECT de.*, f.name as food_name, r.title as recipe_title
    FROM diary_entries de
    LEFT JOIN foods f ON de.food_id = f.id
    LEFT JOIN recipes r ON de.recipe_id = r.id
    WHERE de.user_id = ? AND de.entry_date = ?
    ORDER BY de.created_at ASC
  `).all(req.userId, date);

  const totals = entries.reduce((acc, e) => {
    acc.calories += e.calories;
    acc.protein += e.protein;
    acc.carbs += e.carbs;
    acc.fat += e.fat;
    return acc;
  }, { calories: 0, protein: 0, carbs: 0, fat: 0 });

  const user = db.prepare('SELECT daily_calorie_goal, daily_protein_goal, daily_carbs_goal, daily_fat_goal FROM users WHERE id = ?').get(req.userId);

  // grupare pe mese pentru afisare usoara in aplicatie
  const byMeal = { breakfast: [], lunch: [], dinner: [], snack: [] };
  entries.forEach(e => { if (byMeal[e.meal]) byMeal[e.meal].push(e); });

  res.json({ entries, byMeal, totals, goals: user });
});

// POST /api/diary - adauga o intrare (aliment SAU reteta)
router.post('/', (req, res) => {
  const { food_id, recipe_id, quantity_g, meal, entry_date } = req.body;
  if (!meal || !entry_date || (!food_id && !recipe_id)) {
    return res.status(400).json({ error: 'meal, entry_date si (food_id sau recipe_id) sunt obligatorii.' });
  }

  let calories = 0, protein = 0, carbs = 0, fat = 0;

  if (food_id) {
    const food = db.prepare('SELECT * FROM foods WHERE id = ?').get(food_id);
    if (!food) return res.status(404).json({ error: 'Aliment negasit.' });
    const factor = (quantity_g || 100) / 100;
    calories = food.calories_per_100g * factor;
    protein = food.protein_per_100g * factor;
    carbs = food.carbs_per_100g * factor;
    fat = food.fat_per_100g * factor;
  } else {
    const recipe = db.prepare('SELECT * FROM recipes WHERE id = ?').get(recipe_id);
    if (!recipe) return res.status(404).json({ error: 'Reteta negasita.' });
    const servings = quantity_g || 1; // pentru retete, quantity_g reprezinta nr. de portii
    calories = recipe.calories_per_serving * servings;
    protein = recipe.protein_per_serving * servings;
    carbs = recipe.carbs_per_serving * servings;
    fat = recipe.fat_per_serving * servings;
  }

  const info = db.prepare(`
    INSERT INTO diary_entries (user_id, food_id, recipe_id, quantity_g, meal, entry_date, calories, protein, carbs, fat)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(req.userId, food_id || null, recipe_id || null, quantity_g || null, meal, entry_date, calories, protein, carbs, fat);

  const entry = db.prepare('SELECT * FROM diary_entries WHERE id = ?').get(info.lastInsertRowid);
  res.status(201).json({ entry });
});

// DELETE /api/diary/:id
router.delete('/:id', (req, res) => {
  const entry = db.prepare('SELECT * FROM diary_entries WHERE id = ? AND user_id = ?').get(req.params.id, req.userId);
  if (!entry) return res.status(404).json({ error: 'Intrare negasita.' });
  db.prepare('DELETE FROM diary_entries WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

module.exports = router;
