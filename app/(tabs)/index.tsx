/**
 * Home Dashboard — Daily objectives, level, streak, quick actions
 */
import { DailyObjectives } from '@/components/home/DailyObjectives';
import { LevelIndicator } from '@/components/home/LevelIndicator';
import { QuickActions } from '@/components/home/QuickActions';
import { StreakCounter } from '@/components/home/StreakCounter';
import { useSpacedRepetition } from '@/hooks/useSpacedRepetition';
import { useStudyStore } from '@/hooks/useStudyStore';
import { router } from 'expo-router';
import React, { useEffect } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const subjects = useStudyStore((s) => s.subjects);
  const levels = useStudyStore((s) => s.levels);
  const stats = useStudyStore((s) => s.stats);
  const dailyObjectives = useStudyStore((s) => s.dailyObjectives);
  const completeObjective = useStudyStore((s) => s.completeObjective);
  const updateStreak = useStudyStore((s) => s.updateStreak);
  const { hasDueCards, dueCount } = useSpacedRepetition();

  useEffect(() => {
    updateStreak();
  }, []);

  const onboardingData = useStudyStore((s) => s.onboardingData);
  const activeSubject = subjects[0];
  const activeLevel = levels.find((l) => l.status === 'active');
  const currentLevelNum = activeLevel?.levelNumber || 1;

  const levelTotalDays = activeLevel
    ? Math.max(1, Math.ceil(activeLevel.requiredStudyMinutes / 60 / (onboardingData.hoursPerWeek || 10) * 7))
    : 30;

  const completedObjectivesCount = dailyObjectives.filter(o => o.completed).length;
  const challengeAvailable = completedObjectivesCount > 0;
  const challengeBoosted = dailyObjectives.length > 0 && completedObjectivesCount === dailyObjectives.length;

  const handleChallenge = () => {
    router.push('/quiz/daily-challenge');
  };

  const handleQuickReview = () => {
    router.push('/spaced-review');
  };

  const handleObjectivePress = (objective: import('@/types').DailyObjective) => {
    if (activeLevel) {
      router.push(`/focus?objectiveId=${objective.id}`);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-bg-primary" edges={['top']}>
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 48 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="mb-lg">
          <Text className="text-text-primary text-xxl font-bold mt-[4px]" numberOfLines={1}>
            {activeSubject?.title || 'StudyQuest'}
          </Text>
        </View>

        {/* Level Indicator */}
        <LevelIndicator
          currentLevel={currentLevelNum}
          totalLevels={levels.length}
          levelTitle={activeLevel?.title || 'No active level'}
          completedMinutes={activeLevel?.completedStudyMinutes || 0}
          requiredMinutes={activeLevel?.requiredStudyMinutes || 100}
          deadline={activeLevel?.deadline || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()}
          totalDays={levelTotalDays}
        />

        {/* Streak */}
        <StreakCounter
          currentStreak={stats.currentStreak}
          longestStreak={stats.longestStreak}
        />

        {/* Quick Actions */}
        <View className="mt-xxl">
          <QuickActions
            onTakeChallenge={handleChallenge}
            onQuickReview={handleQuickReview}
            hasDueReviews={hasDueCards}
            dueReviewCount={dueCount}
            challengeAvailable={challengeAvailable}
            challengeBoosted={challengeBoosted}
          />
        </View>

        {/* Daily Objectives */}
        <View className="mt-xxl">
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
