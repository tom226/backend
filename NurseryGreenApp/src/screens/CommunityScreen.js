import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Alert, Image, TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, Spacing, Radius } from '../constants/theme';
import { COMMUNITY_CATEGORIES } from '../constants/data';
import { useAuth } from '../context/AuthContext';
import PostCard from '../components/PostCard';
import api from '../api/client';
import { haptic } from '../utils/platform';

const APP_LOGO = require('../../assets/icon.png');

const LEVEL_LABELS = { seedling: '🌱 Seedling', sapling: '🌿 Sapling', tree: '🌳 Tree', forest: '🌲 Forest', expert: '👑 Expert' };

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
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({ members: 0, posts: 0, cities: 0 });
  const [profile, setProfile] = useState(null);
  const [notifCount, setNotifCount] = useState(0);
  const searchTimeout = useRef(null);

  const fetchPosts = useCallback(async (q) => {
    try {
      const params = {};
      if (q) params.q = q;
      if (selectedCategory !== 'all') params.category = selectedCategory;
      const data = await api.getCommunityPosts(params);
      if (data.posts && data.posts.length > 0) {
        setPosts(data.posts);
      }
    } catch (e) {
      // Keep seed posts on error
    }
  }, [selectedCategory]);

  const fetchStats = useCallback(async () => {
    try {
      const data = await api.getCommunityStats();
      setStats({ members: data.members || 0, posts: data.posts || 0, cities: data.cities || 0 });
    } catch (e) {}
  }, []);

  const fetchProfile = useCallback(async () => {
    if (!isLoggedIn) return;
    try {
      const data = await api.getMyProfile();
      setProfile(data);
    } catch (e) {}
  }, [isLoggedIn]);

  const fetchNotifCount = useCallback(async () => {
    if (!isLoggedIn) return;
    try {
      const data = await api.getNotifications();
      setNotifCount(data.unreadCount || 0);
    } catch (e) {}
  }, [isLoggedIn]);

  useEffect(() => {
    fetchPosts();
    fetchStats();
    fetchProfile();
    fetchNotifCount();
    const interval = setInterval(fetchPosts, 20000);
    return () => clearInterval(interval);
  }, [fetchPosts, fetchStats, fetchProfile, fetchNotifCount]);

  useEffect(() => {
    fetchPosts(searchQuery);
  }, [selectedCategory]);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchPosts(searchQuery), fetchStats(), fetchProfile(), fetchNotifCount()]);
    setRefreshing(false);
  };

  const onSearchChange = (text) => {
    setSearchQuery(text);
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      fetchPosts(text);
    }, 400);
  };

  const handleLike = async (postId) => {
    if (!isLoggedIn) return;
    try {
      const result = await api.likePost(postId);
      setPosts(prev => prev.map(p =>
        (p.id === postId || p._id === postId) ? { ...p, likes: result.likes, liked: result.liked } : p
      ));
    } catch (e) {
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

  const renderHeader = () => (
    <View>
      {/* Stats Bar */}
      <View style={styles.statsBar}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.members.toLocaleString()}</Text>
          <Text style={styles.statLabel}>Members</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.posts.toLocaleString()}</Text>
          <Text style={styles.statLabel}>Posts</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.cities.toLocaleString()}</Text>
          <Text style={styles.statLabel}>Cities</Text>
        </View>
      </View>

      {/* Gamification Card */}
      {profile && (
        <View style={styles.gamCard}>
          <Text style={styles.gamLevel}>{LEVEL_LABELS[profile.level] || '🌱 Seedling'}</Text>
          <View style={styles.gamRow}>
            <Text style={styles.gamLabel}>{(profile.points || 0).toLocaleString()} pts</Text>
            <Text style={styles.gamLabel}>🔥 {profile.streak?.current || 0}-day streak</Text>
          </View>
          {profile.badges && profile.badges.length > 0 && (
            <Text style={styles.gamBadges}>{profile.badges.map(b => b.icon).join(' ')}</Text>
          )}
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Community</Text>
        <View style={styles.headerRight}>
          {notifCount > 0 && (
            <View style={styles.notifBadge}>
              <Text style={styles.notifText}>{notifCount > 9 ? '9+' : notifCount}</Text>
            </View>
          )}
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
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={18} color={Colors.textLight} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search posts, #tags, topics..."
          placeholderTextColor={Colors.textLight}
          value={searchQuery}
          onChangeText={onSearchChange}
          returnKeyType="search"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => { setSearchQuery(''); fetchPosts(); }}>
            <Ionicons name="close-circle" size={18} color={Colors.textLight} />
          </TouchableOpacity>
        )}
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
            {item.icon === 'leaf' ? (
              <Image source={APP_LOGO} style={styles.categoryLogo} resizeMode="contain" />
            ) : (
              <Ionicons
                name={item.icon}
                size={14}
                color={selectedCategory === item.key ? Colors.white : Colors.textSecondary}
              />
            )}
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
        ListHeaderComponent={renderHeader}
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
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  title: { ...Fonts.title },
  newPostBtn: {
    backgroundColor: Colors.primary, width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
  },
  notifBadge: {
    backgroundColor: '#ef4444', minWidth: 20, height: 20, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5,
  },
  notifText: { color: '#fff', fontSize: 11, fontWeight: '800' },
  searchContainer: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.card, marginHorizontal: Spacing.lg, marginVertical: Spacing.sm,
    borderRadius: Radius.lg, paddingHorizontal: Spacing.md, height: 40,
    borderWidth: 1, borderColor: Colors.border || '#e5e7eb',
  },
  searchIcon: { marginRight: 6 },
  searchInput: {
    flex: 1, fontSize: 14, color: Colors.text, fontFamily: 'Manrope_400Regular',
  },
  statsBar: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    paddingVertical: Spacing.md, paddingHorizontal: Spacing.lg,
    backgroundColor: Colors.surface, marginBottom: Spacing.sm, borderRadius: Radius.lg,
    marginHorizontal: Spacing.lg,
  },
  statItem: { alignItems: 'center', flex: 1 },
  statValue: { fontSize: 18, fontWeight: '800', color: Colors.primary },
  statLabel: { fontSize: 11, color: Colors.textSecondary, marginTop: 2 },
  statDivider: { width: 1, height: 28, backgroundColor: Colors.border || '#e5e7eb' },
  gamCard: {
    backgroundColor: '#f0fdf4', marginHorizontal: Spacing.lg, marginBottom: Spacing.sm,
    borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1, borderColor: 'rgba(31,138,85,0.15)',
  },
  gamLevel: { fontSize: 15, fontWeight: '700', color: Colors.primary, marginBottom: 4 },
  gamRow: { flexDirection: 'row', justifyContent: 'space-between' },
  gamLabel: { fontSize: 12, color: Colors.textSecondary },
  gamBadges: { fontSize: 18, marginTop: 4 },
  categoriesContainer: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, backgroundColor: Colors.surface },
  categoryChip: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm, borderRadius: Radius.full,
    backgroundColor: Colors.card, marginRight: Spacing.sm,
  },
  categoryLogo: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  categoryChipActive: { backgroundColor: Colors.primary },
  categoryText: { ...Fonts.small, fontWeight: '600', marginLeft: 4 },
  categoryTextActive: { color: Colors.white },
  postsList: { paddingTop: Spacing.md, paddingBottom: Spacing.xxxl },
  emptyState: { alignItems: 'center', paddingTop: 80 },
  emptyText: { ...Fonts.medium, color: Colors.textSecondary, marginTop: Spacing.md },
});
