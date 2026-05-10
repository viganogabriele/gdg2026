import { Card } from '@/components/ui/Card';
import { NucleoIcon } from '@/components/ui/NucleoIcon';
import { Colors } from '@/constants/theme';
import { LeaderboardEntry } from '@/services/leaderboard';
import React from 'react';
import { Text, View } from 'react-native';
import { MEDAL } from './MedalConfig';

interface LeaderboardRowProps {
  entry: LeaderboardEntry;
  rank: number;
}

export function LeaderboardRow({ entry, rank }: LeaderboardRowProps) {
  const isTop3 = rank <= 3;
  const medal = isTop3 ? MEDAL[rank as 1 | 2 | 3] : null;

  return (
    <Card
      style={{
        borderColor: entry.isMe
          ? `${Colors.accent.primary}99`
          : isTop3
          ? `${medal!.border}66`
          : Colors.border.subtle,
      }}
    >
      <View className="flex-row items-center gap-md">
        <View style={{ width: 32, alignItems: 'center' }}>
          {isTop3 ? (
            <NucleoIcon name={medal!.icon} size={24} />
          ) : (
            <Text className="text-text-muted font-bold text-md">#{rank}</Text>
          )}
        </View>

        <View
          style={{
            width: 40, height: 40, borderRadius: 20,
            backgroundColor: entry.isMe ? Colors.accent.primary : Colors.bg.tertiary,
            borderWidth: 1.5,
            borderColor: entry.isMe ? Colors.accent.primary : Colors.border.subtle,
            alignItems: 'center', justifyContent: 'center',
          }}
        >
          <Text style={{ color: entry.isMe ? '#fff' : Colors.text.muted, fontWeight: '700', fontSize: 16 }}>
            {entry.name[0].toUpperCase()}
          </Text>
        </View>

        <View className="flex-1">
          <Text
            className="font-semibold text-md"
            style={{ color: entry.isMe ? Colors.accent.primaryLight : Colors.text.primary }}
          >
            {entry.name}{entry.isMe ? ' (tu)' : ''}
          </Text>
          <View className="flex-row items-center gap-xs mt-[2px]">
            <NucleoIcon name="flame-fire" size={12} />
            <Text className="text-text-muted text-xs">{entry.streak}d streak</Text>
          </View>
        </View>

        <View className="items-end">
          <View className="flex-row items-center gap-xs">
            <NucleoIcon name="star-xp" size={14} />
            <Text
              className="font-bold text-md"
              style={{ color: isTop3 ? medal!.text : Colors.text.primary }}
            >
              {entry.xp}
            </Text>
          </View>
          <Text className="text-text-muted text-xs">XP</Text>
        </View>
      </View>
    </Card>
  );
}
