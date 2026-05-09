/**
 * Focus Mode — Pomodoro timer with current topic and source refs
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PomodoroTimer } from '@/components/focus/PomodoroTimer';
import { SessionComplete } from '@/components/focus/SessionComplete';
import { Button } from '@/components/ui/Button';
import { useStudyStore } from '@/hooks/useStudyStore';
import { useGamePoints } from '@/hooks/useGamePoints';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius } from '@/constants/theme';
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
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Button title="✕ Close" variant="ghost" onPress={() => router.back()} />
      </View>

      {/* Current Topic Info */}
      {activeLevel && (
        <View style={styles.topicInfo}>
          <Text style={styles.levelLabel}>Level {activeLevel.levelNumber}</Text>
          <Text style={styles.levelTitle}>{activeLevel.title}</Text>
          {currentTopic && (
            <View style={styles.topicCard}>
              <Text style={styles.topicName}>{currentTopic.title}</Text>
              {currentTopic.sourceRefs.map((ref, i) => (
                <Text key={i} style={styles.sourceRef}>📎 {ref.label}</Text>
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg.primary },
  header: { flexDirection: 'row', justifyContent: 'flex-end', padding: Spacing.md },
  topicInfo: { alignItems: 'center', paddingHorizontal: Spacing.xxl, marginBottom: Spacing.lg },
  levelLabel: { color: Colors.accent.primary, fontSize: FontSize.sm, fontWeight: FontWeight.bold, letterSpacing: 1 },
  levelTitle: { color: Colors.text.primary, fontSize: FontSize.xl, fontWeight: FontWeight.bold, marginTop: Spacing.xs },
  topicCard: { backgroundColor: Colors.bg.secondary, borderRadius: BorderRadius.md, padding: Spacing.md, marginTop: Spacing.md, borderWidth: 1, borderColor: Colors.border.subtle, width: '100%' },
  topicName: { color: Colors.text.primary, fontSize: FontSize.md, fontWeight: FontWeight.medium },
  sourceRef: { color: Colors.accent.secondary, fontSize: FontSize.xs, marginTop: Spacing.xs },
});
