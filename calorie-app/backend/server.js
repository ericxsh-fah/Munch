require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const foodRoutes = require('./routes/foods');
const diaryRoutes = require('./routes/diary');
const recipeRoutes = require('./routes/recipes');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => res.json({ status: 'ok', message: 'Calorie App API ruleaza.' }));

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/foods', foodRoutes);
app.use('/api/diary', diaryRoutes);
app.use('/api/recipes', recipeRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message || 'Eroare interna de server.' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server pornit pe http://localhost:${PORT}`));
