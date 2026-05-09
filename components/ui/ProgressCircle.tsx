/**
 * Circular Progress Indicator — SVG-based with animated fill
 */
import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import { Colors } from '@/constants/theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface ProgressCircleProps {
  progress: number; // 0-1
  size?: number;
  strokeWidth?: number;
  color?: string;
  backgroundColor?: string;
  label?: string;
  sublabel?: string;
  showPercentage?: boolean;
}

export function ProgressCircle({
  progress,
  size = 120,
  strokeWidth = 8,
  color = Colors.accent.primary,
  backgroundColor = Colors.bg.tertiary,
  label,
  sublabel,
  showPercentage = true,
}: ProgressCircleProps) {
  const animatedProgress = useSharedValue(0);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    animatedProgress.value = withTiming(Math.min(Math.max(progress, 0), 1), {
      duration: 1000,
      easing: Easing.bezierFn(0.25, 0.1, 0.25, 1),
    });
  }, [progress]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - animatedProgress.value),
  }));

  return (
    <View className="items-center justify-center" style={{ width: size, height: size }}>
      <Svg width={size} height={size} className="absolute">
        {/* Background circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress circle */}
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          animatedProps={animatedProps}
          strokeLinecap="round"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <View className="items-center justify-center">
        {showPercentage && (
          <Text className="text-text-primary font-bold" style={{ fontSize: size * 0.2 }}>
            {Math.round(progress * 100)}%
          </Text>
        )}
        {label && (
          <Text className="text-text-secondary text-xs font-medium mt-[2px]" numberOfLines={1}>
            {label}
          </Text>
        )}
        {sublabel && (
          <Text className="text-text-muted text-xs" numberOfLines={1}>
            {sublabel}
          </Text>
        )}
      </View>
    </View>
  );
}
