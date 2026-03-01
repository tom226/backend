import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, ActivityIndicator, Alert } from 'react-native';
import { api } from '../store/auth';
import useAuth from '../store/auth';

export default function ProfileScreen() {
  const { token, user, logout, saveSession } = useAuth();
  const [firstName, setFirstName] = React.useState(user?.firstName || '');
  const [city, setCity] = React.useState(user?.address?.city || '');
  const [busy, setBusy] = React.useState(false);

  const saveProfile = async () => {
    if (!token) return;
    setBusy(true);
    try {
      const res = await api.put('/api/users/profile', {
        firstName,
        address: { city }
      }, { headers: { Authorization: `Bearer ${token}` } });
      saveSession(token, res.data.user || user);
      Alert.alert('Saved', 'Profile updated');
    } catch (e) {
      Alert.alert('Error', 'Could not save profile');
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      <TextInput
        style={styles.input}
        placeholder="Your name"
        value={firstName}
        onChangeText={setFirstName}
      />
      <TextInput
        style={styles.input}
        placeholder="City"
        value={city}
        onChangeText={setCity}
      />
      <TouchableOpacity style={styles.button} onPress={saveProfile} disabled={busy}>
        {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Save</Text>}
      </TouchableOpacity>
      <TouchableOpacity style={[styles.button, styles.logout]} onPress={logout}>
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f6f8f5' },
  title: { fontSize: 22, fontWeight: '700', color: '#1f2b2a', marginBottom: 12 },
  input: { backgroundColor: '#fff', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#dfe5d9', marginBottom: 10 },
  button: { backgroundColor: '#1c6b44', paddingVertical: 12, borderRadius: 12, alignItems: 'center', marginTop: 8 },
  logout: { backgroundColor: '#d9534f' },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 16 }
});
