/**
 * Onboarding Step 5 — Assessment quiz (10-15 questions)
 */
import React, { useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StepIndicator } from '@/components/onboarding/StepIndicator';
import { QuestionCard } from '@/components/quiz/QuestionCard';
import { Button } from '@/components/ui/Button';
import { useStudyStore } from '@/hooks/useStudyStore';
import { Colors, Spacing } from '@/constants/theme';

export default function AssessmentScreen() {
  const activeQuiz = useStudyStore((s) => s.activeQuiz);
  const answerQuestion = useStudyStore((s) => s.answerQuestion);
  const [currentIndex, setCurrentIndex] = useState(0);

  const questions = activeQuiz?.questions || [];
  const currentQuestion = questions[currentIndex];

  const handleAnswer = useCallback((answerIndex: number) => {
    if (!currentQuestion) return;
    answerQuestion(currentQuestion.id, answerIndex);
  }, [currentQuestion, answerQuestion]);

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Calculate score and proceed
      const correct = questions.filter(
        (q) => q.userAnswer === q.correctIndex
      ).length;
      const score = questions.length > 0 ? correct / questions.length : 0;

      const store = useStudyStore.getState();
      store.setAssessmentScore(score);
      store.completeQuiz();

      router.replace('/(onboarding)/roadmap-reveal');
    }
  };

  if (!currentQuestion) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.empty} />
      </SafeAreaView>
    );
  }

  const answered = currentQuestion.userAnswer !== undefined;

  return (
    <SafeAreaView style={styles.container}>
      <StepIndicator totalSteps={6} currentStep={4} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <QuestionCard
          question={currentQuestion}
          questionNumber={currentIndex + 1}
          totalQuestions={questions.length}
          onAnswer={handleAnswer}
          showFeedback={false}
        />
      </ScrollView>

      {answered && (
        <View style={styles.footer}>
          <Button
            title={currentIndex < questions.length - 1 ? 'Next Question' : 'See Results'}
            onPress={handleNext}
            fullWidth
            size="lg"
          />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg.primary },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: Spacing.huge },
  empty: { flex: 1 },
  footer: { paddingHorizontal: Spacing.xxl, paddingBottom: Spacing.xxl },
});
