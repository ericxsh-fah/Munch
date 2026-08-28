import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import api from '../api';

export default function BarcodeScannerScreen({ route, navigation }) {
  const { meal, date } = route.params;
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState('100');

  async function handleScan({ data }) {
    if (scanned || loading) return;
    setScanned(true);
    setLoading(true);
    try {
      const res = await api.get(`/foods/barcode/${data}`);
      setProduct(res.data.food);
    } catch (e) {
      Alert.alert(
        'Produs negasit',
        e.response?.data?.error || 'Nu am gasit acest produs in baza de date.',
        [{ text: 'Incearca din nou', onPress: () => { setScanned(false); setProduct(null); } }]
      );
    } finally {
      setLoading(false);
    }
  }

  async function confirmAdd() {
    try {
      await api.post('/diary', { food_id: product.id, quantity_g: parseFloat(quantity) || 100, meal, entry_date: date });
      navigation.goBack();
    } catch (e) {
      Alert.alert('Eroare', 'Nu am putut adauga in jurnal.');
    }
  }

  if (!permission) {
    return <View style={styles.center}><ActivityIndicator color="#2E9C4E" /></View>;
  }

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.permText}>Avem nevoie de acces la camera pentru a scana coduri de bare.</Text>
        <TouchableOpacity style={styles.permButton} onPress={requestPermission}>
          <Text style={styles.permButtonText}>Permite accesul la camera</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (product) {
    return (
      <View style={styles.container}>
        <Text style={styles.productName}>{product.name}</Text>
        {product.brand ? <Text style={styles.productBrand}>{product.brand}</Text> : null}
        <Text style={styles.productInfo}>{product.calories_per_100g} kcal / 100g</Text>
        <Text style={styles.macroInfo}>
          P: {product.protein_per_100g}g · C: {product.carbs_per_100g}g · G: {product.fat_per_100g}g
        </Text>

        <View style={styles.confirmBar}>
          <TextInput style={styles.quantityInput} keyboardType="decimal-pad" value={quantity} onChangeText={setQuantity} />
          <Text style={styles.quantityLabel}>grame</Text>
        </View>

        <TouchableOpacity style={styles.confirmButton} onPress={confirmAdd}>
          <Text style={styles.confirmButtonText}>Adauga in jurnal</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.retryButton} onPress={() => { setScanned(false); setProduct(null); }}>
          <Text style={styles.retryButtonText}>Scaneaza alt produs</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        barcodeScannerSettings={{ barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e'] }}
        onBarcodeScanned={scanned ? undefined : handleScan}
      />
      <View style={styles.overlay}>
        <View style={styles.scanBox} />
        <Text style={styles.overlayText}>
          {loading ? 'Se cauta produsul...' : 'Aliniaza codul de bare in cadru'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: '#F7FAF7' },
  permText: { textAlign: 'center', marginBottom: 16, color: '#3A4A3D' },
  permButton: { backgroundColor: '#2E9C4E', borderRadius: 12, padding: 14, paddingHorizontal: 24 },
  permButtonText: { color: '#fff', fontWeight: '600' },
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center' },
  scanBox: { width: 260, height: 140, borderWidth: 3, borderColor: '#2E9C4E', borderRadius: 12, backgroundColor: 'transparent' },
  overlayText: { color: '#fff', marginTop: 16, fontSize: 15, backgroundColor: 'rgba(0,0,0,0.5)', padding: 8, borderRadius: 8 },
  container: { flex: 1, backgroundColor: '#F7FAF7', padding: 24, justifyContent: 'center' },
  productName: { fontSize: 22, fontWeight: '700', color: '#1F2D22', textAlign: 'center' },
  productBrand: { textAlign: 'center', color: '#6B7A6E', marginTop: 4 },
  productInfo: { textAlign: 'center', fontSize: 18, fontWeight: '600', color: '#2E9C4E', marginTop: 16 },
  macroInfo: { textAlign: 'center', color: '#6B7A6E', marginTop: 6 },
  confirmBar: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 24, gap: 10 },
  quantityInput: { borderWidth: 1, borderColor: '#E0E5E1', borderRadius: 10, padding: 12, width: 90, textAlign: 'center', backgroundColor: '#fff', fontSize: 16 },
  quantityLabel: { color: '#6B7A6E' },
  confirmButton: { backgroundColor: '#2E9C4E', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 20 },
  confirmButtonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  retryButton: { padding: 14, alignItems: 'center', marginTop: 8 },
  retryButtonText: { color: '#2E9C4E' }
});
