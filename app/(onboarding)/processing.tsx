/**
 * Onboarding Step 4 — Processing screen with animated progress
 */
import { NucleoIcon, NucleoIconName } from '@/components/ui/NucleoIcon';
import { useStudyStore } from '@/hooks/useStudyStore';
import * as api from '@/services/api';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence, withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const STEPS: { label: string; icon: NucleoIconName }[] = [
  { label: 'Analyzing your sources...', icon: 'book-open' },
  { label: 'Mapping topic dependencies...', icon: 'folder' },
  { label: 'Generating assessment questions...', icon: 'award' },
  { label: 'Almost ready!', icon: 'sparkle' },
];

export default function ProcessingScreen() {
  const store = useStudyStore();
  const [currentStep, setCurrentStep] = useState(0);

  const pulse = useSharedValue(1);

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) })
      ), -1, true
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
          6
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
    <SafeAreaView className="flex-1 bg-bg-primary">
      <View className="flex-1 justify-center items-center px-xxl">
        <Animated.View
          className="w-[120px] h-[120px] rounded-[60px] bg-bg-secondary items-center justify-center border-2 border-accent-primary mb-xxxl"
          style={pulseStyle}
        >
          <NucleoIcon name={step.icon} size={48} />
        </Animated.View>

        <Text className="text-text-primary text-xl font-semibold text-center mb-xxl">{step.label}</Text>

        <View className="flex-row gap-sm">
          {STEPS.map((_, i) => (
            <View
              key={i}
              className={`h-[8px] rounded-[4px] ${i <= currentStep ? 'bg-accent-primary w-[24px]' : 'bg-bg-tertiary w-[8px]'}`}
            />
          ))}
        </View>

        <Text className="text-text-muted text-sm text-center mt-xxxl leading-[20px]">
          Preparing your personalized study plan for{'\n'}
          "{store.onboardingData.subjectTitle}"
        </Text>
      </View>
    </SafeAreaView>
  );
}
