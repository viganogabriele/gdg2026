/**
 * API Service — Gemini → OpenRouter → Mock fallback chain
 *
 * Every endpoint tries Gemini first, then OpenRouter, and finally
 * falls back to local mock data. The demo always works regardless
 * of which API keys are available or working.
 */
import type {
    DailyObjective,
    LevelTopic,
    QuizQuestion,
    Source,
    SourceSection,
    StudyLevel,
    Subject,
} from '@/types';
import {
    geminiAnalyzeSources,
    geminiGenerateAssessment,
    geminiGenerateDailyChallengeQuiz,
    geminiGenerateLevelQuiz,
    geminiGenerateRoadmap,
    geminiGenerateSpacedRepQuestions,
    MOCK_MODE
} from './gemini';
import {
    mockAnalyzeSources,
    mockGenerateAssessment,
    mockGenerateDailyChallengeQuiz,
    mockGenerateLevelQuiz,
    mockGenerateRoadmap,
    mockGenerateSpacedRepQuestions,
} from './mockData';

// ─── 3-tier fallback: Gemini → OpenRouter → Mock ────────────────────

async function withFallback<T>(
  aiCall: (provider: 'gemini' | 'openrouter') => Promise<T>,
  mockCall: () => T,
  label: string
): Promise<T> {
  // If no API keys are set, immediately use mock responses without attempting network calls.
  if (MOCK_MODE) {
    console.warn(`📦 ${label}: MOCK_MODE active — using mock data without network calls`);
    // small delay to keep behavior consistent with non-mock path
    await new Promise((r) => setTimeout(r, 200 + Math.random() * 200));
    return mockCall();
  }
  // Tier 1: Gemini
  try {
    const result = await aiCall('gemini');
    console.log(`✅ ${label}: Gemini API succeeded`);
    return result;
  } catch (geminiError) {
    console.warn(`⚠️ ${label}: Gemini failed —`, geminiError);
  }

  // Tier 2: OpenRouter
  try {
    const result = await aiCall('openrouter');
    console.log(`✅ ${label}: OpenRouter API succeeded`);
    return result;
  } catch (openRouterError) {
    console.warn(`⚠️ ${label}: OpenRouter failed —`, openRouterError);
  }

  // Tier 3: Mock data
  console.warn(`📦 ${label}: Using mock data`);
  await new Promise((r) => setTimeout(r, 600 + Math.random() * 800));
  return mockCall();
}

// ─── Public API Methods ─────────────────────────────────────────────

export async function analyzeSources(
  subjectTitle: string,
  sources: Source[]
): Promise<{
  sections: SourceSection[];
  topicGraph: { topics: string[]; dependencies: string[][] };
}> {
  return withFallback(
    (provider) => geminiAnalyzeSources(subjectTitle, sources, provider),
    () => mockAnalyzeSources(subjectTitle),
    'analyzeSources'
  );
}

export async function generateAssessment(
  subjectTitle: string,
  sections: SourceSection[],
  count: number
): Promise<{ questions: QuizQuestion[] }> {
  return withFallback(
    (provider) => geminiGenerateAssessment(subjectTitle, sections, count, provider),
    () => ({ questions: mockGenerateAssessment(subjectTitle, sections, count) }),
    'generateAssessment'
  );
}

export async function generateRoadmap(
  subject: Subject,
  sections: SourceSection[],
  assessmentScore: number
): Promise<{ levels: StudyLevel[]; dailyObjectives: DailyObjective[] }> {
  return withFallback(
    (provider) => geminiGenerateRoadmap(subject, sections, assessmentScore, provider),
    () =>
      mockGenerateRoadmap(
        subject.title,
        sections,
        subject.deadline,
        assessmentScore
      ),
    'generateRoadmap'
  );
}

export async function generateLevelQuiz(
  levelId: string,
  levelTitle: string,
  topics: LevelTopic[],
  count: number = 8,
  flaggedObjectives?: DailyObjective[],
  sources?: Source[]
): Promise<{ questions: QuizQuestion[] }> {
  return withFallback(
    (provider) => geminiGenerateLevelQuiz(levelId, levelTitle, topics, count, provider, flaggedObjectives, sources),
    () => ({ questions: mockGenerateLevelQuiz(levelTitle, topics, count) }),
    'generateLevelQuiz'
  );
}

export async function generateDailyChallengeQuiz(
  flaggedObjectives: DailyObjective[],
  sources: Source[],
  count: number = 8
): Promise<{ questions: QuizQuestion[] }> {
  return withFallback(
    (provider) => geminiGenerateDailyChallengeQuiz(flaggedObjectives, sources, count, provider),
    () => ({ questions: mockGenerateDailyChallengeQuiz(flaggedObjectives, sources, count) }),
    'generateDailyChallengeQuiz'
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
  return withFallback(
    (provider) => geminiGenerateSpacedRepQuestions(topics, count, provider),
    () => ({ questions: mockGenerateSpacedRepQuestions(topics, count) }),
    'generateSpacedRepQuestions'
  );
}

export async function adjustRoadmap(
  _subject: Subject,
  levels: StudyLevel[],
  event: 'level_failed' | 'early_completion'
): Promise<{ updatedLevels: StudyLevel[]; message: string }> {
  // Keep local adjustment logic — lightweight, no AI needed
  const updated = levels.map((level) => {
    if (level.status === 'locked') {
      if (event === 'level_failed') {
        const dl = new Date(level.deadline);
        dl.setDate(dl.getDate() + 2);
        return { ...level, deadline: dl.toISOString() };
      }
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
