const express = require('express');
const db = require('../db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

// GET /api/foods/search?q=piept+de+pui
router.get('/search', (req, res) => {
  const q = (req.query.q || '').trim();
  if (!q) return res.json({ foods: [] });

  const foods = db.prepare(`
    SELECT * FROM foods
    WHERE (name LIKE ? OR brand LIKE ?) AND (created_by_user_id IS NULL OR created_by_user_id = ?)
    ORDER BY name ASC
    LIMIT 30
  `).all(`%${q}%`, `%${q}%`, req.userId);

  res.json({ foods });
});

// GET /api/foods/barcode/:code - cauta local, apoi in Open Food Facts (gratuit)
router.get('/barcode/:code', async (req, res) => {
  const { code } = req.params;

  // 1. Cauta local, ca sa nu interogam Open Food Facts de fiecare data
  let food = db.prepare('SELECT * FROM foods WHERE barcode = ?').get(code);
  if (food) return res.json({ food, source: 'local' });

  // 2. Interogheaza Open Food Facts (API public, gratuit, fara cheie)
  try {
    const response = await fetch(`https://world.openfoodfacts.org/api/v2/product/${code}.json`);
    const data = await response.json();

    if (data.status !== 1 || !data.product) {
      return res.status(404).json({ error: 'Produsul nu a fost gasit in baza Open Food Facts.' });
    }

    const p = data.product;
    const n = p.nutriments || {};
    const name = p.product_name || p.generic_name || 'Produs necunoscut';
    const calories = n['energy-kcal_100g'] ?? 0;
    const protein = n['proteins_100g'] ?? 0;
    const carbs = n['carbohydrates_100g'] ?? 0;
    const fat = n['fat_100g'] ?? 0;
    const fiber = n['fiber_100g'] ?? 0;

    // salvam produsul local (aliment global, reutilizabil de toti utilizatorii)
    const info = db.prepare(`
      INSERT INTO foods (name, brand, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fiber_per_100g, barcode, created_by_user_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, NULL)
    `).run(name, p.brands || null, calories, protein, carbs, fat, fiber, code);

    food = db.prepare('SELECT * FROM foods WHERE id = ?').get(info.lastInsertRowid);
    res.json({ food, source: 'openfoodfacts' });
  } catch (err) {
    res.status(502).json({ error: 'Nu am putut contacta Open Food Facts. Verifica conexiunea la internet.' });
  }
});

// POST /api/foods - creeaza un aliment custom (personal)
router.post('/', (req, res) => {
  const { name, brand, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fiber_per_100g } = req.body;
  if (!name || calories_per_100g == null) {
    return res.status(400).json({ error: 'Numele si caloriile per 100g sunt obligatorii.' });
  }

  const info = db.prepare(`
    INSERT INTO foods (name, brand, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fiber_per_100g, created_by_user_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(name, brand || null, calories_per_100g, protein_per_100g || 0, carbs_per_100g || 0, fat_per_100g || 0, fiber_per_100g || 0, req.userId);

  const food = db.prepare('SELECT * FROM foods WHERE id = ?').get(info.lastInsertRowid);
  res.status(201).json({ food });
});

module.exports = router;
