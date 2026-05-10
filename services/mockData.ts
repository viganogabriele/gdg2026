/**
 * Mock data generator — realistic AI responses for all endpoints
 */
import type { BraynrStudyProfile } from '@/services/braynrParser';
import { minutesForPages } from '@/services/braynrParser';
import type {
  QuizQuestion,
  StudyLevel,
  DailyObjective,
  SourceSection,
  LevelTopic,
  SourceRef,
} from '@/types';

function uid(): string {
  return Math.random().toString(36).substring(2, 11);
}

function daysFromNow(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

// ─── Source Analysis Mock ───────────────────────────────────────────
export function mockAnalyzeSources(subjectTitle: string): {
  sections: SourceSection[];
  topicGraph: { topics: string[]; dependencies: string[][] };
} {
  const topicSets: Record<string, string[]> = {
    default: [
      'Introduction & Fundamentals',
      'Core Concepts',
      'Intermediate Theory',
      'Applied Methods',
      'Advanced Topics',
      'Case Studies & Applications',
      'Review & Synthesis',
    ],
  };

  const lower = subjectTitle.toLowerCase();
  let topics = topicSets.default;

  if (lower.includes('calculus') || lower.includes('math')) {
    topics = [
      'Limits & Continuity',
      'Derivatives',
      'Applications of Derivatives',
      'Integration',
      'Applications of Integration',
      'Series & Sequences',
      'Multivariable Calculus',
    ];
  } else if (lower.includes('physics')) {
    topics = [
      'Kinematics',
      'Newton\'s Laws',
      'Energy & Work',
      'Momentum & Collisions',
      'Rotational Motion',
      'Waves & Oscillations',
      'Thermodynamics',
    ];
  } else if (lower.includes('computer') || lower.includes('programming') || lower.includes('cs')) {
    topics = [
      'Data Types & Variables',
      'Control Flow',
      'Functions & Scope',
      'Data Structures',
      'Algorithms',
      'Object-Oriented Programming',
      'Software Design Patterns',
    ];
  } else if (lower.includes('biology') || lower.includes('bio')) {
    topics = [
      'Cell Biology',
      'Genetics & DNA',
      'Evolution',
      'Ecology',
      'Human Anatomy',
      'Physiology',
      'Molecular Biology',
    ];
  } else if (lower.includes('chemistry') || lower.includes('chem')) {
    topics = [
      'Atomic Structure',
      'Chemical Bonding',
      'Stoichiometry',
      'Thermochemistry',
      'Chemical Equilibrium',
      'Acids & Bases',
      'Organic Chemistry',
    ];
  } else if (lower.includes('history')) {
    topics = [
      'Ancient Civilizations',
      'Medieval Period',
      'Renaissance & Reformation',
      'Age of Exploration',
      'Industrial Revolution',
      'World Wars',
      'Modern History',
    ];
  }

  const sections: SourceSection[] = topics.map((title, i) => ({
    id: uid(),
    title,
    pageRange: [(i * 30) + 1, (i + 1) * 30] as [number, number],
    summary: `Covers the fundamentals of ${title.toLowerCase()} including key concepts, formulas, and applications.`,
  }));

  const dependencies: string[][] = topics.slice(1).map((_, i) => [topics[i], topics[i + 1]]);

  return { sections, topicGraph: { topics, dependencies } };
}

// ─── Assessment Questions Mock ──────────────────────────────────────
export function mockGenerateAssessment(
  subjectTitle: string,
  sections: SourceSection[],
  count: number = 6
): QuizQuestion[] {
  const questions: QuizQuestion[] = [];

  const questionTemplates = [
    {
      text: 'Which of the following best describes the fundamental principle of {topic}?',
      options: [
        'A systematic approach to analyzing complex systems',
        'A method for breaking down problems into smaller components',
        'A framework for understanding relationships between variables',
        'A technique for measuring and quantifying observations',
      ],
      correct: 2,
      explanation: 'This concept is central to understanding {topic} as it provides the foundational framework.',
    },
    {
      text: 'What is the primary goal when studying {topic}?',
      options: [
        'To memorize all relevant formulas and definitions',
        'To understand the underlying principles and their applications',
        'To compare different historical approaches',
        'To develop new theoretical frameworks',
      ],
      correct: 1,
      explanation: 'Understanding principles and applications is key to mastering {topic}.',
    },
    {
      text: 'In the context of {topic}, which approach is most effective for problem-solving?',
      options: [
        'Trial and error',
        'Systematic analysis and decomposition',
        'Relying on memorized solutions',
        'Consulting external references only',
      ],
      correct: 1,
      explanation: 'Systematic analysis is the most reliable approach in {topic}.',
    },
    {
      text: 'Which concept is a prerequisite for understanding {topic}?',
      options: [
        'Basic mathematical reasoning',
        'Advanced specialized knowledge',
        'Previous topic mastery',
        'Foundational principles from earlier sections',
      ],
      correct: 3,
      explanation: 'Building on foundational principles is essential before tackling {topic}.',
    },
  ];

  for (let i = 0; i < count; i++) {
    const section = sections[i % sections.length];
    const template = questionTemplates[i % questionTemplates.length];

    questions.push({
      id: uid(),
      text: template.text.replace(/{topic}/g, section.title),
      options: [...template.options],
      correctIndex: template.correct,
      explanation: template.explanation.replace(/{topic}/g, section.title),
      sourceRef: {
        sourceId: 'source_1',
        sectionId: section.id,
        label: section.title,
      },
      topicId: section.id,
    });
  }

  return questions;
}

// ─── Roadmap Generation Mock ────────────────────────────────────────
export function mockGenerateRoadmap(
  subjectTitle: string,
  sections: SourceSection[],
  deadline: string,
  assessmentScore: number,
  studyProfile?: BraynrStudyProfile | null
): { levels: StudyLevel[]; dailyObjectives: DailyObjective[] } {
  const deadlineDate = new Date(deadline);
  const now = new Date();
  const totalDays = Math.max(
    Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
    7
  );
  const daysPerLevel = Math.floor(totalDays / sections.length);

  // If assessment score is high, skip early levels (mark as completed)
  const skipLevels = Math.floor(assessmentScore * sections.length * 0.3);

  const levels: StudyLevel[] = sections.map((section, i) => {
    const levelTopics: LevelTopic[] = [
      {
        id: uid(),
        title: `${section.title} — Core Concepts`,
        arguments: [
          'Key definitions and terminology',
          'Fundamental principles',
          'Basic problem-solving techniques',
        ],
        sourceRefs: [
          {
            sourceId: 'source_1',
            sectionId: section.id,
            label: section.pageRange
              ? `Pages ${section.pageRange[0]}-${section.pageRange[1]}`
              : section.title,
          },
        ],
        completed: i < skipLevels,
      },
      {
        id: uid(),
        title: `${section.title} — Applications`,
        arguments: [
          'Real-world applications',
          'Practice problems',
          'Integration with previous topics',
        ],
        sourceRefs: [
          {
            sourceId: 'source_1',
            sectionId: section.id,
            label: section.pageRange
              ? `Pages ${section.pageRange[0]}-${section.pageRange[1]}`
              : section.title,
          },
        ],
        completed: i < skipLevels,
      },
    ];

    return {
      id: `level_${i + 1}`,
      subjectId: 'subject_1',
      levelNumber: i + 1,
      title: section.title,
      topics: levelTopics,
      deadline: daysFromNow(daysPerLevel * (i + 1)),
      status: i < skipLevels ? 'completed' : i === skipLevels ? 'active' : 'locked',
      completedAt: i < skipLevels ? now.toISOString() : undefined,
      quizAttempts: 0,
      requiredStudyMinutes: studyProfile
        ? minutesForPages(section.pageRange ? section.pageRange[1] - section.pageRange[0] + 1 : 30, studyProfile)
        : 120 + Math.floor(Math.random() * 60),
      completedStudyMinutes: i < skipLevels ? 120 : 0,
    } as StudyLevel;
  });

  const activeLevel = levels.find((l) => l.status === 'active');
  const dailyObjectives: DailyObjective[] = [];

  if (activeLevel) {
    dailyObjectives.push(
      {
        id: uid(),
        title: `Study: ${activeLevel.title}`,
        description: `Review core concepts of ${activeLevel.title}. Focus on understanding the fundamental principles.`,
        sourceRefs: activeLevel.topics[0]?.sourceRefs || [],
        type: 'study',
        completed: false,
        estimatedMinutes: 45,
        levelId: activeLevel.id,
      },
      {
        id: uid(),
        title: `Practice: ${activeLevel.title}`,
        description: `Work through practice problems related to ${activeLevel.title}.`,
        sourceRefs: activeLevel.topics[1]?.sourceRefs || [],
        type: 'study',
        completed: false,
        estimatedMinutes: 30,
        levelId: activeLevel.id,
      },
      {
        id: uid(),
        title: 'Spaced Review',
        description: 'Quick review of previously studied topics to reinforce memory.',
        sourceRefs: [],
        type: 'review',
        completed: false,
        estimatedMinutes: 10,
      }
    );
  }

  return { levels, dailyObjectives };
}

// ─── Level Quiz Mock ────────────────────────────────────────────────
export function mockGenerateLevelQuiz(
  levelTitle: string,
  topics: LevelTopic[],
  count: number = 8
): QuizQuestion[] {
  const questions: QuizQuestion[] = [];

  for (let i = 0; i < count; i++) {
    const topic = topics[i % topics.length];
    questions.push({
      id: uid(),
      text: `Regarding ${topic.title}: which statement is most accurate?`,
      options: [
        `The core principle directly builds on prerequisite knowledge`,
        `This concept is independent of all other topics`,
        `Understanding requires memorization only`,
        `Applications are limited to theoretical scenarios`,
      ],
      correctIndex: 0,
      explanation: `${topic.title} builds on foundational concepts and connects to practical applications.`,
      topicId: topic.id,
      sourceRef: topic.sourceRefs[0],
    });
  }

  return questions;
}

// ─── Spaced Repetition Questions Mock ───────────────────────────────
export function mockGenerateSpacedRepQuestions(
  topics: LevelTopic[],
  count: number = 5
): QuizQuestion[] {
  return topics.slice(0, count).map((topic) => ({
    id: uid(),
    text: `Quick recall: What is the key concept in "${topic.title}"?`,
    options: [
      'Systematic analysis of components',
      'Integration of theoretical principles',
      'Application of foundational methods',
      'Synthesis of multiple approaches',
    ],
    correctIndex: Math.floor(Math.random() * 4),
    explanation: `This reinforces your understanding of ${topic.title}.`,
    topicId: topic.id,
    sourceRef: topic.sourceRefs[0],
  }));
}
