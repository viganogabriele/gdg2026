/**
 * Spaced Review — quick 3-5 question review from due SR cards
 */
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { QuestionCard } from '@/components/quiz/QuestionCard';
import { Button } from '@/components/ui/Button';
import { useStudyStore } from '@/hooks/useStudyStore';
import { useSpacedRepetition } from '@/hooks/useSpacedRepetition';
import * as api from '@/services/api';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius } from '@/constants/theme';
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
    return <SafeAreaView style={styles.container}><View style={styles.loading} /></SafeAreaView>;
  }

  if (done || questions.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.doneContent}>
          <Text style={styles.doneEmoji}>{questions.length === 0 ? '✅' : '🧠'}</Text>
          <Text style={styles.doneTitle}>
            {questions.length === 0 ? 'No reviews due!' : 'Review Complete!'}
          </Text>
          {questions.length > 0 && (
            <Text style={styles.doneScore}>
              {correctCount} / {questions.length} correct
            </Text>
          )}
          <Text style={styles.doneHint}>
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
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🧠 Quick Review</Text>
        <Button title="Skip" variant="ghost" onPress={() => router.back()} />
      </View>
      <ScrollView style={styles.scroll}>
        <QuestionCard
          question={currentQ}
          questionNumber={currentIndex + 1}
          totalQuestions={questions.length}
          onAnswer={handleAnswer}
          showFeedback={true}
        />
      </ScrollView>
      {currentQ.userAnswer !== undefined && (
        <View style={styles.footer}>
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg.primary },
  loading: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md },
  headerTitle: { color: Colors.text.primary, fontSize: FontSize.lg, fontWeight: FontWeight.bold },
  scroll: { flex: 1 },
  footer: { paddingHorizontal: Spacing.xxl, paddingBottom: Spacing.xxl },
  doneContent: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.xxl },
  doneEmoji: { fontSize: 64, marginBottom: Spacing.lg },
  doneTitle: { color: Colors.text.primary, fontSize: FontSize.xxl, fontWeight: FontWeight.bold },
  doneScore: { color: Colors.accent.primary, fontSize: FontSize.lg, marginTop: Spacing.sm },
  doneHint: { color: Colors.text.secondary, fontSize: FontSize.md, textAlign: 'center', marginTop: Spacing.lg, marginBottom: Spacing.xxxl, lineHeight: 22 },
});
