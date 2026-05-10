/**
 * Leaderboard Service — mock friends ranking
 * Replace mockGetLeaderboard with a real API call when backend is ready.
 */

export interface LeaderboardEntry {
  id: string;
  name: string;
  xp: number;
  streak: number;
  isMe?: boolean;
}

const MOCK_FRIENDS: Omit<LeaderboardEntry, 'isMe'>[] = [
  { id: '1', name: 'Giulia', xp: 180, streak: 20 },
  { id: '2', name: 'Marco', xp: 170, streak: 14 },
  { id: '3', name: 'Sofia', xp: 150, streak: 8 },
  { id: '4', name: 'Luca', xp: 140, streak: 5 },
];

export async function fetchLeaderboard(myXp: number, myStreak: number): Promise<LeaderboardEntry[]> {
  await new Promise((r) => setTimeout(r, 300 + Math.random() * 200));

  const me: LeaderboardEntry = { id: 'me', name: 'Tu', xp: myXp, streak: myStreak, isMe: true };
  return [...MOCK_FRIENDS, me].sort((a, b) => b.xp - a.xp);
}
