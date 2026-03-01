// The Nursery Green — Yellowish-Green Light Theme
export const Colors = {
  primary: '#689F38',
  primaryLight: '#9CCC65',
  primaryDark: '#33691E',
  primaryMuted: '#AED581',

  accent: '#8BC34A',
  accentLight: '#DCEDC8',

  background: '#FAFEF2',
  surface: '#FFFFFF',
  card: '#F0F7E4',
  cardAlt: '#E8F5D6',

  text: '#2D3B21',
  textSecondary: '#5A6B4F',
  textLight: '#8A9A7E',
  textOnPrimary: '#FFFFFF',

  border: '#D4E6C3',
  borderLight: '#E8F0DE',
  divider: '#EDF5E3',

  success: '#43A047',
  warning: '#FF9800',
  error: '#E53935',
  info: '#1E88E5',

  white: '#FFFFFF',
  black: '#1A1A1A',

  overlay: 'rgba(45, 59, 33, 0.5)',
  shadow: 'rgba(104, 159, 56, 0.15)',

  tabActive: '#689F38',
  tabInactive: '#A8BF98',

  statusPending: '#FF9800',
  statusConfirmed: '#1E88E5',
  statusProcessing: '#7B1FA2',
  statusShipped: '#00897B',
  statusDelivered: '#43A047',
  statusCancelled: '#E53935',

  energyPositive: '#43A047',
  energyNegative: '#E53935',
  energyCaution: '#FF9800',
  energyNeutral: '#78909C',

  skeleton: '#E8F0DE',
  skeletonHighlight: '#F0F7E4',
};

export const Fonts = {
  regular: { fontSize: 14, color: Colors.text },
  medium: { fontSize: 16, fontWeight: '500', color: Colors.text },
  bold: { fontSize: 16, fontWeight: '700', color: Colors.text },
  title: { fontSize: 22, fontWeight: '700', color: Colors.text },
  subtitle: { fontSize: 18, fontWeight: '600', color: Colors.text },
  caption: { fontSize: 12, color: Colors.textSecondary },
  small: { fontSize: 11, color: Colors.textLight },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const Radius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  full: 999,
};

export const Shadows = {
  small: {
    shadowColor: Colors.primaryDark,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  medium: {
    shadowColor: Colors.primaryDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  large: {
    shadowColor: Colors.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
};
