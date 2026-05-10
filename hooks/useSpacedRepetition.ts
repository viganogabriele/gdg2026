/**
 * Spaced Repetition Hook — checks for due cards and manages review sessions
 */
import { useMemo, useCallback } from 'react';
import { useStudyStore } from './useStudyStore';
import {
  getDueCards,
  getCardsForSession,
  processAnswer,
  processAnswerBool,
  createCard,
} from '@/services/spacedRepetition';
import type { QuizQuestion, SpacedRepetitionCard } from '@/types';

export function useSpacedRepetition() {
  const spacedRepCards = useStudyStore((s) => s.spacedRepCards);
  const addSpacedRepCards = useStudyStore((s) => s.addSpacedRepCards);
  const updateSpacedRepCard = useStudyStore((s) => s.updateSpacedRepCard);
  const addPoints = useStudyStore((s) => s.addPoints);
  const activeSubjectId = useStudyStore((s) => s.activeSubjectId);

  const dueCards = useMemo(() => getDueCards(spacedRepCards), [spacedRepCards]);

  const sessionCards = useMemo(
    () => getCardsForSession(spacedRepCards, 5),
    [spacedRepCards]
  );

  const hasDueCards = dueCards.length > 0;
  const dueCount = dueCards.length;

  const addCardsFromQuiz = useCallback(
    (questions: QuizQuestion[]) => {
      if (!activeSubjectId) return;

      const newCards = questions.map((q) =>
        createCard(q.id, activeSubjectId, q.topicId || 'general')
      );
      addSpacedRepCards(newCards);
    },
    [activeSubjectId, addSpacedRepCards]
  );

  /**
   * Primary review function — SM-2+ rating (0–5).
   *   0 = wrong/blank  → review in 10 min
   *   1 = wrong        → review tomorrow
   *   2 = hard/wrong   → review in 2 days
   *   3 = correct hard → same interval
   *   4 = correct      → grow by EaseFactor
   *   5 = perfect      → grow by EaseFactor × 1.1
   */
  const reviewCardRated = useCallback(
    (card: SpacedRepetitionCard, rating: number) => {
      const updated = processAnswer(card, rating);
      updateSpacedRepCard(updated);

      // Points proportional to quality
      const pointsMap: Record<number, number> = { 0: 0, 1: 0, 2: 1, 3: 3, 4: 5, 5: 8 };
      const pts = pointsMap[Math.max(0, Math.min(5, Math.round(rating)))] ?? 0;
      if (pts > 0) addPoints(pts);
    },
    [updateSpacedRepCard, addPoints]
  );

  /**
   * Backward-compatible boolean wrapper.
   * correct=true → rating 4, correct=false → rating 1
   */
  const reviewCard = useCallback(
    (card: SpacedRepetitionCard, correct: boolean) => {
      const updated = processAnswerBool(card, correct);
      updateSpacedRepCard(updated);
      if (correct) addPoints(5);
    },
    [updateSpacedRepCard, addPoints]
  );

  return {
    dueCards,
    sessionCards,
    hasDueCards,
    dueCount,
    addCardsFromQuiz,
    reviewCard,        // compat: bool
    reviewCardRated,   // new: 0–5 rating
  };
}
