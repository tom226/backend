import React from 'react';
import { View, ActivityIndicator, StyleSheet, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { haptic, isIOS } from '../utils/platform';

// Screens
import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import ShopScreen from '../screens/ShopScreen';
import ProductDetailScreen from '../screens/ProductDetailScreen';
import CartScreen from '../screens/CartScreen';
import CheckoutScreen from '../screens/CheckoutScreen';
import ScannerScreen from '../screens/ScannerScreen';
import EnergyDetailScreen from '../screens/EnergyDetailScreen';
import CommunityScreen from '../screens/CommunityScreen';
import CreatePostScreen from '../screens/CreatePostScreen';
import ProfileScreen from '../screens/ProfileScreen';
import OrdersScreen from '../screens/OrdersScreen';
import OrderDetailScreen from '../screens/OrderDetailScreen';
import PaymentScreen from '../screens/PaymentScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function HomeTabs() {
  const { itemCount } = useCart();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: Colors.tabActive,
        tabBarInactiveTintColor: Colors.tabInactive,
        tabBarStyle: {
          backgroundColor: isIOS ? 'rgba(255,255,255,0.92)' : Colors.surface,
          borderTopColor: Colors.borderLight,
          borderTopWidth: isIOS ? 0.5 : 1,
          paddingTop: 4,
          paddingBottom: isIOS ? 28 : 8,
          height: isIOS ? 85 : 60,
          elevation: 8,
          shadowColor: Colors.primaryDark,
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.08,
          shadowRadius: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'HomeTab') iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'ShopTab') iconName = focused ? 'storefront' : 'storefront-outline';
          else if (route.name === 'ScannerTab') iconName = focused ? 'scan' : 'scan-outline';
          else if (route.name === 'CommunityTab') iconName = focused ? 'people' : 'people-outline';
          else if (route.name === 'ProfileTab') iconName = focused ? 'person' : 'person-outline';
          return <Ionicons name={iconName} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen name="HomeTab" component={HomeScreen} options={{ tabBarLabel: 'Home' }}
        listeners={{ tabPress: () => haptic.selection() }}
      />
      <Tab.Screen
        name="ShopTab"
        component={ShopScreen}
        options={{
          tabBarLabel: 'Shop',
          tabBarBadge: itemCount > 0 ? itemCount : undefined,
          tabBarBadgeStyle: {
            backgroundColor: Colors.error,
            fontSize: 10,
            fontWeight: '700',
            minWidth: 16,
            height: 16,
            lineHeight: 16,
          },
        }}
      />
      <Tab.Screen
        name="ScannerTab"
        component={ScannerPlaceholder}
        options={{
          tabBarLabel: 'Scan',
          tabBarIcon: ({ focused, color }) => (
            <View style={{
              backgroundColor: Colors.primary,
              width: 48,
              height: 48,
              borderRadius: 24,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16,
              shadowColor: Colors.primaryDark,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.3,
              shadowRadius: 4,
              elevation: 4,
            }}>
              <Ionicons name="scan" size={24} color={Colors.white} />
            </View>
          ),
        }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            haptic.medium();
            navigation.navigate('Scanner');
          },
        })}
      />
      <Tab.Screen name="CommunityTab" component={CommunityScreen} options={{ tabBarLabel: 'Community' }}
        listeners={{ tabPress: () => haptic.selection() }}
      />
      <Tab.Screen name="ProfileTab" component={ProfileScreen} options={{ tabBarLabel: 'Profile' }}
        listeners={{ tabPress: () => haptic.selection() }}
      />
    </Tab.Navigator>
  );
}

// Placeholder component (Scanner tab redirects to stack screen)
function ScannerPlaceholder() {
  return <View style={{ flex: 1 }} />;
}

export default function AppNavigator() {
  const { isLoggedIn, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingIcon}>
          <Ionicons name="leaf" size={48} color={Colors.primary} />
        </View>
        <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 20 }} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{
        headerShown: false,
        animation: isIOS ? 'default' : 'slide_from_right',
        gestureEnabled: isIOS,
        fullScreenGestureEnabled: isIOS,
        contentStyle: { backgroundColor: Colors.background },
      }}>
        {!isLoggedIn ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : (
          <>
            <Stack.Screen name="MainTabs" component={HomeTabs} />
            <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
            <Stack.Screen name="Cart" component={CartScreen} />
            <Stack.Screen name="Checkout" component={CheckoutScreen} />
            <Stack.Screen name="Scanner" component={ScannerScreen} />
            <Stack.Screen name="Energy" component={ScannerScreen} initialParams={{ tab: 'energy' }} />
            <Stack.Screen name="EnergyDetail" component={EnergyDetailScreen} />
            <Stack.Screen name="CreatePost" component={CreatePostScreen} />
            <Stack.Screen name="Orders" component={OrdersScreen} />
            <Stack.Screen name="OrderDetail" component={OrderDetailScreen} />
        <Stack.Screen name="Payment" component={PaymentScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
