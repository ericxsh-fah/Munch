import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import api from '../api';

export default function RecipesScreen({ navigation }) {
  const [recipes, setRecipes] = useState([]);
  const [query, setQuery] = useState('');

  const load = useCallback(async (q = '') => {
    const res = await api.get(`/recipes${q ? `?q=${encodeURIComponent(q)}` : ''}`);
    setRecipes(res.data.recipes);
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Rețete sănătoase</Text>
      <TextInput
        style={styles.searchInput}
        placeholder="Caută o rețetă..."
        value={query}
        onChangeText={t => { setQuery(t); load(t); }}
      />
      <FlatList
        data={recipes}
        keyExtractor={item => String(item.id)}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('RecipeDetail', { id: item.id })}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardDesc}>{item.description}</Text>
            <View style={styles.cardFooter}>
              <Text style={styles.cardStat}>{Math.round(item.calories_per_serving)} kcal/porție</Text>
              <Text style={styles.cardStat}>⏱ {item.prep_time_minutes} min</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7FAF7', padding: 16 },
  title: { fontSize: 24, fontWeight: '700', color: '#1F6B3A', marginBottom: 12 },
  searchInput: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: '#E0E5E1', fontSize: 16 },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 10 },
  cardTitle: { fontSize: 16, fontWeight: '600', color: '#1F2D22' },
  cardDesc: { color: '#6B7A6E', marginTop: 4, fontSize: 13 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  cardStat: { color: '#2E9C4E', fontWeight: '600', fontSize: 13 }
});
