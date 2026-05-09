/**
 * Game Points Hook — point calculations, streak multipliers, badge checks
 */
import { useCallback } from 'react';
import { useStudyStore } from './useStudyStore';
import { Points, StreakMultipliers } from '@/constants/gamification';

export function useGamePoints() {
  const stats = useStudyStore((s) => s.stats);
  const addPoints = useStudyStore((s) => s.addPoints);
  const checkBadgeEligibility = useStudyStore((s) => s.checkBadgeEligibility);

  const getStreakMultiplier = useCallback((): number => {
    const streak = stats.currentStreak;
    if (streak >= 30) return StreakMultipliers[30];
    if (streak >= 14) return StreakMultipliers[14];
    if (streak >= 7) return StreakMultipliers[7];
    return 1;
  }, [stats.currentStreak]);

  const awardSessionPoints = useCallback(() => {
    const multiplier = getStreakMultiplier();
    const points = Math.round(Points.STUDY_SESSION_COMPLETE * multiplier);
    addPoints(points);
    checkBadgeEligibility();
    return points;
  }, [getStreakMultiplier, addPoints, checkBadgeEligibility]);

  const awardLevelPoints = useCallback(() => {
    const multiplier = getStreakMultiplier();
    const points = Math.round(Points.LEVEL_PASSED * multiplier);
    addPoints(points);
    checkBadgeEligibility();
    return points;
  }, [getStreakMultiplier, addPoints, checkBadgeEligibility]);

  const awardPerfectQuizPoints = useCallback(() => {
    const multiplier = getStreakMultiplier();
    const points = Math.round(Points.PERFECT_QUIZ * multiplier);
    addPoints(points);
    checkBadgeEligibility();
    return points;
  }, [getStreakMultiplier, addPoints, checkBadgeEligibility]);

  return {
    stats,
    streakMultiplier: getStreakMultiplier(),
    awardSessionPoints,
    awardLevelPoints,
    awardPerfectQuizPoints,
  };
}
