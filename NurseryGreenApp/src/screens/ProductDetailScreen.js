import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, Spacing, Radius, Shadows } from '../constants/theme';
import { useCart } from '../context/CartContext';
import { haptic } from '../utils/platform';

export default function ProductDetailScreen({ route, navigation }) {
  const { product } = route.params;
  const { addToCart, items } = useCart();
  const inCart = items.find(i => i.id === product.id);

  const handleAddToCart = () => {
    haptic.success();
    addToCart(product);
    Alert.alert('Added to Cart', `${product.name} added to your cart!`, [
      { text: 'Continue Shopping', style: 'cancel' },
      { text: 'View Cart', onPress: () => navigation.navigate('Cart') },
    ]);
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image */}
        <View style={styles.imageWrapper}>
          <Image source={{ uri: product.image }} style={styles.image} />
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color={Colors.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {/* Category & Rating */}
          <View style={styles.metaRow}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{product.category}</Text>
            </View>
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={14} color="#FFC107" />
              <Text style={styles.ratingText}>{product.rating}</Text>
              <Text style={styles.reviewsText}>({product.reviews} reviews)</Text>
            </View>
          </View>

          {/* Name & Price */}
          <Text style={styles.name}>{product.name}</Text>
          <Text style={styles.price}>₹{product.price}</Text>
          {product.weight && (
            <Text style={styles.weight}>{product.weight}</Text>
          )}

          {/* Description */}
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{product.description}</Text>

          {/* Benefits */}
          <Text style={styles.sectionTitle}>{product.benefits ? 'Benefits' : 'Features'}</Text>
          <View style={styles.featuresList}>
            {product.benefits && product.benefits.length > 0 ? (
              product.benefits.map((benefit, idx) => (
                <View key={idx} style={styles.featureItem}>
                  <Ionicons name="checkmark-circle" size={18} color={Colors.success} />
                  <Text style={styles.featureText}>{benefit}</Text>
                </View>
              ))
            ) : (
              <>
                <View style={styles.featureItem}>
                  <Ionicons name="checkmark-circle" size={18} color={Colors.success} />
                  <Text style={styles.featureText}>100% Organic</Text>
                </View>
                <View style={styles.featureItem}>
                  <Ionicons name="checkmark-circle" size={18} color={Colors.success} />
                  <Text style={styles.featureText}>Safe for all plants</Text>
                </View>
                <View style={styles.featureItem}>
                  <Ionicons name="checkmark-circle" size={18} color={Colors.success} />
                  <Text style={styles.featureText}>Easy to use</Text>
                </View>
              </>
            )}
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={18} color={Colors.success} />
              <Text style={styles.featureText}>Free shipping over ₹1999</Text>
            </View>
          </View>

          {/* Usage Instructions */}
          {product.usage && (
            <>
              <Text style={styles.sectionTitle}>How to Use</Text>
              <View style={styles.usageBox}>
                <Ionicons name="information-circle-outline" size={20} color={Colors.primary} />
                <Text style={styles.usageText}>{product.usage}</Text>
              </View>
            </>
          )}

          {/* Shipping info */}
          <View style={styles.shippingBox}>
            <Ionicons name="bicycle-outline" size={20} color={Colors.primary} />
            <View style={styles.shippingInfo}>
              <Text style={styles.shippingTitle}>Delivery</Text>
              <Text style={styles.shippingText}>Ships from Lucknow, UP. Estimated 5-7 business days.</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.bottomPrice}>
          <Text style={styles.bottomPriceLabel}>Price</Text>
          <Text style={styles.bottomPriceValue}>₹{product.price}</Text>
        </View>
        <TouchableOpacity style={styles.addToCartBtn} onPress={handleAddToCart} activeOpacity={0.85}>
          <Ionicons name="cart" size={20} color={Colors.white} />
          <Text style={styles.addToCartText}>
            {inCart ? `In Cart (${inCart.quantity})` : 'Add to Cart'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  imageWrapper: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 280,
    backgroundColor: Colors.card,
  },
  backBtn: {
    position: 'absolute',
    top: 48,
    left: Spacing.lg,
    backgroundColor: Colors.surface + 'EE',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.small,
  },
  content: {
    padding: Spacing.xl,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  categoryBadge: {
    backgroundColor: Colors.accentLight,
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  categoryText: {
    ...Fonts.small,
    color: Colors.primary,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    ...Fonts.medium,
    fontSize: 14,
    marginLeft: 4,
  },
  reviewsText: {
    ...Fonts.small,
    marginLeft: 4,
  },
  name: {
    ...Fonts.title,
    marginBottom: Spacing.sm,
  },
  price: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.primaryDark,
  },
  weight: {
    ...Fonts.caption,
    marginTop: 4,
  },
  sectionTitle: {
    ...Fonts.subtitle,
    fontSize: 16,
    marginTop: Spacing.xxl,
    marginBottom: Spacing.md,
  },
  description: {
    ...Fonts.regular,
    lineHeight: 22,
    color: Colors.textSecondary,
  },
  featuresList: {},
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  featureText: {
    ...Fonts.regular,
    marginLeft: Spacing.sm,
  },
  shippingBox: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    marginTop: Spacing.xl,
    marginBottom: 100,
  },
  shippingInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  shippingTitle: {
    ...Fonts.medium,
    fontSize: 14,
  },
  shippingText: {
    ...Fonts.caption,
    marginTop: 3,
    lineHeight: 18,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: Spacing.lg,
    paddingBottom: 30,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    ...Shadows.large,
  },
  bottomPrice: {
    marginRight: Spacing.xl,
  },
  bottomPriceLabel: {
    ...Fonts.small,
  },
  bottomPriceValue: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.primaryDark,
  },
  addToCartBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: Radius.lg,
    ...Shadows.small,
  },
  addToCartText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: 16,
    marginLeft: Spacing.sm,
  },
});
