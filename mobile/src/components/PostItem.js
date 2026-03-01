import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { api } from '../store/auth';

export default function PostItem({ post, token, onLike, onComment }) {
  const like = async () => {
    if (!token) return;
    await api.post(`/api/community/${post.id}/like`, {}, { headers: { Authorization: `Bearer ${token}` } });
    onLike?.();
  };

  return (
    <View style={styles.card}>
      <Text style={styles.author}>{post.author}</Text>
      <Text style={styles.meta}>{post.city} · {post.time}</Text>
      <Text style={styles.body}>{post.content}</Text>
      <View style={styles.row}>
        <TouchableOpacity onPress={like} style={styles.action}>
          <Text>❤️ {post.likes || 0}</Text>
        </TouchableOpacity>
        <Text style={styles.action}>💬 {(post.comments || []).length}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: '#e4ebdf' },
  author: { fontWeight: '700', color: '#1f2b2a', fontSize: 16 },
  meta: { color: '#708079', marginTop: 2 },
  body: { color: '#2b3c36', marginTop: 8, lineHeight: 20 },
  row: { flexDirection: 'row', marginTop: 10, gap: 16 },
  action: { color: '#1c6b44', fontWeight: '700' }
});
