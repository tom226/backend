import React, { useRef } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, Spacing, Radius, Shadows } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { haptic } from '../utils/platform';

const { width } = Dimensions.get('window');
const BACKEND_URL = 'https://backend-production-f128.up.railway.app';
const APP_LOGO = require('../../assets/icon.png');

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [showWebView, setShowWebView] = React.useState(false);
  const webViewRef = useRef(null);

  const handleWebViewNav = (event) => {
    const url = event.url;
    // Capture redirect with token and user
    if (url.includes('token=') && url.includes('user=')) {
      try {
        const urlObj = new URL(url);
        const token = urlObj.searchParams.get('token');
        const userStr = urlObj.searchParams.get('user');
        if (token && userStr) {
          const user = JSON.parse(decodeURIComponent(userStr));
          login(token, user);
          setShowWebView(false);
        }
      } catch (e) {
        console.log('Error parsing auth redirect:', e);
      }
    }
  };

  if (showWebView) {
    const authUrl = `${BACKEND_URL}/auth/google?redirect=${encodeURIComponent('nurserygreen://auth')}`;
    return (
      <View style={styles.container}>
        <View style={styles.webViewHeader}>
          <TouchableOpacity onPress={() => setShowWebView(false)} style={styles.closeBtn}>
            <Ionicons name="close" size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.webViewTitle}>Sign In with Google</Text>
          <View style={{ width: 24 }} />
        </View>
        <WebView
          ref={webViewRef}
          source={{ uri: authUrl }}
          onNavigationStateChange={handleWebViewNav}
          style={styles.webView}
          javaScriptEnabled
          domStorageEnabled
          startInLoadingState
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.topSection}>
        <View style={styles.logoCircle}>
          <Image source={APP_LOGO} style={styles.logoImage} resizeMode="contain" />
        </View>
        <Text style={styles.appName}>The Nursery Green</Text>
        <Text style={styles.tagline}>Your Plant Care Companion</Text>
      </View>

      <View style={styles.bottomSection}>
        <Text style={styles.welcomeText}>Welcome!</Text>
        <Text style={styles.descText}>
          Sign in to access your plant dashboard, shop organic products, scan plant health, and join our community.
        </Text>

        <TouchableOpacity
          style={styles.googleBtn}
          onPress={() => { haptic.medium(); setShowWebView(true); }}
          activeOpacity={0.85}
        >
          <View style={styles.btnIcon}>
            <Text style={styles.gLetter}>G</Text>
          </View>
          <Text style={styles.googleBtnText}>Continue with Google</Text>
        </TouchableOpacity>

        {/* Apple Sign In — iOS only */}
        {Platform.OS === 'ios' && (
          <TouchableOpacity
            style={styles.appleBtn}
            onPress={() => { haptic.medium(); setShowWebView(true); }}
            activeOpacity={0.85}
          >
            <Ionicons name="logo-apple" size={20} color="#FFFFFF" />
            <Text style={styles.appleBtnText}>Sign in with Apple</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.skipBtn}
          onPress={() => { haptic.light(); login('guest', { firstName: 'Guest', email: '' }); }}
        >
          <Text style={styles.skipText}>Continue as Guest</Text>
        </TouchableOpacity>

        <Text style={styles.terms}>
          By continuing, you agree to our Terms of Service & Privacy Policy
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  topSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.medium,
  },
  logoImage: {
    width: 68,
    height: 68,
    borderRadius: 34,
  },
  appName: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.primaryDark,
    marginTop: Spacing.xl,
  },
  tagline: {
    ...Fonts.regular,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
  },
  bottomSection: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: Spacing.xxl,
    paddingBottom: 40,
    ...Shadows.large,
  },
  welcomeText: {
    ...Fonts.title,
    marginBottom: Spacing.sm,
  },
  descText: {
    ...Fonts.regular,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: Spacing.xxl,
  },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    paddingVertical: 14,
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.md,
    ...Shadows.small,
  },
  btnIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#4285F4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  gLetter: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 16,
  },
  googleBtnText: {
    ...Fonts.medium,
    flex: 1,
    textAlign: 'center',
  },
  appleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000000',
    borderRadius: Radius.lg,
    paddingVertical: 14,
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.lg,
    ...Shadows.small,
  },
  appleBtnText: {
    ...Fonts.medium,
    color: '#FFF',
    flex: 1,
    textAlign: 'center',
  },
  skipBtn: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  skipText: {
    ...Fonts.medium,
    color: Colors.primary,
  },
  terms: {
    ...Fonts.small,
    textAlign: 'center',
    marginTop: Spacing.lg,
    lineHeight: 16,
  },
  webViewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
    paddingBottom: Spacing.md,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  closeBtn: {
    padding: Spacing.xs,
  },
  webViewTitle: {
    ...Fonts.medium,
  },
  webView: {
    flex: 1,
  },
});
