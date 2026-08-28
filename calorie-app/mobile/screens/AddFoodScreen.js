import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, Alert } from 'react-native';
import api from '../api';

export default function AddFoodScreen({ route, navigation }) {
  const { meal, date } = route.params;
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState(null);
  const [quantity, setQuantity] = useState('100');
  const [mode, setMode] = useState('foods'); // 'foods' | 'recipes'

  async function search(text) {
    setQuery(text);
    if (text.length < 2) return setResults([]);
    const endpoint = mode === 'foods' ? `/foods/search?q=${encodeURIComponent(text)}` : `/recipes?q=${encodeURIComponent(text)}`;
    const res = await api.get(endpoint);
    setResults(mode === 'foods' ? res.data.foods : res.data.recipes);
  }

  async function switchMode(newMode) {
    setMode(newMode);
    setResults([]);
    setQuery('');
    setSelected(null);
  }

  async function confirmAdd() {
    if (!selected) return;
    try {
      const payload = mode === 'foods'
        ? { food_id: selected.id, quantity_g: parseFloat(quantity) || 100, meal, entry_date: date }
        : { recipe_id: selected.id, quantity_g: parseFloat(quantity) || 1, meal, entry_date: date };

      await api.post('/diary', payload);
      navigation.goBack();
    } catch (e) {
      Alert.alert('Eroare', e.response?.data?.error || 'Nu am putut adauga in jurnal.');
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.tabRow}>
        <TouchableOpacity style={[styles.tab, mode === 'foods' && styles.tabActive]} onPress={() => switchMode('foods')}>
          <Text style={mode === 'foods' ? styles.tabTextActive : styles.tabText}>Alimente</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, mode === 'recipes' && styles.tabActive]} onPress={() => switchMode('recipes')}>
          <Text style={mode === 'recipes' ? styles.tabTextActive : styles.tabText}>Retete</Text>
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.searchInput}
        placeholder={mode === 'foods' ? 'Cauta un aliment (ex: piept de pui)' : 'Cauta o reteta (ex: salata)'}
        value={query}
        onChangeText={search}
      />

      {mode === 'foods' && (
        <TouchableOpacity style={styles.scanButton} onPress={() => navigation.navigate('BarcodeScanner', { meal, date })}>
          <Text style={styles.scanButtonText}>📷 Scaneaza cod de bare</Text>
        </TouchableOpacity>
      )}

      <FlatList
        data={results}
        keyExtractor={item => String(item.id)}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.resultRow, selected?.id === item.id && styles.resultRowSelected]}
            onPress={() => setSelected(item)}
          >
            <Text style={styles.resultName}>{item.name || item.title}</Text>
            <Text style={styles.resultInfo}>
              {mode === 'foods'
                ? `${item.calories_per_100g} kcal / 100g`
                : `${Math.round(item.calories_per_serving)} kcal / portie`}
            </Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={query.length >= 2 ? <Text style={styles.emptyText}>Niciun rezultat</Text> : null}
      />

      {selected && (
        <View style={styles.confirmBar}>
          <TextInput
            style={styles.quantityInput}
            keyboardType="decimal-pad"
            value={quantity}
            onChangeText={setQuantity}
          />
          <Text style={styles.quantityLabel}>{mode === 'foods' ? 'grame' : 'portii'}</Text>
          <TouchableOpacity style={styles.confirmButton} onPress={confirmAdd}>
            <Text style={styles.confirmButtonText}>Adauga</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7FAF7', padding: 16 },
  tabRow: { flexDirection: 'row', marginBottom: 12, gap: 10 },
  tab: { flex: 1, padding: 10, borderRadius: 10, backgroundColor: '#fff', alignItems: 'center', borderWidth: 1, borderColor: '#E0E5E1' },
  tabActive: { backgroundColor: '#2E9C4E', borderColor: '#2E9C4E' },
  tabText: { color: '#3A4A3D' },
  tabTextActive: { color: '#fff', fontWeight: '600' },
  searchInput: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: '#E0E5E1', fontSize: 16 },
  scanButton: { backgroundColor: '#1F6B3A', borderRadius: 12, padding: 14, alignItems: 'center', marginBottom: 12 },
  scanButtonText: { color: '#fff', fontWeight: '600', fontSize: 15 },
  resultRow: { backgroundColor: '#fff', padding: 14, borderRadius: 10, marginBottom: 6, flexDirection: 'row', justifyContent: 'space-between' },
  resultRowSelected: { borderWidth: 2, borderColor: '#2E9C4E' },
  resultName: { color: '#1F2D22', flexShrink: 1 },
  resultInfo: { color: '#6B7A6E', fontSize: 12 },
  emptyText: { textAlign: 'center', color: '#A0AAA2', marginTop: 20 },
  confirmBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 12, borderRadius: 12, gap: 10, marginTop: 8 },
  quantityInput: { borderWidth: 1, borderColor: '#E0E5E1', borderRadius: 8, padding: 10, width: 70, textAlign: 'center' },
  quantityLabel: { color: '#6B7A6E', flex: 1 },
  confirmButton: { backgroundColor: '#2E9C4E', borderRadius: 10, paddingVertical: 10, paddingHorizontal: 18 },
  confirmButtonText: { color: '#fff', fontWeight: '600' }
});
