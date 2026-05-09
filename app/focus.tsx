/**
 * Focus Mode — Pomodoro timer with current topic and source refs
 */
import { PomodoroTimer } from '@/components/focus/PomodoroTimer';
import { SessionComplete } from '@/components/focus/SessionComplete';
import { Button } from '@/components/ui/Button';
import { Colors } from '@/constants/theme';
import { useGamePoints } from '@/hooks/useGamePoints';
import { useStudyStore } from '@/hooks/useStudyStore';
import type { StudySession } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { activateKeepAwake, deactivateKeepAwake } from 'expo-keep-awake';
import { router } from 'expo-router';
import * as ScreenOrientation from 'expo-screen-orientation';
import React, { useEffect, useState } from 'react';
import { Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function FocusScreen() {
  const store = useStudyStore();
  const { awardSessionPoints, stats } = useGamePoints();
  const [sessionComplete, setSessionComplete] = useState(false);
  const [pointsEarned, setPointsEarned] = useState(0);

  const activeLevel = store.levels.find((l) => l.status === 'active');
  const currentTopic = activeLevel?.topics.find((t) => !t.completed);

  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

  useEffect(() => {
    // Lock to landscape and keep awake while in focus
    let locked = false;
    (async () => {
      try {
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
        locked = true;
      } catch (e) {
        // ignore
      }
      try {
        activateKeepAwake();
      } catch (e) {}
    })();

    return () => {
      (async () => {
        try {
          if (locked) await ScreenOrientation.unlockAsync();
        } catch (e) {}
        try {
          deactivateKeepAwake();
        } catch (e) {}
      })();
    };
  }, []);

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

      {isLandscape ? (
        <View className="flex-row flex-1 px-xxl">
          {/* Left: Timer */}
          <View className="flex-1 items-center justify-center">
            <PomodoroTimer onSessionComplete={handleSessionComplete} />
          </View>

          {/* Right: Topic / Objectives / Controls */}
          <View className="w-[42%] pl-lg">
            {activeLevel && (
              <View>
                <Text className="text-accent-primary text-sm font-bold tracking-[1px]">Level {activeLevel.levelNumber}</Text>
                <Text className="text-text-primary text-lg font-bold mt-xs">{activeLevel.title}</Text>

                {currentTopic && (
                  <View className="bg-bg-secondary rounded-md p-md mt-md border border-border-subtle">
                    <Text className="text-text-primary text-md font-medium">{currentTopic.title}</Text>
                    {currentTopic.sourceRefs.map((ref, i) => (
                      <View key={i} className="flex-row items-center gap-[8px] mt-xs">
                        <Ionicons name="attach-outline" size={14} color={Colors.accent.secondary} />
                        <Text className="text-accent-secondary text-sm">{ref.label}</Text>
                      </View>
                    ))}
                  </View>
                )}

                <View className="mt-lg">
                  <Text className="text-text-muted text-sm">Streak: {stats.currentStreak} • Points: {stats.totalPoints}</Text>
                </View>

                <View className="mt-md">
                  <Button title="End & Save" variant="success" onPress={() => handleSessionComplete(25)} fullWidth />
                </View>
                <View className="mt-xs">
                  <Button title="Close Focus" variant="ghost" onPress={() => router.back()} fullWidth />
                </View>
              </View>
            )}
          </View>
        </View>
      ) : (
        <>
          {/* Portrait / fallback layout */}
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
                      <Ionicons name="attach-outline" size={12} color={Colors.accent.secondary} />
                      <Text className="text-accent-secondary text-xs">{ref.label}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}

          {/* Timer */}
          <PomodoroTimer onSessionComplete={handleSessionComplete} />
        </>
      )}

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
