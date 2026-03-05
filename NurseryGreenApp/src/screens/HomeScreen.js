import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, Dimensions, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, Spacing, Radius, Shadows } from '../constants/theme';
import { PRODUCTS } from '../constants/data';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const { width } = Dimensions.get('window');
const APP_LOGO = require('../../assets/icon.png');

export default function HomeScreen({ navigation }) {
  const { user, isLoggedIn } = useAuth();
  const { itemCount, addToCart } = useCart();
  const [refreshing, setRefreshing] = useState(false);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const quickActions = [
    { icon: 'scan-outline', label: 'Scan Plant', screen: 'Scanner', color: '#43A047' },
    { icon: 'flash-outline', label: 'Energy', screen: 'Energy', color: '#FF9800' },
    { icon: 'cart-outline', label: 'Shop', screen: 'ShopTab', color: '#1E88E5' },
    { icon: 'people-outline', label: 'Community', screen: 'CommunityTab', color: '#7B1FA2' },
  ];

  const featuredProducts = PRODUCTS.slice(0, 4);

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <View>
          <Text style={styles.greeting}>{greeting()} 🌿</Text>
          <Text style={styles.userName}>
            {user?.firstName || user?.name?.split(' ')[0] || 'Plant Lover'}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.cartBtn}
          onPress={() => navigation.navigate('Cart')}
        >
          <Ionicons name="cart-outline" size={24} color={Colors.text} />
          {itemCount > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{itemCount > 9 ? '9+' : itemCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />}
      >
        {/* Hero Banner */}
        <View style={styles.heroBanner}>
          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>Your plants deserve the best care</Text>
            <Text style={styles.heroSubtitle}>
              Scan, diagnose, and nurture your green friends with expert guidance.
            </Text>
            <TouchableOpacity
              style={styles.heroBtn}
              onPress={() => navigation.navigate('Scanner')}
            >
              <Ionicons name="scan" size={16} color={Colors.white} />
              <Text style={styles.heroBtnText}>Scan Now</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.heroIcon}>
                <Image source={APP_LOGO} style={styles.heroLogo} resizeMode="contain" />
          </View>
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          {quickActions.map((action, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.actionCard}
              onPress={() => {
                if (action.screen === 'ShopTab') {
                  navigation.navigate('ShopTab');
                } else if (action.screen === 'CommunityTab') {
                  navigation.navigate('CommunityTab');
                } else {
                  navigation.navigate(action.screen);
                }
              }}
              activeOpacity={0.8}
            >
              <View style={[styles.actionIcon, { backgroundColor: action.color + '18' }]}>
                <Ionicons name={action.icon} size={24} color={action.color} />
              </View>
              <Text style={styles.actionLabel}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Stats cards */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
              <Image source={APP_LOGO} style={styles.statLogo} resizeMode="contain" />
            <Text style={styles.statValue}>10+</Text>
            <Text style={styles.statLabel}>Products</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="medkit" size={20} color="#E53935" />
            <Text style={styles.statValue}>15+</Text>
            <Text style={styles.statLabel}>Diseases</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="flash" size={20} color="#FF9800" />
            <Text style={styles.statValue}>20+</Text>
            <Text style={styles.statLabel}>Plant Energy</Text>
          </View>
        </View>

        {/* Featured Products */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Featured Products</Text>
          <TouchableOpacity onPress={() => navigation.navigate('ShopTab')}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.productsScroll}>
          {featuredProducts.map((product) => (
            <TouchableOpacity
              key={product.id}
              style={styles.featuredCard}
              onPress={() => navigation.navigate('ProductDetail', { product })}
              activeOpacity={0.85}
            >
              <Image source={{ uri: product.image }} style={styles.featuredImage} />
              <View style={styles.featuredInfo}>
                <Text style={styles.featuredCategory}>{product.category}</Text>
                <Text style={styles.featuredName} numberOfLines={1}>{product.name}</Text>
                <View style={styles.featuredPriceRow}>
                  <Text style={styles.featuredPrice}>₹{product.price}</Text>
                  <TouchableOpacity
                    style={styles.miniAddBtn}
                    onPress={() => addToCart(product)}
                  >
                    <Ionicons name="add" size={16} color={Colors.white} />
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Tips Banner */}
        <View style={styles.tipsBanner}>
          <Ionicons name="bulb" size={24} color="#FF9800" />
          <View style={styles.tipsContent}>
            <Text style={styles.tipsTitle}>Daily Plant Tip</Text>
            <Text style={styles.tipsText}>
              Water your plants early morning for best absorption. Avoid afternoon watering as it may cause leaf burn.
            </Text>
          </View>
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  topBar: {
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
  greeting: {
    ...Fonts.caption,
    color: Colors.textSecondary,
  },
  userName: {
    ...Fonts.title,
    fontSize: 20,
    marginTop: 2,
  },
  cartBtn: {
    position: 'relative',
    padding: Spacing.sm,
  },
  cartBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: Colors.error,
    borderRadius: 10,
    minWidth: 17,
    height: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadgeText: {
    color: Colors.white,
    fontSize: 9,
    fontWeight: '700',
  },
  heroBanner: {
    flexDirection: 'row',
    backgroundColor: Colors.primaryDark,
    margin: Spacing.lg,
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    ...Shadows.medium,
  },
  heroContent: {
    flex: 1,
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.white,
    lineHeight: 24,
  },
  heroSubtitle: {
    ...Fonts.caption,
    color: Colors.primaryMuted,
    marginTop: Spacing.sm,
    lineHeight: 18,
  },
  heroBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    marginTop: Spacing.lg,
  },
  heroBtnText: {
    color: Colors.white,
    fontWeight: '600',
    fontSize: 13,
    marginLeft: 6,
  },
  heroIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Spacing.md,
    opacity: 0.4,
  },
    heroLogo: {
      width: 72,
      height: 72,
      borderRadius: 36,
    },
  sectionTitle: {
    ...Fonts.subtitle,
    paddingHorizontal: Spacing.xl,
    marginTop: Spacing.xl,
    marginBottom: Spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: Spacing.xl,
  },
  seeAll: {
    ...Fonts.caption,
    color: Colors.primary,
    fontWeight: '700',
    marginTop: Spacing.xl,
  },
  actionsGrid: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  actionCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    ...Shadows.small,
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  actionLabel: {
    ...Fonts.small,
    fontWeight: '600',
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.xl,
    gap: Spacing.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    alignItems: 'center',
  },
    statLogo: {
      width: 20,
      height: 20,
      borderRadius: 10,
    },
  statValue: {
    ...Fonts.bold,
    fontSize: 20,
    marginTop: 4,
  },
  statLabel: {
    ...Fonts.small,
    marginTop: 2,
  },
  productsScroll: {
    paddingLeft: Spacing.lg,
  },
  featuredCard: {
    width: 160,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    marginRight: Spacing.md,
    overflow: 'hidden',
    ...Shadows.small,
  },
  featuredImage: {
    width: 160,
    height: 110,
    backgroundColor: Colors.card,
  },
  featuredInfo: {
    padding: Spacing.md,
  },
  featuredCategory: {
    ...Fonts.small,
    color: Colors.primary,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  featuredName: {
    ...Fonts.medium,
    fontSize: 13,
    marginTop: 2,
  },
  featuredPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  featuredPrice: {
    fontWeight: '700',
    color: Colors.primaryDark,
    fontSize: 15,
  },
  miniAddBtn: {
    backgroundColor: Colors.primary,
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipsBanner: {
    flexDirection: 'row',
    backgroundColor: '#FFF8E1',
    margin: Spacing.lg,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderLeftWidth: 3,
    borderLeftColor: '#FF9800',
  },
  tipsContent: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  tipsTitle: {
    ...Fonts.medium,
    fontSize: 14,
    color: '#E65100',
  },
  tipsText: {
    ...Fonts.caption,
    marginTop: 4,
    lineHeight: 18,
    color: '#795548',
  },
});
