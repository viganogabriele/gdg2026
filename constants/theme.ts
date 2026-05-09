/**
 * StudyQuest Design System — Dark Mode Only, Game-Inspired
 */

export const Colors = {
  bg: {
    primary: '#0A0E1A',
    secondary: '#141929',
    tertiary: '#1E2640',
    overlay: 'rgba(10, 14, 26, 0.85)',
  },
  accent: {
    primary: '#6C5CE7',
    primaryLight: '#8B7CF6',
    secondary: '#00D2FF',
    secondaryLight: '#33DDFF',
    success: '#00E676',
    successLight: '#33EB91',
    warning: '#FFD740',
    warningLight: '#FFE066',
    danger: '#FF5252',
    dangerLight: '#FF7B7B',
    xp: '#FFD700',
  },
  text: {
    primary: '#FFFFFF',
    secondary: '#8892B0',
    muted: '#4A5568',
    inverse: '#0A0E1A',
  },
  border: {
    subtle: 'rgba(108, 92, 231, 0.15)',
    medium: 'rgba(108, 92, 231, 0.3)',
    bright: 'rgba(108, 92, 231, 0.5)',
  },
  gradient: {
    primary: ['#6C5CE7', '#8B7CF6'] as const,
    secondary: ['#00D2FF', '#0098B3'] as const,
    success: ['#00E676', '#00C853'] as const,
    warning: ['#FFD740', '#FFC107'] as const,
    danger: ['#FF5252', '#D32F2F'] as const,
    xp: ['#FFD700', '#FF8F00'] as const,
    dark: ['#141929', '#0A0E1A'] as const,
    card: ['rgba(30, 38, 64, 0.8)', 'rgba(20, 25, 41, 0.9)'] as const,
  },
};

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
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 9999,
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
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  heavy: '800' as const,
};

export const Shadow = {
  sm: {
    shadowColor: '#6C5CE7',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#6C5CE7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#6C5CE7',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  glow: {
    shadowColor: '#6C5CE7',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
};

// Re-export for backward compatibility with existing template components
export const Fonts = {
  sans: 'System',
  serif: 'serif',
  rounded: 'System',
  mono: 'monospace',
};
