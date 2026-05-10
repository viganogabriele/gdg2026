const SESSION_GAP_MS = 30 * 60 * 1000; // 30 min gap = new session

export interface BraynrStudyProfile {
  pagesPerHour: number;
  retentionRate: number;    // 0.0–1.0
  difficultyRatio: number;  // fraction of hard cards (rating ≤ 2)
  avgSessionMinutes: number;
  studiedDays: string[];    // ISO date strings (YYYY-MM-DD)
  totalStudyMinutes: number;
}

interface BraynrResult { time: number; rating: number }
interface BraynrQuestion { results: BraynrResult[] }
interface BraynrKeyword { createdAt: number }
interface BraynrBook {
  pages: number;
  keywords: BraynrKeyword[];
  questions: BraynrQuestion[];
}
interface BraynrJson { books: BraynrBook[] }

function groupIntoSessions(timestamps: number[]): number[][] {
  if (!timestamps.length) return [];
  const sorted = [...timestamps].sort((a, b) => a - b);
  const sessions: number[][] = [[sorted[0]]];
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] - sorted[i - 1] > SESSION_GAP_MS) {
      sessions.push([]);
    }
    sessions[sessions.length - 1].push(sorted[i]);
  }
  return sessions;
}

function isoDate(ms: number): string {
  return new Date(ms).toISOString().split('T')[0];
}

export function parseBraynrJson(raw: unknown): BraynrStudyProfile {
  const json = raw as BraynrJson;
  const books: BraynrBook[] = json?.books ?? [];

  // ── Reading speed from keyword timestamps ─────────────────────────
  let pagesPerHour = 10; // sensible default
  let totalReadingMinutes = 0;

  for (const book of books) {
    const totalPages = book.pages || 1;
    const keyTimes = (book.keywords ?? []).map((k) => k.createdAt).filter(Boolean);
    const sessions = groupIntoSessions(keyTimes);

    for (const s of sessions) {
      if (s.length < 2) continue;
      const durationMs = s[s.length - 1] - s[0];
      const durationMin = durationMs / 60_000;
      totalReadingMinutes += durationMin;

      // fraction of the book covered in this session (rough estimate via keyword density)
      const fraction = s.length / Math.max((book.keywords ?? []).length, 1);
      const pagesInSession = Math.max(1, Math.round(totalPages * fraction));
      const speed = pagesInSession / (durationMin / 60);
      if (speed > 0 && speed < 100) pagesPerHour = speed;
    }
  }

  // ── Flashcard performance ──────────────────────────────────────────
  const allRatings: number[] = books.flatMap((b) =>
    (b.questions ?? []).flatMap((q) => (q.results ?? []).map((r) => r.rating))
  );

  const retentionRate = allRatings.length
    ? allRatings.reduce((s, r) => s + r, 0) / (allRatings.length * 4)
    : 0.7;

  const difficultyRatio = allRatings.length
    ? allRatings.filter((r) => r <= 2).length / allRatings.length
    : 0.3;

  // ── Review sessions ────────────────────────────────────────────────
  const reviewTimes: number[] = books.flatMap((b) =>
    (b.questions ?? []).flatMap((q) => (q.results ?? []).map((r) => r.time))
  );
  const reviewSessions = groupIntoSessions(reviewTimes);
  const reviewMinutes = reviewSessions.reduce((sum, s) => {
    if (s.length < 2) return sum + 2; // single review = ~2 min
    return sum + (s[s.length - 1] - s[0]) / 60_000;
  }, 0);

  const totalStudyMinutes = Math.round(totalReadingMinutes + reviewMinutes);
  const avgSessionMinutes =
    reviewSessions.length + (totalReadingMinutes > 0 ? 1 : 0) > 0
      ? Math.round(totalStudyMinutes / (reviewSessions.length + 1))
      : 30;

  // ── Days studied ───────────────────────────────────────────────────
  const daySet = new Set<string>();
  for (const book of books) {
    for (const k of book.keywords ?? []) daySet.add(isoDate(k.createdAt));
  }
  for (const t of reviewTimes) daySet.add(isoDate(t));
  const studiedDays = [...daySet].sort();

  return {
    pagesPerHour: Math.max(1, Math.round(pagesPerHour * 10) / 10),
    retentionRate: Math.min(1, Math.max(0, retentionRate)),
    difficultyRatio: Math.min(1, Math.max(0, difficultyRatio)),
    avgSessionMinutes: Math.max(10, avgSessionMinutes),
    studiedDays,
    totalStudyMinutes,
  };
}

export function minutesForPages(
  pages: number,
  profile: BraynrStudyProfile
): number {
  const readingMin = (pages / profile.pagesPerHour) * 60;
  const difficultyMultiplier = 1 + profile.difficultyRatio * 0.5;
  const retentionPenalty = 1 + (1 - profile.retentionRate) * 0.3;
  return Math.round(readingMin * difficultyMultiplier * retentionPenalty);
}

export function adjustMinutesToStudyProfile(
  baseMinutes: number,
  profile: BraynrStudyProfile
): number {
  const baselinePagesPerHour = 10;
  const paceMultiplier = Math.min(1.85, Math.max(0.75, baselinePagesPerHour / profile.pagesPerHour));
  const difficultyMultiplier = 1 + profile.difficultyRatio * 0.5;
  const retentionPenalty = 1 + (1 - profile.retentionRate) * 0.3;

  return Math.round(baseMinutes * paceMultiplier * difficultyMultiplier * retentionPenalty);
}
