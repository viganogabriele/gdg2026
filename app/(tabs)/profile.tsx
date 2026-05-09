/**
 * Profile / Settings Screen — stats, badges, preferences
 */
import React from 'react';
import { ScrollView, View, Text, StyleSheet, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '@/components/ui/Card';
import { BadgeDisplay } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useStudyStore } from '@/hooks/useStudyStore';
import { BadgeDefinitions } from '@/constants/gamification';
import { Colors, BorderRadius, FontSize, FontWeight, Spacing } from '@/constants/theme';

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
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Profile</Text>

        {/* Stats Cards */}
        <View style={styles.statsGrid}>
          <StatCard icon="⏱" label="Study Time" value={formatHours(stats.totalStudyMinutes)} />
          <StatCard icon="⭐" label="Total XP" value={String(stats.totalPoints)} />
          <StatCard icon="📚" label="Levels Done" value={String(stats.levelsCompleted)} />
          <StatCard icon="🔥" label="Best Streak" value={`${stats.longestStreak}d`} />
        </View>

        {/* Current Subject */}
        {subjects[0] && (
          <Card style={styles.subjectCard}>
            <Text style={styles.sectionTitle}>📖 Current Subject</Text>
            <Text style={styles.subjectName}>{subjects[0].title}</Text>
            <Text style={styles.subjectMeta}>
              Deadline: {new Date(subjects[0].deadline).toLocaleDateString()}
            </Text>
          </Card>
        )}

        {/* Badges */}
        <Text style={styles.sectionTitle}>🏆 Badges</Text>
        <View style={styles.badgeGrid}>
          {BadgeDefinitions.map((def) => (
            <BadgeDisplay
              key={def.id}
              icon={def.icon}
              title={def.title}
              description={def.description}
              earned={earnedBadgeIds.has(def.id)}
              size="md"
            />
          ))}
        </View>

        {/* Notification Settings */}
        <Text style={styles.sectionTitle}>🔔 Notifications</Text>
        <Card style={styles.settingsCard}>
          <SettingRow label="Daily Reminder" value={prefs.dailyReminder}
            onChange={(v) => updatePrefs({ dailyReminder: v })} />
          <SettingRow label="Deadline Warnings" value={prefs.deadlineWarnings}
            onChange={(v) => updatePrefs({ deadlineWarnings: v })} />
          <SettingRow label="Streak Warnings" value={prefs.streakWarnings}
            onChange={(v) => updatePrefs({ streakWarnings: v })} />
          <SettingRow label="Challenge Alerts" value={prefs.challengeNotifications}
            onChange={(v) => updatePrefs({ challengeNotifications: v })} />
        </Card>

        {/* Danger Zone */}
        <View style={styles.dangerZone}>
          <Button title="Reset All Data" variant="danger" onPress={handleReset} fullWidth />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatCard({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={statStyles.card}>
      <Text style={statStyles.icon}>{icon}</Text>
      <Text style={statStyles.value}>{value}</Text>
      <Text style={statStyles.label}>{label}</Text>
    </View>
  );
}

function SettingRow({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <View style={settingStyles.row}>
      <Text style={settingStyles.label}>{label}</Text>
      <Switch value={value} onValueChange={onChange}
        trackColor={{ false: Colors.bg.tertiary, true: Colors.accent.primary }}
        thumbColor={Colors.text.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg.primary },
  content: { padding: Spacing.lg, paddingBottom: Spacing.huge },
  title: { color: Colors.text.primary, fontSize: FontSize.xxl, fontWeight: FontWeight.bold, marginBottom: Spacing.xxl },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md, marginBottom: Spacing.xxl },
  subjectCard: { marginBottom: Spacing.xxl },
  subjectName: { color: Colors.text.primary, fontSize: FontSize.lg, fontWeight: FontWeight.semibold, marginTop: Spacing.sm },
  subjectMeta: { color: Colors.text.muted, fontSize: FontSize.sm, marginTop: Spacing.xs },
  sectionTitle: { color: Colors.text.primary, fontSize: FontSize.lg, fontWeight: FontWeight.bold, marginBottom: Spacing.md, marginTop: Spacing.lg },
  badgeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md, marginBottom: Spacing.lg },
  settingsCard: { marginBottom: Spacing.xxl },
  dangerZone: { marginTop: Spacing.xxl, paddingBottom: Spacing.xxl },
});

const statStyles = StyleSheet.create({
  card: { flex: 1, minWidth: '45%', backgroundColor: Colors.bg.secondary, borderRadius: BorderRadius.lg, padding: Spacing.lg, alignItems: 'center', borderWidth: 1, borderColor: Colors.border.subtle },
  icon: { fontSize: 24, marginBottom: Spacing.sm },
  value: { color: Colors.text.primary, fontSize: FontSize.xxl, fontWeight: FontWeight.bold },
  label: { color: Colors.text.muted, fontSize: FontSize.xs, marginTop: Spacing.xs },
});

const settingStyles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.border.subtle },
  label: { color: Colors.text.primary, fontSize: FontSize.md },
});
