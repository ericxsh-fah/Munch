const express = require('express');
const db = require('../db');
const authMiddleware = require('../middleware/auth');
const { calculateFullGoals } = require('../utils/calculations');

const router = express.Router();
router.use(authMiddleware);

// PUT /api/user/profile - actualizeaza datele fizice si recalculeaza obiectivele
router.put('/profile', (req, res) => {
  const { name, gender, birth_year, height_cm, weight_kg, activity_level, goal } = req.body;

  const goals = calculateFullGoals({ gender, weight_kg, height_cm, birth_year, activity_level, goal });

  db.prepare(`
    UPDATE users SET name=?, gender=?, birth_year=?, height_cm=?, weight_kg=?, activity_level=?, goal=?,
    daily_calorie_goal=?, daily_protein_goal=?, daily_carbs_goal=?, daily_fat_goal=?
    WHERE id=?
  `).run(name, gender, birth_year, height_cm, weight_kg, activity_level, goal,
         goals.calorieGoal, goals.protein, goals.carbs, goals.fat, req.userId);

  // Salveaza si o inregistrare in jurnalul de greutate
  const today = new Date().toISOString().split('T')[0];
  db.prepare('INSERT INTO weight_log (user_id, weight_kg, log_date) VALUES (?, ?, ?)').run(req.userId, weight_kg, today);

  const user = db.prepare('SELECT id, email, name, daily_calorie_goal, daily_protein_goal, daily_carbs_goal, daily_fat_goal FROM users WHERE id = ?').get(req.userId);
  res.json({ user, goals });
});

// GET /api/user/weight-history
router.get('/weight-history', (req, res) => {
  const rows = db.prepare('SELECT weight_kg, log_date FROM weight_log WHERE user_id = ? ORDER BY log_date ASC').all(req.userId);
  res.json({ history: rows });
});

// POST /api/user/weight - adauga o singura inregistrare de greutate (fara a schimba profilul)
router.post('/weight', (req, res) => {
  const { weight_kg, log_date } = req.body;
  const date = log_date || new Date().toISOString().split('T')[0];
  db.prepare('INSERT INTO weight_log (user_id, weight_kg, log_date) VALUES (?, ?, ?)').run(req.userId, weight_kg, date);
  db.prepare('UPDATE users SET weight_kg = ? WHERE id = ?').run(weight_kg, req.userId);
  res.status(201).json({ success: true });
});

module.exports = router;
