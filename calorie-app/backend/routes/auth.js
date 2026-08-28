const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { calculateFullGoals } = require('../utils/calculations');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { email, password, name, gender, birth_year, height_cm, weight_kg, activity_level, goal } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email si parola sunt obligatorii.' });
  }

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) {
    return res.status(409).json({ error: 'Exista deja un cont cu acest email.' });
  }

  const password_hash = await bcrypt.hash(password, 10);

  let goals = {};
  if (gender && birth_year && height_cm && weight_kg) {
    goals = calculateFullGoals({ gender, weight_kg, height_cm, birth_year, activity_level, goal });
  }

  const info = db.prepare(`
    INSERT INTO users (email, password_hash, name, gender, birth_year, height_cm, weight_kg, activity_level, goal, daily_calorie_goal, daily_protein_goal, daily_carbs_goal, daily_fat_goal)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    email, password_hash, name || null, gender || null, birth_year || null, height_cm || null, weight_kg || null,
    activity_level || 'moderate', goal || 'maintain',
    goals.calorieGoal || 2000, goals.protein || null, goals.carbs || null, goals.fat || null
  );

  const token = jwt.sign({ userId: info.lastInsertRowid }, process.env.JWT_SECRET, { expiresIn: '30d' });
  const user = db.prepare('SELECT id, email, name, daily_calorie_goal, daily_protein_goal, daily_carbs_goal, daily_fat_goal FROM users WHERE id = ?').get(info.lastInsertRowid);

  res.status(201).json({ token, user });
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user) return res.status(401).json({ error: 'Email sau parola incorecte.' });

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) return res.status(401).json({ error: 'Email sau parola incorecte.' });

  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '30d' });
  delete user.password_hash;
  res.json({ token, user });
});

// GET /api/auth/me
router.get('/me', authMiddleware, (req, res) => {
  const user = db.prepare(`
    SELECT id, email, name, gender, birth_year, height_cm, weight_kg, activity_level, goal,
           daily_calorie_goal, daily_protein_goal, daily_carbs_goal, daily_fat_goal
    FROM users WHERE id = ?
  `).get(req.userId);
  if (!user) return res.status(404).json({ error: 'Utilizator negasit.' });
  res.json({ user });
});

module.exports = router;
