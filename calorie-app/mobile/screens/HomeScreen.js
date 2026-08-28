import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import api from '../api';

const MEAL_LABELS = { breakfast: 'Mic dejun', lunch: 'Pranz', dinner: 'Cina', snack: 'Gustari' };

function todayStr() {
  return new Date().toISOString().split('T')[0];
}

export default function HomeScreen({ navigation }) {
  const [data, setData] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const date = todayStr();

  const loadData = useCallback(async () => {
    try {
      const res = await api.get(`/diary/${date}`);
      setData(res.data);
    } catch (e) {
      console.log('Eroare incarcare jurnal', e.message);
    }
  }, [date]);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  async function onRefresh() {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }

  async function deleteEntry(id) {
    await api.delete(`/diary/${id}`);
    loadData();
  }

  if (!data) return <View style={styles.container}><Text>Se incarca...</Text></View>;

  const { totals, goals, byMeal } = data;
  const goalCalories = goals?.daily_calorie_goal || 2000;
  const remaining = Math.round(goalCalories - totals.calories);
  const progress = Math.min(totals.calories / goalCalories, 1);

  return (
    <ScrollView style={styles.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      <Text style={styles.dateLabel}>Astazi</Text>

      <View style={styles.summaryCard}>
        <Text style={styles.calorieNumber}>{Math.round(totals.calories)} / {goalCalories} kcal</Text>
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${progress * 100}%`, backgroundColor: remaining < 0 ? '#E05252' : '#2E9C4E' }]} />
        </View>
        <Text style={styles.remainingText}>
          {remaining >= 0 ? `${remaining} kcal ramase` : `${Math.abs(remaining)} kcal peste obiectiv`}
        </Text>

        <View style={styles.macroRow}>
          <MacroPill label="Proteine" value={Math.round(totals.protein)} goal={goals?.daily_protein_goal} />
          <MacroPill label="Carbo" value={Math.round(totals.carbs)} goal={goals?.daily_carbs_goal} />
          <MacroPill label="Grasimi" value={Math.round(totals.fat)} goal={goals?.daily_fat_goal} />
        </View>
      </View>

      {Object.keys(MEAL_LABELS).map(mealKey => (
        <View key={mealKey} style={styles.mealSection}>
          <View style={styles.mealHeader}>
            <Text style={styles.mealTitle}>{MEAL_LABELS[mealKey]}</Text>
            <TouchableOpacity onPress={() => navigation.navigate('AddFood', { meal: mealKey, date })}>
              <Text style={styles.addButton}>+ Adauga</Text>
            </TouchableOpacity>
          </View>

          {byMeal[mealKey].length === 0 && <Text style={styles.emptyText}>Nimic adaugat inca</Text>}

          {byMeal[mealKey].map(entry => (
            <TouchableOpacity key={entry.id} style={styles.entryRow} onLongPress={() => deleteEntry(entry.id)}>
              <Text style={styles.entryName}>{entry.food_name || entry.recipe_title}</Text>
              <Text style={styles.entryCalories}>{Math.round(entry.calories)} kcal</Text>
            </TouchableOpacity>
          ))}
        </View>
      ))}

      <Text style={styles.hint}>Tine apasat pe o intrare pentru a o sterge</Text>
    </ScrollView>
  );
}

function MacroPill({ label, value, goal }) {
  return (
    <View style={styles.macroPill}>
      <Text style={styles.macroValue}>{value}g</Text>
      <Text style={styles.macroLabel}>{label}{goal ? ` / ${goal}g` : ''}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7FAF7', padding: 16 },
  dateLabel: { fontSize: 22, fontWeight: '700', color: '#1F6B3A', marginBottom: 12 },
  summaryCard: { backgroundColor: '#fff', borderRadius: 16, padding: 20, marginBottom: 20, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  calorieNumber: { fontSize: 24, fontWeight: '700', textAlign: 'center', color: '#1F2D22' },
  progressBarBg: { height: 10, backgroundColor: '#E8EDE9', borderRadius: 5, marginTop: 12, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 5 },
  remainingText: { textAlign: 'center', marginTop: 8, color: '#6B7A6E' },
  macroRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 },
  macroPill: { flex: 1, alignItems: 'center' },
  macroValue: { fontSize: 16, fontWeight: '700', color: '#1F2D22' },
  macroLabel: { fontSize: 12, color: '#6B7A6E', marginTop: 2 },
  mealSection: { marginBottom: 18 },
  mealHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  mealTitle: { fontSize: 17, fontWeight: '600', color: '#1F2D22' },
  addButton: { color: '#2E9C4E', fontWeight: '600' },
  emptyText: { color: '#A0AAA2', fontStyle: 'italic', paddingVertical: 6 },
  entryRow: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#fff', padding: 12, borderRadius: 10, marginBottom: 6 },
  entryName: { color: '#1F2D22', flexShrink: 1 },
  entryCalories: { color: '#6B7A6E', fontWeight: '600' },
  hint: { textAlign: 'center', color: '#A0AAA2', fontSize: 12, marginBottom: 30 }
});
