import React, { useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StepIndicator } from '@/components/onboarding/StepIndicator';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useStudyStore } from '@/hooks/useStudyStore';

export default function SubjectScreen() {
  const setOnboardingSubject = useStudyStore((s) => s.setOnboardingSubject);
  const existing = useStudyStore((s) => s.onboardingData.subjectTitle);
  const isAddingRoadmap = useStudyStore((s) => s.isAddingRoadmap);
  const cancelAddRoadmap = useStudyStore((s) => s.cancelAddRoadmap);
  const [subject, setSubject] = useState(existing);

  const handleContinue = () => {
    if (!subject.trim()) return;
    setOnboardingSubject(subject.trim());
    router.push('/(onboarding)/sources');
  };

  const handleCancel = () => {
    cancelAddRoadmap();
    router.replace('/(tabs)');
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <SafeAreaView style={{ flex: 1 }} className="bg-bg-primary">
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <StepIndicator totalSteps={6} currentStep={0} />

          <View style={{ flex: 1, justifyContent: 'center', paddingVertical: 32 }}>
            <Text className="text-xxl text-text-primary mb-sm">Let's get started</Text>
            <Text className="text-text-primary text-xxxl font-bold mb-md">What are you studying?</Text>
            <Text className="text-text-secondary text-md leading-[22px] mb-xxxl">
              Enter the subject or course name you want to master
            </Text>

            <Input
              placeholder="e.g. Calculus II, Organic Chemistry, History..."
              value={subject}
              onChangeText={setSubject}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={handleContinue}
            />
          </View>

          <View style={{ paddingBottom: 32, gap: 8 }}>
            <Button
              title="Continue"
              onPress={handleContinue}
              disabled={!subject.trim()}
              fullWidth
              size="lg"
            />
            {isAddingRoadmap && (
              <Button
                title="Cancel"
                variant="ghost"
                onPress={handleCancel}
                fullWidth
              />
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}
