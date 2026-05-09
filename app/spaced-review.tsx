/**
 * Spaced Review — quick 3-5 question review from due SR cards
 */
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { QuestionCard } from '@/components/quiz/QuestionCard';
import { Button } from '@/components/ui/Button';
import { useStudyStore } from '@/hooks/useStudyStore';
import { useSpacedRepetition } from '@/hooks/useSpacedRepetition';
import * as api from '@/services/api';
import { Colors } from '@/constants/theme';
import type { QuizQuestion } from '@/types';

export default function SpacedReviewScreen() {
  const store = useStudyStore();
  const { sessionCards, reviewCard } = useSpacedRepetition();
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [done, setDone] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);

  const completedTopics = store.levels
    .filter((l) => l.status === 'completed' || l.status === 'active')
    .flatMap((l) => l.topics);

  useEffect(() => {
    async function load() {
      try {
        if (completedTopics.length > 0) {
          const { questions: q } = await api.generateSpacedRepQuestions(
            completedTopics, Math.min(5, sessionCards.length || 3)
          );
          setQuestions(q);
        }
      } catch (e) {
        console.error('Spaced rep error:', e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleAnswer = useCallback((answerIndex: number) => {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === currentIndex ? { ...q, userAnswer: answerIndex } : q
      )
    );

    // Update SR card
    const card = sessionCards[currentIndex];
    const correct = questions[currentIndex]?.correctIndex === answerIndex;
    if (card) reviewCard(card, correct);
    if (correct) setCorrectCount((c) => c + 1);
  }, [currentIndex, sessionCards, questions, reviewCard]);

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setDone(true);
      store.addPoints(15); // SPACED_REP_SESSION
    }
  };

  if (loading) {
    return <SafeAreaView className="flex-1 bg-bg-primary"><View className="flex-1" /></SafeAreaView>;
  }

  if (done || questions.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-bg-primary">
        <View className="flex-1 justify-center items-center p-xxl">
          <View className="mb-lg">
            <Ionicons
              name={questions.length === 0 ? 'checkmark-circle' : 'bulb-outline'}
              size={64}
              color={questions.length === 0 ? Colors.accent.success : Colors.accent.primary}
            />
          </View>
          <Text className="text-text-primary text-xxl font-bold">
            {questions.length === 0 ? 'No reviews due!' : 'Review Complete!'}
          </Text>
          {questions.length > 0 && (
            <Text className="text-accent-primary text-lg mt-sm">
              {correctCount} / {questions.length} correct
            </Text>
          )}
          <Text className="text-text-secondary text-md text-center mt-lg mb-xxxl leading-[22px]">
            {questions.length === 0
              ? 'Keep studying, reviews will appear as you progress.'
              : 'Spaced repetition helps lock in long-term memory. Keep it up!'}
          </Text>
          <Button title="Done" onPress={() => router.back()} fullWidth size="lg" />
        </View>
      </SafeAreaView>
    );
  }

  const currentQ = questions[currentIndex];
  if (!currentQ) return null;

  return (
    <SafeAreaView className="flex-1 bg-bg-primary">
      <View className="flex-row justify-between items-center px-lg py-md">
        <View className="flex-row items-center gap-sm">
          <Ionicons name="bulb-outline" size={20} color={Colors.text.primary} />
          <Text className="text-text-primary text-lg font-bold">Quick Review</Text>
        </View>
        <Button title="Skip" variant="ghost" onPress={() => router.back()} />
      </View>
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
