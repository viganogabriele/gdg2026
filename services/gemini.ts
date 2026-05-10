/**
 * AI API Service — Google Generative AI SDK (primary) + OpenRouter (fallback)
 *
 * Uses the official @google/generative-ai SDK with Gemini 2.0 Flash
 * as the primary provider, OpenRouter as a secondary fallback.
 * All functions return structured JSON via responseSchema / json_object mode.
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
  GoogleGenerativeAI,
  SchemaType,
} from '@google/generative-ai';

// ─── Configuration ──────────────────────────────────────────────────

const GEMINI_MODEL = 'gemini-3.1-flash-lite';

const OPENROUTER_BASE = 'https://openrouter.ai/api/v1';
const OPENROUTER_MODEL = 'google/gemini-2.0-flash-001';
const TIMEOUT_MS = 30_000;

// If neither API key is provided, run in mock mode and avoid network/sdk calls.
export const MOCK_MODE = !process.env.EXPO_PUBLIC_GEMINI_API_KEY && !process.env.EXPO_PUBLIC_OPEN_ROUTER_API_KEY;

export type AIProvider = 'gemini' | 'openrouter';

// ─── SDK singleton ──────────────────────────────────────────────────

let _genAI: GoogleGenerativeAI | null = null;

function getGenAI(): GoogleGenerativeAI {
  if (_genAI) return _genAI;
  const key = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';
  if (!key && !MOCK_MODE) throw new Error('EXPO_PUBLIC_GEMINI_API_KEY is not set');
  if (!key && MOCK_MODE) {
    // In mock mode we don't construct the SDK instance.
    throw new Error('Gemini SDK not available in mock mode');
  }
  _genAI = new GoogleGenerativeAI(key);
  return _genAI;
}

function getOpenRouterKey(): string {
  const key = process.env.EXPO_PUBLIC_OPEN_ROUTER_API_KEY || '';
  if (!key && !MOCK_MODE) throw new Error('EXPO_PUBLIC_OPEN_ROUTER_API_KEY is not set');
  if (!key && MOCK_MODE) {
    // In mock mode we don't call the OpenRouter API.
    throw new Error('OpenRouter API not available in mock mode');
  }
  return key;
}

// ─── Low-level callers ──────────────────────────────────────────────

interface AIRequest {
  prompt: string;
  responseSchema?: Record<string, unknown>;
  temperature?: number;
}

async function callGemini<T>(req: AIRequest): Promise<T> {
  const ai = getGenAI();
  const model = ai.getGenerativeModel({
    model: GEMINI_MODEL,
    generationConfig: {
      temperature: req.temperature ?? 0.7,
      responseMimeType: 'application/json',
      responseSchema: req.responseSchema as any,
    },
  });

  const result = await model.generateContent(req.prompt);
  const text = result.response.text();
  if (!text) throw new Error('Gemini returned empty response');
  return JSON.parse(text) as T;
}

async function callOpenRouter<T>(req: AIRequest): Promise<T> {
  const apiKey = getOpenRouterKey();
  const url = `${OPENROUTER_BASE}/chat/completions`;

  const body = {
    model: OPENROUTER_MODEL,
    messages: [{ role: 'user' as const, content: req.prompt }],
    temperature: req.temperature ?? 0.7,
    response_format: { type: 'json_object' as const },
  };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://studyquest.app',
        'X-Title': 'StudyQuest',
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`OpenRouter API ${response.status}: ${errorBody.slice(0, 300)}`);
    }

    const data = await response.json();
    const text = data?.choices?.[0]?.message?.content;
    if (!text) throw new Error('OpenRouter returned empty response');
    return JSON.parse(text) as T;
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Unified caller — dispatches to Gemini SDK or OpenRouter based on provider.
 */
export async function callAI<T>(req: AIRequest, provider: AIProvider = 'gemini'): Promise<T> {
  if (MOCK_MODE) {
    // Prevent any downstream attempt to call external services when running in mock mode.
    throw new Error('AI keys not set — caller should use mock responses');
  }

  if (provider === 'openrouter') return callOpenRouter<T>(req);
  return callGemini<T>(req);
}

// ─── Helpers ────────────────────────────────────────────────────────

function uid(): string {
  return Math.random().toString(36).substring(2, 11);
}

