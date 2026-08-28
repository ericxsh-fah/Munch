import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// IMPORTANT: schimba acest IP cu adresa IP locala a calculatorului tau
// (gaseste-o cu `ipconfig` pe Windows sau `ifconfig`/`ipconfig getifaddr en0` pe Mac)
// Telefonul si calculatorul trebuie sa fie pe aceeasi retea WiFi.
const BASE_URL = 'https://calorie-app-backend-char.onrender.com/api';

const api = axios.create({ baseURL: BASE_URL });

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
