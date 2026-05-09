/**
 * Animated Progress Bar — horizontal bar with gradient fill
 */
import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Colors } from '@/constants/theme';

interface ProgressBarProps {
  progress: number; // 0-1
  label?: string;
  showPercentage?: boolean;
  height?: number;
  color?: string;
  backgroundColor?: string;
}

export function ProgressBar({
  progress,
  label,
  showPercentage = true,
  height = 8,
  color = Colors.accent.primary,
  backgroundColor = Colors.bg.tertiary,
}: ProgressBarProps) {
  const animatedWidth = useSharedValue(0);

  useEffect(() => {
    animatedWidth.value = withTiming(Math.min(Math.max(progress, 0), 1), {
      duration: 800,
      easing: Easing.bezierFn(0.25, 0.1, 0.25, 1),
    });
  }, [progress]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${animatedWidth.value * 100}%`,
  }));

  return (
    <View className="w-full">
      {(label || showPercentage) && (
        <View className="flex-row justify-between items-center mb-xs">
          {label && <Text className="text-text-secondary text-sm font-medium">{label}</Text>}
          {showPercentage && (
            <Text className="text-text-secondary text-sm font-semibold">
              {Math.round(progress * 100)}%
            </Text>
          )}
        </View>
      )}
      <View className="w-full overflow-hidden" style={{ height, backgroundColor, borderRadius: height / 2 }}>
        <Animated.View
          style={[{ height: '100%', backgroundColor: color, borderRadius: height / 2 }, fillStyle]}
        />
      </View>
    </View>
  );
}
