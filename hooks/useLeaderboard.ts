import { useEffect, useState } from 'react';
import { fetchLeaderboard, LeaderboardEntry } from '@/services/leaderboard';
import { useStudyStore } from '@/hooks/useStudyStore';

export function useLeaderboard() {
  const totalPoints = useStudyStore((s) => s.stats.totalPoints);
  const currentStreak = useStudyStore((s) => s.stats.currentStreak);

  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchLeaderboard(totalPoints, currentStreak)
      .then(setEntries)
      .finally(() => setLoading(false));
  }, [totalPoints, currentStreak]);

  return { entries, loading };
}
