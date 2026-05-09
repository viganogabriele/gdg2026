/**
 * Streak Counter — animated flame with streak count and history
 */
import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { NucleoIcon } from '@/components/ui/NucleoIcon';
import { Colors, Shadow } from '@/constants/theme';

interface StreakCounterProps {
  currentStreak: number;
  longestStreak: number;
}

export function StreakCounter({ currentStreak, longestStreak }: StreakCounterProps) {
  const flameScale = useSharedValue(1);
  const flamRotation = useSharedValue(0);

  useEffect(() => {
    if (currentStreak > 0) {
      flameScale.value = withRepeat(
        withSequence(
          withTiming(1.15, { duration: 600, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 600, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
      flamRotation.value = withRepeat(
        withSequence(
          withTiming(3, { duration: 400 }),
          withTiming(-3, { duration: 400 }),
          withTiming(0, { duration: 200 })
        ),
        -1,
        true
      );
    }
  }, [currentStreak]);

  const flameStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: flameScale.value },
      { rotate: `${flamRotation.value}deg` },
    ],
  }));

  const isActive = currentStreak > 0;

  return (
    <View
      className={`bg-bg-secondary rounded-lg p-lg border ${isActive ? 'border-[rgba(255,152,0,0.3)]' : 'border-border-subtle'}`}
      style={isActive ? { ...Shadow.sm, shadowColor: '#FF9800' } : undefined}
    >
      <View className="flex-row items-center gap-md">
        <Animated.View style={flameStyle}>
          <NucleoIcon
            name={isActive ? 'flame-fire' : 'flame'}
            size={36}
            className={isActive ? 'opacity-100' : 'opacity-40'}
          />
        </Animated.View>
        <View className="flex-1">
          <Text className={`text-xxxl font-extrabold ${isActive ? 'text-accent-warning' : 'text-text-muted'}`}>
            {currentStreak}
          </Text>
          <Text className="text-text-secondary text-sm font-medium mt-[-2px]">
            day streak
          </Text>
        </View>
      </View>

      {longestStreak > 0 && (
        <Text className="text-text-muted text-xs mt-sm font-medium">
          Best: {longestStreak} days
        </Text>
      )}
    </View>
  );
}
