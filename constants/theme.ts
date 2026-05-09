/**
 * Theme tokens mirrored from the provided Tailwind/CSS theme.
 * Semantic names match the source as closely as possible, while aliases keep
 * the current React Native app working without refactoring every component.
 */

export const ThemeTokens = {
  light: {
    background: '#fbfcfe',
    foreground: '#1a304d',
    card: '#fbfcfe',
    cardForeground: '#1a304d',
    popover: '#ffffff',
    popoverForeground: '#1f3e65',
    primary: '#1156ae',
    primaryForeground: '#ffffff',
    secondary: '#c9d9f2',
    secondaryForeground: '#203c60',
    muted: '#dae4f2',
    mutedForeground: '#0c2b50',
    accent: '#d4e2f7',
    accentForeground: '#0b2e5b',
    destructive: '#ba1c1e',
    destructiveForeground: '#ffffff',
    border: '#cadbf1',
    input: '#cadbf1',
    ring: '#2473db',
    chart1: '#2a7be5',
    chart2: '#1b20bb',
    chart3: '#274754',
    chart4: '#e8c468',
    chart5: '#f4a462',
    sidebar: '#e0e9f5',
    sidebarForeground: '#1156ae',
    sidebarPrimary: '#454554',
    sidebarPrimaryForeground: '#f4f5fb',
    sidebarAccent: '#e8f1fd',
    sidebarAccentForeground: '#1251a1',
    sidebarBorder: '#e9e9ec',
    sidebarRing: '#1156ae',
  },
  dark: {
    background: '#0b151e',
    foreground: '#d1d5ea',
    card: '#17202e',
    cardForeground: '#cfdef2',
    popover: '#1a2433',
    popoverForeground: '#f1f2f8',
    primary: '#1156ae',
    primaryForeground: '#d8e9fd',
    secondary: '#1c395e',
    secondaryForeground: '#c7cce1',
    muted: '#1a2737',
    mutedForeground: '#b8bbd6',
    accent: '#2c3b4e',
    accentForeground: '#f2f1f8',
    destructive: '#ba1c1e',
    destructiveForeground: '#ffffff',
    border: '#2c3b4e',
    input: '#2c3b4e',
    ring: '#1156ae',
    chart1: '#435ca8',
    chart2: '#934dcb',
    chart3: '#e88930',
    chart4: '#db57c3',
    chart5: '#36c6e2',
    sidebar: '#0a1524',
    sidebarForeground: '#bbc5d3',
    sidebarPrimary: '#1d4ed8',
    sidebarPrimaryForeground: '#ffffff',
    sidebarAccent: '#1b2736',
    sidebarAccentForeground: '#f4f4f5',
    sidebarBorder: '#000000',
    sidebarRing: '#1156ae',
  },
} as const;

export const ThemeTypography = {
  sans: 'Poppins',
  serif: 'Libre Baskerville',
  mono: 'Space Mono',
} as const;

export const ThemeRadius = {
  base: 9.6,
  sm: 5.6,
  md: 7.6,
  lg: 9.6,
  xl: 13.6,
} as const;

export const Colors = {
  light: {
    text: ThemeTokens.light.foreground,
    background: ThemeTokens.light.background,
    tint: ThemeTokens.light.primary,
    icon: ThemeTokens.light.mutedForeground,
    tabIconDefault: ThemeTokens.light.mutedForeground,
    tabIconSelected: ThemeTokens.light.primary,
  },
  dark: {
    text: ThemeTokens.dark.foreground,
    background: ThemeTokens.dark.background,
    tint: ThemeTokens.dark.primary,
    icon: ThemeTokens.dark.mutedForeground,
    tabIconDefault: ThemeTokens.dark.mutedForeground,
    tabIconSelected: ThemeTokens.dark.primary,
  },

  bg: {
    primary: ThemeTokens.dark.background,
    secondary: ThemeTokens.dark.card,
    tertiary: ThemeTokens.dark.popover,
    overlay: ThemeTokens.dark.muted,
  },
  accent: {
    primary: ThemeTokens.dark.primary,
    primaryLight: ThemeTokens.dark.primaryForeground,
    secondary: ThemeTokens.dark.secondary,
    secondaryLight: ThemeTokens.dark.accent,
    success: ThemeTokens.dark.chart5,
    successLight: ThemeTokens.dark.chart3,
    warning: ThemeTokens.dark.chart3,
    warningLight: ThemeTokens.dark.chart4,
    danger: ThemeTokens.dark.destructive,
    dangerLight: ThemeTokens.dark.destructiveForeground,
    xp: ThemeTokens.dark.chart4,
  },
  text: {
    primary: ThemeTokens.dark.foreground,
    secondary: ThemeTokens.dark.secondaryForeground,
    muted: ThemeTokens.dark.mutedForeground,
    inverse: ThemeTokens.dark.background,
    accentDarkBg: ThemeTokens.dark.accentForeground,
    accentLightBg: ThemeTokens.dark.accent,
  },
  border: {
    subtle: ThemeTokens.dark.border,
    medium: ThemeTokens.dark.input,
    bright: ThemeTokens.dark.ring,
  },
  gradient: {
    primary: [ThemeTokens.dark.primary, ThemeTokens.dark.primaryForeground] as const,
    secondary: [ThemeTokens.dark.secondary, ThemeTokens.dark.accent] as const,
    success: [ThemeTokens.dark.chart5, ThemeTokens.dark.chart3] as const,
    warning: [ThemeTokens.dark.chart3, ThemeTokens.dark.chart4] as const,
    danger: [ThemeTokens.dark.destructive, ThemeTokens.dark.destructiveForeground] as const,
    xp: [ThemeTokens.dark.chart4, ThemeTokens.dark.chart5] as const,
    dark: [ThemeTokens.dark.card, ThemeTokens.dark.background] as const,
    card: [ThemeTokens.dark.card, ThemeTokens.dark.popover] as const,
  },
  figma: ThemeTokens,
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
  sm: ThemeRadius.sm,
  md: ThemeRadius.md,
  lg: ThemeRadius.lg,
  xl: ThemeRadius.xl,
  xxl: 24,
  full: 9999,
  images: ThemeRadius.md,
  rectangles: ThemeRadius.lg,
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
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  heavy: '800' as const,
};

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
  sans: ThemeTypography.sans,
  serif: ThemeTypography.serif,
  rounded: ThemeTypography.sans,
  mono: ThemeTypography.mono,
} as const;
