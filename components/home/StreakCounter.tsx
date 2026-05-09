/**
 * Streak Counter — animated flame with streak count and history
 */
import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Colors, FontSize, FontWeight, Spacing, Shadow, BorderRadius } from '@/constants/theme';

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
    <View style={[styles.container, isActive && styles.activeContainer]}>
      <View style={styles.row}>
        <Animated.Text style={[styles.flame, flameStyle]}>
          {isActive ? '🔥' : '❄️'}
        </Animated.Text>
        <View style={styles.textContainer}>
          <Text style={[styles.count, isActive && styles.activeCount]}>
            {currentStreak}
          </Text>
          <Text style={styles.label}>
            {currentStreak === 1 ? 'day streak' : 'day streak'}
          </Text>
        </View>
      </View>

      {longestStreak > 0 && (
        <Text style={styles.best}>
          Best: {longestStreak} days
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.bg.secondary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
  },
  activeContainer: {
    borderColor: 'rgba(255, 152, 0, 0.3)',
    ...Shadow.sm,
    shadowColor: '#FF9800',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  flame: {
    fontSize: 36,
  },
  textContainer: {
    flex: 1,
  },
  count: {
    color: Colors.text.muted,
    fontSize: FontSize.xxxl,
    fontWeight: FontWeight.heavy,
  },
  activeCount: {
    color: Colors.accent.warning,
  },
  label: {
    color: Colors.text.secondary,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    marginTop: -2,
  },
  best: {
    color: Colors.text.muted,
    fontSize: FontSize.xs,
    marginTop: Spacing.sm,
    fontWeight: FontWeight.medium,
  },
});
