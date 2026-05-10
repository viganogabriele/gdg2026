import type { BraynrStudyProfile } from '@/services/braynrParser';

function roundToNearestFive(value: number): number {
  return Math.round(value / 5) * 5;
}

export function estimateObjectiveMinutes(
  levelRequiredMinutes: number,
  objectiveCount: number,
  avgSessionMinutes?: number,
): number {
  if (objectiveCount <= 0) {
    return 30;
  }

  const rawMinutes = levelRequiredMinutes > 0 ? levelRequiredMinutes / objectiveCount : 30;
  const sessionCap = avgSessionMinutes ? Math.max(20, Math.min(90, avgSessionMinutes)) : 90;
  const boundedMinutes = Math.max(15, Math.min(sessionCap, rawMinutes));

  return roundToNearestFive(boundedMinutes);
}

export function effectivePagesPerHour(profile: BraynrStudyProfile): number {
  const difficultyMultiplier = 1 + profile.difficultyRatio * 0.5;
  const retentionPenalty = 1 + (1 - profile.retentionRate) * 0.3;

  return profile.pagesPerHour / (difficultyMultiplier * retentionPenalty);
}

export function estimatePagesForStudyMinutes(
  minutes: number,
  profile: BraynrStudyProfile,
): number {
  const effectiveRate = effectivePagesPerHour(profile);
  const sessionMaxPages = Math.max(2, Math.round(effectiveRate * (profile.avgSessionMinutes / 60)));
  const estimatedPages = Math.round((minutes / 60) * effectiveRate);

  return Math.max(1, Math.min(sessionMaxPages, estimatedPages));
}
