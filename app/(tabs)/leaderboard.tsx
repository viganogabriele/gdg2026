import { LeaderboardRow } from '@/components/leaderboard/LeaderboardRow';
import { PodiumView } from '@/components/leaderboard/PodiumView';
import { useLeaderboard } from '@/hooks/useLeaderboard';
import React from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/theme';

export default function LeaderboardScreen() {
  const { entries, loading } = useLeaderboard();

  return (
    <SafeAreaView className="flex-1 bg-bg-primary" edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 48 }} showsVerticalScrollIndicator={false}>
        <Text className="text-text-primary text-xxl font-bold mb-xxl">Leaderboard</Text>

        {loading ? (
          <View className="items-center py-xxl">
            <ActivityIndicator color={Colors.accent.primary} />
          </View>
        ) : (
          <>
            <PodiumView top3={entries.slice(0, 3)} />
            <View className="gap-sm">
              {entries.map((entry, idx) => (
                <LeaderboardRow key={entry.id} entry={entry} rank={idx + 1} />
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
