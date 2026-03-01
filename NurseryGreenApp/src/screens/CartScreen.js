import React from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, Spacing, Radius, Shadows } from '../constants/theme';
import { useCart } from '../context/CartContext';
import { FREE_SHIPPING_THRESHOLD } from '../constants/data';
import { haptic } from '../utils/platform';

export default function CartScreen({ navigation }) {
  const { items, subtotal, itemCount, updateQuantity, removeFromCart, clearCart } = useCart();

  const shippingCharge = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : 100;
  const total = subtotal + shippingCharge;

  if (items.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Cart</Text>
          <View style={{ width: 30 }} />
        </View>
        <View style={styles.emptyState}>
          <View style={styles.emptyIcon}>
            <Ionicons name="cart-outline" size={60} color={Colors.textLight} />
          </View>
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptyText}>Browse our organic products and add items to your cart</Text>
          <TouchableOpacity
            style={styles.shopBtn}
            onPress={() => navigation.navigate('ShopTab')}
          >
            <Text style={styles.shopBtnText}>Start Shopping</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const renderCartItem = ({ item }) => (
    <View style={styles.cartItem}>
      <Image source={{ uri: item.image }} style={styles.itemImage} />
      <View style={styles.itemInfo}>
        <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.itemWeight}>{item.weight || item.category}</Text>
        <Text style={styles.itemPrice}>₹{item.price}</Text>
      </View>
      <View style={styles.quantityControls}>
        <TouchableOpacity
          style={styles.qtyBtn}
          onPress={() => { haptic.selection(); updateQuantity(item.id, item.quantity - 1); }}
        >
          <Ionicons name="remove" size={16} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.qtyText}>{item.quantity}</Text>
        <TouchableOpacity
          style={styles.qtyBtn}
          onPress={() => { haptic.selection(); updateQuantity(item.id, item.quantity + 1); }}
        >
          <Ionicons name="add" size={16} color={Colors.text} />
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        onPress={() => {
          Alert.alert('Remove Item', `Remove ${item.name} from cart?`, [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Remove', style: 'destructive', onPress: () => removeFromCart(item.id) },
          ]);
        }}
        style={styles.removeBtn}
      >
        <Ionicons name="trash-outline" size={18} color={Colors.error} />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Cart ({itemCount})</Text>
        <TouchableOpacity onPress={() => {
          Alert.alert('Clear Cart', 'Remove all items?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Clear', style: 'destructive', onPress: clearCart },
          ]);
        }}>
          <Text style={styles.clearText}>Clear</Text>
        </TouchableOpacity>
      </View>

      {/* Free shipping banner */}
      {subtotal < FREE_SHIPPING_THRESHOLD && (
        <View style={styles.shippingBanner}>
          <Ionicons name="bicycle-outline" size={16} color={Colors.primary} />
          <Text style={styles.shippingBannerText}>
            Add ₹{FREE_SHIPPING_THRESHOLD - subtotal} more for free shipping!
          </Text>
        </View>
      )}

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={renderCartItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />

      {/* Summary */}
      <View style={styles.summary}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Subtotal</Text>
          <Text style={styles.summaryValue}>₹{subtotal}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Shipping</Text>
          <Text style={[styles.summaryValue, shippingCharge === 0 && { color: Colors.success }]}>
            {shippingCharge === 0 ? 'FREE' : `₹${shippingCharge}`}
          </Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.summaryRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>₹{total}</Text>
        </View>

        <TouchableOpacity
          style={styles.checkoutBtn}
          onPress={() => navigation.navigate('Checkout')}
          activeOpacity={0.85}
        >
          <Text style={styles.checkoutBtnText}>Proceed to Checkout</Text>
          <Ionicons name="arrow-forward" size={18} color={Colors.white} />
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingTop: 52,
    paddingBottom: Spacing.md,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  backBtn: {
    padding: Spacing.xs,
  },
  title: {
    ...Fonts.title,
    fontSize: 20,
  },
  clearText: {
    ...Fonts.caption,
    color: Colors.error,
    fontWeight: '600',
  },
  shippingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.accentLight,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    padding: Spacing.md,
    borderRadius: Radius.md,
  },
  shippingBannerText: {
    ...Fonts.caption,
    color: Colors.primaryDark,
    fontWeight: '600',
    marginLeft: Spacing.sm,
  },
  list: {
    padding: Spacing.lg,
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    ...Shadows.small,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: Radius.md,
    backgroundColor: Colors.card,
  },
  itemInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  itemName: {
    ...Fonts.medium,
    fontSize: 14,
  },
  itemWeight: {
    ...Fonts.small,
    marginTop: 2,
  },
  itemPrice: {
    ...Fonts.bold,
    fontSize: 15,
    color: Colors.primaryDark,
    marginTop: 3,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: Radius.full,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  qtyBtn: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyText: {
    ...Fonts.medium,
    fontSize: 14,
    minWidth: 24,
    textAlign: 'center',
  },
  removeBtn: {
    padding: Spacing.sm,
    marginLeft: Spacing.sm,
  },
  summary: {
    backgroundColor: Colors.surface,
    padding: Spacing.xl,
    paddingBottom: 34,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    ...Shadows.large,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  summaryLabel: {
    ...Fonts.regular,
    color: Colors.textSecondary,
  },
  summaryValue: {
    ...Fonts.medium,
    fontSize: 14,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.divider,
    marginVertical: Spacing.md,
  },
  totalLabel: {
    ...Fonts.bold,
    fontSize: 16,
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.primaryDark,
  },
  checkoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 15,
    borderRadius: Radius.lg,
    marginTop: Spacing.lg,
    ...Shadows.small,
  },
  checkoutBtnText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: 16,
    marginRight: Spacing.sm,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xxxl,
  },
  emptyIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
  },
  emptyTitle: {
    ...Fonts.subtitle,
    marginBottom: Spacing.sm,
  },
  emptyText: {
    ...Fonts.regular,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  shopBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.md,
    borderRadius: Radius.full,
    marginTop: Spacing.xl,
  },
  shopBtnText: {
    color: Colors.white,
    fontWeight: '700',
  },
});
