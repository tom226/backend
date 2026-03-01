import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, Spacing, Radius } from '../constants/theme';
import { COMMUNITY_CATEGORIES } from '../constants/data';
import { useAuth } from '../context/AuthContext';
import PostCard from '../components/PostCard';
import api from '../api/client';
import { haptic } from '../utils/platform';

const SEED_POSTS = [
  {
    id: 'seed1', author: 'Priya Singh', avatar: null, city: 'Lucknow',
    category: 'show-tell', content: 'My tulsi plant is thriving after using vermicompost! 🌿 The leaves are so green and vibrant now.',
    images: [], likes: 12, liked: false, comments: [
      { authorName: 'Rahul', text: 'Amazing! Which variety?' },
    ],
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'seed2', author: 'Arjun Patel', avatar: null, city: 'Mumbai',
    category: 'tips', content: 'Pro tip: Add neem cake powder to your soil mix before monsoon starts. It keeps pests away naturally! 🍃',
    images: [], likes: 28, liked: false, comments: [],
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: 'seed3', author: 'Meera Sharma', avatar: null, city: 'Delhi',
    category: 'help', content: 'My money plant leaves are turning yellow. Any suggestions? I water it twice a week. 😟',
    images: [], likes: 5, liked: false, comments: [
      { authorName: 'Plant Expert', text: 'Try reducing watering to once a week and add some liquid fertilizer.' },
    ],
    createdAt: new Date(Date.now() - 14400000).toISOString(),
  },
];

export default function CommunityScreen({ navigation }) {
  const { isLoggedIn } = useAuth();
  const [posts, setPosts] = useState(SEED_POSTS);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchPosts = useCallback(async () => {
    try {
      const data = await api.getCommunityPosts();
      if (data.posts && data.posts.length > 0) {
        setPosts(data.posts);
      }
    } catch (e) {
      // Keep seed posts on error
    }
  }, []);

  useEffect(() => {
    fetchPosts();
    const interval = setInterval(fetchPosts, 20000);
    return () => clearInterval(interval);
  }, [fetchPosts]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPosts();
    setRefreshing(false);
  };

  const handleLike = async (postId) => {
    if (!isLoggedIn) return;
    try {
      const result = await api.likePost(postId);
      setPosts(prev => prev.map(p =>
        (p.id === postId || p._id === postId) ? { ...p, likes: result.likes, liked: result.liked } : p
      ));
    } catch (e) {
      // Toggle locally
      setPosts(prev => prev.map(p =>
        (p.id === postId || p._id === postId) ?
          { ...p, liked: !p.liked, likes: p.liked ? (p.likes - 1) : (p.likes + 1) } : p
      ));
    }
  };

  const handleComment = async (postId, text) => {
    if (!isLoggedIn) return;
    try {
      const result = await api.commentOnPost(postId, text);
      setPosts(prev => prev.map(p =>
        (p.id === postId || p._id === postId) ? { ...p, comments: result.comments || [...(p.comments || []), result.comment] } : p
      ));
    } catch (e) {
      console.log('Comment error:', e);
    }
  };

  const filteredPosts = selectedCategory === 'all'
    ? posts
    : posts.filter(p => p.category === selectedCategory);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Community</Text>
        <TouchableOpacity
          style={styles.newPostBtn}
          onPress={() => {
            if (!isLoggedIn) {
              Alert.alert('Login Required', 'Please sign in to create a post.');
              return;
            }
            haptic.medium();
            navigation.navigate('CreatePost');
          }}
        >
          <Ionicons name="add" size={20} color={Colors.white} />
        </TouchableOpacity>
      </View>

      {/* Categories */}
      <FlatList
        data={COMMUNITY_CATEGORIES}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.key}
        contentContainerStyle={styles.categoriesContainer}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.categoryChip,
              selectedCategory === item.key && styles.categoryChipActive,
            ]}
            onPress={() => setSelectedCategory(item.key)}
          >
            <Ionicons
              name={item.icon}
              size={14}
              color={selectedCategory === item.key ? Colors.white : Colors.textSecondary}
            />
            <Text style={[
              styles.categoryText,
              selectedCategory === item.key && styles.categoryTextActive,
            ]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* Posts */}
      <FlatList
        data={filteredPosts}
        keyExtractor={(item) => item.id || item._id}
        renderItem={({ item }) => (
          <PostCard
            post={item}
            onLike={handleLike}
            onComment={handleComment}
            isLoggedIn={isLoggedIn}
          />
        )}
        contentContainerStyle={styles.postsList}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="chatbubbles-outline" size={48} color={Colors.textLight} />
            <Text style={styles.emptyText}>No posts in this category</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.xl, paddingTop: 52, paddingBottom: Spacing.md,
    backgroundColor: Colors.surface,
  },
  title: { ...Fonts.title },
  newPostBtn: {
    backgroundColor: Colors.primary, width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
  },
  categoriesContainer: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, backgroundColor: Colors.surface },
  categoryChip: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm, borderRadius: Radius.full,
    backgroundColor: Colors.card, marginRight: Spacing.sm,
  },
  categoryChipActive: { backgroundColor: Colors.primary },
  categoryText: { ...Fonts.small, fontWeight: '600', marginLeft: 4 },
  categoryTextActive: { color: Colors.white },
  postsList: { paddingTop: Spacing.md, paddingBottom: Spacing.xxxl },
  emptyState: { alignItems: 'center', paddingTop: 80 },
  emptyText: { ...Fonts.medium, color: Colors.textSecondary, marginTop: Spacing.md },
});
