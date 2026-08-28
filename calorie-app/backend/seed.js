// Populeaza baza de date cu alimente comune si cateva retete sanatoase de start.
// Ruleaza cu: npm run seed
const db = require('./db');

const foods = [
  ['Piept de pui (fara piele)', null, 165, 31, 0, 3.6, 0],
  ['Piept de curcan', null, 135, 30, 0, 1, 0],
  ['Ou de gaina', null, 155, 13, 1.1, 11, 0],
  ['Orez alb fiert', null, 130, 2.7, 28, 0.3, 0.4],
  ['Orez brun fiert', null, 111, 2.6, 23, 0.9, 1.8],
  ['Paste fainoase fierte', null, 158, 5.8, 31, 0.9, 1.8],
  ['Cartof fiert', null, 87, 1.9, 20, 0.1, 1.8],
  ['Cartof dulce copt', null, 90, 2, 21, 0.1, 3.3],
  ['Paine integrala', null, 247, 13, 41, 3.4, 7],
  ['Ovaz (fulgi)', null, 389, 16.9, 66, 6.9, 10.6],
  ['Lapte 1.5%', null, 47, 3.4, 5, 1.5, 0],
  ['Iaurt grecesc simplu', null, 59, 10, 3.6, 0.4, 0],
  ['Branza de vaci slaba', null, 98, 11, 3.4, 4.3, 0],
  ['Somon', null, 208, 20, 0, 13, 0],
  ['Ton in apa (conserva)', null, 116, 26, 0, 1, 0],
  ['Carne de vita macra', null, 250, 26, 0, 15, 0],
  ['Broccoli fiert', null, 35, 2.4, 7, 0.4, 3.3],
  ['Spanac crud', null, 23, 2.9, 3.6, 0.4, 2.2],
  ['Rosii', null, 18, 0.9, 3.9, 0.2, 1.2],
  ['Castraveti', null, 15, 0.7, 3.6, 0.1, 0.5],
  ['Avocado', null, 160, 2, 8.5, 14.7, 6.7],
  ['Banana', null, 89, 1.1, 23, 0.3, 2.6],
  ['Mar', null, 52, 0.3, 14, 0.2, 2.4],
  ['Migdale', null, 579, 21, 22, 50, 12.5],
  ['Nuci', null, 654, 15, 14, 65, 6.7],
  ['Ulei de masline', null, 884, 0, 0, 100, 0],
  ['Unt de arahide', null, 588, 25, 20, 50, 6],
  ['Linte fiarta', null, 116, 9, 20, 0.4, 7.9],
  ['Naut fiert', null, 164, 8.9, 27, 2.6, 7.6],
  ['Quinoa fiarta', null, 120, 4.4, 21, 1.9, 2.8],
  ['Zahar', null, 387, 0, 100, 0, 0],
  ['Miere', null, 304, 0.3, 82, 0, 0.2]
];

