/**
 * Onboarding Step 6 — Roadmap Reveal with animated level cascade
 */
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Animated, {
  FadeInDown, useSharedValue, useAnimatedStyle,
  withDelay, withTiming,
} from 'react-native-reanimated';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useStudyStore } from '@/hooks/useStudyStore';
import * as api from '@/services/api';
import { Colors, BorderRadius, FontSize, FontWeight, Spacing } from '@/constants/theme';

export default function RoadmapRevealScreen() {
  const store = useStudyStore();
  const [loading, setLoading] = useState(true);
  const [levels, setLevels] = useState<any[]>([]);

  useEffect(() => {
    async function generateRoadmap() {
      try {
        const subject = {
          id: 'subject_1',
          title: store.onboardingData.subjectTitle,
          sources: store.onboardingData.sources,
          deadline: store.onboardingData.deadline,
          hoursPerWeek: store.onboardingData.hoursPerWeek,
          createdAt: new Date().toISOString(),
          currentLevel: 1,
          totalLevels: 0,
        };

        const result = await api.generateRoadmap(
          subject,
          store.onboardingData.sections,
          store.onboardingData.assessmentScore
        );

        subject.totalLevels = result.levels.length;
        const activeLevel = result.levels.find((l) => l.status === 'active');
        subject.currentLevel = activeLevel?.levelNumber || 1;

        store.completeOnboarding(subject, result.levels, result.dailyObjectives);
        setLevels(result.levels);
      } catch (error) {
        console.error('Roadmap generation error:', error);
      } finally {
        setLoading(false);
      }
    }
    generateRoadmap();
  }, []);

  const handleStart = () => {
    router.replace('/(tabs)');
  };

  const score = Math.round(store.onboardingData.assessmentScore * 100);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.delay(200)}>
          <Text style={styles.emoji}>🎓</Text>
          <Text style={styles.title}>Your Study Plan is Ready!</Text>
          <Text style={styles.subtitle}>
            Assessment score: {score}% — {score >= 70 ? 'Great foundation!' : score >= 40 ? 'Good start!' : "We'll build you up!"}
          </Text>
        </Animated.View>

        {/* Level List */}
        <View style={styles.levelList}>
          {levels.map((level, i) => (
            <Animated.View
              key={level.id}
              entering={FadeInDown.delay(400 + i * 150)}
              style={[styles.levelItem, level.status === 'active' && styles.activeLevelItem]}
            >
              <View style={[styles.levelDot, {
                backgroundColor: level.status === 'completed'
                  ? Colors.accent.success
                  : level.status === 'active'
                  ? Colors.accent.primary
                  : Colors.bg.tertiary,
              }]}>
                <Text style={styles.levelNum}>{level.levelNumber}</Text>
              </View>
              <View style={styles.levelInfo}>
                <Text style={styles.levelTitle}>{level.title}</Text>
                <Text style={styles.levelStatus}>
                  {level.status === 'completed' ? '✅ Already known' :
                   level.status === 'active' ? '📖 Start here' : '🔒 Locked'}
                </Text>
              </View>
            </Animated.View>
          ))}
        </View>

        <Animated.View entering={FadeInDown.delay(400 + levels.length * 150)} style={styles.footer}>
          <Button title="Start Studying! 🚀" onPress={handleStart} fullWidth size="lg" loading={loading} />
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg.primary },
  content: { padding: Spacing.xxl, paddingTop: Spacing.huge },
  emoji: { fontSize: 64, textAlign: 'center', marginBottom: Spacing.lg },
  title: { color: Colors.text.primary, fontSize: FontSize.xxl, fontWeight: FontWeight.bold, textAlign: 'center' },
  subtitle: { color: Colors.text.secondary, fontSize: FontSize.md, textAlign: 'center', marginTop: Spacing.sm, marginBottom: Spacing.xxxl },
  levelList: { gap: Spacing.md },
  levelItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.bg.secondary, borderRadius: BorderRadius.md, padding: Spacing.lg, borderWidth: 1, borderColor: Colors.border.subtle, gap: Spacing.md },
  activeLevelItem: { borderColor: Colors.accent.primary, borderWidth: 1.5 },
  levelDot: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  levelNum: { color: Colors.text.primary, fontSize: FontSize.sm, fontWeight: FontWeight.bold },
  levelInfo: { flex: 1 },
  levelTitle: { color: Colors.text.primary, fontSize: FontSize.md, fontWeight: FontWeight.semibold },
  levelStatus: { color: Colors.text.muted, fontSize: FontSize.xs, marginTop: 2 },
  footer: { marginTop: Spacing.xxxl, paddingBottom: Spacing.xxl },
});
