// Formula Mifflin-St Jeor pentru rata metabolica bazala (BMR)
function calculateBMR({ gender, weight_kg, height_cm, age }) {
  const base = 10 * weight_kg + 6.25 * height_cm - 5 * age;
  return gender === 'female' ? base - 161 : base + 5;
}

const ACTIVITY_MULTIPLIERS = {
  sedentary: 1.2,      // munca de birou, fara sport
  light: 1.375,        // sport usor 1-3 zile/saptamana
  moderate: 1.55,      // sport moderat 3-5 zile/saptamana
  active: 1.725,       // sport intens 6-7 zile/saptamana
  very_active: 1.9     // sport foarte intens / munca fizica
};

function calculateTDEE(bmr, activityLevel) {
  const multiplier = ACTIVITY_MULTIPLIERS[activityLevel] || ACTIVITY_MULTIPLIERS.moderate;
  return bmr * multiplier;
}

// Ajusteaza caloriile in functie de obiectiv (deficit/surplus de ~15%)
function calculateGoalCalories(tdee, goal) {
  if (goal === 'lose') return Math.round(tdee * 0.85);
  if (goal === 'gain') return Math.round(tdee * 1.15);
  return Math.round(tdee);
}

// Distributie macro standard: 30% proteine, 40% carbohidrati, 30% grasimi
function calculateMacroGoals(calorieGoal) {
  return {
    protein: Math.round((calorieGoal * 0.3) / 4), // 4 kcal/g
    carbs: Math.round((calorieGoal * 0.4) / 4),    // 4 kcal/g
    fat: Math.round((calorieGoal * 0.3) / 9)       // 9 kcal/g
  };
}

function calculateFullGoals({ gender, weight_kg, height_cm, birth_year, activity_level, goal }) {
  const age = new Date().getFullYear() - birth_year;
  const bmr = calculateBMR({ gender, weight_kg, height_cm, age });
  const tdee = calculateTDEE(bmr, activity_level);
  const calorieGoal = calculateGoalCalories(tdee, goal);
  const macros = calculateMacroGoals(calorieGoal);
  return { bmr: Math.round(bmr), tdee: Math.round(tdee), calorieGoal, ...macros };
}

module.exports = { calculateBMR, calculateTDEE, calculateGoalCalories, calculateMacroGoals, calculateFullGoals };
