import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, Spacing, Radius, Shadows } from '../constants/theme';

export default function ProductCard({ product, onPress, onAddToCart }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <Image source={{ uri: product.image }} style={styles.image} />
      <View style={styles.info}>
        <Text style={styles.category}>{product.category}</Text>
        <Text style={styles.name} numberOfLines={1}>{product.name}</Text>
        <View style={styles.ratingRow}>
          <Ionicons name="star" size={13} color="#FFC107" />
          <Text style={styles.rating}>{product.rating}</Text>
          <Text style={styles.reviews}>({product.reviews})</Text>
        </View>
        <View style={styles.priceRow}>
          <Text style={styles.price}>₹{product.price}</Text>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={(e) => { e.stopPropagation?.(); onAddToCart?.(product); }}
          >
            <Ionicons name="add" size={18} color={Colors.white} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    flex: 1,
    margin: Spacing.sm,
    ...Shadows.small,
  },
  image: {
    width: '100%',
    height: 130,
    backgroundColor: Colors.card,
  },
  info: {
    padding: Spacing.md,
  },
  category: {
    ...Fonts.small,
    color: Colors.primary,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  name: {
    ...Fonts.medium,
    marginTop: 3,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  rating: {
    ...Fonts.caption,
    marginLeft: 3,
    color: Colors.text,
    fontWeight: '600',
  },
  reviews: {
    ...Fonts.small,
    marginLeft: 3,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  price: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.primaryDark,
  },
  addBtn: {
    backgroundColor: Colors.primary,
    width: 32,
    height: 32,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.small,
  },
});
