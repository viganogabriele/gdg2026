/**
 * Step Indicator — horizontal dots for onboarding progress
 */
import React from 'react';
import { View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { Colors } from '@/constants/theme';

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

  return <Animated.View className="h-[8px] rounded-[4px]" style={style} />;
}

export function StepIndicator({ totalSteps, currentStep }: StepIndicatorProps) {
  return (
    <View className="flex-row items-center justify-center gap-sm py-lg">
      {Array.from({ length: totalSteps }, (_, i) => (
        <Dot key={i} active={i === currentStep} />
      ))}
    </View>
  );
}
