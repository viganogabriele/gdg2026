/**
 * Home Dashboard — Daily objectives, level, streak, quick actions
 */
import React from 'react';
import { ScrollView, View, Text } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NucleoIcon } from '@/components/ui/NucleoIcon';
import { LevelIndicator } from '@/components/home/LevelIndicator';
import { StreakCounter } from '@/components/home/StreakCounter';
import { QuickActions } from '@/components/home/QuickActions';
import { DailyObjectives } from '@/components/home/DailyObjectives';
import { useStudyStore } from '@/hooks/useStudyStore';
import { useSpacedRepetition } from '@/hooks/useSpacedRepetition';
import { Colors } from '@/constants/theme';

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
    <SafeAreaView className="flex-1 bg-bg-primary" edges={['top']}>
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 48 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="flex-row justify-between items-start mb-lg">
          <View>
            <View className="flex-row items-center gap-xs">
              <Text className="text-text-secondary text-md">Welcome back</Text>
              <NucleoIcon name="face-grin" size={18} />
            </View>
            <Text className="text-text-primary text-xxl font-bold mt-[4px] max-w-[250px]" numberOfLines={1}>
              {activeSubject?.title || 'StudyQuest'}
            </Text>
          </View>
          <View className="bg-[rgba(255,215,0,0.1)] rounded-[20px] px-md py-sm border border-[rgba(255,215,0,0.2)]">
            <View className="flex-row items-center gap-[4px]">
              <NucleoIcon name="star" size={16} />
              <Text className="text-accent-xp text-md font-bold">{stats.totalPoints}</Text>
            </View>
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
