/**
 * Study Roadmap Screen — Timeline view of all levels
 */
import React from 'react';
import { StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TimelineView } from '@/components/roadmap/TimelineView';
import { useStudyStore } from '@/hooks/useStudyStore';
import { Colors } from '@/constants/theme';
import type { StudyLevel } from '@/types';

export default function RoadmapScreen() {
  const levels = useStudyStore((s) => s.levels);

  const handleLevelPress = (level: StudyLevel) => {
    // Could navigate to level detail in the future
  };

  const handleTakeQuiz = (level: StudyLevel) => {
    router.push(`/quiz/${level.id}`);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <TimelineView
        levels={levels}
        onLevelPress={handleLevelPress}
        onTakeQuiz={handleTakeQuiz}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg.primary },
});
