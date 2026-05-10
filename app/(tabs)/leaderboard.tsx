import { LeaderboardRow } from '@/components/leaderboard/LeaderboardRow';
import { PodiumView } from '@/components/leaderboard/PodiumView';
import { NucleoIcon } from '@/components/ui/NucleoIcon';
import { ResponsiveContainer } from '@/components/ui/ResponsiveContainer';
import { Colors } from '@/constants/theme';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import { useLeaderboard } from '@/hooks/useLeaderboard';
import { useStudyStore } from '@/hooks/useStudyStore';
import React from 'react';
import { ActivityIndicator, ScrollView, Share, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LeaderboardScreen() {
  const { entries, loading } = useLeaderboard();
  const subject = useStudyStore((s) => s.subjects[0]);
  const { isDesktop, contentPadding } = useResponsiveLayout();

  const handleShare = () => {
    const slug = subject?.title.toLowerCase().replace(/\s+/g, '-') ?? 'subject';
    Share.share({
      message: `Study with me on StudyQuest!\nhttps://studyquest.app/join/${slug}`,
      title: subject?.title,
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-bg-primary" edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: contentPadding, paddingBottom: 48 }} showsVerticalScrollIndicator={false}>
        <ResponsiveContainer maxWidth={680}>
          <View className="flex-row items-center justify-between mb-xxl">
            <Text className="text-text-primary text-xxl font-bold">Leaderboard</Text>
            <TouchableOpacity onPress={handleShare} activeOpacity={0.7} className="mt-lg">
              <NucleoIcon name="paper-plane" size={22} />
            </TouchableOpacity>
          </View>

          {loading ? (
            <View className="items-center py-xxl">
              <ActivityIndicator color={Colors.accent.primary} />
            </View>
          ) : (
            <>
              <PodiumView top3={entries.slice(0, 3)} />
              <View style={isDesktop ? { flexDirection: 'row', flexWrap: 'wrap', gap: 8 } : { gap: 8 }}>
                {entries.slice(3).map((entry, idx) => (
                  <View key={entry.id} style={isDesktop ? { width: '48.5%' } : undefined}>
                    <LeaderboardRow entry={entry} rank={idx + 4} />
                  </View>
                ))}
              </View>
            </>
          )}
        </ResponsiveContainer>
      </ScrollView>
    </SafeAreaView>
  );
}
