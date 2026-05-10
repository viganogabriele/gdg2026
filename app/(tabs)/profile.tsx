/**
 * Profile / Settings Screen — stats, badges, preferences
 */
import { BadgeDisplay } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { NucleoIcon, NucleoIconName } from '@/components/ui/NucleoIcon';
import { BadgeDefinitions } from '@/constants/gamification';
import { Colors } from '@/constants/theme';
import { useStudyStore } from '@/hooks/useStudyStore';
import React from 'react';
import { Alert, ScrollView, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileScreen() {
  const stats = useStudyStore((s) => s.stats);
  const prefs = useStudyStore((s) => s.notificationPrefs);
  const updatePrefs = useStudyStore((s) => s.updateNotificationPrefs);
  const resetStore = useStudyStore((s) => s.resetStore);
  const subjects = useStudyStore((s) => s.subjects);

  const earnedBadgeIds = new Set(stats.badges.map((b) => b.id));

  const handleReset = () => {
    Alert.alert(
      'Reset App',
      'This will delete all your study data. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reset', style: 'destructive', onPress: () => resetStore() },
      ]
    );
  };

  const formatHours = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  return (
    <SafeAreaView className="flex-1 bg-bg-primary" edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 48 }} showsVerticalScrollIndicator={false}>
        <Text className="text-text-primary text-xxl font-bold mb-xxl">Profile</Text>

        {/* Stats Cards */}
        <View className="flex-row flex-wrap gap-md mb-xxl">
          <StatCard iconName="calendar" label="Study Time" value={formatHours(stats.totalStudyMinutes)} />
          <StatCard iconName="star-xp" label="Total XP" value={String(stats.totalPoints)} />
          <StatCard iconName="award-gold" label="Levels Done" value={String(stats.levelsCompleted)} />
          <StatCard iconName="flame-fire" label="Best Streak" value={`${stats.longestStreak}d`} />
        </View>

        {/* Current Subject */}
        {subjects[0] && (
          <Card style={{ marginBottom: 24 }}>
            <View className="flex-row items-center gap-sm mb-sm">
              <NucleoIcon name="book-open" size={18} />
              <Text className="text-text-primary text-lg font-bold">Current Subject</Text>
            </View>
            <Text className="text-text-primary text-lg font-semibold mt-sm">{subjects[0].title}</Text>
            <Text className="text-text-muted text-sm mt-xs">
              Deadline: {new Date(subjects[0].deadline).toLocaleDateString()}
            </Text>
          </Card>
        )}

        {/* Badges */}
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

        {/* Notification Settings */}
        <View className="flex-row items-center gap-sm mb-md mt-lg">
          <NucleoIcon name="bell" size={18} />
          <Text className="text-text-primary text-lg font-bold">Notifications</Text>
        </View>
        <Card style={{ marginBottom: 24 }}>
          <SettingRow label="Daily Reminder" value={prefs.dailyReminder}
            onChange={(v) => updatePrefs({ dailyReminder: v })} />
          <SettingRow label="Deadline Warnings" value={prefs.deadlineWarnings}
            onChange={(v) => updatePrefs({ deadlineWarnings: v })} />
          <SettingRow label="Streak Warnings" value={prefs.streakWarnings}
            onChange={(v) => updatePrefs({ streakWarnings: v })} />
          <SettingRow label="Challenge Alerts" value={prefs.challengeNotifications}
            onChange={(v) => updatePrefs({ challengeNotifications: v })} last />
        </Card>

        {/* Danger Zone */}
        <View className="mt-xxl pb-xxl">
          <Button title="Reset All Data" variant="danger" onPress={handleReset} fullWidth />
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

function SettingRow({ label, value, onChange, last }: { label: string; value: boolean; onChange: (v: boolean) => void; last?: boolean }) {
  return (
    <View className={`flex-row justify-between items-center py-md ${last ? '' : 'border-b border-border-subtle'}`}>
      <Text className="text-text-primary text-md">{label}</Text>
      <Switch value={value} onValueChange={onChange}
        trackColor={{ false: Colors.bg.tertiary, true: Colors.accent.primary }}
        thumbColor={Colors.text.primary} />
    </View>
  );
}
