import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { api } from '../store/auth';
import useAuth from '../store/auth';

export default function PostScreen() {
  const { token, user } = useAuth();
  const [content, setContent] = React.useState('');
  const [category, setCategory] = React.useState('show-tell');
  const [busy, setBusy] = React.useState(false);

  const submit = async () => {
    if (!token) {
      Alert.alert('Sign in', 'Please sign in to post.');
      return;
    }
    if (!content.trim()) {
      Alert.alert('Write something', 'Post content cannot be empty.');
      return;
    }
    setBusy(true);
    try {
      await api.post('/api/community', { content, category, images: [] }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setContent('');
      Alert.alert('Posted', 'Your post is live.');
    } catch (e) {
      Alert.alert('Error', 'Could not post right now.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 24 }}>
      <Text style={styles.label}>Share with the community</Text>
      <TextInput
        style={styles.input}
        placeholder="What's happening in your garden?"
        multiline
        value={content}
        onChangeText={setContent}
      />
      <Text style={styles.hint}>Category (plain text for now): {category}</Text>
      <TouchableOpacity style={styles.button} onPress={submit} disabled={busy}>
        {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Post 🌱</Text>}
      </TouchableOpacity>
      <Text style={styles.meta}>Signed in as: {user?.email || 'Guest'}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f6f8f5', padding: 16 },
  label: { fontSize: 18, fontWeight: '700', color: '#1f2b2a', marginBottom: 8 },
  input: { minHeight: 140, backgroundColor: '#fff', borderRadius: 12, padding: 12, textAlignVertical: 'top', borderWidth: 1, borderColor: '#dfe5d9' },
  hint: { marginTop: 8, color: '#5c6f68' },
  button: { marginTop: 16, backgroundColor: '#1c6b44', paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  meta: { marginTop: 16, color: '#4c5a55' }
});
