/**
 * Spaced Repetition Hook — checks for due cards and manages review sessions
 */
import { useMemo, useCallback } from 'react';
import { useStudyStore } from './useStudyStore';
import {
  getDueCards,
  getCardsForSession,
  processAnswer,
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

  const reviewCard = useCallback(
    (card: SpacedRepetitionCard, correct: boolean) => {
      const updated = processAnswer(card, correct);
      updateSpacedRepCard(updated);

      if (correct) {
        addPoints(5); // SPACED_REP_CORRECT
      }

      // If wrong, we need to schedule more reviews (card goes back to box 1)
      if (!correct) {
        // The processAnswer already moves to box 1, which schedules for tomorrow
        // This naturally creates more review prompts
      }
    },
    [updateSpacedRepCard, addPoints]
  );

  return {
    dueCards,
    sessionCards,
    hasDueCards,
    dueCount,
    addCardsFromQuiz,
    reviewCard,
  };
}
