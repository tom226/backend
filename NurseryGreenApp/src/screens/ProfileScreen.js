import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Alert, ActivityIndicator, Image, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, Spacing, Radius, Shadows } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import { haptic } from '../utils/platform';

export default function ProfileScreen({ navigation }) {
  const { user, isLoggedIn, logout, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    firstName: user?.firstName || user?.name?.split(' ')[0] || '',
    lastName: user?.lastName || user?.name?.split(' ').slice(1).join(' ') || '',
    phone: user?.phone || '',
    street: user?.address?.street || '',
    city: user?.address?.city || '',
    state: user?.address?.state || '',
    zipCode: user?.address?.zipCode || '',
  });

  const handleSave = async () => {
    setLoading(true);
    try {
      const data = {
        firstName: form.firstName,
        lastName: form.lastName,
        phone: form.phone,
        address: {
          street: form.street,
          city: form.city,
          state: form.state,
          zipCode: form.zipCode,
          country: 'India',
        },
      };
      await api.updateProfile(data);
      updateUser(data);
      haptic.success();
      setEditing(false);
      Alert.alert('Saved', 'Profile updated successfully.');
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: () => { haptic.warning(); logout(); } },
    ]);
  };

  const menuItems = [
    { icon: 'receipt-outline', label: 'My Orders', screen: 'Orders', color: '#1E88E5' },
    { icon: 'scan-outline', label: 'Plant Scanner', screen: 'Scanner', color: '#43A047' },
    { icon: 'flash-outline', label: 'Plant Energy', screen: 'Energy', color: '#FF9800' },
    { icon: 'cart-outline', label: 'Shop', screen: 'ShopTab', color: '#7B1FA2' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
        {isLoggedIn && user?.email && (
          <TouchableOpacity onPress={() => setEditing(!editing)}>
            <Ionicons name={editing ? 'close' : 'create-outline'} size={22} color={Colors.text} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarCircle}>
            {user?.profilePicture || user?.picture ? (
              <Image
                source={{ uri: user.profilePicture || user.picture }}
                style={styles.avatarImage}
                defaultSource={undefined}
              />
            ) : (
              <Text style={styles.avatarLetter}>
                {(user?.firstName || user?.name || 'U')[0].toUpperCase()}
              </Text>
            )}
          </View>
          <Text style={styles.profileName}>
            {user?.firstName || user?.name || 'Guest User'}
            {user?.lastName ? ` ${user.lastName}` : ''}
          </Text>
          <Text style={styles.profileEmail}>{user?.email || 'Not logged in'}</Text>
          {user?.phone && <Text style={styles.profilePhone}>{user.phone}</Text>}
        </View>

        {/* Edit Form */}
        {editing && (
          <View style={styles.editSection}>
            <Text style={styles.sectionTitle}>Edit Profile</Text>
            <View style={styles.row}>
              <View style={styles.halfField}>
                <Text style={styles.inputLabel}>First Name</Text>
                <TextInput
                  style={styles.input}
                  value={form.firstName}
                  onChangeText={(v) => setForm({ ...form, firstName: v })}
                  placeholder="First Name"
                  placeholderTextColor={Colors.textLight}
                />
              </View>
              <View style={styles.halfField}>
                <Text style={styles.inputLabel}>Last Name</Text>
                <TextInput
                  style={styles.input}
                  value={form.lastName}
                  onChangeText={(v) => setForm({ ...form, lastName: v })}
                  placeholder="Last Name"
                  placeholderTextColor={Colors.textLight}
                />
              </View>
            </View>
            <Text style={styles.inputLabel}>Phone</Text>
            <TextInput
              style={styles.input}
              value={form.phone}
              onChangeText={(v) => setForm({ ...form, phone: v })}
              placeholder="Phone Number"
              placeholderTextColor={Colors.textLight}
              keyboardType="phone-pad"
            />
            <Text style={styles.inputLabel}>Street</Text>
            <TextInput
              style={styles.input}
              value={form.street}
              onChangeText={(v) => setForm({ ...form, street: v })}
              placeholder="Street Address"
              placeholderTextColor={Colors.textLight}
            />
            <View style={styles.row}>
              <View style={styles.halfField}>
                <Text style={styles.inputLabel}>City</Text>
                <TextInput
                  style={styles.input}
                  value={form.city}
                  onChangeText={(v) => setForm({ ...form, city: v })}
                  placeholder="City"
                  placeholderTextColor={Colors.textLight}
                />
              </View>
              <View style={styles.halfField}>
                <Text style={styles.inputLabel}>State</Text>
                <TextInput
                  style={styles.input}
                  value={form.state}
                  onChangeText={(v) => setForm({ ...form, state: v })}
                  placeholder="State"
                  placeholderTextColor={Colors.textLight}
                />
              </View>
            </View>

            <TouchableOpacity
              style={[styles.saveBtn, loading && { opacity: 0.7 }]}
              onPress={handleSave}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <Text style={styles.saveBtnText}>Save Changes</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Quick Menu */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Quick Access</Text>
          {menuItems.map((item, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.menuItem}
              onPress={() => {
                if (item.screen === 'ShopTab') navigation.navigate('ShopTab');
                else navigation.navigate(item.screen);
              }}
            >
              <View style={[styles.menuIcon, { backgroundColor: item.color + '15' }]}>
                <Ionicons name={item.icon} size={20} color={item.color} />
              </View>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={16} color={Colors.textLight} />
            </TouchableOpacity>
          ))}
        </View>

        {/* About */}
        <View style={styles.aboutSection}>
          <TouchableOpacity style={styles.aboutItem}>
            <Ionicons name="information-circle-outline" size={20} color={Colors.textSecondary} />
            <Text style={styles.aboutText}>About The Nursery Green</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.aboutItem}>
            <Ionicons name="call-outline" size={20} color={Colors.textSecondary} />
            <Text style={styles.aboutText}>Contact Support</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.aboutItem}>
            <Ionicons name="shield-checkmark-outline" size={20} color={Colors.textSecondary} />
            <Text style={styles.aboutText}>Privacy Policy</Text>
          </TouchableOpacity>
        </View>

        {/* Logout */}
        {isLoggedIn && user?.email && (
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color={Colors.error} />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        )}

        <Text style={styles.version}>The Nursery Green v1.0.0</Text>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.xl, paddingTop: 52, paddingBottom: Spacing.md,
    backgroundColor: Colors.surface,
  },
  title: { ...Fonts.title },
  profileCard: {
    alignItems: 'center', backgroundColor: Colors.surface, margin: Spacing.lg,
    padding: Spacing.xxl, borderRadius: Radius.xl, ...Shadows.medium,
  },
  avatarCircle: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.primaryLight,
    alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.md,
  },
  avatarImg: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.primaryLight,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarImage: {
    width: 80, height: 80, borderRadius: 40,
  },
  avatarLetter: { fontSize: 32, fontWeight: '700', color: Colors.white },
  profileName: { ...Fonts.title, fontSize: 20 },
  profileEmail: { ...Fonts.caption, marginTop: 4 },
  profilePhone: { ...Fonts.caption, marginTop: 2 },
  editSection: {
    backgroundColor: Colors.surface, margin: Spacing.lg, padding: Spacing.lg,
    borderRadius: Radius.xl, ...Shadows.small,
  },
  sectionTitle: { ...Fonts.subtitle, fontSize: 16, marginBottom: Spacing.md },
  inputLabel: { ...Fonts.caption, fontWeight: '600', marginBottom: 4, marginTop: Spacing.md },
  input: {
    backgroundColor: Colors.card, borderRadius: Radius.md, paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md, ...Fonts.regular, color: Colors.text,
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  row: { flexDirection: 'row', gap: Spacing.md },
  halfField: { flex: 1 },
  saveBtn: {
    backgroundColor: Colors.primary, paddingVertical: 14, borderRadius: Radius.lg,
    alignItems: 'center', marginTop: Spacing.xl,
  },
  saveBtnText: { color: Colors.white, fontWeight: '700', fontSize: 16 },
  menuSection: {
    backgroundColor: Colors.surface, margin: Spacing.lg, padding: Spacing.lg,
    borderRadius: Radius.xl, ...Shadows.small,
  },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.md,
    borderBottomWidth: 1, borderBottomColor: Colors.divider,
  },
  menuIcon: {
    width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center',
  },
  menuLabel: { ...Fonts.medium, fontSize: 14, flex: 1, marginLeft: Spacing.md },
  aboutSection: {
    backgroundColor: Colors.surface, marginHorizontal: Spacing.lg, padding: Spacing.lg,
    borderRadius: Radius.xl, ...Shadows.small,
  },
  aboutItem: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.md,
  },
  aboutText: { ...Fonts.regular, marginLeft: Spacing.md, color: Colors.textSecondary },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    margin: Spacing.lg, paddingVertical: 14, borderRadius: Radius.lg,
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.error + '30',
  },
  logoutText: { ...Fonts.medium, color: Colors.error, marginLeft: Spacing.sm },
  version: { ...Fonts.small, textAlign: 'center', marginTop: Spacing.lg },
});
