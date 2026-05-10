/**
 * Focus Mode — Pomodoro timer with current topic and source refs
 * On tablet/desktop, shows landscape layout directly without rotation transforms.
 */
import { PomodoroTimer } from '@/components/focus/PomodoroTimer';
import { SessionComplete } from '@/components/focus/SessionComplete';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { NucleoIcon } from '@/components/ui/NucleoIcon';
import { Colors } from '@/constants/theme';
import { useGamePoints } from '@/hooks/useGamePoints';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import { useStudyStore } from '@/hooks/useStudyStore';
import type { StudySession } from '@/types';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { Platform, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

export default function FocusScreen() {
  const store = useStudyStore();
  const { awardSessionPoints, stats } = useGamePoints();
  const [sessionComplete, setSessionComplete] = useState(false);
  const [pointsEarned, setPointsEarned] = useState(0);
  const { objectiveId } = useLocalSearchParams<{ objectiveId?: string }>();
  const { isWide } = useResponsiveLayout();

  const activeLevel = store.levels.find((l) => l.status === 'active');
  const currentTopic = activeLevel?.topics.find((t) => !t.completed);

  const activeObjective = objectiveId
    ? store.dailyObjectives.find((o) => o.id === objectiveId)
    : undefined;
  const targetSessions = activeObjective
    ? Math.ceil(activeObjective.estimatedMinutes / 25)
    : undefined;
  const { width, height } = useWindowDimensions();
  const saInsets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ dir?: string }>();
  // Default to 90deg (Landscape Right) if not specified
  const rotation = Platform.OS === 'ios' ? (params.dir === 'left' ? '90deg' : '-90deg') : (params.dir === 'left' ? '-90deg' : '90deg');

  const handleSessionComplete = (durationMinutes: number) => {
    // Create session record
    const session: StudySession = {
      id: `session_${Date.now()}`,
      subjectId: store.activeSubjectId || 'subject_1',
      levelId: activeLevel?.id || '',
      startedAt: new Date(Date.now() - durationMinutes * 60000).toISOString(),
      durationMinutes,
      type: 'pomodoro',
    };
    store.startSession(session);
    store.endSession(session.id);

    const pts = awardSessionPoints();
    setPointsEarned(pts);
    setSessionComplete(true);
  };

  // On tablet/desktop, render native landscape layout without rotation
  if (isWide) {
    return (
      <SafeAreaView className="flex-1 bg-bg-primary">
        <View className="flex-1 flex-row">
          {/* Left Column: Topic Info */}
          <View className="flex-1 justify-center px-xxl" style={{ paddingLeft: 48 }}>
            {activeLevel && (
              <View>
                <Text className="text-accent-primary text-sm font-bold tracking-[1px] uppercase mb-xs">
                  Level {activeLevel.levelNumber}
                </Text>
                <Text className="text-text-primary font-extrabold mb-lg leading-tight" style={{ fontSize: 36 }}>
                  {activeLevel.title}
                </Text>

                {currentTopic && (
                  <View className="bg-bg-secondary rounded-xl p-xl border border-border-subtle mt-md" style={{ maxWidth: 480 }}>
                    <Text className="text-accent-xp text-xs font-bold uppercase mb-xs tracking-wider">Current Topic</Text>
                    <Text className="text-text-primary text-xl font-bold mb-md">{currentTopic.title}</Text>

                    {currentTopic.sourceRefs.map((ref, i) => (
                      <View key={i} className="flex-row items-center gap-sm mt-sm">
                        <NucleoIcon name="link" size={14} />
                        <Text className="text-gray-400 text-md font-medium">{ref.label}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            )}
          </View>

          {/* Right Column: Timer */}
          <View className="flex-1 justify-center items-center">
            <PomodoroTimer onSessionComplete={handleSessionComplete} targetSessions={targetSessions} />
          </View>
        </View>

        {/* Session Complete Overlay */}
        {sessionComplete && (
          <SessionComplete
            durationMinutes={25}
            pointsEarned={pointsEarned}
            streakDay={stats.currentStreak}
            onDismiss={() => router.back()}
          />
        )}
      </SafeAreaView>
    );
  }

  // Mobile: rotated landscape layout (original)
  return (
    <SafeAreaView className="flex-1 bg-bg-primary overflow-hidden">
      <View
        style={{
          width: height - saInsets.top - saInsets.bottom,
          height: width - saInsets.left - saInsets.right,
          position: 'absolute',
          top: (height - width) / 2,
          left: (width - height) / 2 + (rotation === '90deg' ? saInsets.top : saInsets.bottom),
          transform: [{ rotate: rotation }],
        }}
        className="bg-bg-primary"
      >
        <View className="flex-1 flex-row pt-xxl">
          {/* Left Column: Topic Info */}
          <View className="flex-1 justify-center px-xxl pl-xxxl">
            {activeLevel && (
              <View>
                <Text className="text-accent-primary text-sm font-bold tracking-[1px] uppercase mb-xs">
                  Level {activeLevel.levelNumber}
                </Text>
                <Text className="text-text-primary text-display font-extrabold mb-lg leading-tight">
                  {activeLevel.title}
                </Text>

                {currentTopic && (
                  <View className="bg-bg-secondary rounded-xl p-xl border border-border-subtle mt-md">
                    <Text className="text-accent-xp text-xs font-bold uppercase mb-xs tracking-wider">Current Topic</Text>
                    <Text className="text-text-primary text-xl font-bold mb-md">{currentTopic.title}</Text>

                    {currentTopic.sourceRefs.map((ref, i) => (
                      <View key={i} className="flex-row items-center gap-sm mt-sm">
                        <NucleoIcon name="link" size={14} />
                        <Text className="text-gray-400 text-md font-medium">{ref.label}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            )}
          </View>

          {/* Right Column: Timer */}
          <View className="flex-1 justify-center items-center">
            <PomodoroTimer onSessionComplete={handleSessionComplete} targetSessions={targetSessions} />
          </View>
        </View>

        {/* Session Complete Overlay */}
        {sessionComplete && (
          <SessionComplete
            durationMinutes={25}
            pointsEarned={pointsEarned}
            streakDay={stats.currentStreak}
            onDismiss={() => router.back()}
          />
        )}
      </View>
    </SafeAreaView >
  );
}
