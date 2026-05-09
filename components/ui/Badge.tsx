/**
 * Badge Display — icon with glow effect and locked/unlocked states
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, BorderRadius, FontSize, FontWeight, Spacing, Shadow } from '@/constants/theme';

interface BadgeDisplayProps {
  icon: string;
  title: string;
  description?: string;
  earned: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function BadgeDisplay({
  icon,
  title,
  description,
  earned,
  size = 'md',
}: BadgeDisplayProps) {
  const sizeConfig = {
    sm: { icon: 24, container: 48, fontSize: FontSize.xs },
    md: { icon: 32, container: 64, fontSize: FontSize.sm },
    lg: { icon: 40, container: 80, fontSize: FontSize.md },
  }[size];

  return (
    <View style={styles.wrapper}>
      <View
        style={[
          styles.container,
          {
            width: sizeConfig.container,
            height: sizeConfig.container,
          },
          earned ? styles.earned : styles.locked,
        ]}
      >
        <Text
          style={[
            styles.icon,
            { fontSize: sizeConfig.icon },
            !earned && styles.lockedIcon,
          ]}
        >
          {earned ? icon : '🔒'}
        </Text>
      </View>
      <Text
        style={[
          styles.title,
          { fontSize: sizeConfig.fontSize },
          !earned && styles.lockedText,
        ]}
        numberOfLines={1}
      >
        {title}
      </Text>
      {description && (
        <Text style={styles.description} numberOfLines={2}>
          {description}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    width: 80,
  },
  container: {
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  earned: {
    backgroundColor: Colors.bg.tertiary,
    borderColor: Colors.accent.xp,
    ...Shadow.glow,
    shadowColor: Colors.accent.xp,
  },
  locked: {
    backgroundColor: Colors.bg.secondary,
    borderColor: Colors.border.subtle,
    opacity: 0.5,
  },
  icon: {
    textAlign: 'center',
  },
  lockedIcon: {
    opacity: 0.4,
  },
  title: {
    color: Colors.text.primary,
    fontWeight: FontWeight.medium,
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
  lockedText: {
    color: Colors.text.muted,
  },
  description: {
    color: Colors.text.muted,
    fontSize: FontSize.xs,
    textAlign: 'center',
    marginTop: 2,
  },
});