const insertFood = db.prepare(`
  INSERT INTO foods (name, brand, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fiber_per_100g)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);

const foodIds = {};
const insertAllFoods = db.transaction((items) => {
  for (const item of items) {
    const info = insertFood.run(...item);
    foodIds[item[0]] = info.lastInsertRowid;
  }
});

const existingCount = db.prepare('SELECT COUNT(*) as c FROM foods').get().c;
if (existingCount === 0) {
  insertAllFoods(foods);
  console.log(`${foods.length} alimente adaugate.`);
} else {
  console.log('Baza de alimente contine deja date, sar peste seed de alimente.');
  // reincarca id-urile existente pentru retete
  db.prepare('SELECT id, name FROM foods').all().forEach(f => { foodIds[f.name] = f.id; });
}

// --- Retete sanatoase de exemplu ---
const insertRecipe = db.prepare(`
  INSERT INTO recipes (title, description, servings, prep_time_minutes, instructions, calories_per_serving, protein_per_serving, carbs_per_serving, fat_per_serving)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`);
const insertIngredient = db.prepare('INSERT INTO recipe_ingredients (recipe_id, food_id, quantity_g) VALUES (?, ?, ?)');

function macros(items) {
  // items: [[foodName, grams], ...]
  let cal = 0, prot = 0, carbs = 0, fat = 0;
  const rows = [];
  items.forEach(([name, grams]) => {
    const food = db.prepare('SELECT * FROM foods WHERE id = ?').get(foodIds[name]);
    const factor = grams / 100;
    cal += food.calories_per_100g * factor;
    prot += food.protein_per_100g * factor;
    carbs += food.carbs_per_100g * factor;
    fat += food.fat_per_100g * factor;
    rows.push([foodIds[name], grams]);
  });
  return { cal, prot, carbs, fat, rows };
}

const recipeCount = db.prepare('SELECT COUNT(*) as c FROM recipes').get().c;
if (recipeCount === 0) {
  const recipesToSeed = [
    {
      title: 'Piept de pui cu orez brun si broccoli',
      description: 'Masa clasica fitness, bogata in proteine.',
      servings: 1,
      prep_time_minutes: 25,
      instructions: '1. Fierbe orezul brun.\n2. Condimenteaza pieptul de pui si prajeste-l in tigaie antiaderenta 6-7 min pe fiecare parte.\n3. Fierbe broccoli la abur 5 min.\n4. Serveste totul impreuna.',
      items: [['Piept de pui (fara piele)', 150], ['Orez brun fiert', 150], ['Broccoli fiert', 100], ['Ulei de masline', 5]]
    },
    {
      title: 'Bol de iaurt grecesc cu ovaz si fructe',
      description: 'Mic dejun rapid si sanatos.',
      servings: 1,
      prep_time_minutes: 5,
      instructions: '1. Pune iaurtul grecesc intr-un bol.\n2. Adauga fulgii de ovaz.\n3. Taie banana felii si adauga peste.\n4. Presara migdale maruntite si putina miere.',
      items: [['Iaurt grecesc simplu', 200], ['Ovaz (fulgi)', 40], ['Banana', 100], ['Migdale', 15], ['Miere', 10]]
    },
    {
      title: 'Salata de ton cu naut',
      description: 'Salata sateoasa, bogata in proteine si fibre.',
      servings: 2,
      prep_time_minutes: 10,
      instructions: '1. Amesteca tonul scurs cu naut fiert.\n2. Adauga rosii si castraveti taiati cubulete.\n3. Condimenteaza cu ulei de masline, sare si piper.',
      items: [['Ton in apa (conserva)', 160], ['Naut fiert', 150], ['Rosii', 100], ['Castraveti', 100], ['Ulei de masline', 10]]
    },
    {
      title: 'Toast cu avocado si ou',
      description: 'Mic dejun rapid, gras-sanatos.',
      servings: 1,
      prep_time_minutes: 10,
      instructions: '1. Prajeste feliile de paine integrala.\n2. Zdrobeste avocado peste paine.\n3. Adauga un ou ochi/fiert deasupra.\n4. Condimenteaza cu sare si piper.',
      items: [['Paine integrala', 60], ['Avocado', 80], ['Ou de gaina', 55]]
    },
    {
      title: 'Quinoa cu somon si spanac',
      description: 'Masa completa, bogata in Omega-3.',
      servings: 1,
      prep_time_minutes: 25,
      instructions: '1. Fierbe quinoa conform instructiunilor.\n2. Coace somonul la cuptor 15 min la 200°C.\n3. Caleste spanacul rapid intr-o tigaie cu putin ulei.\n4. Serveste toate componentele impreuna.',
      items: [['Quinoa fiarta', 150], ['Somon', 150], ['Spanac crud', 60], ['Ulei de masline', 8]]
    }
  ];

  recipesToSeed.forEach(r => {
    const { cal, prot, carbs, fat, rows } = macros(r.items);
    const info = insertRecipe.run(
      r.title, r.description, r.servings, r.prep_time_minutes, r.instructions,
      cal / r.servings, prot / r.servings, carbs / r.servings, fat / r.servings
    );
    rows.forEach(([foodId, grams]) => insertIngredient.run(info.lastInsertRowid, foodId, grams));
  });

  console.log(`${recipesToSeed.length} retete adaugate.`);
} else {
  console.log('Baza de retete contine deja date, sar peste seed de retete.');
}

console.log('Seed complet.');
