/**
 * Session Complete — overlay showing study session summary
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/ui/Button';
import { Colors } from '@/constants/theme';

interface SessionCompleteProps {
  durationMinutes: number;
  pointsEarned: number;
  streakDay: number;
  onDismiss: () => void;
}

export function SessionComplete({
  durationMinutes, pointsEarned, streakDay, onDismiss,
}: SessionCompleteProps) {
  return (
    <View className="absolute inset-0 bg-bg-overlay justify-center items-center p-xxl" style={StyleSheet.absoluteFillObject}>
      <View className="bg-bg-secondary rounded-xl p-xxxl w-full items-center border border-border-medium">
        <View className="mb-lg">
          <Ionicons name="trophy" size={64} color={Colors.accent.xp} />
        </View>
        <Text className="text-text-primary text-xxl font-bold mb-xxl">Session Complete!</Text>

        <View className="w-full gap-md mb-xxl">
          <StatItem iconName="time-outline" label="Time Studied" value={`${durationMinutes} min`} />
          <StatItem iconName="star" label="XP Earned" value={`+${pointsEarned}`} />
          <StatItem iconName="flame" label="Streak" value={`${streakDay} days`} />
        </View>

        <Button title="Done" onPress={onDismiss} fullWidth size="lg" />
      </View>
    </View>
  );
}

function StatItem({ iconName, label, value }: { iconName: string; label: string; value: string }) {
  return (
    <View className="flex-row items-center bg-bg-tertiary rounded-md p-lg">
      <View className="mr-md">
        <Ionicons name={iconName as any} size={20} color={Colors.text.primary} />
      </View>
      <Text className="text-text-secondary text-md flex-1">{label}</Text>
      <Text className="text-text-primary text-lg font-bold">{value}</Text>
    </View>
  );
}
