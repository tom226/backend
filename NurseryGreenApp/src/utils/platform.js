// The Nursery Green — iOS Platform Utilities
import { Platform } from 'react-native';

// Haptic feedback wrapper — triggers on iOS, no-op on others
let Haptics = null;

async function loadHaptics() {
  if (Platform.OS === 'ios') {
    try {
      Haptics = await import('expo-haptics');
    } catch (e) {
      // expo-haptics not available
    }
  }
}
loadHaptics();

export const haptic = {
  light: () => {
    if (Haptics && Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  },
  medium: () => {
    if (Haptics && Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  },
  heavy: () => {
    if (Haptics && Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
  },
  success: () => {
    if (Haptics && Platform.OS === 'ios') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  },
  warning: () => {
    if (Haptics && Platform.OS === 'ios') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
  },
  error: () => {
    if (Haptics && Platform.OS === 'ios') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  },
  selection: () => {
    if (Haptics && Platform.OS === 'ios') {
      Haptics.selectionAsync();
    }
  },
};

// Platform-specific style helpers
export const isIOS = Platform.OS === 'ios';
export const isAndroid = Platform.OS === 'android';
export const isWeb = Platform.OS === 'web';

// iOS-specific safe values
export const iOS = {
  // Bottom tab bar height (accounts for iOS home indicator)
  tabBarHeight: isIOS ? 88 : 60,
  // Status bar height
  statusBarHeight: isIOS ? 44 : 0,
  // Bottom safe area padding for phones with home indicator
  bottomSafe: isIOS ? 34 : 0,
  // iOS blur effect intensity
  blurIntensity: 80,
  // Header large title style
  headerLargeTitle: isIOS,
  // iOS scroll bounce
  bounces: isIOS,
};

// Platform-adaptive shadow
export function platformShadow(elevation = 4) {
  if (isIOS) {
    return {
      shadowColor: '#33691E',
      shadowOffset: { width: 0, height: elevation / 2 },
      shadowOpacity: 0.08 + (elevation * 0.015),
      shadowRadius: elevation * 1.5,
    };
  }
  return { elevation };
}

// Platform-adaptive font weight (iOS renders weights differently)
export function fontWeight(weight) {
  const weights = {
    thin: isIOS ? '100' : '100',
    light: isIOS ? '300' : '300',
    regular: isIOS ? '400' : 'normal',
    medium: isIOS ? '500' : '500',
    semibold: isIOS ? '600' : '600',
    bold: isIOS ? '700' : 'bold',
    heavy: isIOS ? '800' : '800',
    black: isIOS ? '900' : '900',
  };
  return weights[weight] || weight;
}

// iOS keyboard handling offset
export const keyboardOffset = isIOS ? 90 : 0;
