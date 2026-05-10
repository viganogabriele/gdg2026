/**
 * Timeline View — vertical timeline connector for roadmap levels
 */
import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { LevelCard } from './LevelCard';
import { Colors } from '@/constants/theme';
import type { StudyLevel } from '@/types';

interface TimelineViewProps {
  levels: StudyLevel[];
  onLevelPress: (level: StudyLevel) => void;
  onTakeQuiz: (level: StudyLevel) => void;
}

// Gradient: violet (#9333ea) → cyan (#36c6e2) → blue (#1156ae)
const GRADIENT_STOPS = [
  { r: 0x93, g: 0x33, b: 0xea },
  { r: 0x36, g: 0xc6, b: 0xe2 },
  { r: 0x11, g: 0x56, b: 0xae },
];

function getLevelColor(index: number, total: number): string {
  const t = total > 1 ? index / (total - 1) : 0;
  const segment = t <= 0.5 ? 0 : 1;
  const s = t <= 0.5 ? t * 2 : (t - 0.5) * 2;
  const from = GRADIENT_STOPS[segment];
  const to = GRADIENT_STOPS[segment + 1];
  const r = Math.round(from.r + (to.r - from.r) * s);
  const g = Math.round(from.g + (to.g - from.g) * s);
  const b = Math.round(from.b + (to.b - from.b) * s);
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

export function TimelineView({ levels, onLevelPress, onTakeQuiz }: TimelineViewProps) {
  const completedCount = levels.filter((l) => l.status === 'completed').length;
  const totalCount = levels.length;
  const overallProgress = totalCount > 0 ? completedCount / totalCount : 0;
  const glowColor = getLevelColor(completedCount, totalCount);

  return (
    <ScrollView
      className="flex-1"
      contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 48 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Overall Progress Header */}
      <View className="mb-xxl pt-lg">
        <Text className="text-text-primary text-xxl font-bold">Study Roadmap</Text>
        <Text className="text-text-secondary text-sm mt-xs">
          {completedCount} / {totalCount} levels completed
        </Text>
        <View className="h-[6px] bg-bg-tertiary rounded-[3px] mt-md">
          {overallProgress > 0 && (
            <LinearGradient
              colors={['#9333ea', '#36c6e2', '#1156ae']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                width: `${overallProgress * 100}%`,
                height: '100%',
                borderRadius: 3,
                shadowColor: glowColor,
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 1,
                shadowRadius: 10,
                elevation: 8,
              }}
            />
          )}
        </View>
      </View>

      {/* Timeline */}
      {levels.map((level, index) => {
        const levelColor = level.status !== 'locked' ? getLevelColor(index, totalCount) : Colors.border.medium;
        const prevColor = index > 0 && levels[index - 1].status !== 'locked'
          ? getLevelColor(index - 1, totalCount)
          : Colors.border.subtle;

        return (
          <View key={level.id} className="flex-row">
            {/* Timeline connector line */}
            <View className="w-[24px] items-center mr-md">
              {index > 0 && (
                <View
                  className="w-[2px] flex-1 min-h-[12px]"
                  style={{
                    backgroundColor:
                      level.status === 'completed' || levels[index - 1]?.status === 'completed'
                        ? prevColor
                        : Colors.border.subtle,
                  }}
                />
              )}
              <View
                className="w-[14px] h-[14px] rounded-[7px] border-2"
                style={{
                  backgroundColor: level.status === 'locked' ? Colors.bg.tertiary : levelColor,
                  borderColor: levelColor,
                }}
              />
              {index < levels.length - 1 && (
                <View
                  className="w-[2px] flex-1 min-h-[12px]"
                  style={{
                    backgroundColor: level.status === 'completed' ? levelColor : Colors.border.subtle,
                  }}
                />
              )}
            </View>

            {/* Level Card */}
            <View className="flex-1">
              <LevelCard
                level={level}
                levelColor={levelColor}
                onPress={() => onLevelPress(level)}
                onTakeQuiz={() => onTakeQuiz(level)}
              />
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}
