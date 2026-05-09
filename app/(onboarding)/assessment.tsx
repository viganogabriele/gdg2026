/**
 * Onboarding Step 5 — Assessment quiz (10-15 questions)
 */
import React, { useState, useCallback } from 'react';
import { View, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StepIndicator } from '@/components/onboarding/StepIndicator';
import { QuestionCard } from '@/components/quiz/QuestionCard';
import { Button } from '@/components/ui/Button';
import { useStudyStore } from '@/hooks/useStudyStore';

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

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else {
      router.back();
    }
  };

  if (!currentQuestion) {
    return (
      <SafeAreaView className="flex-1 bg-bg-primary">
        <View className="flex-1" />
      </SafeAreaView>
    );
  }

  const answered = currentQuestion.userAnswer !== undefined;

  return (
    <SafeAreaView className="flex-1 bg-bg-primary">
      <StepIndicator totalSteps={6} currentStep={4} />
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 48 }}>
        <QuestionCard
          question={currentQuestion}
          questionNumber={currentIndex + 1}
          totalQuestions={questions.length}
          onAnswer={handleAnswer}
          showFeedback={false}
        />
      </ScrollView>

      <View className="px-xxl pb-xxl gap-sm">
        {answered && (
          <Button
            title={currentIndex < questions.length - 1 ? 'Next Question' : 'See Results'}
            onPress={handleNext}
            fullWidth
            size="lg"
          />
        )}
        <Button
          title="Back"
          variant="ghost"
          onPress={handleBack}
          fullWidth
        />
      </View>
    </SafeAreaView>
  );
}
