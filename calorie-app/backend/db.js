const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'calorie-app.db'));
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT,
    gender TEXT,               -- 'male' | 'female'
    birth_year INTEGER,
    height_cm REAL,
    weight_kg REAL,
    activity_level TEXT DEFAULT 'moderate', -- sedentary|light|moderate|active|very_active
    goal TEXT DEFAULT 'maintain',           -- lose|maintain|gain
    daily_calorie_goal INTEGER,
    daily_protein_goal INTEGER,
    daily_carbs_goal INTEGER,
    daily_fat_goal INTEGER,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS foods (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    brand TEXT,
    calories_per_100g REAL NOT NULL,
    protein_per_100g REAL DEFAULT 0,
    carbs_per_100g REAL DEFAULT 0,
    fat_per_100g REAL DEFAULT 0,
    fiber_per_100g REAL DEFAULT 0,
    barcode TEXT,                    -- cod de bare EAN/UPC, daca a fost scanat
    created_by_user_id INTEGER,      -- NULL = aliment global din baza predefinita
    FOREIGN KEY(created_by_user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS recipes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    servings INTEGER DEFAULT 1,
    prep_time_minutes INTEGER,
    instructions TEXT,
    calories_per_serving REAL,
    protein_per_serving REAL,
    carbs_per_serving REAL,
    fat_per_serving REAL,
    created_by_user_id INTEGER,
    FOREIGN KEY(created_by_user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS recipe_ingredients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    recipe_id INTEGER NOT NULL,
    food_id INTEGER NOT NULL,
    quantity_g REAL NOT NULL,
    FOREIGN KEY(recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
    FOREIGN KEY(food_id) REFERENCES foods(id)
  );

  CREATE TABLE IF NOT EXISTS diary_entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    food_id INTEGER,
    recipe_id INTEGER,
    quantity_g REAL,
    meal TEXT NOT NULL,          -- breakfast|lunch|dinner|snack
    entry_date TEXT NOT NULL,    -- 'YYYY-MM-DD'
    calories REAL NOT NULL,
    protein REAL DEFAULT 0,
    carbs REAL DEFAULT 0,
    fat REAL DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(food_id) REFERENCES foods(id),
    FOREIGN KEY(recipe_id) REFERENCES recipes(id)
  );

  CREATE TABLE IF NOT EXISTS weight_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    weight_kg REAL NOT NULL,
    log_date TEXT NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE INDEX IF NOT EXISTS idx_diary_user_date ON diary_entries(user_id, entry_date);
  CREATE INDEX IF NOT EXISTS idx_foods_name ON foods(name);
  CREATE INDEX IF NOT EXISTS idx_foods_barcode ON foods(barcode);
`);

module.exports = db;
