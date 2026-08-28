import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { useAuth } from '../context/AuthContext';

const ACTIVITY_OPTIONS = [
  { key: 'sedentary', label: 'Sedentar (fara sport)' },
  { key: 'light', label: 'Sport usor (1-3 zile/sapt.)' },
  { key: 'moderate', label: 'Sport moderat (3-5 zile/sapt.)' },
  { key: 'active', label: 'Sport intens (6-7 zile/sapt.)' },
  { key: 'very_active', label: 'Foarte activ / munca fizica' }
];

const GOAL_OPTIONS = [
  { key: 'lose', label: 'Vreau sa slabesc' },
  { key: 'maintain', label: 'Vreau sa mentin greutatea' },
  { key: 'gain', label: 'Vreau sa cresc in greutate' }
];

export default function RegisterScreen({ navigation }) {
  const { register } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    email: '', password: '', name: '',
    gender: 'male', birth_year: '', height_cm: '', weight_kg: '',
    activity_level: 'moderate', goal: 'maintain'
  });

  function update(field, value) { setForm(prev => ({ ...prev, [field]: value })); }

  async function handleSubmit() {
    if (!form.email || !form.password) return Alert.alert('Eroare', 'Email si parola sunt obligatorii.');
    setLoading(true);
    try {
      await register({
        ...form,
        birth_year: parseInt(form.birth_year, 10),
        height_cm: parseFloat(form.height_cm),
        weight_kg: parseFloat(form.weight_kg)
      });
    } catch (e) {
      Alert.alert('Eroare la inregistrare', e.response?.data?.error || 'Verifica datele si conexiunea la server.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Cont nou</Text>
      <Text style={styles.stepIndicator}>Pasul {step} din 3</Text>

      {step === 1 && (
        <View>
          <TextInput style={styles.input} placeholder="Nume" value={form.name} onChangeText={t => update('name', t)} />
          <TextInput style={styles.input} placeholder="Email" autoCapitalize="none" keyboardType="email-address" value={form.email} onChangeText={t => update('email', t)} />
          <TextInput style={styles.input} placeholder="Parola" secureTextEntry value={form.password} onChangeText={t => update('password', t)} />
          <TouchableOpacity style={styles.button} onPress={() => setStep(2)}>
            <Text style={styles.buttonText}>Continua</Text>
          </TouchableOpacity>
        </View>
      )}

      {step === 2 && (
        <View>
          <Text style={styles.label}>Gen</Text>
          <View style={styles.row}>
            {['male', 'female'].map(g => (
              <TouchableOpacity key={g} style={[styles.chip, form.gender === g && styles.chipActive]} onPress={() => update('gender', g)}>
                <Text style={[styles.chipText, form.gender === g && styles.chipTextActive]}>{g === 'male' ? 'Barbat' : 'Femeie'}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TextInput style={styles.input} placeholder="An nastere (ex: 1995)" keyboardType="number-pad" value={form.birth_year} onChangeText={t => update('birth_year', t)} />
          <TextInput style={styles.input} placeholder="Inaltime (cm)" keyboardType="decimal-pad" value={form.height_cm} onChangeText={t => update('height_cm', t)} />
          <TextInput style={styles.input} placeholder="Greutate (kg)" keyboardType="decimal-pad" value={form.weight_kg} onChangeText={t => update('weight_kg', t)} />

          <TouchableOpacity style={styles.button} onPress={() => setStep(3)}>
            <Text style={styles.buttonText}>Continua</Text>
          </TouchableOpacity>
        </View>
      )}

      {step === 3 && (
        <View>
          <Text style={styles.label}>Nivel de activitate</Text>
          {ACTIVITY_OPTIONS.map(opt => (
            <TouchableOpacity key={opt.key} style={[styles.optionRow, form.activity_level === opt.key && styles.optionRowActive]} onPress={() => update('activity_level', opt.key)}>
              <Text style={form.activity_level === opt.key ? styles.optionTextActive : styles.optionText}>{opt.label}</Text>
            </TouchableOpacity>
          ))}

          <Text style={[styles.label, { marginTop: 16 }]}>Obiectiv</Text>
          {GOAL_OPTIONS.map(opt => (
            <TouchableOpacity key={opt.key} style={[styles.optionRow, form.goal === opt.key && styles.optionRowActive]} onPress={() => update('goal', opt.key)}>
              <Text style={form.goal === opt.key ? styles.optionTextActive : styles.optionText}>{opt.label}</Text>
            </TouchableOpacity>
          ))}

          <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading}>
            <Text style={styles.buttonText}>{loading ? 'Se creeaza contul...' : 'Finalizeaza si calculeaza caloriile'}</Text>
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.link}>Ai deja cont? Autentifica-te</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 24, backgroundColor: '#F7FAF7' },
  title: { fontSize: 26, fontWeight: '700', textAlign: 'center', color: '#1F6B3A' },
  stepIndicator: { textAlign: 'center', color: '#6B7A6E', marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#3A4A3D', marginBottom: 8 },
  input: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: '#E0E5E1', fontSize: 16 },
  row: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  chip: { flex: 1, padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#E0E5E1', alignItems: 'center', backgroundColor: '#fff' },
  chipActive: { backgroundColor: '#2E9C4E', borderColor: '#2E9C4E' },
  chipText: { color: '#3A4A3D' },
  chipTextActive: { color: '#fff', fontWeight: '600' },
  optionRow: { backgroundColor: '#fff', padding: 14, borderRadius: 10, borderWidth: 1, borderColor: '#E0E5E1', marginBottom: 8 },
  optionRowActive: { backgroundColor: '#2E9C4E', borderColor: '#2E9C4E' },
  optionText: { color: '#3A4A3D' },
  optionTextActive: { color: '#fff', fontWeight: '600' },
  button: { backgroundColor: '#2E9C4E', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 8 },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  link: { textAlign: 'center', marginTop: 24, marginBottom: 24, color: '#2E9C4E', fontSize: 14 }
});
