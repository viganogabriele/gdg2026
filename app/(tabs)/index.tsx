/**
 * Home Dashboard — Daily objectives, level, streak, quick actions
 */
import { DailyObjectives } from '@/components/home/DailyObjectives';
import { LevelIndicator } from '@/components/home/LevelIndicator';
import { QuickActions } from '@/components/home/QuickActions';
import { RoadmapSelector } from '@/components/roadmap/RoadmapSelector';
import { StreakCounter } from '@/components/home/StreakCounter';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { NucleoIcon } from '@/components/ui/NucleoIcon';
import { ResponsiveContainer } from '@/components/ui/ResponsiveContainer';
import { Colors } from '@/constants/theme';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
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
  const { isDesktop, isWide, contentPadding } = useResponsiveLayout();

  useEffect(() => {
    updateStreak();
  }, [updateStreak]);

  const activeSubject = subjects[0];
  const activeLevel = levels.find((l) => l.status === 'active');
  const currentLevelNum = Math.floor(stats.totalPoints / 100) + 1;

  const onboardingData = useStudyStore((s) => s.onboardingData);
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

  // Shared elements
  const headerEl = (
    <View className="mb-lg">
      <RoadmapSelector />
    </View>
  );

  const levelEl = (
    <LevelIndicator
      currentLevel={currentLevelNum}
      totalLevels={levels.length}
      levelTitle={activeLevel?.title || 'No active level'}
      completedMinutes={activeLevel?.completedStudyMinutes || 0}
      requiredMinutes={activeLevel?.requiredStudyMinutes || 100}
      deadline={activeLevel?.deadline || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()}
      totalPoints={stats.totalPoints}
    />
  );

  const streakEl = (
    <StreakCounter
      currentStreak={stats.currentStreak}
      longestStreak={stats.longestStreak}
    />
  );

  const quickActionsEl = (
    <View style={{ marginTop: isDesktop ? 24 : 32 }}>
      <QuickActions
        onTakeChallenge={handleChallenge}
        onQuickReview={handleQuickReview}
        hasDueReviews={hasDueCards}
        dueReviewCount={dueCount}
        challengeAvailable={challengeAvailable}
        challengeBoosted={challengeBoosted}
      />
    </View>
  );

  const focusModeEl = (
    <View style={{ marginTop: isDesktop ? 24 : 32 }}>
      <TouchableOpacity
        className="bg-bg-secondary border border-border-subtle rounded-xl p-md flex-row items-center justify-between"
        onPress={() => router.push('/focus')}
        activeOpacity={0.7}
      >
        <View className="flex-row items-center gap-md">
          <View className="bg-accent-primary/20 p-sm rounded-lg">
            <NucleoIcon
              name="eye"
              size={20}
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
  );

  const objectivesEl = (
    <View style={{ marginTop: isDesktop ? 24 : 32 }}>
      <DailyObjectives
        objectives={dailyObjectives}
        onComplete={completeObjective}
        onPress={handleObjectivePress}
      />
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-bg-primary" edges={['top']}>
      <ScrollView
        contentContainerStyle={{ padding: contentPadding, paddingBottom: 48 }}
        showsVerticalScrollIndicator={false}
      >
        <ResponsiveContainer maxWidth={960}>
          {/* Header */}
          {headerEl}

          {isDesktop ? (
            <>
              {/* Top row: Level (left) | Streak + QuickActions + FocusMode (right) */}
              <View style={{ flexDirection: 'row', gap: 24, alignItems: 'flex-start' }}>
                <View style={{ flex: 1 }}>
                  {levelEl}
                </View>
                <View style={{ flex: 1, gap: 16 }}>
                  {streakEl}
                  {quickActionsEl}
                  {focusModeEl}
                </View>
              </View>

              {/* Full width: Objectives */}
              {objectivesEl}
            </>
          ) : isWide ? (
            /* Tablet: Level + Streak side by side, then rest stacked */
            <>
              <View style={{ flexDirection: 'row', gap: 16, alignItems: 'flex-start' }}>
                <View style={{ flex: 1 }}>
                  {levelEl}
                </View>
                <View style={{ flex: 1 }}>
                  {streakEl}
                </View>
              </View>
              {quickActionsEl}
              {focusModeEl}
              {objectivesEl}
            </>
          ) : (
            /* Mobile: original stacked layout */
            <>
              {levelEl}
              {streakEl}
              {quickActionsEl}
              {focusModeEl}
              {objectivesEl}
            </>
          )}
        </ResponsiveContainer>
      </ScrollView>
    </SafeAreaView>
  );
}
