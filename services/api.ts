/**
 * API Service — fetch wrapper with mock fallback
 *
 * All endpoints call the external AI proxy. If the proxy is unavailable
 * or not configured, we fall back to local mock data.
 */
import type {
  Source,
  SourceSection,
  QuizQuestion,
  StudyLevel,
  DailyObjective,
  LevelTopic,
  Subject,
} from '@/types';
import {
  mockAnalyzeSources,
  mockGenerateAssessment,
  mockGenerateRoadmap,
  mockGenerateLevelQuiz,
  mockGenerateSpacedRepQuestions,
} from './mockData';

// Configure this to point to your AI proxy when available
const API_BASE_URL = ''; // e.g. 'https://your-api.com'
const TIMEOUT_MS = 15000;
const USE_MOCKS = true; // Set to false when backend is ready

async function fetchWithTimeout(
  url: string,
  options: RequestInit
): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timeout);
  }
}

async function apiCall<T>(
  endpoint: string,
  body: unknown,
  mockFn: () => T
): Promise<T> {
  if (USE_MOCKS || !API_BASE_URL) {
    // Simulate network delay
    await new Promise((r) => setTimeout(r, 800 + Math.random() * 1200));
    return mockFn();
  }

  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return (await response.json()) as T;
  } catch (error) {
    console.warn(`API call to ${endpoint} failed, using mock:`, error);
    return mockFn();
  }
}

// ─── Public API Methods ─────────────────────────────────────────────

export async function analyzeSources(
  subjectTitle: string,
  _sources: Source[]
): Promise<{
  sections: SourceSection[];
  topicGraph: { topics: string[]; dependencies: string[][] };
}> {
  return apiCall(
    '/api/sources/analyze',
    { subjectTitle, sources: _sources },
    () => mockAnalyzeSources(subjectTitle)
  );
}

export async function generateAssessment(
  subjectTitle: string,
  sections: SourceSection[],
  count: number = 12
): Promise<{ questions: QuizQuestion[] }> {
  return apiCall(
    '/api/assessment/generate',
    { subjectTitle, sections, count },
    () => ({ questions: mockGenerateAssessment(subjectTitle, sections, count) })
  );
}

export async function generateRoadmap(
  subject: Subject,
  sections: SourceSection[],
  assessmentScore: number
): Promise<{ levels: StudyLevel[]; dailyObjectives: DailyObjective[] }> {
  return apiCall(
    '/api/roadmap/generate',
    { subject, assessmentScore },
    () =>
      mockGenerateRoadmap(
        subject.title,
        sections,
        subject.deadline,
        assessmentScore
      )
  );
}

export async function generateLevelQuiz(
  levelId: string,
  levelTitle: string,
  topics: LevelTopic[],
  count: number = 8
): Promise<{ questions: QuizQuestion[] }> {
  return apiCall(
    '/api/quiz/generate',
    { levelId, topics, count },
    () => ({ questions: mockGenerateLevelQuiz(levelTitle, topics, count) })
  );
}

export async function gradeQuiz(
  questions: QuizQuestion[]
): Promise<{
  score: number;
  feedback: string;
  topicScores: { topicId: string; score: number }[];
}> {
  // Grade locally — no need for API
  const totalQuestions = questions.length;
  let correct = 0;
  const topicMap: Record<string, { total: number; correct: number }> = {};

  questions.forEach((q) => {
    const isCorrect = q.userAnswer === q.correctIndex;
    if (isCorrect) correct++;

    if (q.topicId) {
      if (!topicMap[q.topicId]) topicMap[q.topicId] = { total: 0, correct: 0 };
      topicMap[q.topicId].total++;
      if (isCorrect) topicMap[q.topicId].correct++;
    }
  });

  const score = correct / totalQuestions;
  const topicScores = Object.entries(topicMap).map(([topicId, data]) => ({
    topicId,
    score: data.correct / data.total,
  }));

  let feedback = '';
  if (score >= 0.9) feedback = 'Excellent! You have a strong grasp of this material.';
  else if (score >= 0.7) feedback = 'Good job! You passed and can move on.';
  else if (score >= 0.5) feedback = 'Almost there. Review the weak areas and try again.';
  else feedback = 'Keep studying. Focus on the fundamentals before retrying.';

  return { score, feedback, topicScores };
}

export async function generateSpacedRepQuestions(
  topics: LevelTopic[],
  count: number = 5
): Promise<{ questions: QuizQuestion[] }> {
  return apiCall(
    '/api/spaced-repetition/generate',
    { topics, count },
    () => ({ questions: mockGenerateSpacedRepQuestions(topics, count) })
  );
}

export async function adjustRoadmap(
  _subject: Subject,
  levels: StudyLevel[],
  event: 'level_failed' | 'early_completion'
): Promise<{ updatedLevels: StudyLevel[]; message: string }> {
  return apiCall(
    '/api/roadmap/adjust',
    { subject: _subject, levels, event },
    () => {
      // Simple local adjustment
      const updated = levels.map((level) => {
        if (level.status === 'locked') {
          // Push deadlines back by 2 days on failure
          if (event === 'level_failed') {
            const dl = new Date(level.deadline);
            dl.setDate(dl.getDate() + 2);
            return { ...level, deadline: dl.toISOString() };
          }
          // Pull deadlines forward by 1 day on early completion
          if (event === 'early_completion') {
            const dl = new Date(level.deadline);
            dl.setDate(dl.getDate() - 1);
            return { ...level, deadline: dl.toISOString() };
          }
        }
        return level;
      });

      const message =
        event === 'level_failed'
          ? 'Your schedule has been adjusted to give you more time. Keep going!'
          : 'Great job finishing early! Your schedule has been optimized.';

      return { updatedLevels: updated, message };
    }
  );
}
