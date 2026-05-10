/**
 * Onboarding Step 5 — Assessment quiz (10-15 questions)
 */
import { StepIndicator } from '@/components/onboarding/StepIndicator';
import { QuestionCard } from '@/components/quiz/QuestionCard';
import { Button } from '@/components/ui/Button';
import { ResponsiveContainer } from '@/components/ui/ResponsiveContainer';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import { useStudyStore } from '@/hooks/useStudyStore';
import type { QuizQuestion } from '@/types';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const INITIAL_WINDOW = 3;
const FOLLOW_UP_COUNT = 3;
const EMPTY_QUESTIONS: QuizQuestion[] = [];

function pickByDifficulty(
  questions: QuizQuestion[],
  difficulties: ('easy' | 'medium' | 'hard')[],
  alreadySelected: Set<string>,
  limit: number
): string[] {
  const picked: string[] = [];

  for (const difficulty of difficulties) {
    for (const q of questions) {
      if (picked.length >= limit) return picked;
      if (alreadySelected.has(q.id)) continue;
      if ((q.difficulty || 'medium') !== difficulty) continue;
      alreadySelected.add(q.id);
      picked.push(q.id);
    }
  }

  return picked;
}

export default function AssessmentScreen() {
  const activeQuiz = useStudyStore((s) => s.activeQuiz);
  const answerQuestion = useStudyStore((s) => s.answerQuestion);
  const setAssessmentScore = useStudyStore((s) => s.setAssessmentScore);
  const completeQuiz = useStudyStore((s) => s.completeQuiz);
  const { contentPadding } = useResponsiveLayout();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [orderedQuestionIds, setOrderedQuestionIds] = useState<string[]>([]);
  const [gateEvaluated, setGateEvaluated] = useState(false);
  const initializedQuizIdRef = useRef<string | null>(null);

  const questions = activeQuiz?.questions ?? EMPTY_QUESTIONS;
  const questionById = useMemo(() => {
    const map = new Map<string, QuizQuestion>();
    questions.forEach((q) => map.set(q.id, q));
    return map;
  }, [questions]);

  const currentQuestion = questionById.get(orderedQuestionIds[currentIndex] || '');

  useEffect(() => {
    const quizId = activeQuiz?.id ?? null;
    if (quizId === initializedQuizIdRef.current) return;
    initializedQuizIdRef.current = quizId;

    if (questions.length === 0) {
      setOrderedQuestionIds([]);
      setCurrentIndex(0);
      setGateEvaluated(false);
      return;
    }

    const initial = pickByDifficulty(
      questions,
      ['easy', 'medium', 'hard'],
      new Set<string>(),
      INITIAL_WINDOW
    );

    setOrderedQuestionIds(
      initial.length > 0
        ? initial
        : questions.slice(0, INITIAL_WINDOW).map((q) => q.id)
    );
    setCurrentIndex(0);
    setGateEvaluated(false);
  }, [activeQuiz?.id, questions]);

  const finalizeAssessment = useCallback((scoreOverride?: number) => {
    const askedQuestions = orderedQuestionIds
      .map((id) => questionById.get(id))
      .filter((q): q is QuizQuestion => Boolean(q));

    const answeredQuestions = askedQuestions.filter((q) => q.userAnswer !== undefined);
    const correct = answeredQuestions.filter((q) => q.userAnswer === q.correctIndex).length;
    const computedScore = answeredQuestions.length > 0 ? correct / answeredQuestions.length : 0;
    const score = scoreOverride ?? computedScore;

    setAssessmentScore(score);
    completeQuiz();
    router.replace('/(onboarding)/roadmap-reveal');
  }, [orderedQuestionIds, questionById, setAssessmentScore, completeQuiz]);

  const advanceAfterAnswer = useCallback((answerIndex: number) => {
    if (!currentQuestion) return;

    const isAtEndOfCurrentSequence = currentIndex === orderedQuestionIds.length - 1;
    if (!isAtEndOfCurrentSequence) {
      setCurrentIndex((index) => index + 1);
      return;
    }

    const isAtAdaptiveGate = !gateEvaluated && orderedQuestionIds.length <= INITIAL_WINDOW;
    if (isAtAdaptiveGate) {
      const openingQuestions = orderedQuestionIds
        .slice(0, INITIAL_WINDOW)
        .map((id) => questionById.get(id))
        .filter((q): q is QuizQuestion => Boolean(q));

      const answeredOpening = openingQuestions.filter((q) => q.userAnswer !== undefined);
      const openingCorrect = answeredOpening.filter((q) => q.userAnswer === q.correctIndex).length;

      if (answeredOpening.length === INITIAL_WINDOW && openingCorrect === 0) {
        finalizeAssessment(0);
        return;
      }

      const openingAccuracy = answeredOpening.length > 0 ? openingCorrect / answeredOpening.length : 0;
      const selectedSet = new Set(orderedQuestionIds);
      const followUpOrder: ('easy' | 'medium' | 'hard')[] = openingAccuracy >= 2 / 3
        ? ['hard', 'medium', 'easy']
        : ['medium', 'easy'];

      const followUp = pickByDifficulty(
        questions,
        followUpOrder,
        selectedSet,
        FOLLOW_UP_COUNT
      );

      setGateEvaluated(true);

      if (followUp.length === 0) {
        finalizeAssessment();
        return;
      }

      setOrderedQuestionIds((prev) => [...prev, ...followUp]);
      setCurrentIndex((index) => index + 1);
      return;
    }

    finalizeAssessment();
  }, [
    currentIndex,
    currentQuestion,
    finalizeAssessment,
    gateEvaluated,
    orderedQuestionIds,
    questionById,
    questions,
  ]);

  const handleAnswer = useCallback((answerIndex: number) => {
    if (!currentQuestion) return;
    answerQuestion(currentQuestion.id, answerIndex);
    advanceAfterAnswer(answerIndex);
  }, [advanceAfterAnswer, currentQuestion, answerQuestion]);

  const handleStartFromZero = useCallback(() => {
    finalizeAssessment(0);
  }, [finalizeAssessment]);

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
      <ResponsiveContainer maxWidth={640}>
        <StepIndicator totalSteps={6} currentStep={4} />
      </ResponsiveContainer>
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 48 }}>
        <ResponsiveContainer maxWidth={640}>
          <QuestionCard
            question={currentQuestion}
            questionNumber={currentIndex + 1}
            totalQuestions={orderedQuestionIds.length || questions.length}
            onAnswer={handleAnswer}
            showFeedback={false}
          />
        </ResponsiveContainer>
      </ScrollView>

      <View style={{ paddingHorizontal: contentPadding, paddingBottom: 24, alignItems: 'center' }}>
        <ResponsiveContainer maxWidth={640}>
          <View className="gap-sm">
            <Button
              title="I don't know, start from scratch"
              variant="danger"
              onPress={handleStartFromZero}
              fullWidth
            />
            <Button
              title="Back"
              variant="ghost"
              onPress={handleBack}
              fullWidth
            />
          </View>
        </ResponsiveContainer>
      </View>
    </SafeAreaView>
  );
}
