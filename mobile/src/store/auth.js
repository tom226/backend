import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const AuthContext = React.createContext({ token: null, user: null });

export function AuthProvider({ children }) {
  const [token, setToken] = React.useState(null);
  const [user, setUser] = React.useState(null);
  const [booted, setBooted] = React.useState(false);

  React.useEffect(() => {
    (async () => {
      try {
        const storedToken = await AsyncStorage.getItem('authToken');
        const storedUser = await AsyncStorage.getItem('userData');
        if (storedToken) setToken(storedToken);
        if (storedUser) setUser(JSON.parse(storedUser));
      } catch (e) {
        console.warn('Auth restore failed', e);
      } finally {
        setBooted(true);
      }
    })();
  }, []);

  const saveSession = async (nextToken, nextUser) => {
    setToken(nextToken);
    setUser(nextUser);
    try {
      await AsyncStorage.setItem('authToken', nextToken || '');
      await AsyncStorage.setItem('userData', JSON.stringify(nextUser || {}));
    } catch (e) {
      console.warn('Persist failed', e);
    }
  };

  const logout = async () => {
    await saveSession(null, null);
  };

  const value = { token, user, booted, saveSession, logout };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default function useAuth() {
  return React.useContext(AuthContext);
}

// Axios helper
export const api = axios.create({ baseURL: 'https://backend-production-f128.up.railway.app' });

api.interceptors.request.use((config) => {
  if (global.__authToken) {
    config.headers.Authorization = `Bearer ${global.__authToken}`;
  }
  return config;
});
