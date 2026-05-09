/**
 * Glass Card — glassmorphic card with subtle border glow
 */
import React from 'react';
import { View, ViewStyle } from 'react-native';
import { Colors, Spacing, Shadow } from '@/constants/theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle | any;
  className?: string;
  variant?: 'default' | 'elevated' | 'glow';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const variantMap = {
  default: { backgroundColor: Colors.bg.secondary },
  elevated: { backgroundColor: Colors.bg.tertiary, ...Shadow.md },
  glow: { backgroundColor: Colors.bg.secondary, ...Shadow.glow, borderColor: Colors.border.medium },
};

const paddingMap = {
  none: 0,
  sm: Spacing.sm,
  md: Spacing.lg,
  lg: Spacing.xxl,
};

export function Card({
  children,
  style,
  className,
  variant = 'default',
  padding = 'md',
}: CardProps) {
  return (
    <View
      className={`rounded-lg border border-border-subtle overflow-hidden ${className || ''}`}
      style={[
        variantMap[variant],
        { padding: paddingMap[padding] },
        style,
      ]}
    >
      {children}
    </View>
  );
}
