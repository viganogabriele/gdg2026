/**
 * Spaced Repetition Engine — Leitner System Implementation
 *
 * Boxes 1-5, with increasing review intervals:
 *   Box 1: review in 1 day
 *   Box 2: review in 3 days
 *   Box 3: review in 7 days
 *   Box 4: review in 14 days
 *   Box 5: review in 30 days
 *
 * Correct answer → move to next box
 * Wrong answer → move back to box 1
 */

import type { SpacedRepetitionCard } from '@/types';

const BOX_INTERVALS_DAYS: Record<number, number> = {
  1: 1,
  2: 3,
  3: 7,
  4: 14,
  5: 30,
};

function getNextReviewDate(box: number): string {
  const days = BOX_INTERVALS_DAYS[box] || 1;
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
}

export function createCard(
  questionId: string,
  subjectId: string,
  topicId: string
): SpacedRepetitionCard {
  return {
    id: `sr_${questionId}_${Date.now()}`,
    questionId,
    subjectId,
    topicId,
    box: 1,
    nextReviewDate: getNextReviewDate(1),
    consecutiveCorrect: 0,
  };
}

export function processAnswer(
  card: SpacedRepetitionCard,
  correct: boolean
): SpacedRepetitionCard {
  if (correct) {
    const newBox = Math.min(card.box + 1, 5);
    return {
      ...card,
      box: newBox,
      consecutiveCorrect: card.consecutiveCorrect + 1,
      lastReviewDate: new Date().toISOString(),
      nextReviewDate: getNextReviewDate(newBox),
    };
  } else {
    return {
      ...card,
      box: 1,
      consecutiveCorrect: 0,
      lastReviewDate: new Date().toISOString(),
      nextReviewDate: getNextReviewDate(1),
    };
  }
}

export function getDueCards(cards: SpacedRepetitionCard[]): SpacedRepetitionCard[] {
  const now = new Date().toISOString();
  return cards
    .filter((card) => card.nextReviewDate <= now)
    .sort((a, b) => a.box - b.box); // lower boxes first (more urgent)
}

export function getCardsForSession(
  cards: SpacedRepetitionCard[],
  count: number = 5
): SpacedRepetitionCard[] {
  const due = getDueCards(cards);
  return due.slice(0, count);
}

export function isCardMastered(card: SpacedRepetitionCard): boolean {
  return card.box >= 5 && card.consecutiveCorrect >= 3;
}

export function getBoxDistribution(
  cards: SpacedRepetitionCard[]
): Record<number, number> {
  const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  cards.forEach((card) => {
    distribution[card.box] = (distribution[card.box] || 0) + 1;
  });
  return distribution;
}
