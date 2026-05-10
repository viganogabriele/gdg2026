/**
 * Profile Screen — stats, subject, badges
 */
import { BadgeDisplay } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { NucleoIcon, NucleoIconName } from '@/components/ui/NucleoIcon';
import { BadgeDefinitions } from '@/constants/gamification';
import { useStudyStore } from '@/hooks/useStudyStore';
import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileScreen() {
  const stats = useStudyStore((s) => s.stats);
  const subjects = useStudyStore((s) => s.subjects);
  const roadmaps = useStudyStore((s) => s.roadmaps);

  const earnedBadgeIds = new Set(stats.badges.map((b) => b.id));

  const formatHours = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  return (
    <SafeAreaView className="flex-1 bg-bg-primary" edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 48 }} showsVerticalScrollIndicator={false}>
        <Text className="text-text-primary text-xxl font-bold mb-xxl">Profile</Text>

        <View className="flex-row flex-wrap gap-md mb-xxl">
          <StatCard iconName="calendar" label="Study Time" value={formatHours(stats.totalStudyMinutes)} />
          <StatCard iconName="star-xp" label="Total XP" value={String(stats.totalPoints)} />
          <StatCard iconName="award-gold" label="Levels Done" value={String(stats.levelsCompleted)} />
          <StatCard iconName="flame-fire" label="Best Streak" value={`${stats.longestStreak}d`} />
        </View>

        {subjects[0] && (
          <Card style={{ marginBottom: 24 }}>
            <View className="flex-row items-center gap-sm mb-sm">
              <NucleoIcon name="book-open" size={18} />
              <Text className="text-text-primary text-lg font-bold">Active Subject</Text>
            </View>
            <Text className="text-text-primary text-lg font-semibold mt-sm">{subjects[0].title}</Text>
            <Text className="text-text-muted text-sm mt-xs">
              Deadline: {new Date(subjects[0].deadline).toLocaleDateString()}
            </Text>
            {roadmaps.length > 1 && (
              <Text className="text-text-muted text-xs mt-sm">
                {roadmaps.length} subjects total
              </Text>
            )}
          </Card>
        )}

        <View className="flex-row items-center gap-sm mb-md mt-lg">
          <NucleoIcon name="award-gold" size={18} />
          <Text className="text-text-primary text-lg font-bold">Badges</Text>
        </View>
        <View className="flex-row flex-wrap mb-lg" style={{ gap: 12 }}>
          {BadgeDefinitions.map((def) => (
            <View key={def.id} style={{ width: '30%', flexGrow: 1 }}>
              <BadgeDisplay
                icon={def.icon}
                title={def.title}
                description={def.description}
                earned={earnedBadgeIds.has(def.id)}
                size="md"
              />
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatCard({ iconName, label, value }: { iconName: NucleoIconName; label: string; value: string }) {
  return (
    <View className="flex-1 min-w-[45%] bg-bg-secondary rounded-lg p-lg items-center border border-border-subtle">
      <NucleoIcon name={iconName} size={24} />
      <Text className="text-text-primary text-xxl font-bold mt-sm">{value}</Text>
      <Text className="text-text-muted text-xs mt-xs">{label}</Text>
    </View>
  );
}
