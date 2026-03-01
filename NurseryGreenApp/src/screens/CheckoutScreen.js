import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity,
  Alert, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, Spacing, Radius, Shadows } from '../constants/theme';
import { STATES, SHIPPING_RATES, FREE_SHIPPING_THRESHOLD } from '../constants/data';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import { haptic } from '../utils/platform';

export default function CheckoutScreen({ navigation }) {
  const { items, subtotal, clearCart } = useCart();
  const { user, isLoggedIn } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showStates, setShowStates] = useState(false);

  const [form, setForm] = useState({
    street: user?.address?.street || '',
    city: user?.address?.city || '',
    state: user?.address?.state || 'Uttar Pradesh',
    zipCode: user?.address?.zipCode || '',
    country: 'India',
    phone: user?.phone || '',
    notes: '',
    paymentMethod: 'cod',
  });

  const shippingRate = SHIPPING_RATES[form.state] || SHIPPING_RATES['Other'];
  const shippingCharge = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : shippingRate;
  const total = subtotal + shippingCharge;

  const handlePlaceOrder = async () => {
    if (!form.street || !form.city || !form.state || !form.zipCode || !form.phone) {
      Alert.alert('Missing Info', 'Please fill in all required fields.');
      return;
    }
    if (!isLoggedIn || user?.email === '') {
      Alert.alert('Login Required', 'Please login to place an order.', [
        { text: 'OK' },
      ]);
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        items: items.map(i => ({
          productName: i.name,
          productId: i.id,
          quantity: i.quantity,
          price: i.price,
          subtotal: i.price * i.quantity,
        })),
        shippingAddress: {
          street: form.street,
          city: form.city,
          state: form.state,
          zipCode: form.zipCode,
          country: form.country,
        },
        paymentMethod: form.paymentMethod,
        notes: form.notes,
      };
      const result = await api.createOrder(orderData);
      haptic.success();
      clearCart();
      Alert.alert(
        'Order Placed! 🎉',
        `Your order ${result.orderId} has been placed successfully.\nTotal: ₹${total}`,
        [{ text: 'View Orders', onPress: () => navigation.navigate('Orders') }]
      );
    } catch (error) {
      haptic.error();
      Alert.alert('Error', error.message || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Checkout</Text>
        <View style={{ width: 30 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Order Summary */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Order Summary</Text>
            {items.map(item => (
              <View key={item.id} style={styles.orderItem}>
                <Text style={styles.orderItemName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.orderItemQty}>x{item.quantity}</Text>
                <Text style={styles.orderItemPrice}>₹{item.price * item.quantity}</Text>
              </View>
            ))}
          </View>

          {/* Shipping Address */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Shipping Address</Text>

            <Text style={styles.inputLabel}>Phone *</Text>
            <TextInput
              style={styles.input}
              placeholder="Your phone number"
              placeholderTextColor={Colors.textLight}
              value={form.phone}
              onChangeText={(v) => setForm({ ...form, phone: v })}
              keyboardType="phone-pad"
            />

            <Text style={styles.inputLabel}>Street Address *</Text>
            <TextInput
              style={styles.input}
              placeholder="House/flat no, street name"
              placeholderTextColor={Colors.textLight}
              value={form.street}
              onChangeText={(v) => setForm({ ...form, street: v })}
            />

            <View style={styles.row}>
              <View style={styles.halfInput}>
                <Text style={styles.inputLabel}>City *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="City"
                  placeholderTextColor={Colors.textLight}
                  value={form.city}
                  onChangeText={(v) => setForm({ ...form, city: v })}
                />
              </View>
              <View style={styles.halfInput}>
                <Text style={styles.inputLabel}>ZIP Code *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="PIN Code"
                  placeholderTextColor={Colors.textLight}
                  value={form.zipCode}
                  onChangeText={(v) => setForm({ ...form, zipCode: v })}
                  keyboardType="number-pad"
                />
              </View>
            </View>

            <Text style={styles.inputLabel}>State *</Text>
            <TouchableOpacity
              style={styles.selectInput}
              onPress={() => setShowStates(!showStates)}
            >
              <Text style={styles.selectText}>{form.state}</Text>
              <Ionicons name="chevron-down" size={16} color={Colors.textSecondary} />
            </TouchableOpacity>
            {showStates && (
              <View style={styles.dropdown}>
                <ScrollView style={{ maxHeight: 200 }} nestedScrollEnabled>
                  {STATES.map(state => (
                    <TouchableOpacity
                      key={state}
                      style={[styles.dropdownItem, form.state === state && styles.dropdownItemActive]}
                      onPress={() => { setForm({ ...form, state }); setShowStates(false); }}
                    >
                      <Text style={[styles.dropdownText, form.state === state && { color: Colors.primary }]}>
                        {state}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            <Text style={styles.inputLabel}>Notes (optional)</Text>
            <TextInput
              style={[styles.input, { height: 60 }]}
              placeholder="Any special instructions..."
              placeholderTextColor={Colors.textLight}
              value={form.notes}
              onChangeText={(v) => setForm({ ...form, notes: v })}
              multiline
            />
          </View>

          {/* Payment */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Payment Method</Text>
            <TouchableOpacity
              style={[styles.paymentOption, form.paymentMethod === 'cod' && styles.paymentOptionActive]}
              onPress={() => setForm({ ...form, paymentMethod: 'cod' })}
            >
              <Ionicons
                name={form.paymentMethod === 'cod' ? 'radio-button-on' : 'radio-button-off'}
                size={20}
                color={form.paymentMethod === 'cod' ? Colors.primary : Colors.textLight}
              />
              <Text style={styles.paymentText}>Cash on Delivery</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.paymentOption, form.paymentMethod === 'online' && styles.paymentOptionActive]}
              onPress={() => setForm({ ...form, paymentMethod: 'online' })}
            >
              <Ionicons
                name={form.paymentMethod === 'online' ? 'radio-button-on' : 'radio-button-off'}
                size={20}
                color={form.paymentMethod === 'online' ? Colors.primary : Colors.textLight}
              />
              <Text style={styles.paymentText}>Online Payment</Text>
            </TouchableOpacity>
          </View>

          {/* Price Summary */}
          <View style={styles.section}>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Subtotal</Text>
              <Text style={styles.priceValue}>₹{subtotal}</Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Shipping ({form.state})</Text>
              <Text style={[styles.priceValue, shippingCharge === 0 && { color: Colors.success }]}>
                {shippingCharge === 0 ? 'FREE' : `₹${shippingCharge}`}
              </Text>
            </View>
            <View style={styles.priceDivider} />
            <View style={styles.priceRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>₹{total}</Text>
            </View>
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Place Order Button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.placeOrderBtn, loading && { opacity: 0.7 }]}
          onPress={handlePlaceOrder}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={20} color={Colors.white} />
              <Text style={styles.placeOrderText}>Place Order · ₹{total}</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
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
  backBtn: { padding: Spacing.xs },
  title: { ...Fonts.title, fontSize: 20 },
  scrollContent: { padding: Spacing.lg },
  section: {
    backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.lg,
    marginBottom: Spacing.md, ...Shadows.small,
  },
  sectionTitle: { ...Fonts.subtitle, fontSize: 16, marginBottom: Spacing.md },
  orderItem: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.sm,
    borderBottomWidth: 1, borderBottomColor: Colors.divider,
  },
  orderItemName: { ...Fonts.regular, flex: 1 },
  orderItemQty: { ...Fonts.caption, marginHorizontal: Spacing.md },
  orderItemPrice: { ...Fonts.medium, fontSize: 14, color: Colors.primaryDark },
  inputLabel: { ...Fonts.caption, fontWeight: '600', marginBottom: 4, marginTop: Spacing.md },
  input: {
    backgroundColor: Colors.card, borderRadius: Radius.md, paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md, ...Fonts.regular, color: Colors.text, borderWidth: 1, borderColor: Colors.borderLight,
  },
  row: { flexDirection: 'row', gap: Spacing.md },
  halfInput: { flex: 1 },
  selectInput: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: Colors.card, borderRadius: Radius.md, paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md, borderWidth: 1, borderColor: Colors.borderLight,
  },
  selectText: { ...Fonts.regular, color: Colors.text },
  dropdown: {
    backgroundColor: Colors.surface, borderRadius: Radius.md, marginTop: 4,
    borderWidth: 1, borderColor: Colors.border, ...Shadows.small,
  },
  dropdownItem: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.md },
  dropdownItemActive: { backgroundColor: Colors.accentLight },
  dropdownText: { ...Fonts.regular },
  paymentOption: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md, borderRadius: Radius.md, marginBottom: Spacing.sm,
    backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.borderLight,
  },
  paymentOptionActive: { borderColor: Colors.primary, backgroundColor: Colors.accentLight },
  paymentText: { ...Fonts.medium, fontSize: 14, marginLeft: Spacing.md },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.sm },
  priceLabel: { ...Fonts.regular, color: Colors.textSecondary },
  priceValue: { ...Fonts.medium, fontSize: 14 },
  priceDivider: { height: 1, backgroundColor: Colors.divider, marginVertical: Spacing.md },
  totalLabel: { ...Fonts.bold, fontSize: 16 },
  totalValue: { fontSize: 20, fontWeight: '700', color: Colors.primaryDark },
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: Colors.surface, padding: Spacing.lg, paddingBottom: 30,
    borderTopWidth: 1, borderTopColor: Colors.borderLight, ...Shadows.large,
  },
  placeOrderBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.primary, paddingVertical: 15, borderRadius: Radius.lg, ...Shadows.small,
  },
  placeOrderText: { color: Colors.white, fontWeight: '700', fontSize: 16, marginLeft: Spacing.sm },
});
