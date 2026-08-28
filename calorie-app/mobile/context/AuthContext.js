import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadUser(); }, []);

  async function loadUser() {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      try {
        const res = await api.get('/auth/me');
        setUser(res.data.user);
      } catch (e) {
        await AsyncStorage.removeItem('token');
      }
    }
    setLoading(false);
  }

  async function register(payload) {
    const res = await api.post('/auth/register', payload);
    await AsyncStorage.setItem('token', res.data.token);
    setUser(res.data.user);
  }

  async function login(email, password) {
    const res = await api.post('/auth/login', { email, password });
    await AsyncStorage.setItem('token', res.data.token);
    setUser(res.data.user);
  }

  async function logout() {
    await AsyncStorage.removeItem('token');
    setUser(null);
  }

  async function refreshUser() {
    const res = await api.get('/auth/me');
    setUser(res.data.user);
  }

  return (
    <AuthContext.Provider value={{ user, loading, register, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
