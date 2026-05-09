/**
 * Level Indicator — large circular display of current level + XP
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ProgressCircle } from '@/components/ui/ProgressCircle';
import { Colors, FontSize, FontWeight, Spacing } from '@/constants/theme';

interface LevelIndicatorProps {
  currentLevel: number;
  totalLevels: number;
  levelTitle: string;
  completedMinutes: number;
  requiredMinutes: number;
  totalPoints: number;
}

export function LevelIndicator({
  currentLevel,
  totalLevels,
  levelTitle,
  completedMinutes,
  requiredMinutes,
  totalPoints,
}: LevelIndicatorProps) {
  const progress = requiredMinutes > 0 ? completedMinutes / requiredMinutes : 0;

  return (
    <View style={styles.container}>
      <View style={styles.circleWrapper}>
        <ProgressCircle
          progress={progress}
          size={140}
          strokeWidth={10}
          color={Colors.accent.primary}
          showPercentage={false}
        />
        <View style={styles.centerContent}>
          <Text style={styles.levelNumber}>{currentLevel}</Text>
          <Text style={styles.levelLabel}>LEVEL</Text>
        </View>
      </View>

      <View style={styles.info}>
        <Text style={styles.levelTitle} numberOfLines={1}>
          {levelTitle}
        </Text>
        <Text style={styles.progress}>
          {completedMinutes} / {requiredMinutes} min studied
        </Text>
        <View style={styles.xpRow}>
          <Text style={styles.xpIcon}>⭐</Text>
          <Text style={styles.xpText}>{totalPoints} XP</Text>
        </View>
      </View>

      <View style={styles.levelBadge}>
        <Text style={styles.levelBadgeText}>
          {currentLevel} / {totalLevels}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
  circleWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    width: 140,
    height: 140,
  },
  centerContent: {
    position: 'absolute',
    alignItems: 'center',
  },
  levelNumber: {
    color: Colors.text.primary,
    fontSize: FontSize.hero,
    fontWeight: FontWeight.heavy,
    lineHeight: 44,
  },
  levelLabel: {
    color: Colors.accent.primary,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    letterSpacing: 2,
  },
  info: {
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  levelTitle: {
    color: Colors.text.primary,
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
  },
  progress: {
    color: Colors.text.secondary,
    fontSize: FontSize.sm,
    marginTop: Spacing.xs,
  },
  xpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.sm,
    gap: Spacing.xs,
  },
  xpIcon: {
    fontSize: 16,
  },
  xpText: {
    color: Colors.accent.xp,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
  },
  levelBadge: {
    position: 'absolute',
    top: Spacing.lg,
    right: 0,
    backgroundColor: Colors.bg.tertiary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
  },
  levelBadgeText: {
    color: Colors.text.secondary,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
  },
});
