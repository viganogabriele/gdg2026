/**
 * Onboarding Step 2 — "What are your sources?"
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StepIndicator } from '@/components/onboarding/StepIndicator';
import { SourcePicker } from '@/components/onboarding/SourcePicker';
import { Button } from '@/components/ui/Button';
import { useStudyStore } from '@/hooks/useStudyStore';
import { Colors, FontSize, FontWeight, Spacing } from '@/constants/theme';
import type { Source } from '@/types';

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
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <StepIndicator totalSteps={6} currentStep={1} />

        <Text style={styles.title}>What are your sources?</Text>
        <Text style={styles.subtitle}>
          Add PDFs, URLs, or paste notes. We'll analyze them to build your study plan.
        </Text>

        <View style={styles.pickerWrapper}>
          <SourcePicker
            sources={sources}
            onAddSource={handleAddSource}
            onRemoveSource={handleRemoveSource}
          />
        </View>

        <View style={styles.footer}>
          <Button
            title={sources.length > 0 ? 'Continue' : 'Skip for now'}
            variant={sources.length > 0 ? 'primary' : 'ghost'}
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg.primary },
  content: { flex: 1, paddingHorizontal: Spacing.xxl },
  title: { color: Colors.text.primary, fontSize: FontSize.xxl, fontWeight: FontWeight.bold, marginTop: Spacing.lg },
  subtitle: { color: Colors.text.secondary, fontSize: FontSize.md, marginTop: Spacing.sm, marginBottom: Spacing.xxl, lineHeight: 22 },
  pickerWrapper: { flex: 1 },
  footer: { gap: Spacing.sm, paddingBottom: Spacing.xxl },
});
