import React from 'react';
import { View, Text, FlatList, RefreshControl, StyleSheet, ActivityIndicator } from 'react-native';
import { api } from '../store/auth';
import PostItem from '../components/PostItem';
import useAuth from '../store/auth';

export default function FeedScreen() {
  const { token } = useAuth();
  const [posts, setPosts] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);

  const fetchPosts = async () => 
    api.get('/api/community', token ? { headers: { Authorization: `Bearer ${token}` } } : {})
      .then((res) => setPosts(res.data.posts || []))
      .catch(() => {})
      .finally(() => setLoading(false));

  React.useEffect(() => {
    fetchPosts();
    const id = setInterval(fetchPosts, 20000);
    return () => clearInterval(id);
  }, [token]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPosts();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1c6b44" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={({ item }) => (
          <PostItem post={item} token={token} onLike={fetchPosts} onComment={fetchPosts} />
        )}
        ListEmptyComponent={<Text style={styles.empty}>No posts yet</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f6f8f5', paddingHorizontal: 12, paddingTop: 8 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f6f8f5' },
  empty: { textAlign: 'center', marginTop: 40, color: '#5c6f68' }
});
