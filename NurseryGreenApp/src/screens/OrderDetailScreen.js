import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, Spacing, Radius, Shadows } from '../constants/theme';
import { ORDER_STATUSES } from '../constants/data';
import api from '../api/client';

export default function OrderDetailScreen({ route, navigation }) {
  const { order: initialOrder } = route.params;
  const [order, setOrder] = useState(initialOrder);
  const [tracking, setTracking] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadTracking();
  }, []);

  const loadTracking = async () => {
    setLoading(true);
    try {
      const data = await api.trackOrder(order.orderId);
      setTracking(data);
    } catch (e) {
      console.log('Track error:', e);
    } finally {
      setLoading(false);
    }
  };

  const status = ORDER_STATUSES[order.orderStatus] || ORDER_STATUSES.pending;
  const date = new Date(order.orderDate || order.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  const trackingSteps = [
    { key: 'pending', label: 'Order Placed', icon: 'cart' },
    { key: 'confirmed', label: 'Confirmed', icon: 'checkmark-circle' },
    { key: 'processing', label: 'Processing', icon: 'construct' },
    { key: 'shipped', label: 'Shipped', icon: 'airplane' },
    { key: 'delivered', label: 'Delivered', icon: 'home' },
  ];

  const statusOrder = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
  const currentIdx = statusOrder.indexOf(order.orderStatus);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Order Details</Text>
        <View style={{ width: 30 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Order ID & Status */}
        <View style={styles.card}>
          <View style={styles.idRow}>
            <Text style={styles.orderId}>{order.orderId}</Text>
            <View style={[styles.statusBadge, { backgroundColor: status.color + '20' }]}>
              <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
            </View>
          </View>
          <Text style={styles.dateText}>Placed on {date}</Text>
        </View>

        {/* Tracking Timeline */}
        {order.orderStatus !== 'cancelled' && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Order Tracking</Text>
            {trackingSteps.map((step, idx) => {
              const completed = idx <= currentIdx;
              const isActive = idx === currentIdx;
              return (
                <View key={step.key} style={styles.trackStep}>
                  <View style={styles.trackLine}>
                    <View style={[
                      styles.trackDot,
                      completed && styles.trackDotCompleted,
                      isActive && styles.trackDotActive,
                    ]}>
                      <Ionicons
                        name={step.icon}
                        size={14}
                        color={completed ? Colors.white : Colors.textLight}
                      />
                    </View>
                    {idx < trackingSteps.length - 1 && (
                      <View style={[
                        styles.trackConnector,
                        completed && idx < currentIdx && styles.trackConnectorCompleted,
                      ]} />
                    )}
                  </View>
                  <View style={styles.trackInfo}>
                    <Text style={[styles.trackLabel, completed && styles.trackLabelCompleted]}>
                      {step.label}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* Items */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Items</Text>
          {(order.items || []).map((item, idx) => (
            <View key={idx} style={styles.itemRow}>
              <View style={styles.itemIcon}>
                <Ionicons name="leaf" size={16} color={Colors.primary} />
              </View>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.productName}</Text>
                <Text style={styles.itemMeta}>Qty: {item.quantity} × ₹{item.price}</Text>
              </View>
              <Text style={styles.itemPrice}>₹{item.subtotal || (item.price * item.quantity)}</Text>
            </View>
          ))}
        </View>

        {/* Shipping Address */}
        {order.shippingAddress && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Shipping Address</Text>
            <View style={styles.addressRow}>
              <Ionicons name="location-outline" size={18} color={Colors.primary} />
              <Text style={styles.addressText}>
                {order.shippingAddress.street}{'\n'}
                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}{'\n'}
                {order.shippingAddress.country}
              </Text>
            </View>
          </View>
        )}

        {/* Price Summary */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Price Summary</Text>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Subtotal</Text>
            <Text style={styles.priceValue}>₹{order.subtotal}</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Shipping</Text>
            <Text style={[styles.priceValue, order.shippingCharge === 0 && { color: Colors.success }]}>
              {order.shippingCharge === 0 ? 'FREE' : `₹${order.shippingCharge}`}
            </Text>
          </View>
          <View style={styles.priceDivider} />
          <View style={styles.priceRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>₹{order.totalAmount}</Text>
          </View>
        </View>

        {/* Tracking Info */}
        {tracking && tracking.trackingNumber && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Shipping Info</Text>
            <View style={styles.trackingInfo}>
              <Text style={styles.trackingLabel}>Carrier: {tracking.shippingCarrier || 'N/A'}</Text>
              <Text style={styles.trackingLabel}>Tracking: {tracking.trackingNumber}</Text>
              {tracking.estimatedDeliveryDate && (
                <Text style={styles.trackingLabel}>
                  Est. Delivery: {new Date(tracking.estimatedDeliveryDate).toLocaleDateString('en-IN')}
                </Text>
              )}
            </View>
          </View>
        )}

        <View style={{ height: 30 }} />
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
  backBtn: { padding: Spacing.xs },
  title: { ...Fonts.title, fontSize: 20 },
  scrollContent: { padding: Spacing.lg },
  card: {
    backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.lg,
    marginBottom: Spacing.md, ...Shadows.small,
  },
  idRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderId: { ...Fonts.title, fontSize: 18 },
  statusBadge: { paddingHorizontal: Spacing.md, paddingVertical: 4, borderRadius: Radius.full },
  statusText: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  dateText: { ...Fonts.caption, marginTop: 4 },
  sectionTitle: { ...Fonts.subtitle, fontSize: 16, marginBottom: Spacing.md },
  // Tracking Timeline
  trackStep: { flexDirection: 'row', marginBottom: 0 },
  trackLine: { alignItems: 'center', width: 30 },
  trackDot: {
    width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.card,
    alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: Colors.border,
  },
  trackDotCompleted: { backgroundColor: Colors.success, borderColor: Colors.success },
  trackDotActive: { backgroundColor: Colors.primary, borderColor: Colors.primary, transform: [{ scale: 1.1 }] },
  trackConnector: { width: 2, height: 24, backgroundColor: Colors.border },
  trackConnectorCompleted: { backgroundColor: Colors.success },
  trackInfo: { flex: 1, marginLeft: Spacing.md, justifyContent: 'center', minHeight: 52 },
  trackLabel: { ...Fonts.regular, color: Colors.textLight },
  trackLabelCompleted: { color: Colors.text, fontWeight: '600' },
  // Items
  itemRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.sm, borderBottomWidth: 1, borderBottomColor: Colors.divider },
  itemIcon: { width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.card, alignItems: 'center', justifyContent: 'center' },
  itemInfo: { flex: 1, marginLeft: Spacing.md },
  itemName: { ...Fonts.medium, fontSize: 14 },
  itemMeta: { ...Fonts.small, marginTop: 2 },
  itemPrice: { ...Fonts.bold, color: Colors.primaryDark },
  // Address
  addressRow: { flexDirection: 'row', alignItems: 'flex-start' },
  addressText: { ...Fonts.regular, marginLeft: Spacing.md, lineHeight: 22, color: Colors.textSecondary },
  // Price
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.sm },
  priceLabel: { ...Fonts.regular, color: Colors.textSecondary },
  priceValue: { ...Fonts.medium, fontSize: 14 },
  priceDivider: { height: 1, backgroundColor: Colors.divider, marginVertical: Spacing.md },
  totalLabel: { ...Fonts.bold, fontSize: 16 },
  totalValue: { fontSize: 20, fontWeight: '700', color: Colors.primaryDark },
  // Tracking info
  trackingInfo: {},
  trackingLabel: { ...Fonts.regular, marginBottom: 4, color: Colors.textSecondary },
});
