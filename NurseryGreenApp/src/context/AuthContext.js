import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('authToken');
      const storedUser = await AsyncStorage.getItem('userData');
      if (storedToken && storedUser) {
        api.setToken(storedToken);
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        // Verify token is still valid
        try {
          await api.verifyToken();
        } catch {
          // Token expired, clear auth
          await clearAuth();
        }
      }
    } catch (e) {
      console.log('Error loading auth:', e);
    } finally {
      setLoading(false);
    }
  };

  const login = async (authToken, userData) => {
    try {
      api.setToken(authToken);
      setToken(authToken);
      setUser(userData);
      await AsyncStorage.setItem('authToken', authToken);
      await AsyncStorage.setItem('userData', JSON.stringify(userData));
    } catch (e) {
      console.log('Error saving auth:', e);
    }
  };

  const clearAuth = async () => {
    api.setToken(null);
    setToken(null);
    setUser(null);
    await AsyncStorage.removeItem('authToken');
    await AsyncStorage.removeItem('userData');
  };

  const logout = async () => {
    await clearAuth();
  };

  const updateUser = (updatedData) => {
    const newUser = { ...user, ...updatedData };
    setUser(newUser);
    AsyncStorage.setItem('userData', JSON.stringify(newUser));
  };

  const isLoggedIn = !!token && !!user;

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      isLoggedIn,
      login,
      logout,
      updateUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}

export default AuthContext;
