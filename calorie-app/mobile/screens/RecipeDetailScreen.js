import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import api from '../api';

export default function RecipeDetailScreen({ route }) {
  const { id } = route.params;
  const [recipe, setRecipe] = useState(null);
  const [ingredients, setIngredients] = useState([]);

  useEffect(() => {
    api.get(`/recipes/${id}`).then(res => {
      setRecipe(res.data.recipe);
      setIngredients(res.data.ingredients);
    });
  }, [id]);

  async function addToTodayDiary() {
    try {
      const today = new Date().toISOString().split('T')[0];
      await api.post('/diary', { recipe_id: id, quantity_g: 1, meal: 'lunch', entry_date: today });
      Alert.alert('Adăugat', 'Rețeta a fost adăugată în jurnalul de azi (Prânz).');
    } catch (e) {
      Alert.alert('Eroare', 'Nu am putut adăuga rețeta în jurnal.');
    }
  }

  if (!recipe) return <View style={styles.container}><Text>Se încarcă...</Text></View>;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{recipe.title}</Text>
      <Text style={styles.description}>{recipe.description}</Text>

      <View style={styles.statsRow}>
        <Stat label="Calorii" value={`${Math.round(recipe.calories_per_serving)} kcal`} />
        <Stat label="Proteine" value={`${Math.round(recipe.protein_per_serving)}g`} />
        <Stat label="Carbo" value={`${Math.round(recipe.carbs_per_serving)}g`} />
        <Stat label="Grăsimi" value={`${Math.round(recipe.fat_per_serving)}g`} />
      </View>

      <Text style={styles.sectionTitle}>Ingrediente ({recipe.servings} porție/porții)</Text>
      {ingredients.map((ing, i) => (
        <Text key={i} style={styles.ingredientLine}>• {ing.name} — {ing.quantity_g}g</Text>
      ))}

      <Text style={styles.sectionTitle}>Preparare</Text>
      <Text style={styles.instructions}>{recipe.instructions}</Text>

      <TouchableOpacity style={styles.addButton} onPress={addToTodayDiary}>
        <Text style={styles.addButtonText}>Adaugă în jurnalul de azi</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function Stat({ label, value }) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7FAF7', padding: 16 },
  title: { fontSize: 24, fontWeight: '700', color: '#1F2D22' },
  description: { color: '#6B7A6E', marginTop: 6, marginBottom: 16 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 20 },
  statBox: { alignItems: 'center' },
  statValue: { fontWeight: '700', fontSize: 15, color: '#1F2D22' },
  statLabel: { fontSize: 11, color: '#6B7A6E', marginTop: 2 },
  sectionTitle: { fontSize: 17, fontWeight: '600', color: '#1F2D22', marginTop: 10, marginBottom: 8 },
  ingredientLine: { color: '#3A4A3D', marginBottom: 4, fontSize: 15 },
  instructions: { color: '#3A4A3D', lineHeight: 22, marginBottom: 30 },
  addButton: { backgroundColor: '#2E9C4E', borderRadius: 12, padding: 16, alignItems: 'center', marginBottom: 40 },
  addButtonText: { color: '#fff', fontWeight: '600', fontSize: 16 }
});
