import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import useAuth from '../store/auth';

const LOGIN_URL = 'https://thenurserygreen.com/login.html?redirect=community.html';

export default function LoginScreen() {
  const { saveSession, booted } = useAuth();
  const [showWeb, setShowWeb] = React.useState(false);

  const handleNavChange = (navState) => {
    try {
      const url = new URL(navState.url);
      const token = url.searchParams.get('token');
      const user = url.searchParams.get('user');
      if (token && user) {
        const parsedUser = JSON.parse(decodeURIComponent(user));
        global.__authToken = token;
        saveSession(token, parsedUser);
        setShowWeb(false);
      }
    } catch (e) {
      // ignore parse errors
    }
  };

  if (!booted) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1c6b44" />
      </View>
    );
  }

  if (showWeb) {
    return (
      <WebView
        source={{ uri: LOGIN_URL }}
        onNavigationStateChange={handleNavChange}
        startInLoadingState
      />
    );
  }

  return (
    <View style={styles.center}>
      <Text style={styles.title}>Plant Parents Community</Text>
      <Text style={styles.sub}>Sign in with your Nursery Green account.</Text>
      <TouchableOpacity style={styles.button} onPress={() => setShowWeb(true)}>
        <Text style={styles.buttonText}>Sign In</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: '#f6f8f5' },
  title: { fontSize: 24, fontWeight: '700', color: '#1f2b2a', marginBottom: 8 },
  sub: { fontSize: 16, color: '#4c5a55', marginBottom: 20, textAlign: 'center' },
  button: { backgroundColor: '#1c6b44', paddingVertical: 12, paddingHorizontal: 28, borderRadius: 12 },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 16 }
});
