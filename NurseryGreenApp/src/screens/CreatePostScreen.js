import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView,
  Alert, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, Spacing, Radius } from '../constants/theme';
import { COMMUNITY_CATEGORIES } from '../constants/data';
import api from '../api/client';

export default function CreatePostScreen({ navigation }) {
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('show-tell');
  const [loading, setLoading] = useState(false);

  const categories = COMMUNITY_CATEGORIES.filter(c => c.key !== 'all');

  const handlePost = async () => {
    if (!content.trim()) {
      Alert.alert('Empty Post', 'Please write something to share.');
      return;
    }
    setLoading(true);
    try {
      await api.createPost({ content: content.trim(), category, images: [] });
      Alert.alert('Posted!', 'Your post has been shared with the community.');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to create post.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.title}>New Post</Text>
        <TouchableOpacity
          style={[styles.postBtn, (!content.trim() || loading) && { opacity: 0.5 }]}
          onPress={handlePost}
          disabled={!content.trim() || loading}
        >
          {loading ? (
            <ActivityIndicator color={Colors.white} size="small" />
          ) : (
            <Text style={styles.postBtnText}>Post</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Category Selection */}
        <Text style={styles.label}>Category</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.key}
              style={[styles.catChip, category === cat.key && styles.catChipActive]}
              onPress={() => setCategory(cat.key)}
            >
              <Ionicons
                name={cat.icon}
                size={14}
                color={category === cat.key ? Colors.white : Colors.textSecondary}
              />
              <Text style={[styles.catText, category === cat.key && styles.catTextActive]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Content */}
        <Text style={styles.label}>What's on your mind?</Text>
        <TextInput
          style={styles.textArea}
          placeholder="Share your plant story, tips, or ask for help... 🌱"
          placeholderTextColor={Colors.textLight}
          value={content}
          onChangeText={setContent}
          multiline
          textAlignVertical="top"
          maxLength={500}
          autoFocus
        />
        <Text style={styles.charCount}>{content.length}/500</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.xl, paddingTop: 52, paddingBottom: Spacing.md,
    backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  cancelText: { ...Fonts.medium, color: Colors.textSecondary },
  title: { ...Fonts.subtitle },
  postBtn: {
    backgroundColor: Colors.primary, paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm, borderRadius: Radius.full,
  },
  postBtnText: { color: Colors.white, fontWeight: '700', fontSize: 14 },
  scrollContent: { padding: Spacing.xl },
  label: { ...Fonts.caption, fontWeight: '700', marginBottom: Spacing.sm, textTransform: 'uppercase', letterSpacing: 0.5 },
  catScroll: { marginBottom: Spacing.xl },
  catChip: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm, borderRadius: Radius.full,
    backgroundColor: Colors.surface, marginRight: Spacing.sm,
    borderWidth: 1, borderColor: Colors.border,
  },
  catChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  catText: { ...Fonts.small, fontWeight: '600', marginLeft: 4 },
  catTextActive: { color: Colors.white },
  textArea: {
    backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.lg,
    ...Fonts.regular, color: Colors.text, minHeight: 200, borderWidth: 1, borderColor: Colors.border,
    lineHeight: 22,
  },
  charCount: { ...Fonts.small, textAlign: 'right', marginTop: Spacing.sm },
});
