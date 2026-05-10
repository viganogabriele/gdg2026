/**
 * Home Dashboard — Daily objectives, level, streak, quick actions
 */
import { DailyObjectives } from '@/components/home/DailyObjectives';
import { LevelIndicator } from '@/components/home/LevelIndicator';
import { QuickActions } from '@/components/home/QuickActions';
import { StreakCounter } from '@/components/home/StreakCounter';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useSpacedRepetition } from '@/hooks/useSpacedRepetition';
import { useStudyStore } from '@/hooks/useStudyStore';
import { router } from 'expo-router';
import React, { useEffect } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
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
  }, [updateStreak]);

  const onboardingData = useStudyStore((s) => s.onboardingData);
  const activeSubject = subjects[0];
  const activeLevel = levels.find((l) => l.status === 'active');
  const currentLevelNum = activeLevel?.levelNumber || 1;

  const levelTotalDays = activeLevel
    ? Math.max(1, Math.ceil(activeLevel.requiredStudyMinutes / 60 / (onboardingData.hoursPerWeek || 10) * 7))
    : 30;

  const handleChallenge = () => {
    if (activeLevel) {
      router.push(`/quiz/${activeLevel.id}`);
    }
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

        {/* Focus Mode Manual Button */}
        <View className="mt-md">
          <TouchableOpacity
            className="bg-bg-secondary border border-border-subtle rounded-xl p-md flex-row items-center justify-between"
            onPress={() => router.push('/focus')}
            activeOpacity={0.7}
          >
            <View className="flex-row items-center gap-md">
              <View className="bg-accent-primary/20 p-sm rounded-lg">
                <IconSymbol
                  name="eye"
                  size={20}
                  weight="medium"
                  color={Colors.text.secondary}
                />

              </View>
              <View>
                <Text className="text-text-primary text-md font-bold">Focus Mode</Text>
                <Text className="text-text-muted text-sm">Rotate phone to auto-start</Text>
              </View>
            </View>
            <IconSymbol
              name="chevron.right"
              size={16}
              weight="medium"
              color={Colors.text.secondary}
            />
          </TouchableOpacity>
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
            challengeAvailable={!!activeLevel}
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
