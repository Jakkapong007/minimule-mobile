// Sticker Mule-inspired design tokens
export const Colors = {
  primary: '#E31837',
  primaryDark: '#B8122C',
  primaryLight: '#FF4D6A',
  primaryBg: '#FFF0F2',

  black: '#0D0D0D',
  dark: '#1A1A1A',
  gray900: '#1A1A1A',
  gray800: '#2D2D2D',
  gray700: '#444444',
  gray600: '#666666',
  gray500: '#888888',
  gray400: '#AAAAAA',
  gray300: '#CCCCCC',
  gray200: '#E5E5E5',
  gray100: '#F2F2F2',
  gray50: '#F8F8F8',
  white: '#FFFFFF',

  background: '#FFFFFF',
  backgroundDark: '#F8F8F8',
  surface: '#FFFFFF',
  border: '#EBEBEB',
  error: '#EF4444',
  errorBg: '#FEF2F2',
  success: '#22C55E',
  successBg: '#F0FDF4',
  warning: '#F59E0B',
  warningBg: '#FFFBEB',
  info: '#3B82F6',
  infoBg: '#EFF6FF',
  overlay: 'rgba(0,0,0,0.5)',
};

export const Typography = {
  // Font sizes
  xs: 11,
  sm: 13,
  base: 15,
  md: 16,
  lg: 18,
  xl: 22,
  '2xl': 26,
  '3xl': 32,
  '4xl': 40,

  // Weights (React Native uses strings)
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  black: '900' as const,
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,
  '2xl': 32,
  '3xl': 48,
  '4xl': 64,
};

export const Radius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

export const Shadow = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 12,
    elevation: 8,
  },
};
