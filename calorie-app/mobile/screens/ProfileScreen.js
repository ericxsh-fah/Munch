import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import api from '../api';

export default function ProfileScreen() {
  const { user, logout, refreshUser } = useAuth();
  const [weight, setWeight] = useState(user?.weight_kg ? String(user.weight_kg) : '');
  const [saving, setSaving] = useState(false);

  async function updateWeight() {
    if (!weight) return;
    setSaving(true);
    try {
      await api.post('/user/weight', { weight_kg: parseFloat(weight) });
      await refreshUser();
      Alert.alert('Salvat', 'Greutatea a fost actualizata.');
    } catch (e) {
      Alert.alert('Eroare', 'Nu am putut salva greutatea.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Profilul tau</Text>
      <Text style={styles.email}>{user?.email}</Text>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>Obiectiv caloric zilnic</Text>
        <Text style={styles.cardValue}>{user?.daily_calorie_goal} kcal</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>Macronutrienti tinta</Text>
        <Text style={styles.macroLine}>Proteine: {user?.daily_protein_goal}g</Text>
        <Text style={styles.macroLine}>Carbohidrati: {user?.daily_carbs_goal}g</Text>
        <Text style={styles.macroLine}>Grasimi: {user?.daily_fat_goal}g</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>Actualizeaza greutatea (kg)</Text>
        <View style={styles.row}>
          <TextInput style={styles.input} keyboardType="decimal-pad" value={weight} onChangeText={setWeight} />
          <TouchableOpacity style={styles.saveButton} onPress={updateWeight} disabled={saving}>
            <Text style={styles.saveButtonText}>{saving ? '...' : 'Salveaza'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Text style={styles.logoutText}>Deconectare</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7FAF7', padding: 16 },
  title: { fontSize: 24, fontWeight: '700', color: '#1F6B3A' },
  email: { color: '#6B7A6E', marginBottom: 20 },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 14 },
  cardLabel: { color: '#6B7A6E', fontSize: 13, marginBottom: 6 },
  cardValue: { fontSize: 20, fontWeight: '700', color: '#1F2D22' },
  macroLine: { fontSize: 15, color: '#1F2D22', marginTop: 2 },
  row: { flexDirection: 'row', gap: 10, marginTop: 6 },
  input: { flex: 1, borderWidth: 1, borderColor: '#E0E5E1', borderRadius: 10, padding: 10 },
  saveButton: { backgroundColor: '#2E9C4E', borderRadius: 10, justifyContent: 'center', paddingHorizontal: 16 },
  saveButtonText: { color: '#fff', fontWeight: '600' },
  logoutButton: { marginTop: 10, padding: 14, alignItems: 'center' },
  logoutText: { color: '#E05252', fontWeight: '600' }
});
