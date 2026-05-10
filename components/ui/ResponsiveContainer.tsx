/**
 * ResponsiveContainer — Centers content with max-width on tablet/desktop.
 * On mobile, renders children with no extra wrapper overhead.
 */
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import React from 'react';
import { View, ViewStyle } from 'react-native';

interface ResponsiveContainerProps {
  children: React.ReactNode;
  /** Max width of the centered content area (default: 720) */
  maxWidth?: number;
  /** Additional style for the container */
  style?: ViewStyle;
}

export function ResponsiveContainer({
  children,
  maxWidth = 720,
  style,
}: ResponsiveContainerProps) {
  const { isWide } = useResponsiveLayout();

  if (!isWide) {
    return <>{children}</>;
  }

  return (
    <View
      style={[
        {
          width: '100%',
          maxWidth,
          alignSelf: 'center',
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
