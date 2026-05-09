/**
 * Home Dashboard — Daily objectives, level, streak, quick actions
 */
import React from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LevelIndicator } from '@/components/home/LevelIndicator';
import { StreakCounter } from '@/components/home/StreakCounter';
import { QuickActions } from '@/components/home/QuickActions';
import { DailyObjectives } from '@/components/home/DailyObjectives';
import { useStudyStore } from '@/hooks/useStudyStore';
import { useSpacedRepetition } from '@/hooks/useSpacedRepetition';
import { Colors, FontSize, FontWeight, Spacing } from '@/constants/theme';

export default function HomeScreen() {
  const subjects = useStudyStore((s) => s.subjects);
  const levels = useStudyStore((s) => s.levels);
  const stats = useStudyStore((s) => s.stats);
  const dailyObjectives = useStudyStore((s) => s.dailyObjectives);
  const completeObjective = useStudyStore((s) => s.completeObjective);
  const { hasDueCards, dueCount } = useSpacedRepetition();

  const activeSubject = subjects[0];
  const activeLevel = levels.find((l) => l.status === 'active');
  const currentLevelNum = activeLevel?.levelNumber || 1;

  const handleChallenge = () => {
    if (activeLevel) {
      router.push(`/quiz/${activeLevel.id}`);
    }
  };

  const handleQuickReview = () => {
    router.push('/spaced-review');
  };

  const handleObjectivePress = () => {
    if (activeLevel) {
      router.push('/focus');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome back 👋</Text>
            <Text style={styles.subject} numberOfLines={1}>
              {activeSubject?.title || 'StudyQuest'}
            </Text>
          </View>
          <View style={styles.xpBadge}>
            <Text style={styles.xpText}>⭐ {stats.totalPoints}</Text>
          </View>
        </View>

        {/* Level Indicator */}
        <LevelIndicator
          currentLevel={currentLevelNum}
          totalLevels={levels.length}
          levelTitle={activeLevel?.title || 'No active level'}
          completedMinutes={activeLevel?.completedStudyMinutes || 0}
          requiredMinutes={activeLevel?.requiredStudyMinutes || 100}
          totalPoints={stats.totalPoints}
        />

        {/* Streak */}
        <StreakCounter
          currentStreak={stats.currentStreak}
          longestStreak={stats.longestStreak}
        />

        {/* Quick Actions */}
        <View style={styles.section}>
          <QuickActions
            onTakeChallenge={handleChallenge}
            onQuickReview={handleQuickReview}
            hasDueReviews={hasDueCards}
            dueReviewCount={dueCount}
            challengeAvailable={!!activeLevel}
          />
        </View>

        {/* Daily Objectives */}
        <View style={styles.section}>
          <DailyObjectives
            objectives={dailyObjectives}
            onComplete={completeObjective}
            onPress={handleObjectivePress}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg.primary },
  content: { padding: Spacing.lg, paddingBottom: Spacing.huge },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Spacing.lg },
  greeting: { color: Colors.text.secondary, fontSize: FontSize.md },
  subject: { color: Colors.text.primary, fontSize: FontSize.xxl, fontWeight: FontWeight.bold, marginTop: 4, maxWidth: 250 },
  xpBadge: { backgroundColor: 'rgba(255, 215, 0, 0.1)', borderRadius: 20, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderWidth: 1, borderColor: 'rgba(255, 215, 0, 0.2)' },
  xpText: { color: Colors.accent.xp, fontSize: FontSize.md, fontWeight: FontWeight.bold },
  section: { marginTop: Spacing.xxl },
});
