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
  { id: '1', name: 'Giulia',  xp: 1840, streak: 12 },
  { id: '2', name: 'Marco',   xp: 1560, streak: 7  },
  { id: '3', name: 'Sofia',   xp: 1120, streak: 5  },
  { id: '4', name: 'Luca',    xp: 870,  streak: 3  },
  { id: '5', name: 'Anna',    xp: 640,  streak: 9  },
  { id: '6', name: 'Matteo',  xp: 420,  streak: 1  },
];

export async function fetchLeaderboard(myXp: number, myStreak: number): Promise<LeaderboardEntry[]> {
  await new Promise((r) => setTimeout(r, 300 + Math.random() * 200));

  const me: LeaderboardEntry = { id: 'me', name: 'Tu', xp: myXp, streak: myStreak, isMe: true };
  return [...MOCK_FRIENDS, me].sort((a, b) => b.xp - a.xp);
}
