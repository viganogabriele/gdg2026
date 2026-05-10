// ============================================================
// StudyQuest — Core Type Definitions
// ============================================================

export interface Subject {
  id: string;
  title: string;
  sources: Source[];
  deadline: string; // ISO date
  hoursPerWeek: number;
  createdAt: string;
  currentLevel: number;
  totalLevels: number;
}

export interface Source {
  id: string;
  type: 'pdf' | 'url' | 'notes';
  title: string;
  content?: string;
  uri?: string;
  rawText?: string;
  sections: SourceSection[];
}

export interface SourceSection {
  id: string;
  title: string;
  pageRange?: [number, number];
  summary?: string;
}

export interface StudyLevel {
  id: string;
  subjectId: string;
  levelNumber: number;
  title: string;
  topics: LevelTopic[];
  deadline: string;
  status: 'locked' | 'active' | 'completed' | 'failed';
  completedAt?: string;
  quizAttempts: number;
  lastQuizScore?: number;
  requiredStudyMinutes: number;
  completedStudyMinutes: number;
}

export interface LevelTopic {
  id: string;
  title: string;
  arguments: string[];
  sourceRefs: SourceRef[];
  completed: boolean;
}

export interface SourceRef {
  sourceId: string;
  sectionId: string;
  label: string;
}

export interface Quiz {
  id: string;
  type: 'assessment' | 'level' | 'spaced_repetition';
  subjectId: string;
  levelId?: string;
  questions: QuizQuestion[];
  score?: number;
  completedAt?: string;
  passThreshold: number;
}

export interface QuizQuestion {
  id: string;
  text: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  sourceRef?: SourceRef;
  topicId?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  userAnswer?: number;
}

export interface UserStats {
  totalPoints: number;
  totalStudyMinutes: number;
  levelsCompleted: number;
  currentStreak: number;
  longestStreak: number;
  lastStudyDate: string;
  badges: Badge[];
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  earnedAt: string;
}

export interface SpacedRepetitionCard {
  id: string;
  questionId: string;
  subjectId: string;
  topicId: string;
  box: number;              // Leitner box 1–5 (derived from intervalDays for display)
  nextReviewDate: string;
  lastReviewDate?: string;
  consecutiveCorrect: number;
  // SM-2+ fields
  intervalDays: number;     // current interval in days
  easeFactor: number;       // multiplier for interval growth (default 2.5, min 1.3)
  consecutiveFails: number; // resets to 0 on any correct answer
  needsReinforcement: boolean; // true when consecutiveFails >= 3 → show in every session
  totalReviews: number;     // total number of reviews ever
}

export interface DailyObjective {
  id: string;
  title: string;
  description: string;
  sourceRefs: SourceRef[];
  type: 'study' | 'review' | 'quiz';
  completed: boolean;
  estimatedMinutes: number;
  levelId?: string;
  topicId?: string;
}

export interface StudySession {
  id: string;
  subjectId: string;
  levelId: string;
  startedAt: string;
  endedAt?: string;
  durationMinutes: number;
  type: 'pomodoro' | 'free';
}

export interface NotificationPreferences {
  dailyReminder: boolean;
  dailyReminderTime: string; // HH:mm
  deadlineWarnings: boolean;
  streakWarnings: boolean;
  challengeNotifications: boolean;
  tiltToFocusEnabled: boolean;
}

// ─── Multi-Roadmap Container ────────────────────────────────────────
export interface Roadmap {
  id: string;
  subject: Subject;
  stats: UserStats;
  levels: StudyLevel[];
  dailyObjectives: DailyObjective[];
  spacedRepCards: SpacedRepetitionCard[];
  quizzes: Quiz[];
  sessions: StudySession[];
  currentDayIndex: number;
  dayAdvanceReady: boolean;
  onboardingData: {
    subjectTitle: string;
    sources: Source[];
    deadline: string;
    hoursPerWeek: number;
    sections: SourceSection[];
    assessmentScore: number;
  };
}

// API request/response types
export interface AnalyzeSourcesResponse {
  sections: SourceSection[];
  topicGraph: {
    topics: string[];
    dependencies: string[][];
  };
}

export interface GenerateAssessmentResponse {
  questions: QuizQuestion[];
}

export interface GenerateRoadmapResponse {
  levels: StudyLevel[];
  dailyObjectives: DailyObjective[];
}

export interface GenerateQuizResponse {
  questions: QuizQuestion[];
}

export interface GradeQuizResponse {
  score: number;
  feedback: string;
  topicScores: { topicId: string; score: number }[];
}

export interface AdjustRoadmapResponse {
  updatedLevels: StudyLevel[];
  message: string;
}
