/**
 * Timeline View — vertical timeline connector for roadmap levels
 */
import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { LevelCard } from './LevelCard';
import { Colors } from '@/constants/theme';
import type { StudyLevel } from '@/types';

interface TimelineViewProps {
  levels: StudyLevel[];
  onLevelPress: (level: StudyLevel) => void;
  onTakeQuiz: (level: StudyLevel) => void;
}

export function TimelineView({ levels, onLevelPress, onTakeQuiz }: TimelineViewProps) {
  const completedCount = levels.filter((l) => l.status === 'completed').length;
  const totalCount = levels.length;
  const overallProgress = totalCount > 0 ? completedCount / totalCount : 0;

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
        <View className="h-[4px] bg-bg-tertiary rounded-[2px] mt-md overflow-hidden">
          <View
            className="h-full bg-accent-success rounded-[2px]"
            style={{ width: `${overallProgress * 100}%` }}
          />
        </View>
      </View>

      {/* Timeline */}
      {levels.map((level, index) => (
        <View key={level.id} className="flex-row">
          {/* Timeline connector line */}
          <View className="w-[24px] items-center mr-md">
            {index > 0 && (
              <View
                className="w-[2px] flex-1 min-h-[12px]"
                style={{
                  backgroundColor:
                    level.status === 'completed' || levels[index - 1]?.status === 'completed'
                      ? Colors.accent.success
                      : Colors.border.subtle,
                }}
              />
            )}
            <View
              className="w-[14px] h-[14px] rounded-[7px] border-2"
              style={{
                backgroundColor:
                  level.status === 'completed'
                    ? Colors.accent.success
                    : level.status === 'active'
                    ? Colors.accent.primary
                    : Colors.bg.tertiary,
                borderColor:
                  level.status === 'completed'
                    ? Colors.accent.success
                    : level.status === 'active'
                    ? Colors.accent.primary
                    : Colors.border.medium,
              }}
            />
            {index < levels.length - 1 && (
              <View
                className="w-[2px] flex-1 min-h-[12px]"
                style={{
                  backgroundColor:
                    level.status === 'completed'
                      ? Colors.accent.success
                      : Colors.border.subtle,
                }}
              />
            )}
          </View>

          {/* Level Card */}
          <View className="flex-1">
            <LevelCard
              level={level}
              onPress={() => onLevelPress(level)}
              onTakeQuiz={() => onTakeQuiz(level)}
            />
          </View>
        </View>
      ))}
    </ScrollView>
  );
}
