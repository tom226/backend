import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, Spacing, Radius, Shadows } from '../constants/theme';
import { ORDER_STATUSES } from '../constants/data';

export default function OrderCard({ order, onPress }) {
  const status = ORDER_STATUSES[order.orderStatus] || ORDER_STATUSES.pending;
  const date = new Date(order.orderDate || order.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
  const itemCount = (order.items || []).reduce((s, i) => s + (i.quantity || 1), 0);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.topRow}>
        <View>
          <Text style={styles.orderId}>{order.orderId}</Text>
          <Text style={styles.date}>{date}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: status.color + '20' }]}>
          <View style={[styles.statusDot, { backgroundColor: status.color }]} />
          <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.itemsList}>
        {(order.items || []).slice(0, 3).map((item, idx) => (
          <Text key={idx} style={styles.itemName} numberOfLines={1}>
            {item.quantity}x {item.productName}
          </Text>
        ))}
        {(order.items || []).length > 3 && (
          <Text style={styles.moreItems}>+{order.items.length - 3} more items</Text>
        )}
      </View>

      <View style={styles.bottomRow}>
        <Text style={styles.itemCount}>{itemCount} item{itemCount !== 1 ? 's' : ''}</Text>
        <Text style={styles.total}>₹{order.totalAmount}</Text>
      </View>

      <View style={styles.trackRow}>
        <Ionicons name="location-outline" size={14} color={Colors.primary} />
        <Text style={styles.trackText}>Track Order</Text>
        <Ionicons name="chevron-forward" size={14} color={Colors.primary} />
      </View>
    </TouchableOpacity>
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
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  orderId: {
    ...Fonts.medium,
    fontWeight: '700',
  },
  date: {
    ...Fonts.caption,
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.divider,
    marginVertical: Spacing.md,
  },
  itemsList: {
    marginBottom: Spacing.sm,
  },
  itemName: {
    ...Fonts.regular,
    marginBottom: 3,
  },
  moreItems: {
    ...Fonts.small,
    color: Colors.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
  itemCount: {
    ...Fonts.caption,
  },
  total: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.primaryDark,
  },
  trackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
  trackText: {
    ...Fonts.caption,
    color: Colors.primary,
    fontWeight: '600',
    marginHorizontal: 5,
  },
});
