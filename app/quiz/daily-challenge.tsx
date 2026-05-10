/**
 * Daily Challenge Screen — targeted quiz based on flagged objectives
 */
import { QuestionCard } from '@/components/quiz/QuestionCard';
import { QuizResults } from '@/components/quiz/QuizResults';
import { Button } from '@/components/ui/Button';
import { ResponsiveContainer } from '@/components/ui/ResponsiveContainer';
import { LevelThresholds, Points } from '@/constants/gamification';
import { Colors } from '@/constants/theme';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import { useSpacedRepetition } from '@/hooks/useSpacedRepetition';
import { useStudyStore } from '@/hooks/useStudyStore';
import * as api from '@/services/api';
import type { QuizQuestion } from '@/types';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function DailyChallengeScreen() {
  const store = useStudyStore();
  const { addCardsFromQuiz } = useSpacedRepetition();
  const { contentPadding } = useResponsiveLayout();

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [pointsEarned, setPointsEarned] = useState(0);

  const activeLevel = store.levels.find((l) => l.status === 'active');
  const flaggedObjectives = store.dailyObjectives.filter(o => o.completed);
  const sources = store.subjects[0]?.sources || [];

  // Capture whether this was a "boosted" challenge at the time of entry
  const wasBoosted = useRef(
    store.dailyObjectives.length > 0 &&
    store.dailyObjectives.every(o => o.completed)
  );
  const hasNextDay = activeLevel
    ? store.currentDayIndex + 1 < activeLevel.topics.length
    : false;
  const nextDayIndex = store.currentDayIndex + 1;
  const nextTopicTitle = activeLevel?.topics[nextDayIndex]?.title || `Day ${nextDayIndex + 1}`;

  useEffect(() => {
    async function loadQuiz() {
      try {
        const { questions: q } = await api.generateDailyChallengeQuiz(
          flaggedObjectives,
          sources,
          8
        );
        setQuestions(q);
      } catch (e) {
        console.error('Failed to generate daily challenge quiz:', e);
      } finally {
        setLoading(false);
      }
    }

    loadQuiz();
  }, []);

  const handleAnswer = useCallback((answerIndex: number) => {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === currentIndex ? { ...q, userAnswer: answerIndex } : q
      )
    );
  }, [currentIndex]);

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = () => {
    const pointsBefore = useStudyStore.getState().stats.totalPoints;
    const correct = questions.filter((q) => q.userAnswer === q.correctIndex).length;
    const s = questions.length > 0 ? correct / questions.length : 0;
    setScore(s);

    // Add questions to spaced repetition
    addCardsFromQuiz(questions);

    store.updateStreak();
    store.addPoints(Points.STUDY_SESSION_COMPLETE);

    const pointsAfter = useStudyStore.getState().stats.totalPoints;
    setPointsEarned(Math.max(0, pointsAfter - pointsBefore));
    setShowResults(true);
  };

  const handleContinue = () => {
    if (wasBoosted.current && hasNextDay && score >= LevelThresholds.PASS_PERCENTAGE) {
      store.setDayAdvanceReady(true);
      store.advanceToDay(nextDayIndex);
      router.back();
    } else {
      router.back();
    }
  };

  const handleRetry = () => {
    setCurrentIndex(0);
    setShowResults(false);
    setQuestions((prev) => prev.map((q) => ({ ...q, userAnswer: undefined })));
  };

  const handleClose = () => {
    router.back();
  };

  if (loading) {
    return <SafeAreaView className="flex-1 bg-bg-primary"><View className="flex-1" /></SafeAreaView>;
  }

  if (showResults) {
    const correct = questions.filter((q) => q.userAnswer === q.correctIndex).length;
    const passed = score >= LevelThresholds.PASS_PERCENTAGE;
    const canAdvanceInline = passed && wasBoosted.current && hasNextDay;
    return (
      <SafeAreaView className="flex-1 bg-bg-primary">
        <ResponsiveContainer maxWidth={640}>
          <QuizResults
            score={score}
            totalQuestions={questions.length}
            correctAnswers={correct}
            passThreshold={LevelThresholds.PASS_PERCENTAGE}
            feedback={canAdvanceInline ? undefined : (passed ? undefined : 'Keep reviewing those objectives!')}
            onContinue={handleContinue}
            onRetry={!passed ? handleRetry : undefined}
            pointsEarned={pointsEarned}
            title={passed ? 'Great work!' : undefined}
            continueLabel={canAdvanceInline ? 'Start next day' : undefined}
            secondaryActionLabel={canAdvanceInline ? 'Close' : undefined}
            onSecondaryAction={canAdvanceInline ? handleClose : undefined}
            extraContent={canAdvanceInline ? (
              <View
                style={{
                  width: '100%',
                  marginTop: 16,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: Colors.border.subtle,
                  backgroundColor: Colors.bg.secondary,
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                }}
              >
                <Text
                  style={{
                    color: Colors.text.muted,
                    fontSize: 11,
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                  }}
                >
                  Next up
                </Text>
                <Text
                  style={{
                    color: Colors.text.primary,
                    fontSize: 16,
                    fontWeight: '600',
                    marginTop: 4,
                  }}
                >
                  {nextTopicTitle}
                </Text>
              </View>
            ) : undefined}
          />
        </ResponsiveContainer>
      </SafeAreaView>
    );
  }

  const currentQ = questions[currentIndex];
  if (!currentQ) return null;

  return (
    <SafeAreaView className="flex-1 bg-bg-primary">
      <ScrollView className="flex-1">
        <ResponsiveContainer maxWidth={640}>
          <QuestionCard
            question={currentQ}
            questionNumber={currentIndex + 1}
            totalQuestions={questions.length}
            onAnswer={handleAnswer}
            showFeedback={true}
          />
        </ResponsiveContainer>
      </ScrollView>
      {currentQ.userAnswer !== undefined && (
        <View style={{ paddingHorizontal: contentPadding, paddingBottom: 24, alignItems: 'center' }}>
          <ResponsiveContainer maxWidth={640}>
            <Button
              title={currentIndex < questions.length - 1 ? 'Next' : 'Finish'}
              onPress={handleNext}
              fullWidth size="lg"
            />
          </ResponsiveContainer>
        </View>
      )}
    </SafeAreaView>
  );
}
