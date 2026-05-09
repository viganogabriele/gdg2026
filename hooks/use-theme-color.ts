/**
 * Theme color hook — always returns dark mode colors for this app
 */

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const themeColors = {
  text: Colors.text.primary,
  background: Colors.bg.primary,
  tint: Colors.accent.primary,
  icon: Colors.text.secondary,
  tabIconDefault: Colors.text.muted,
  tabIconSelected: Colors.accent.primary,
};

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof themeColors
) {
  const theme = useColorScheme() ?? 'dark';
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return themeColors[colorName];
  }
}
