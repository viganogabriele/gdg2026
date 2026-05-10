/**
 * Spaced Repetition Engine — SM-2+ Algorithm
 *
 * Ratings (0–5):
 *   0 → Wrong, no memory at all        → review in 10 minutes (same session)
 *   1 → Wrong, vaguely remembered      → review in 1 day
 *   2 → Wrong but close                → review in 2 days
 *   3 → Correct but hard / slow        → normal interval × 1.0
 *   4 → Correct with minor hesitation  → normal interval × EaseFactor
 *   5 → Correct, fast & confident      → normal interval × EaseFactor × 1.1
 *
 * EaseFactor (2.5 default, min 1.3): adjusts per answer quality
 *   EF += 0.1 - (5 - rating) × (0.08 + (5 - rating) × 0.02)
 *
 * needsReinforcement: flagged when consecutiveFails >= 3
 *   → card appears in every session until 2 consecutive correct answers
 *
 * Box (UI display only, derived from intervalDays):
 *   < 3d → 1 | 3–6d → 2 | 7–13d → 3 | 14–29d → 4 | ≥ 30d → 5
 */

import type { SpacedRepetitionCard } from '@/types';

// ─── Constants ────────────────────────────────────────────────────────────────

const EASE_DEFAULT = 2.5;
const EASE_MIN = 1.3;
const EASE_BONUS_MULTIPLIER = 1.1;  // rating 5 bonus
const REINFORCEMENT_FAIL_THRESHOLD = 3;
const REINFORCEMENT_RECOVERY_STREAK = 2;

// Minutes/days for wrong answers
const WRONG_INTERVALS: Record<number, { minutes?: number; days?: number }> = {
  0: { minutes: 10 },  // same-session repeat
  1: { days: 1 },
  2: { days: 2 },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function intervalToBox(days: number): number {
  if (days < 3) return 1;
  if (days < 7) return 2;
  if (days < 14) return 3;
  if (days < 30) return 4;
  return 5;
}

function addDays(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

function addMinutes(minutes: number): string {
  const d = new Date();
  d.setMinutes(d.getMinutes() + minutes);
  return d.toISOString();
}

/** SM-2 ease factor delta. Positive for rating ≥ 4, negative for rating < 4. */
function easeDelta(rating: number): number {
  return 0.1 - (5 - rating) * (0.08 + (5 - rating) * 0.02);
}

// ─── Public API ───────────────────────────────────────────────────────────────

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
    nextReviewDate: addDays(1),
    consecutiveCorrect: 0,
    // SM-2+ fields
    intervalDays: 1,
    easeFactor: EASE_DEFAULT,
    consecutiveFails: 0,
    needsReinforcement: false,
    totalReviews: 0,
  };
}

/**
 * Core SM-2+ answer processing.
 * @param card   The card being reviewed
 * @param rating 0–5 quality rating (0–2 = wrong/hard, 3–5 = correct)
 */
export function processAnswer(
  card: SpacedRepetitionCard,
  rating: number
): SpacedRepetitionCard {
  const clampedRating = Math.max(0, Math.min(5, Math.round(rating)));
  const totalReviews = (card.totalReviews ?? 0) + 1;
  const newEase = Math.max(EASE_MIN, (card.easeFactor ?? EASE_DEFAULT) + easeDelta(clampedRating));

  if (clampedRating < 3) {
    // ── Wrong / Hard ──────────────────────────────────────────────────────────
    const newFails = (card.consecutiveFails ?? 0) + 1;
    const needsReinforcement = newFails >= REINFORCEMENT_FAIL_THRESHOLD;

    let nextReviewDate: string;
    const wrongSpec = WRONG_INTERVALS[clampedRating];
    if (wrongSpec?.minutes) {
      nextReviewDate = addMinutes(wrongSpec.minutes);
    } else {
      nextReviewDate = addDays(wrongSpec?.days ?? 1);
    }

    // Interval resets: rating 0 → 1d effective, 1 → 1d, 2 → 2d
    const newInterval = clampedRating === 2 ? 2 : 1;

    return {
      ...card,
      box: 1,
      intervalDays: newInterval,
      easeFactor: newEase,
      consecutiveCorrect: 0,
      consecutiveFails: newFails,
      needsReinforcement,
      totalReviews,
      lastReviewDate: new Date().toISOString(),
      nextReviewDate,
    };
  } else {
    // ── Correct ───────────────────────────────────────────────────────────────
    const newFails = 0;
    const newConsecutiveCorrect = card.consecutiveCorrect + 1;

    // Graduated interval growth (SM-2 first-review boostrap)
    let newInterval: number;
    const prevInterval = card.intervalDays ?? 1;
    if (totalReviews === 1) {
      newInterval = 1;
    } else if (prevInterval <= 1) {
      newInterval = 6;
    } else {
      newInterval = Math.round(prevInterval * newEase);
    }

    // Rating 5 gets a small bonus
    if (clampedRating === 5) {
      newInterval = Math.round(newInterval * EASE_BONUS_MULTIPLIER);
    }

    // Recover from reinforcement after REINFORCEMENT_RECOVERY_STREAK correct answers
    const stillNeedsReinforcement =
      card.needsReinforcement &&
      newConsecutiveCorrect < REINFORCEMENT_RECOVERY_STREAK;

    return {
      ...card,
      box: intervalToBox(newInterval),
      intervalDays: newInterval,
      easeFactor: newEase,
      consecutiveCorrect: newConsecutiveCorrect,
      consecutiveFails: newFails,
      needsReinforcement: stillNeedsReinforcement,
      totalReviews,
      lastReviewDate: new Date().toISOString(),
      nextReviewDate: addDays(newInterval),
    };
  }
}

/**
 * Backward-compatible boolean wrapper for callers that haven't migrated yet.
 * correct=true → rating 4, correct=false → rating 1
 */
export function processAnswerBool(
  card: SpacedRepetitionCard,
  correct: boolean
): SpacedRepetitionCard {
  return processAnswer(card, correct ? 4 : 1);
}

export function getDueCards(cards: SpacedRepetitionCard[]): SpacedRepetitionCard[] {
  const now = new Date().toISOString();
  return cards
    .filter((card) => card.nextReviewDate <= now || card.needsReinforcement)
    .sort((a, b) => {
      // Reinforcement cards always first
      if (a.needsReinforcement && !b.needsReinforcement) return -1;
      if (!a.needsReinforcement && b.needsReinforcement) return 1;
      // Then by box (lower = more urgent)
      if (a.box !== b.box) return a.box - b.box;
      // Then by overdue amount
      return a.nextReviewDate.localeCompare(b.nextReviewDate);
    });
}

export function getCardsForSession(
  cards: SpacedRepetitionCard[],
  count: number = 5
): SpacedRepetitionCard[] {
  const due = getDueCards(cards);
  if (due.length >= count) return due.slice(0, count);

  // Fill remaining slots with soon-to-be-due cards (proactive review)
  const notYetDue = cards
    .filter((c) => !due.includes(c))
    .sort((a, b) => a.nextReviewDate.localeCompare(b.nextReviewDate));

  return [...due, ...notYetDue].slice(0, count);
}

export function isCardMastered(card: SpacedRepetitionCard): boolean {
  return card.box >= 5 && card.consecutiveCorrect >= 3 && !card.needsReinforcement;
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
