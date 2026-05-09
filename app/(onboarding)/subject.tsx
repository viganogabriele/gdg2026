/**
 * Onboarding Step 1 — "What are you studying?"
 */
import React, { useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StepIndicator } from '@/components/onboarding/StepIndicator';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useStudyStore } from '@/hooks/useStudyStore';
import { Colors } from '@/constants/theme';

export default function SubjectScreen() {
  const setOnboardingSubject = useStudyStore((s) => s.setOnboardingSubject);
  const existing = useStudyStore((s) => s.onboardingData.subjectTitle);
  const [subject, setSubject] = useState(existing);

  const handleContinue = () => {
    if (!subject.trim()) return;
    setOnboardingSubject(subject.trim());
    router.push('/(onboarding)/sources');
  };

  return (
    <SafeAreaView className="flex-1 bg-bg-primary">
      <KeyboardAvoidingView
        className="flex-1 px-xxl"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <StepIndicator totalSteps={6} currentStep={0} />

        <View className="flex-1 justify-center">
          <View className="flex-row items-center gap-sm mb-sm">
            <Ionicons name="hand-left-outline" size={24} color={Colors.text.primary} />
            <Text className="text-xxl text-text-primary">Let's get started</Text>
          </View>
          <Text className="text-text-primary text-xxxl font-bold mb-md">What are you studying?</Text>
          <Text className="text-text-secondary text-md leading-[22px] mb-xxxl">
            Enter the subject or course name you want to master
          </Text>

          <Input
            placeholder="e.g. Calculus II, Organic Chemistry, History..."
            value={subject}
            onChangeText={setSubject}
            containerStyle={{ marginTop: 16 }}
            autoFocus
            returnKeyType="done"
            onSubmitEditing={handleContinue}
          />
        </View>

        <View className="pb-xxl">
          <Button
            title="Continue"
            onPress={handleContinue}
            disabled={!subject.trim()}
            fullWidth
            size="lg"
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
