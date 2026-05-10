/**
 * Session Complete — overlay showing study session summary
 */
import { NucleoIcon, NucleoIconName } from '@/components/ui/NucleoIcon';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from '../ui/Button';

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
      <View className="bg-bg-secondary rounded-xl border border-border-medium p-[32px] w-full gap-[36px]" style={{ maxWidth: 920 }}>
        <View className="flex-row items-center justify-center gap-xl">
          <View className="flex-row items-center gap-lg">
            <View className="shrink-0">
              <NucleoIcon name="award-gold" size={64} />
            </View>
            <Text className="text-text-primary text-4xl font-black leading-none text-left">
              Session Complete!
            </Text>
          </View>
        </View>

        <View className="w-full gap-md">
          <View className="flex-row gap-xl">
            <StatItem iconName="calendar" label="Time Studied" value={`${durationMinutes} min`} compact />
            <StatItem iconName="star-xp" label="XP Earned" value={`+${pointsEarned}`} compact />
            <StatItem iconName="flame-fire" label="Streak" value={`${streakDay} days`} compact />
          </View>
        </View>

        <View className="w-full max-w-[180px] shrink-0 self-center">
          <Button title="Done" onPress={onDismiss} fullWidth size="lg" />
        </View>
      </View>
    </View>
  );
}

function StatItem({
  iconName,
  label,
  value,
  compact = true,
}: { iconName: NucleoIconName; label: string; value: string; compact?: boolean }) {
  return (
    <View
      className={`flex-1 min-w-0 rounded-lg border border-border-subtle bg-bg-tertiary ${compact ? 'p-md' : 'p-lg'}`}
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
        elevation: 3,
      }}
    >
      <View className="flex-row items-center gap-sm mb-sm min-w-0">
        <NucleoIcon name={iconName} size={compact ? 18 : 20} />
        <Text className={`text-text-secondary flex-1 ${compact ? 'text-sm font-medium' : 'text-md font-medium'}`} numberOfLines={1}>
          {label}
        </Text>
      </View>
      <Text className={`text-text-primary font-extrabold ${compact ? 'text-xl' : 'text-2xl'}`} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}
