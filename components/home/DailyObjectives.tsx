/**
 * Daily Objectives — scrollable card list with source refs and completion
 */
import { Card } from '@/components/ui/Card';
import { Colors } from '@/constants/theme';
import type { DailyObjective } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface DailyObjectivesProps {
  objectives: DailyObjective[];
  onComplete: (id: string) => void;
  onPress: (objective: DailyObjective) => void;
}

export function DailyObjectives({
  objectives,
  onComplete,
  onPress,
}: DailyObjectivesProps) {
  const typeIcons: Record<string, keyof typeof Ionicons.glyphMap> = {
    study: 'book-outline',
    review: 'swap-horizontal',
    quiz: 'help-circle-outline',
  };

  return (
    <View className="gap-sm">
      <Text className="text-text-primary text-lg font-bold mb-xs">Today's Objectives</Text>
      {objectives.map((obj) => (
        <TouchableOpacity key={obj.id} onPress={() => onPress(obj)} activeOpacity={0.7} className="mb-xs">
          <Card className={obj.completed ? 'opacity-60' : ''}>
            <View className="flex-row items-start gap-md">
              <TouchableOpacity
                className={`w-[24px] h-[24px] rounded-md border-2 border-accent-primary items-center justify-center mt-[2px] ${obj.completed ? 'bg-accent-primary' : ''}`}
                onPress={() => onComplete(obj.id)}
              >
                {obj.completed && <Text className="text-text-primary text-[14px] font-bold">✓</Text>}
              </TouchableOpacity>
              <View className="flex-1">
                <View className="flex-row items-center gap-sm">
                  <Ionicons name={typeIcons[obj.type] || 'book-outline'} size={16} color={Colors.text.primary} />
                  <Text
                    className={`text-text-primary text-md font-semibold flex-1 ${obj.completed ? 'line-through text-text-muted' : ''}`}
                    numberOfLines={1}
                  >
                    {obj.title}
                  </Text>
                </View>
                <Text className="text-text-secondary text-sm mt-xs leading-[18px]" numberOfLines={2}>
                  {obj.description}
                </Text>
                <View className="flex-row gap-md mt-sm">
                  <View className="flex-row items-center gap-[4px]">
                    <Ionicons name="time-outline" size={12} color={Colors.text.muted} />
                    <Text className="text-text-muted text-xs font-medium">{obj.estimatedMinutes} min</Text>
                  </View>
                  {obj.sourceRefs.length > 0 && (
                    <View className="flex-row items-center gap-[4px] flex-1">
                      <Ionicons name="attach-outline" size={12} color={Colors.accent.secondary} />
                      <Text className="text-accent-secondary text-xs font-medium flex-1" numberOfLines={1}>
                        {obj.sourceRefs[0].label}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          </Card>
        </TouchableOpacity>
      ))}
      {objectives.length === 0 && (
        <Card className="items-center py-xxl">
          <View className="flex-row items-center gap-sm">
            <Ionicons name="checkmark-circle" size={20} color={Colors.text.secondary} />
            <Text className="text-text-secondary text-md">All done for today!</Text>
          </View>
        </Card>
      )}
    </View>
  );
}
