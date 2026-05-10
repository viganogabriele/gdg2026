/**
 * Profile Screen — stats, subject, badges
 */
import { BadgeDisplay } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { NucleoIcon, NucleoIconName } from '@/components/ui/NucleoIcon';
import { ResponsiveContainer } from '@/components/ui/ResponsiveContainer';
import { BadgeDefinitions } from '@/constants/gamification';
import { Colors } from '@/constants/theme';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import { useStudyStore } from '@/hooks/useStudyStore';
import React from 'react';
import { DimensionValue, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileScreen() {
  const stats = useStudyStore((s) => s.stats);
  const subjects = useStudyStore((s) => s.subjects);
  const roadmaps = useStudyStore((s) => s.roadmaps);
  const { isWide, isDesktop, contentPadding } = useResponsiveLayout();

  const earnedBadgeIds = new Set(stats.badges.map((b) => b.id));

  const formatHours = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  // On tablet/desktop, show 4 stat cards in a row; on mobile, 2 per row (flex-wrap)
  const statCardMinWidth: DimensionValue = isWide ? '22%' : '45%';
  // Badge grid: more columns on wider screens
  const badgeWidth: DimensionValue = isDesktop ? '18%' : isWide ? '22%' : '30%';

  return (
    <SafeAreaView className="flex-1 bg-bg-primary" edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: contentPadding, paddingBottom: 48 }} showsVerticalScrollIndicator={false}>
        <ResponsiveContainer maxWidth={720}>
          <Text className="text-text-primary text-xxl font-bold mb-xxl">Profile</Text>

          <View className="flex-row flex-wrap gap-md mb-xxl">
            <StatCard iconName="calendar" label="Study Time" value={formatHours(stats.totalStudyMinutes)} minWidth={statCardMinWidth} />
            <StatCard iconName="star-xp" label="Total XP" value={String(stats.totalPoints)} minWidth={statCardMinWidth} />
            <StatCard iconName="award-gold" label="Levels Done" value={String(stats.levelsCompleted)} minWidth={statCardMinWidth} />
            <StatCard iconName="flame-fire" label="Best Streak" value={`${stats.longestStreak}d`} minWidth={statCardMinWidth} />
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

          {isDesktop ? (
            <Card style={{ marginBottom: 24, padding: 0, overflow: 'hidden' }}>
              {BadgeDefinitions.map((def, i) => {
                const earned = earnedBadgeIds.has(def.id);
                return (
                  <View
                    key={def.id}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingHorizontal: 20,
                      paddingVertical: 14,
                      gap: 16,
                      borderBottomWidth: i < BadgeDefinitions.length - 1 ? 1 : 0,
                      borderBottomColor: Colors.border.subtle,
                      opacity: earned ? 1 : 0.5,
                    }}
                  >
                    <View style={{
                      width: 44, height: 44, borderRadius: 12,
                      alignItems: 'center', justifyContent: 'center',
                      backgroundColor: earned ? Colors.bg.tertiary : Colors.bg.secondary,
                      borderWidth: 1.5,
                      borderColor: earned ? '#FFD000' : Colors.border.subtle,
                    }}>
                      <NucleoIcon
                        name={def.icon as NucleoIconName}
                        size={24}
                        style={!earned ? { opacity: 0.25 } : undefined}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: Colors.text.primary, fontWeight: '600', fontSize: 14 }}>{def.title}</Text>
                      {def.description && (
                        <Text style={{ color: Colors.text.muted, fontSize: 12, marginTop: 2 }}>{def.description}</Text>
                      )}
                    </View>
                    <View style={{
                      paddingHorizontal: 10, paddingVertical: 4,
                      borderRadius: 20,
                      backgroundColor: earned ? 'rgba(255,208,0,0.12)' : Colors.bg.tertiary,
                      borderWidth: 1,
                      borderColor: earned ? '#FFD000' : Colors.border.subtle,
                    }}>
                      <Text style={{
                        fontSize: 11, fontWeight: '600',
                        color: earned ? '#FFD000' : Colors.text.muted,
                        letterSpacing: 0.3,
                      }}>
                        {earned ? 'Earned' : 'Locked'}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </Card>
          ) : (
            <View className="flex-row flex-wrap mb-lg" style={{ gap: 12 }}>
              {BadgeDefinitions.map((def) => (
                <View key={def.id} style={{ width: badgeWidth, flexGrow: 1 }}>
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
          )}
        </ResponsiveContainer>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatCard({ iconName, label, value, minWidth }: { iconName: NucleoIconName; label: string; value: string; minWidth: DimensionValue }) {
  return (
    <View className="flex-1 bg-bg-secondary rounded-lg p-lg items-center border border-border-subtle" style={{ minWidth }}>
      <NucleoIcon name={iconName} size={24} />
      <Text className="text-text-primary text-xxl font-bold mt-sm">{value}</Text>
      <Text className="text-text-muted text-xs mt-xs">{label}</Text>
    </View>
  );
}
