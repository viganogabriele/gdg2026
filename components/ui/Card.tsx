/**
 * Glass Card — glassmorphic card with subtle border glow
 */
import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Colors, BorderRadius, Spacing, Shadow } from '@/constants/theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'elevated' | 'glow';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export function Card({
  children,
  style,
  variant = 'default',
  padding = 'md',
}: CardProps) {
  return (
    <View
      style={[
        styles.base,
        variantStyles[variant],
        paddingStyles[padding],
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
    overflow: 'hidden',
  },
});

const variantStyles = StyleSheet.create({
  default: {
    backgroundColor: Colors.bg.secondary,
  },
  elevated: {
    backgroundColor: Colors.bg.tertiary,
    ...Shadow.md,
  },
  glow: {
    backgroundColor: Colors.bg.secondary,
    ...Shadow.glow,
    borderColor: Colors.border.medium,
  },
});

const paddingStyles = StyleSheet.create({
  none: {},
  sm: { padding: Spacing.sm },
  md: { padding: Spacing.lg },
  lg: { padding: Spacing.xxl },
});
