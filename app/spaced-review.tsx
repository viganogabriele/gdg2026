/**
 * Spaced Review — SM-2+ review with graduated rating buttons
 */
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NucleoIcon } from '@/components/ui/NucleoIcon';
import { QuestionCard } from '@/components/quiz/QuestionCard';
import { Button } from '@/components/ui/Button';
import { useStudyStore } from '@/hooks/useStudyStore';
import { useSpacedRepetition } from '@/hooks/useSpacedRepetition';
import * as api from '@/services/api';
import { Colors } from '@/constants/theme';
import type { QuizQuestion, SpacedRepetitionCard } from '@/types';

// Rating levels exposed to the user
const RATINGS = [
  { label: 'Non sapevo', emoji: '🔴', rating: 0, color: Colors.accent.danger,  bg: 'rgba(186,28,30,0.15)' },
  { label: 'Difficile',  emoji: '🟡', rating: 2, color: Colors.accent.warning, bg: 'rgba(232,137,48,0.15)' },
  { label: 'Facile',     emoji: '🟢', rating: 4, color: Colors.accent.success, bg: 'rgba(34,197,94,0.15)'  },
] as const;

export default function SpacedReviewScreen() {
  const store = useStudyStore();
  const { sessionCards, reviewCardRated } = useSpacedRepetition();
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [done, setDone] = useState(false);
  const [ratingPicked, setRatingPicked] = useState<number | null>(null);
  const [ratingCounts, setRatingCounts] = useState({ wrong: 0, hard: 0, easy: 0 });

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
  }, [currentIndex]);

  const handleRating = useCallback((rating: number) => {
    setRatingPicked(rating);
    const card: SpacedRepetitionCard | undefined = sessionCards[currentIndex];
    if (card) reviewCardRated(card, rating);

    setRatingCounts((prev) => ({
      wrong: prev.wrong + (rating === 0 ? 1 : 0),
      hard:  prev.hard  + (rating === 2 ? 1 : 0),
      easy:  prev.easy  + (rating === 4 ? 1 : 0),
    }));
  }, [currentIndex, sessionCards, reviewCardRated]);

  const handleNext = () => {
    setRatingPicked(null);
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setDone(true);
      store.addPoints(15); // SPACED_REP_SESSION bonus
    }
  };

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return <SafeAreaView className="flex-1 bg-bg-primary"><View className="flex-1" /></SafeAreaView>;
  }

  // ── Done screen ────────────────────────────────────────────────────────────
  if (done || questions.length === 0) {
    const total = ratingCounts.wrong + ratingCounts.hard + ratingCounts.easy;
    return (
      <SafeAreaView className="flex-1 bg-bg-primary">
        <View className="flex-1 justify-center items-center p-xxl">
          <View className="mb-lg">
            <NucleoIcon
              name={questions.length === 0 ? 'circle-check' : 'sparkle-yellow'}
              size={64}
            />
          </View>
          <Text className="text-text-primary text-xxl font-bold">
            {questions.length === 0 ? 'Nessuna card in scadenza!' : 'Review completata!'}
          </Text>
          <Text className="text-text-muted text-md text-center mt-sm mb-lg leading-[22px]">
            {questions.length === 0
              ? 'Continua a studiare — i ripassi appariranno man mano che progredisci.'
              : 'La spaced repetition rafforza la memoria a lungo termine. Continua così!'}
          </Text>

          {total > 0 && (
            <View className="w-full bg-bg-secondary rounded-xl p-lg mb-xxl" style={{ gap: 8 }}>
              {RATINGS.map(({ label, emoji, rating, color }) => {
                const count = rating === 0 ? ratingCounts.wrong : rating === 2 ? ratingCounts.hard : ratingCounts.easy;
                const pct = total > 0 ? count / total : 0;
                return (
                  <View key={rating} style={{ gap: 4 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <Text style={{ color: Colors.text.muted, fontSize: 13 }}>{emoji} {label}</Text>
                      <Text style={{ color, fontSize: 13, fontWeight: '600' }}>{count}</Text>
                    </View>
                    <View style={{ height: 6, backgroundColor: Colors.bg.tertiary, borderRadius: 3 }}>
                      <View style={{ height: 6, width: `${pct * 100}%`, backgroundColor: color, borderRadius: 3 }} />
                    </View>
                  </View>
                );
              })}
            </View>
          )}

          <Button title="Fine" onPress={() => router.back()} fullWidth size="lg" />
        </View>
      </SafeAreaView>
    );
  }

  // ── Review screen ──────────────────────────────────────────────────────────
  const currentQ = questions[currentIndex];
  if (!currentQ) return null;

  const currentCard: SpacedRepetitionCard | undefined = sessionCards[currentIndex];
  const isReinforcement = currentCard?.needsReinforcement ?? false;
  const answered = currentQ.userAnswer !== undefined;

  return (
    <SafeAreaView className="flex-1 bg-bg-primary">
      {/* Header */}
      <View className="flex-row justify-between items-center px-lg py-md">
        <View className="flex-row items-center gap-sm">
          <NucleoIcon name="sparkle-yellow" size={20} />
          <Text className="text-text-primary text-lg font-bold">Quick Review</Text>
          {isReinforcement && (
            <View
              style={{
                backgroundColor: 'rgba(232,137,48,0.18)',
                borderRadius: 999,
                paddingHorizontal: 8,
                paddingVertical: 2,
                borderWidth: 1,
                borderColor: Colors.accent.warning,
              }}
            >
              <Text style={{ color: Colors.accent.warning, fontSize: 11, fontWeight: '700' }}>
                🔁 Ripasso extra
              </Text>
            </View>
          )}
        </View>
        <Button title="Esci" variant="ghost" onPress={() => router.back()} />
      </View>

      {/* Question */}
      <ScrollView className="flex-1">
        <QuestionCard
          question={currentQ}
          questionNumber={currentIndex + 1}
          totalQuestions={questions.length}
          onAnswer={handleAnswer}
          showFeedback={true}
        />
      </ScrollView>

      {/* Rating buttons — appear after answering */}
      {answered && (
        <View style={{ paddingHorizontal: 24, paddingBottom: 24, gap: 10 }}>
          {ratingPicked === null ? (
            <>
              <Text style={{ color: Colors.text.muted, fontSize: 13, textAlign: 'center', marginBottom: 4 }}>
                Com'è andata?
              </Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {RATINGS.map(({ label, emoji, rating, color, bg }) => (
                  <Pressable
                    key={rating}
                    onPress={() => handleRating(rating)}
                    style={({ pressed }) => ({
                      flex: 1,
                      backgroundColor: bg,
                      borderWidth: 1.5,
                      borderColor: color,
                      borderRadius: 12,
                      paddingVertical: 12,
                      alignItems: 'center',
                      opacity: pressed ? 0.7 : 1,
                    })}
                  >
                    <Text style={{ fontSize: 20 }}>{emoji}</Text>
                    <Text style={{ color, fontSize: 12, fontWeight: '600', marginTop: 4 }}>{label}</Text>
                  </Pressable>
                ))}
              </View>
            </>
          ) : (
            <Button
              title={currentIndex < questions.length - 1 ? 'Prossima →' : 'Fine sessione'}
              onPress={handleNext}
              fullWidth
              size="lg"
            />
          )}
        </View>
      )}
    </SafeAreaView>
  );
}
