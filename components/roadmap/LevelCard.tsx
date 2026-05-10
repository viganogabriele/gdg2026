/**
 * Level Card — expandable card for roadmap timeline
 */
import { NucleoIcon } from '@/components/ui/NucleoIcon';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Colors, Shadow } from '@/constants/theme';
import { useStudyStore } from '@/hooks/useStudyStore';
import type { StudyLevel } from '@/types';
import React, { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

interface LevelCardProps {
  level: StudyLevel;
  levelColor: string;
  onPress: () => void;
  onTakeQuiz: () => void;
}

export function LevelCard({ level, levelColor, onPress, onTakeQuiz }: LevelCardProps) {
  const [expanded, setExpanded] = useState(false);
  const expandHeight = useSharedValue(0);
  const currentDayIndex = useStudyStore((s) => s.currentDayIndex);
  const dailyObjectives = useStudyStore((s) => s.dailyObjectives);
  const advanceToDay = useStudyStore((s) => s.advanceToDay);
  const dayAdvanceReady = useStudyStore((s) => s.dayAdvanceReady);

  const isActiveLevel = level.status === 'active' || level.status === 'failed';
  const allCurrentDayDone =
    isActiveLevel &&
    dailyObjectives.length > 0 &&
    dailyObjectives.every((o) => o.completed);

  const toggleExpand = () => {
    setExpanded(!expanded);
    expandHeight.value = withTiming(expanded ? 0 : 1, { duration: 300 });
  };

  const expandStyle = useAnimatedStyle(() => ({
    maxHeight: expandHeight.value * (level.topics.length * 120 + 80),
    opacity: expandHeight.value,
  }));

  const statusConfig = {
    locked: { color: Colors.text.muted, icon: 'lock' as const, label: 'Locked' },
    active: { color: levelColor, icon: 'book-open' as const, label: 'In Progress' },
    completed: { color: levelColor, icon: 'circle-check' as const, label: 'Completed' },
    failed: { color: Colors.accent.danger, icon: 'flame-fire' as const, label: 'Needs Review' },
  }[level.status];

  const progress =
    level.requiredStudyMinutes > 0
      ? level.completedStudyMinutes / level.requiredStudyMinutes
      : 0;

  const deadlineDate = new Date(level.deadline);
  const daysLeft = Math.ceil(
    (deadlineDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  return (
    <TouchableOpacity
      className={`bg-bg-secondary rounded-lg p-lg border mb-md ${level.status === 'completed' ? 'opacity-80' : ''}`}
      style={[
        { borderColor: level.status !== 'locked' ? levelColor : Colors.border.subtle },
        level.status === 'active' ? Shadow.sm : undefined,
      ]}
      onPress={toggleExpand}
      activeOpacity={0.8}
    >
      {/* Header */}
      <View className="flex-row items-center gap-md">
        <View className="w-[40px] h-[40px] rounded-[20px] bg-bg-tertiary items-center justify-center border-[1.5px]" style={{ borderColor: statusConfig.color }}>
          <Text className="text-lg font-bold" style={{ color: statusConfig.color }}>
            {level.status === 'completed' ? '✓' : level.levelNumber}
          </Text>
        </View>
        <View className="flex-1">
          <Text className="text-text-primary text-md font-semibold" numberOfLines={1}>
            {level.title}
          </Text>
          <View className="flex-row items-center gap-sm mt-[4px]">
            <Text className="text-xs font-medium" style={{ color: statusConfig.color }}>
              {statusConfig.label}
              {isActiveLevel && ` — Day ${currentDayIndex + 1}/${level.topics.length}`}
            </Text>
            {level.status !== 'completed' && level.status !== 'locked' && (
              <Text className="text-text-muted text-xs ml-auto">
                {daysLeft > 0 ? `${daysLeft}d left` : 'Due today'}
              </Text>
            )}
          </View>
        </View>
        <Text className="text-text-muted text-[10px]">{expanded ? '▲' : '▼'}</Text>
      </View>

      {/* Progress Bar */}
      {level.status !== 'locked' && (
        <View className="mt-md">
          <ProgressBar
            progress={progress}
            height={6}
            color={statusConfig.color}
            showPercentage={false}
          />
        </View>
      )}

      {/* Expanded Content */}
      <Animated.View className="overflow-hidden mt-md" style={expandStyle}>
        {level.topics.map((topic, topicIndex) => {
          const isPastDay = isActiveLevel && topicIndex < currentDayIndex;
          const isCurrentDay = isActiveLevel && topicIndex === currentDayIndex;
          const isNextDay = isActiveLevel && topicIndex === currentDayIndex + 1;
          const canAdvance = isNextDay && dayAdvanceReady;
          const currentDayStrikethrough = isCurrentDay && allCurrentDayDone;

          return (
            <TouchableOpacity
              key={topic.id}
              className={`flex-row gap-sm mb-md p-sm rounded-md ${isCurrentDay ? 'bg-bg-tertiary' : ''}`}
              style={canAdvance ? { borderWidth: 1, borderColor: `${levelColor}66`, borderStyle: 'dashed' } : undefined}
              onPress={canAdvance ? () => advanceToDay(topicIndex) : undefined}
              disabled={!canAdvance}
              activeOpacity={canAdvance ? 0.6 : 1}
            >
              <Text className="text-md font-bold w-[20px] text-center" style={{ color: (isPastDay || topic.completed) ? levelColor : isCurrentDay ? levelColor : Colors.text.muted }}>
                {(isPastDay || topic.completed) ? '✓' : isCurrentDay ? '▶' : '○'}
              </Text>
              <View className="flex-1">
                <Text
                  className={`text-sm font-medium mb-[4px] ${(isPastDay || topic.completed) ? 'line-through text-text-muted' : isCurrentDay ? 'text-text-primary' : 'text-text-muted'}`}
                >
                  {topic.title}
                </Text>
                {(isCurrentDay || isPastDay || topic.completed) && topic.arguments.map((arg, i) => (
                  <Text key={i} className="text-text-secondary text-xs ml-sm mb-[2px]">
                    • {arg}
                  </Text>
                ))}
                {canAdvance && (
                  <Text className="text-xs font-semibold mt-[4px]" style={{ color: levelColor }}>
                    Tap to start this day →
                  </Text>
                )}
                {topic.sourceRefs.map((ref, i) => (
                  <View key={i} className="flex-row items-center gap-[4px] mt-[4px]">
                    <NucleoIcon name="link" size={12} />
                    <Text className="text-text-muted text-xs">
                      {ref.label}
                    </Text>
                  </View>
                ))}
              </View>
            </TouchableOpacity>
          );
        })}

        {/* Actions */}
        {(level.status === 'active' || level.status === 'failed') && (
          <TouchableOpacity className="bg-accent-primary rounded-md py-md items-center mt-sm" onPress={onTakeQuiz}>
            <Text className="text-text-primary text-md font-semibold">
              {level.status === 'failed' ? 'Retry Quiz' : 'Take Level Quiz'}
            </Text>
          </TouchableOpacity>
        )}

        {level.completedAt && (
          <Text className="text-text-muted text-xs text-center mt-sm">
            Completed {new Date(level.completedAt).toLocaleDateString()}
          </Text>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
}
