import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, Spacing, Radius, Shadows } from '../constants/theme';

export default function PostCard({ post, onLike, onComment, isLoggedIn }) {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');

  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString();
  };

  const handleSubmitComment = () => {
    if (commentText.trim()) {
      onComment?.(post.id || post._id, commentText.trim());
      setCommentText('');
    }
  };

  const categoryColors = {
    'show-tell': '#E8F5E9',
    help: '#FFF3E0',
    tips: '#E3F2FD',
    diy: '#FCE4EC',
    balcony: '#F3E5F5',
    terrace: '#E0F2F1',
    indoor: '#E8F5E9',
    organic: '#FFF8E1',
  };

  return (
    <View style={styles.card}>
      {/* Author row */}
      <View style={styles.authorRow}>
        <View style={styles.avatarWrap}>
          {post.avatar ? (
            <Image source={{ uri: post.avatar }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Text style={styles.avatarLetter}>
                {(post.author || post.authorName || 'U')[0].toUpperCase()}
              </Text>
            </View>
          )}
        </View>
        <View style={styles.authorInfo}>
          <View style={styles.authorNameRow}>
            <Text style={styles.authorName}>{post.author || post.authorName || 'Plant Lover'}</Text>
            {post.isExpertPost && (
              <View style={styles.expertBadge}>
                <Text style={styles.expertBadgeText}>✓ Expert</Text>
              </View>
            )}
          </View>
          <Text style={styles.meta}>
            {post.city ? `${post.city} · ` : ''}{timeAgo(post.createdAt || post.timestamp)}
          </Text>
        </View>
        {post.category && (
          <View style={[styles.categoryBadge, { backgroundColor: categoryColors[post.category] || Colors.card }]}>
            <Text style={styles.categoryText}>{post.category}</Text>
          </View>
        )}
      </View>

      {/* Scanner Diagnosis Badge */}
      {post.scanDiagnosis && (
        <View style={styles.scanBadge}>
          <Text style={styles.scanBadgeText}>
            🔬 Scanner: <Text style={{ fontWeight: '800' }}>{post.scanDiagnosis}</Text>
            {post.scanConfidence ? ` (${Math.round(post.scanConfidence * 100)}%)` : ''}
          </Text>
        </View>
      )}

      {/* Content */}
      <Text style={styles.content}>{post.content}</Text>

      {/* Images */}
      {post.images && post.images.length > 0 && (
        <View style={styles.imageRow}>
          {post.images.slice(0, 2).map((img, idx) => (
            <Image key={idx} source={{ uri: img }} style={styles.postImage} />
          ))}
        </View>
      )}

      {/* Product Suggestions */}
      {post.linkedProducts && post.linkedProducts.length > 0 && (
        <View style={styles.productRow}>
          <Text style={styles.productLabel}>🛒 Recommended:</Text>
          {post.linkedProducts.map((p, i) => (
            <View key={i} style={styles.productChip}>
              <Text style={styles.productChipText}>{p}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => onLike?.(post.id || post._id)}
        >
          <Ionicons
            name={post.liked ? 'heart' : 'heart-outline'}
            size={20}
            color={post.liked ? Colors.error : Colors.textSecondary}
          />
          <Text style={[styles.actionText, post.liked && { color: Colors.error }]}>
            {post.likes || 0}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => setShowComments(!showComments)}
        >
          <Ionicons name="chatbubble-outline" size={18} color={Colors.textSecondary} />
          <Text style={styles.actionText}>
            {(post.comments || []).length}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn}>
          <Ionicons name="share-social-outline" size={18} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Comments section */}
      {showComments && (
        <View style={styles.commentsSection}>
          {(post.comments || []).slice(-3).map((c, idx) => (
            <View key={idx} style={[styles.commentItem, c.isPinned && styles.bestAnswer]}>
              <View style={styles.commentAuthorRow}>
                <Text style={styles.commentAuthor}>{c.authorName || c.author || 'User'}</Text>
                {c.isExpert && <Text style={styles.expertDot}>✓</Text>}
                {c.isPinned && <Text style={styles.bestAnswerLabel}>✅ Best Answer</Text>}
              </View>
              <Text style={styles.commentText}>{c.text}</Text>
            </View>
          ))}
          {isLoggedIn && (
            <View style={styles.commentInput}>
              <TextInput
                style={styles.commentField}
                placeholder="Add a comment..."
                placeholderTextColor={Colors.textLight}
                value={commentText}
                onChangeText={setCommentText}
                onSubmitEditing={handleSubmitComment}
              />
              <TouchableOpacity onPress={handleSubmitComment} style={styles.sendBtn}>
                <Ionicons name="send" size={18} color={Colors.primary} />
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    padding: Spacing.lg,
    ...Shadows.small,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  avatarWrap: {},
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.card,
  },
  avatarPlaceholder: {
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  authorInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  authorNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  authorName: {
    ...Fonts.medium,
    fontSize: 14,
  },
  expertBadge: {
    backgroundColor: '#10b981',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  expertBadgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '800',
  },
  meta: {
    ...Fonts.small,
    marginTop: 1,
  },
  categoryBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radius.sm,
  },
  categoryText: {
    ...Fonts.small,
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  scanBadge: {
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#93c5fd',
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  scanBadgeText: {
    fontSize: 12,
    color: '#1e40af',
  },
  content: {
    ...Fonts.regular,
    lineHeight: 20,
    marginBottom: Spacing.md,
  },
  imageRow: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
  },
  postImage: {
    flex: 1,
    height: 150,
    borderRadius: Radius.md,
    marginRight: Spacing.sm,
    backgroundColor: Colors.card,
  },
  productRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#fefce8',
    borderWidth: 1,
    borderColor: '#fde68a',
    borderRadius: Radius.md,
    padding: Spacing.sm,
    marginBottom: Spacing.md,
  },
  productLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#92400e',
  },
  productChip: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#fde68a',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  productChipText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#92400e',
  },
  actions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
    paddingTop: Spacing.md,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: Spacing.xl,
  },
  actionText: {
    ...Fonts.caption,
    marginLeft: 5,
  },
  commentsSection: {
    marginTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
    paddingTop: Spacing.md,
  },
  commentItem: {
    marginBottom: Spacing.sm,
  },
  commentAuthorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  commentAuthor: {
    ...Fonts.caption,
    fontWeight: '700',
  },
  expertDot: {
    fontSize: 10,
    color: '#10b981',
    fontWeight: '800',
  },
  bestAnswer: {
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.2)',
    borderRadius: Radius.md,
    padding: Spacing.sm,
  },
  bestAnswerLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#059669',
  },
  commentText: {
    ...Fonts.caption,
    flex: 1,
  },
  commentInput: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.sm,
    backgroundColor: Colors.card,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
  },
  commentField: {
    flex: 1,
    paddingVertical: Spacing.sm,
    ...Fonts.caption,
    color: Colors.text,
  },
  sendBtn: {
    padding: Spacing.sm,
  },
});
