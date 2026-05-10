export const Colors = {
  light: {
    text: '#1a304d',
    background: '#fbfcfe',
    tint: '#1156ae',
    icon: '#0c2b50',
    tabIconDefault: '#0c2b50',
    tabIconSelected: '#1156ae',
  },
  dark: {
    text: '#d1d5ea',
    background: '#0b151e',
    tint: '#1156ae',
    icon: '#b8bbd6',
    tabIconDefault: '#b8bbd6',
    tabIconSelected: '#1156ae',
  },
  bg: {
    primary: '#0b151e',
    secondary: '#17202e',
    tertiary: '#1a2433',
    overlay: '#1a2737',
  },
  accent: {
    primary: '#1156ae',
    primaryLight: '#d8e9fd',
    secondary: '#1c395e',
    secondaryLight: '#2c3b4e',
    success: '#22c55e',
    successLight: '#bbf7d0',
    warning: '#e88930',
    warningLight: '#9333ea',
    danger: '#ba1c1e',
    dangerLight: '#ffffff',
    xp: '#9333ea',
  },
  text: {
    primary: '#d1d5ea',
    secondary: '#c7cce1',
    muted: '#b8bbd6',
    inverse: '#0b151e',
    accentDarkBg: '#f2f1f8',
    accentLightBg: '#2c3b4e',
  },
  border: {
    subtle: '#2c3b4e',
    medium: '#2c3b4e',
    bright: '#1156ae',
  },
  gradient: {
    primary: ['#1156ae', '#d8e9fd'] as const,
    secondary: ['#1c395e', '#2c3b4e'] as const,
    success: ['#36c6e2', '#e88930'] as const,
    warning: ['#e88930', '#9333ea'] as const,
    danger: ['#ba1c1e', '#ffffff'] as const,
    xp: ['#9333ea', '#36c6e2'] as const,
    dark: ['#17202e', '#0b151e'] as const,
    card: ['#17202e', '#1a2433'] as const,
  },
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 48,
  massive: 64,
} as const;

export const BorderRadius = {
  sm: 5.6,
  md: 7.6,
  lg: 9.6,
  xl: 13.6,
  xxl: 24,
  full: 9999,
  images: 7.6,
  rectangles: 9.6,
  buttonsM: 60,
  buttonsL: 100,
} as const;

export const FontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  hero: 40,
  display: 48,
} as const;

export const FontWeight = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  heavy: '800',
} as const;

export const Shadow = {
  sm: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 2,
  },
  md: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  glow: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.38,
    shadowRadius: 10,
    elevation: 10,
  },
} as const;

export const Fonts = {
  sans: 'Poppins',
  serif: 'Libre Baskerville',
  rounded: 'Poppins',
  mono: 'Space Mono',
} as const;