function daysFromNow(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

// ─── Public API Functions ───────────────────────────────────────────

/**
 * Analyze sources and break the subject into ordered topic sections.
 */
export async function geminiAnalyzeSources(
  subjectTitle: string,
  _sources: Source[],
  provider: AIProvider = 'gemini'
): Promise<{
  sections: SourceSection[];
  topicGraph: { topics: string[]; dependencies: string[][] };
}> {
  const sourceDescriptions = _sources
    .map((s, i) => `Source ${i + 1}: "${s.title}" (${s.type})${s.content ? ` — Content preview: ${s.content.slice(0, 200)}` : ''}`)
    .join('\n');

  const prompt = `You are a study planning assistant. A student is studying "${subjectTitle}".

${sourceDescriptions ? `Their study materials:\n${sourceDescriptions}\n` : ''}
Break this subject into 5-7 ordered topic sections that build on each other, from fundamentals to advanced.
For each section, provide a title, a short summary (1-2 sentences), and a page range estimate (as if the material is ~200 pages total).
Also provide the dependency graph showing which topics depend on which.

Return JSON matching this structure exactly:
{
  "sections": [
    {
      "id": "unique_id_string",
      "title": "Topic Title",
      "pageRange": [1, 30],
      "summary": "Brief summary of what this section covers."
    }
  ],
  "topicGraph": {
    "topics": ["Topic 1", "Topic 2"],
    "dependencies": [["Topic 1", "Topic 2"]]
  }
}`;

  const responseSchema = {
    type: SchemaType.OBJECT,
    properties: {
      sections: {
        type: SchemaType.ARRAY,
        items: {
          type: SchemaType.OBJECT,
          properties: {
            id: { type: SchemaType.STRING },
            title: { type: SchemaType.STRING },
            pageRange: { type: SchemaType.ARRAY, items: { type: SchemaType.INTEGER } },
            summary: { type: SchemaType.STRING },
          },
          required: ['id', 'title', 'summary'],
        },
      },
      topicGraph: {
        type: SchemaType.OBJECT,
        properties: {
          topics: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
          dependencies: {
            type: SchemaType.ARRAY,
            items: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
          },
        },
        required: ['topics', 'dependencies'],
      },
    },
    required: ['sections', 'topicGraph'],
  };

  const result = await callAI<{
    sections: SourceSection[];
    topicGraph: { topics: string[]; dependencies: string[][] };
  }>({ prompt, responseSchema, temperature: 0.5 }, provider);

  result.sections = result.sections.map((s) => ({
    ...s,
    id: s.id || uid(),
    pageRange: s.pageRange || undefined,
  }));

  return result;
}

/**
 * Generate assessment questions to gauge the student's existing knowledge.
 */
export async function geminiGenerateAssessment(
  subjectTitle: string,
  sections: SourceSection[],
  count: number = 12,
  provider: AIProvider = 'gemini'
): Promise<{ questions: QuizQuestion[] }> {
  const sectionList = sections
    .map((s, i) => `${i + 1}. ${s.title}${s.summary ? ` — ${s.summary}` : ''}`)
    .join('\n');

  const prompt = `You are a study assessment generator. Create ${count} multiple-choice questions to assess a student's knowledge of "${subjectTitle}".

The subject is divided into these sections:
${sectionList}

Requirements:
- Each question should have exactly 4 options
- Questions should range from basic to advanced
- Distribute questions across all sections
- Include clear explanations for the correct answer
- Make the questions specific and educational, not generic
- The correctIndex is 0-based (0, 1, 2, or 3)

Return JSON with this structure:
{
  "questions": [
    {
      "id": "unique_id",
      "text": "Question text?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 0,
      "explanation": "Why this is correct.",
      "topicId": "section_id_from_above"
    }
  ]
}`;

  const responseSchema = {
    type: SchemaType.OBJECT,
    properties: {
      questions: {
        type: SchemaType.ARRAY,
        items: {
          type: SchemaType.OBJECT,
          properties: {
            id: { type: SchemaType.STRING },
            text: { type: SchemaType.STRING },
            options: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
            correctIndex: { type: SchemaType.INTEGER },
            explanation: { type: SchemaType.STRING },
            topicId: { type: SchemaType.STRING },
          },
          required: ['id', 'text', 'options', 'correctIndex', 'explanation'],
        },
      },
    },
    required: ['questions'],
  };

  const result = await callAI<{ questions: QuizQuestion[] }>({
    prompt,
    responseSchema,
    temperature: 0.8,
  }, provider);

  result.questions = result.questions.map((q, i) => ({
    ...q,
    id: q.id || uid(),
    topicId: sections[i % sections.length]?.id || q.topicId,
    sourceRef: {
      sourceId: 'source_1',
      sectionId: sections[i % sections.length]?.id || '',
      label: sections[i % sections.length]?.title || '',
    },
  }));

  return result;
}

/**
 * Generate a study roadmap with levels, topics, and daily objectives.
 */
export async function geminiGenerateRoadmap(
  subject: Subject,
  sections: SourceSection[],
  assessmentScore: number,
  provider: AIProvider = 'gemini'
): Promise<{ levels: StudyLevel[]; dailyObjectives: DailyObjective[] }> {
  const deadlineDate = new Date(subject.deadline);
  const now = new Date();
  const totalDays = Math.max(
    Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
    7
  );

  const sectionList = sections
    .map((s, i) => `${i + 1}. ${s.title} — ${s.summary || 'No summary'}`)
    .join('\n');

  const prompt = `You are a study planner. Create a levelled study roadmap for "${subject.title}".

Student context:
- Assessment score: ${Math.round(assessmentScore * 100)}%
- Deadline: ${deadlineDate.toLocaleDateString()} (${totalDays} days away)
- Available: ${subject.hoursPerWeek} hours/week
- Sections to cover:
${sectionList}

Rules:
- Create one level per section (${sections.length} levels total)
- Each level can have more than topics, preceded by the day number and a dash, e.g. "Day 1 - Topic Title" (Days need to be incremental, no skipping days)
- Each topic has 3 specific study arguments (what to study)
- If the student scored well (>${Math.round(assessmentScore * 100)}%), mark early levels as completed
- Levels should be numbered 1 through ${sections.length}
- Space deadlines evenly across ${totalDays} days
- Estimate required study minutes per level (90-180 min)

Also create exactly 3 daily study objectives for today based on the FIRST topic (Day 1) of the first active level. Each objective should correspond to one of the topic's arguments. Do NOT include review-type objectives.

Return JSON:
{
  "levels": [
    {
      "levelNumber": 1,
      "title": "Section Title",
      "topics": [
        {
          "title": "Day 1 - Topic Title",
          "arguments": ["Argument 1", "Argument 2", "Argument 3"],
          "completed": false
        },
        {
          "title": "Day 2 — Topic Title",
          "arguments": ["Argument 1", "Argument 2", "Argument 3"],
          "completed": false
        },
        ... //as many days as needed tailored to the student's availability and deadlines
       ],
      "status": "active",
      "requiredStudyMinutes": 120,
      "completedStudyMinutes": 0
    }
  ],
  "dailyObjectives": [
    {
      "title": "Day 1 - Topic: Argument",
      "description": "Focus on: Argument details",
      "type": "study",
      "estimatedMinutes": 30
    }
  ]
}`;

  const responseSchema = {
    type: SchemaType.OBJECT,
    properties: {
      levels: {
        type: SchemaType.ARRAY,
        items: {
          type: SchemaType.OBJECT,
          properties: {
            levelNumber: { type: SchemaType.INTEGER },
            title: { type: SchemaType.STRING },
            topics: {
              type: SchemaType.ARRAY,
              items: {
                type: SchemaType.OBJECT,
                properties: {
                  title: { type: SchemaType.STRING },
                  arguments: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
                  completed: { type: SchemaType.BOOLEAN },
                },
                required: ['title', 'arguments', 'completed'],
              },
            },
            status: { type: SchemaType.STRING },
            requiredStudyMinutes: { type: SchemaType.INTEGER },
            completedStudyMinutes: { type: SchemaType.INTEGER },
          },
          required: ['levelNumber', 'title', 'topics', 'status', 'requiredStudyMinutes'],
        },
      },
      dailyObjectives: {
        type: SchemaType.ARRAY,
        items: {
          type: SchemaType.OBJECT,
          properties: {
            title: { type: SchemaType.STRING },
            description: { type: SchemaType.STRING },
            type: { type: SchemaType.STRING },
            estimatedMinutes: { type: SchemaType.INTEGER },
          },
          required: ['title', 'description', 'type', 'estimatedMinutes'],
        },
      },
    },
    required: ['levels', 'dailyObjectives'],
  };

  const raw = await callAI<{
    levels: {
      levelNumber: number;
      title: string;
      topics: {
        title: string;
        arguments: string[];
        completed: boolean;
      }[];
      status: string;
      requiredStudyMinutes: number;
      completedStudyMinutes?: number;
    }[];
    dailyObjectives: {
      title: string;
      description: string;
      type: string;
      estimatedMinutes: number;
    }[];
  }>({ prompt, responseSchema, temperature: 0.6 }, provider);

  // Hydrate with IDs, deadlines, and full type compliance
  const daysPerLevel = Math.floor(totalDays / raw.levels.length);
  const skipLevels = Math.floor(assessmentScore * raw.levels.length * 0.3);

  const levels: StudyLevel[] = raw.levels.map((level, i) => {
    const sectionId = sections[i]?.id || uid();

    const topics: LevelTopic[] = level.topics.map((t) => ({
      id: uid(),
      title: t.title,
      arguments: t.arguments,
      sourceRefs: [
        {
          sourceId: 'source_1',
          sectionId,
          label: sections[i]?.pageRange
            ? `Pages ${sections[i].pageRange![0]}-${sections[i].pageRange![1]}`
            : sections[i]?.title || level.title,
        },
      ],
      completed: i < skipLevels || t.completed,
    }));

    return {
      id: `level_${level.levelNumber}`,
      subjectId: 'subject_1',
      levelNumber: level.levelNumber,
      title: level.title,
      topics,
      deadline: daysFromNow(daysPerLevel * (i + 1)),
      status: i < skipLevels
        ? 'completed'
        : i === skipLevels
          ? 'active'
          : 'locked',
      completedAt: i < skipLevels ? now.toISOString() : undefined,
      quizAttempts: 0,
      requiredStudyMinutes: level.requiredStudyMinutes || 120,
      completedStudyMinutes: i < skipLevels ? level.requiredStudyMinutes : 0,
    } as StudyLevel;
  });

  const activeLevel = levels.find((l) => l.status === 'active');
  const firstTopic = activeLevel?.topics[0];
  const dailyObjectives: DailyObjective[] = raw.dailyObjectives.map((obj) => ({
    id: uid(),
    title: obj.title,
    description: obj.description,
    sourceRefs: firstTopic?.sourceRefs || [],
    type: (obj.type as 'study' | 'review' | 'quiz') || 'study',
    completed: false,
    estimatedMinutes: obj.estimatedMinutes || 30,
    levelId: activeLevel?.id,
    topicId: firstTopic?.id,
  }));

  return { levels, dailyObjectives };
}

/**
 * Generate quiz questions for a specific level.
 */
export async function geminiGenerateLevelQuiz(
  levelId: string,
  levelTitle: string,
  topics: LevelTopic[],
  count: number = 8,
  provider: AIProvider = 'gemini',
  flaggedObjectives?: DailyObjective[],
  sources?: Source[]
): Promise<{ questions: QuizQuestion[] }> {
  const topicList = topics
    .map(
      (t, i) =>
        `${i + 1}. "${t.title}" — Key arguments: ${t.arguments.join(', ')}`
    )
    .join('\n');

  const objectivesText = flaggedObjectives && flaggedObjectives.length > 0
    ? `\nFocus the questions heavily on these completed daily objectives:\n` + flaggedObjectives.map(o => `- ${o.title}: ${o.description}`).join('\n')
    : '';

  const sourcesText = sources && sources.length > 0
    ? `\nBase the questions on the loaded sources provided:\n` + sources.map(s => `Source: "${s.title}"\nContent Preview: ${s.content?.slice(0, 500) || s.rawText?.slice(0, 500) || 'No content preview available'}`).join('\n\n')
    : '';

  const prompt = `You are a quiz generator for a study app. Create ${count} multiple-choice questions for the level "${levelTitle}".

Topics in this level:
${topicList}
${objectivesText}
${sourcesText}

Requirements:
- Each question must have exactly 4 options
- The correctIndex is 0-based (0, 1, 2, or 3)
- Questions should test understanding, not just memorization
- Include clear explanations for correct answers
- Make questions specific to the topics listed above
- Distribute questions across all topics

Return JSON:
{
  "questions": [
    {
      "id": "unique_id",
      "text": "Question text?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 0,
      "explanation": "Why this answer is correct.",
      "topicId": "topic_id"
    }
  ]
}`;

  const responseSchema = {
    type: SchemaType.OBJECT,
    properties: {
      questions: {
        type: SchemaType.ARRAY,
        items: {
          type: SchemaType.OBJECT,
          properties: {
            id: { type: SchemaType.STRING },
            text: { type: SchemaType.STRING },
            options: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
            correctIndex: { type: SchemaType.INTEGER },
            explanation: { type: SchemaType.STRING },
            topicId: { type: SchemaType.STRING },
          },
          required: ['id', 'text', 'options', 'correctIndex', 'explanation'],
        },
      },
    },
    required: ['questions'],
  };

  const result = await callAI<{ questions: QuizQuestion[] }>({
    prompt,
    responseSchema,
    temperature: 0.8,
  }, provider);

  result.questions = result.questions.map((q, i) => {
    const topic = topics[i % topics.length];
    return {
      ...q,
      id: q.id || uid(),
      topicId: topic?.id || q.topicId,
      sourceRef: topic?.sourceRefs[0],
    };
  });

  return result;
}

/**
 * Generate a daily challenge quiz based ONLY on completed objectives and loaded sources.
 */
export async function geminiGenerateDailyChallengeQuiz(
  flaggedObjectives: DailyObjective[],
  sources: Source[],
  count: number = 8,
  provider: AIProvider = 'gemini'
): Promise<{ questions: QuizQuestion[] }> {
  const objectivesText = flaggedObjectives.length > 0
    ? `\nFocus the questions heavily on these completed daily objectives:\n` + flaggedObjectives.map(o => `- ${o.title}: ${o.description}`).join('\n')
    : '';

  const sourcesText = sources.length > 0
    ? `\nBase the questions on the loaded sources provided:\n` + sources.map(s => `Source: "${s.title}"\nContent Preview: ${s.content?.slice(0, 500) || s.rawText?.slice(0, 500) || 'No content preview available'}`).join('\n\n')
    : '';

  const prompt = `You are a quiz generator for a study app. Create ${count} multiple-choice questions for a daily challenge.

${objectivesText}
${sourcesText}

Requirements:
- Each question must have exactly 4 options
- The correctIndex is 0-based (0, 1, 2, or 3)
- Questions should test understanding, not just memorization
- Include clear explanations for correct answers
- Make questions specific to the daily objectives and sources provided

Return JSON:
{
  "questions": [
    {
      "id": "unique_id",
      "text": "Question text?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 0,
      "explanation": "Why this answer is correct."
    }
  ]
}`;

  const responseSchema = {
    type: SchemaType.OBJECT,
    properties: {
      questions: {
        type: SchemaType.ARRAY,
        items: {
          type: SchemaType.OBJECT,
          properties: {
            id: { type: SchemaType.STRING },
            text: { type: SchemaType.STRING },
            options: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
            correctIndex: { type: SchemaType.INTEGER },
            explanation: { type: SchemaType.STRING },
          },
          required: ['id', 'text', 'options', 'correctIndex', 'explanation'],
        },
      },
    },
    required: ['questions'],
  };

  const result = await callAI<{ questions: QuizQuestion[] }>({
    prompt,
    responseSchema,
    temperature: 0.8,
  }, provider);

  result.questions = result.questions.map((q) => {
    return {
      ...q,
      id: q.id || uid(),
    };
  });

  return result;
}

/**
 * Generate quick recall questions for spaced repetition sessions.
 */
export async function geminiGenerateSpacedRepQuestions(
  topics: LevelTopic[],
  count: number = 5,
  provider: AIProvider = 'gemini'
): Promise<{ questions: QuizQuestion[] }> {
  const topicList = topics
    .slice(0, 10)
    .map((t, i) => `${i + 1}. "${t.title}" — ${t.arguments.join(', ')}`)
    .join('\n');

  const prompt = `Create ${count} quick recall multiple-choice questions for spaced repetition review.

Previously studied topics:
${topicList}

Requirements:
- Questions should test RECALL of key concepts (not deep analysis)
- Keep questions short and direct
- Each question must have exactly 4 options
- The correctIndex is 0-based (0, 1, 2, or 3)
- Include a brief explanation for the correct answer
- Questions should help reinforce long-term memory

Return JSON:
{
  "questions": [
    {
      "id": "unique_id",
      "text": "Quick recall: ...",
      "options": ["A", "B", "C", "D"],
      "correctIndex": 0,
      "explanation": "Brief explanation.",
      "topicId": "topic_id"
    }
  ]
}`;

  const responseSchema = {
    type: SchemaType.OBJECT,
    properties: {
      questions: {
        type: SchemaType.ARRAY,
        items: {
          type: SchemaType.OBJECT,
          properties: {
            id: { type: SchemaType.STRING },
            text: { type: SchemaType.STRING },
            options: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
            correctIndex: { type: SchemaType.INTEGER },
            explanation: { type: SchemaType.STRING },
            topicId: { type: SchemaType.STRING },
          },
          required: ['id', 'text', 'options', 'correctIndex', 'explanation'],
        },
      },
    },
    required: ['questions'],
  };

  const result = await callAI<{ questions: QuizQuestion[] }>({
    prompt,
    responseSchema,
    temperature: 0.9,
  }, provider);

  result.questions = result.questions.map((q, i) => {
    const topic = topics[i % topics.length];
    return {
      ...q,
      id: q.id || uid(),
      topicId: topic?.id || q.topicId,
      sourceRef: topic?.sourceRefs[0],
    };
  });

  return result;
}
