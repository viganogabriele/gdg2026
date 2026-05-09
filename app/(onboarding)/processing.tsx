/**
 * Onboarding Step 4 — Processing screen with animated progress
 */
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withRepeat,
  withSequence, withTiming, Easing, withDelay,
} from 'react-native-reanimated';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStudyStore } from '@/hooks/useStudyStore';
import * as api from '@/services/api';
import { Colors, FontSize, FontWeight, Spacing } from '@/constants/theme';

const STEPS = [
  { label: 'Analyzing your sources...', icon: '📄' },
  { label: 'Mapping topic dependencies...', icon: '🗺️' },
  { label: 'Generating assessment questions...', icon: '❓' },
  { label: 'Almost ready!', icon: '✨' },
];

export default function ProcessingScreen() {
  const store = useStudyStore();
  const [currentStep, setCurrentStep] = useState(0);

  const pulse = useSharedValue(1);
  const rotation = useSharedValue(0);

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) })
      ), -1, true
    );
    rotation.value = withRepeat(
      withTiming(360, { duration: 3000, easing: Easing.linear }), -1
    );
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function process() {
      try {
        // Step 1: Analyze sources
        setCurrentStep(0);
        const { sections } = await api.analyzeSources(
          store.onboardingData.subjectTitle,
          store.onboardingData.sources
        );

        if (cancelled) return;
        store.setOnboardingSections(sections);
        setCurrentStep(1);
        await new Promise((r) => setTimeout(r, 800));

        // Step 2: Generate assessment
        if (cancelled) return;
        setCurrentStep(2);
        const { questions } = await api.generateAssessment(
          store.onboardingData.subjectTitle,
          sections,
          12
        );

        if (cancelled) return;
        setCurrentStep(3);
        await new Promise((r) => setTimeout(r, 600));

        // Navigate to assessment with questions stored
        store.startQuiz({
          id: 'assessment_initial',
          type: 'assessment',
          subjectId: 'subject_1',
          questions,
          passThreshold: 0,
        });

        router.replace('/(onboarding)/assessment');
      } catch (error) {
        console.error('Processing error:', error);
        // Still navigate on error with mock data
        router.replace('/(onboarding)/assessment');
      }
    }
    process();
    return () => { cancelled = true; };
  }, []);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  const step = STEPS[currentStep];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Animated.View style={[styles.iconWrapper, pulseStyle]}>
          <Text style={styles.icon}>{step.icon}</Text>
        </Animated.View>

        <Text style={styles.label}>{step.label}</Text>

        <View style={styles.dots}>
          {STEPS.map((_, i) => (
            <View
              key={i}
              style={[styles.dot, i <= currentStep && styles.dotActive]}
            />
          ))}
        </View>

        <Text style={styles.hint}>
          Preparing your personalized study plan for{'\n'}
          "{store.onboardingData.subjectTitle}"
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg.primary },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: Spacing.xxl },
  iconWrapper: { width: 120, height: 120, borderRadius: 60, backgroundColor: Colors.bg.secondary, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: Colors.accent.primary, marginBottom: Spacing.xxxl },
  icon: { fontSize: 48 },
  label: { color: Colors.text.primary, fontSize: FontSize.xl, fontWeight: FontWeight.semibold, textAlign: 'center', marginBottom: Spacing.xxl },
  dots: { flexDirection: 'row', gap: Spacing.sm },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.bg.tertiary },
  dotActive: { backgroundColor: Colors.accent.primary, width: 24 },
  hint: { color: Colors.text.muted, fontSize: FontSize.sm, textAlign: 'center', marginTop: Spacing.xxxl, lineHeight: 20 },
});
