/**
 * Step Indicator — horizontal dots for onboarding progress
 */
import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { Colors, Spacing } from '@/constants/theme';

interface StepIndicatorProps {
  totalSteps: number;
  currentStep: number;
}

function Dot({ active }: { active: boolean }) {
  const style = useAnimatedStyle(() => ({
    width: withSpring(active ? 24 : 8, { damping: 15, stiffness: 200 }),
    opacity: withSpring(active ? 1 : 0.3, { damping: 15 }),
    backgroundColor: active ? Colors.accent.primary : Colors.text.muted,
  }));

  return <Animated.View style={[styles.dot, style]} />;
}

export function StepIndicator({ totalSteps, currentStep }: StepIndicatorProps) {
  return (
    <View style={styles.container}>
      {Array.from({ length: totalSteps }, (_, i) => (
        <Dot key={i} active={i === currentStep} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.lg,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
});
