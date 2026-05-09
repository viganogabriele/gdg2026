/**
 * Focus Mode — Pomodoro timer with current topic and source refs
 */
import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NucleoIcon } from '@/components/ui/NucleoIcon';
import { PomodoroTimer } from '@/components/focus/PomodoroTimer';
import { SessionComplete } from '@/components/focus/SessionComplete';
import { Button } from '@/components/ui/Button';
import { useStudyStore } from '@/hooks/useStudyStore';
import { useGamePoints } from '@/hooks/useGamePoints';
import { Colors } from '@/constants/theme';
import type { StudySession } from '@/types';

export default function FocusScreen() {
  const store = useStudyStore();
  const { awardSessionPoints, stats } = useGamePoints();
  const [sessionComplete, setSessionComplete] = useState(false);
  const [pointsEarned, setPointsEarned] = useState(0);

  const activeLevel = store.levels.find((l) => l.status === 'active');
  const currentTopic = activeLevel?.topics.find((t) => !t.completed);

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

  return (
    <SafeAreaView className="flex-1 bg-bg-primary">
      {/* Header */}
      <View className="flex-row justify-end p-md">
        <Button title="✕ Close" variant="ghost" onPress={() => router.back()} />
      </View>

      {/* Current Topic Info */}
      {activeLevel && (
        <View className="items-center px-xxl mb-lg">
          <Text className="text-accent-primary text-sm font-bold tracking-[1px]">Level {activeLevel.levelNumber}</Text>
          <Text className="text-text-primary text-xl font-bold mt-xs">{activeLevel.title}</Text>
          {currentTopic && (
            <View className="bg-bg-secondary rounded-md p-md mt-md border border-border-subtle w-full">
              <Text className="text-text-primary text-md font-medium">{currentTopic.title}</Text>
              {currentTopic.sourceRefs.map((ref, i) => (
                <View key={i} className="flex-row items-center gap-[4px] mt-xs">
                  <NucleoIcon name="link" size={12} />
                  <Text className="text-accent-secondary text-xs">{ref.label}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      )}

      {/* Timer */}
      <PomodoroTimer onSessionComplete={handleSessionComplete} />

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
