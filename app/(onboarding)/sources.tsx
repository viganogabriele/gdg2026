/**
 * Onboarding Step 2 — "What are your sources?"
 */
import { SourcePicker } from '@/components/onboarding/SourcePicker';
import { StepIndicator } from '@/components/onboarding/StepIndicator';
import { Button } from '@/components/ui/Button';
import { useStudyStore } from '@/hooks/useStudyStore';
import type { Source } from '@/types';
import { router } from 'expo-router';
import React from 'react';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SourcesScreen() {
  const sources = useStudyStore((s) => s.onboardingData.sources);
  const setSources = useStudyStore((s) => s.setOnboardingSources);

  const handleAddSource = (source: Source) => {
    setSources([...sources, source]);
  };

  const handleRemoveSource = (id: string) => {
    setSources(sources.filter((s) => s.id !== id));
  };

  return (
    <SafeAreaView className="flex-1 bg-bg-primary">
      <View className="flex-1 px-xxl">
        <StepIndicator totalSteps={6} currentStep={1} />

        <Text className="text-text-primary text-xxl font-bold mt-lg">What are your sources?</Text>
        <Text className="text-text-secondary text-md mt-sm mb-xxl leading-[22px]">
          Add PDFs, URLs, or paste notes. We'll analyze them to build your study plan.
        </Text>

        <View className="flex-1">
          <SourcePicker
            sources={sources}
            onAddSource={handleAddSource}
            onRemoveSource={handleRemoveSource}
          />
        </View>

        <View className="gap-sm pb-xxl">
          <Button
            title={sources.length > 0 ? 'Continue' : 'Skip for now'}
            variant='primary'
            onPress={() => router.push('/(onboarding)/deadline')}
            fullWidth
            size="lg"
          />
          <Button
            title="Back"
            variant="ghost"
            onPress={() => router.back()}
            fullWidth
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
