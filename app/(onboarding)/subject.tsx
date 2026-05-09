/**
 * Onboarding Step 1 — "What are you studying?"
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StepIndicator } from '@/components/onboarding/StepIndicator';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useStudyStore } from '@/hooks/useStudyStore';
import { Colors, FontSize, FontWeight, Spacing } from '@/constants/theme';

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
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <StepIndicator totalSteps={6} currentStep={0} />

        <View style={styles.body}>
          <Text style={styles.greeting}>👋 Let's get started</Text>
          <Text style={styles.title}>What are you studying?</Text>
          <Text style={styles.subtitle}>
            Enter the subject or course name you want to master
          </Text>

          <Input
            placeholder="e.g. Calculus II, Organic Chemistry, History..."
            value={subject}
            onChangeText={setSubject}
            containerStyle={styles.input}
            autoFocus
            returnKeyType="done"
            onSubmitEditing={handleContinue}
          />
        </View>

        <View style={styles.footer}>
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg.primary },
  content: { flex: 1, paddingHorizontal: Spacing.xxl },
  body: { flex: 1, justifyContent: 'center' },
  greeting: { fontSize: FontSize.xxl, marginBottom: Spacing.sm },
  title: { color: Colors.text.primary, fontSize: FontSize.xxxl, fontWeight: FontWeight.bold, marginBottom: Spacing.md },
  subtitle: { color: Colors.text.secondary, fontSize: FontSize.md, lineHeight: 22, marginBottom: Spacing.xxxl },
  input: { marginTop: Spacing.lg },
  footer: { paddingBottom: Spacing.xxl },
});
