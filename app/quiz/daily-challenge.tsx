/**
 * Daily Challenge Screen — targeted quiz based on flagged objectives
 */
import { QuestionCard } from '@/components/quiz/QuestionCard';
import { QuizResults } from '@/components/quiz/QuizResults';
import { Button } from '@/components/ui/Button';
import { LevelThresholds, Points } from '@/constants/gamification';
import { useSpacedRepetition } from '@/hooks/useSpacedRepetition';
import { useStudyStore } from '@/hooks/useStudyStore';
import * as api from '@/services/api';
import type { QuizQuestion } from '@/types';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function DailyChallengeScreen() {
  const store = useStudyStore();
  const { addCardsFromQuiz } = useSpacedRepetition();

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);

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
    const correct = questions.filter((q) => q.userAnswer === q.correctIndex).length;
    const s = questions.length > 0 ? correct / questions.length : 0;
    setScore(s);
    setShowResults(true);

    // Add questions to spaced repetition
    addCardsFromQuiz(questions);

    store.updateStreak();
    store.addPoints(Points.STUDY_SESSION_COMPLETE);
  };

  const handleContinue = () => {
    // If this was a boosted challenge and there's a next day, prompt to advance
    if (wasBoosted.current && hasNextDay && score >= LevelThresholds.PASS_PERCENTAGE) {
      store.setDayAdvanceReady(true);
      const nextDayIndex = store.currentDayIndex + 1;
      const nextTopic = activeLevel?.topics[nextDayIndex];
      Alert.alert(
        'Great work!',
        `You completed all objectives for today! Ready to start "${nextTopic?.title || `Day ${nextDayIndex + 1}`}"?`,
        [
          {
            text: 'Not yet',
            style: 'cancel',
            onPress: () => router.back(),
          },
          {
            text: 'Start next day',
            onPress: () => {
              store.advanceToDay(nextDayIndex);
              router.back();
            },
          },
        ]
      );
    } else {
      router.back();
    }
  };

  const handleRetry = () => {
    setCurrentIndex(0);
    setShowResults(false);
    setQuestions((prev) => prev.map((q) => ({ ...q, userAnswer: undefined })));
  };

  if (loading) {
    return <SafeAreaView className="flex-1 bg-bg-primary"><View className="flex-1" /></SafeAreaView>;
  }

  if (showResults) {
    const correct = questions.filter((q) => q.userAnswer === q.correctIndex).length;
    const passed = score >= LevelThresholds.PASS_PERCENTAGE;
    return (
      <SafeAreaView className="flex-1 bg-bg-primary">
        <QuizResults
          score={score}
          totalQuestions={questions.length}
          correctAnswers={correct}
          passThreshold={LevelThresholds.PASS_PERCENTAGE}
          feedback={passed ? 'Great job on your Daily Challenge!' : 'Keep reviewing those objectives!'}
          onContinue={handleContinue}
          onRetry={!passed ? handleRetry : undefined}
          pointsEarned={Points.STUDY_SESSION_COMPLETE}
        />
      </SafeAreaView>
    );
  }

  const currentQ = questions[currentIndex];
  if (!currentQ) return null;

  return (
    <SafeAreaView className="flex-1 bg-bg-primary">
      <ScrollView className="flex-1">
        <QuestionCard
          question={currentQ}
          questionNumber={currentIndex + 1}
          totalQuestions={questions.length}
          onAnswer={handleAnswer}
          showFeedback={true}
        />
      </ScrollView>
      {currentQ.userAnswer !== undefined && (
        <View className="px-xxl pb-xxl">
          <Button
            title={currentIndex < questions.length - 1 ? 'Next' : 'Finish'}
            onPress={handleNext}
            fullWidth size="lg"
          />
        </View>
      )}
    </SafeAreaView>
  );
}
