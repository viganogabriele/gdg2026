/**
 * Level Indicator — large circular display of current level + XP
 */
import React from 'react';
import { View, Text } from 'react-native';
import { NucleoIcon } from '@/components/ui/NucleoIcon';
import { ProgressCircle } from '@/components/ui/ProgressCircle';
import { Colors } from '@/constants/theme';

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
    <View className="items-center py-lg">
      <View className="relative items-center justify-center w-[140px] h-[140px]">
        <ProgressCircle
          progress={progress}
          size={140}
          strokeWidth={10}
          color={Colors.accent.primary}
          showPercentage={false}
        />
        <View className="absolute items-center">
          <Text className="text-text-primary text-hero font-extrabold leading-[44px]">
            {currentLevel}
          </Text>
          <Text className="text-accent-primary text-xs font-bold tracking-[2px]">
            LEVEL
          </Text>
        </View>
      </View>

      <View className="items-center mt-lg">
        <Text className="text-text-primary text-xl font-bold" numberOfLines={1}>
          {levelTitle}
        </Text>
        <Text className="text-text-secondary text-sm mt-xs">
          {completedMinutes} / {requiredMinutes} min studied
        </Text>
        <View className="flex-row items-center mt-sm gap-xs">
          <NucleoIcon name="star-xp" size={16} />
          <Text className="text-accent-xp text-lg font-bold">{totalPoints} XP</Text>
        </View>
      </View>

      <View className="absolute top-lg right-0 bg-bg-tertiary px-md py-xs rounded-[12px] border border-border-subtle">
        <Text className="text-text-secondary text-xs font-semibold">
          {currentLevel} / {totalLevels}
        </Text>
      </View>
    </View>
  );
}
