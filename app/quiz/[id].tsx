/**
 * Quiz Screen — level quiz or challenge, accessed via /quiz/[id]
 */
import { QuestionCard } from '@/components/quiz/QuestionCard';
import { QuizResults } from '@/components/quiz/QuizResults';
import { Button } from '@/components/ui/Button';
import { LevelThresholds, Points } from '@/constants/gamification';
import { useSpacedRepetition } from '@/hooks/useSpacedRepetition';
import { useStudyStore } from '@/hooks/useStudyStore';
import * as api from '@/services/api';
import type { QuizQuestion } from '@/types';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function QuizScreen() {
  const { id: levelId } = useLocalSearchParams<{ id: string }>();
  const store = useStudyStore();
  const { addCardsFromQuiz } = useSpacedRepetition();

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);

  const level = store.levels.find((l) => l.id === levelId);

  useEffect(() => {
    // Wait up to 1s for store hydration before giving up
    let attempts = 0;
    const tryLoad = () => {
      const found = useStudyStore.getState().levels.find((l) => l.id === levelId);
      if (found) {
        loadQuiz(found);
      } else if (attempts < 5) {
        attempts++;
        setTimeout(tryLoad, 200);
      } else {
        router.back();
      }
    };

    async function loadQuiz(lvl: typeof level) {
      if (!lvl) return;
      try {
        const { questions: q } = await api.generateLevelQuiz(
          lvl.id, lvl.title, lvl.topics, 8
        );
        setQuestions(q);
      } catch (e) {
        console.error('Failed to generate quiz:', e);
      } finally {
        setLoading(false);
      }
    }

    tryLoad();
  }, [levelId]);

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

    if (s >= LevelThresholds.PASS_PERCENTAGE && level) {
      store.completeLevel(level.id);
    } else if (level) {
      store.failLevel(level.id, s);
      // Adjust roadmap if failed 2+ times
      if (level.quizAttempts + 1 >= LevelThresholds.MAX_QUIZ_ATTEMPTS_BEFORE_RESCHEDULE) {
        const subject = store.subjects[0];
        if (subject) {
          api.adjustRoadmap(subject, store.levels, 'level_failed').then(({ updatedLevels }) => {
            store.setLevels(updatedLevels);
          });
        }
      }
    }
  };

  const handleContinue = () => router.back();
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
          feedback={passed ? 'Great job! You\'ve mastered this level.' : 'Keep studying and try again.'}
          onContinue={handleContinue}
          onRetry={!passed ? handleRetry : undefined}
          pointsEarned={passed ? Points.LEVEL_PASSED : 0}
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
