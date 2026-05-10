/**
 * Zustand Store — Central state management with AsyncStorage persistence
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  Subject,
  Source,
  StudyLevel,
  Quiz,
  QuizQuestion,
  UserStats,
  DailyObjective,
  SpacedRepetitionCard,
  StudySession,
  NotificationPreferences,
  SourceSection,
  Badge,
} from '@/types';
import { Points, BadgeDefinitions } from '@/constants/gamification';

// ─── Store State ────────────────────────────────────────────────────

interface StudyState {
  // Onboarding
  onboardingComplete: boolean;
  onboardingData: {
    subjectTitle: string;
    sources: Source[];
    deadline: string;
    hoursPerWeek: number;
    sections: SourceSection[];
    assessmentScore: number;
  };

  // Core Data
  subjects: Subject[];
  levels: StudyLevel[];
  dailyObjectives: DailyObjective[];
  quizzes: Quiz[];
  sessions: StudySession[];
  spacedRepCards: SpacedRepetitionCard[];

  // User
  stats: UserStats;
  notificationPrefs: NotificationPreferences;

  // Active State
  activeSubjectId: string | null;
  activeQuiz: Quiz | null;
  sessionFocusTime: number; // Time in seconds spent in focus mode this app session

  // Actions — Onboarding
  setOnboardingSubject: (title: string) => void;
  setOnboardingSources: (sources: Source[]) => void;
  setOnboardingDeadline: (deadline: string, hoursPerWeek: number) => void;
  setOnboardingSections: (sections: SourceSection[]) => void;
  setAssessmentScore: (score: number) => void;
  completeOnboarding: (subject: Subject, levels: StudyLevel[], objectives: DailyObjective[]) => void;

  // Actions — Subjects
  setActiveSubject: (id: string) => void;

  // Actions — Levels
  setLevels: (levels: StudyLevel[]) => void;
  updateLevel: (levelId: string, updates: Partial<StudyLevel>) => void;
  completeLevel: (levelId: string) => void;
  failLevel: (levelId: string, score: number) => void;
  unlockNextLevel: (currentLevelId: string) => void;

  // Actions — Objectives
  setDailyObjectives: (objectives: DailyObjective[]) => void;
  completeObjective: (objectiveId: string) => void;

  // Actions — Quizzes
  startQuiz: (quiz: Quiz) => void;
  answerQuestion: (questionId: string, answerIndex: number) => void;
  completeQuiz: () => void;

  // Actions — Sessions
  startSession: (session: StudySession) => void;
  endSession: (sessionId: string) => void;
  incrementSessionFocusTime: () => void;

  // Actions — Spaced Repetition
  addSpacedRepCards: (cards: SpacedRepetitionCard[]) => void;
  updateSpacedRepCard: (card: SpacedRepetitionCard) => void;

  // Actions — Stats & Gamification
  addPoints: (points: number) => void;
  updateStreak: () => void;
  addBadge: (badge: Badge) => void;
  checkBadgeEligibility: () => void;

  // Actions — Settings
  updateNotificationPrefs: (prefs: Partial<NotificationPreferences>) => void;

  // Actions — Reset
  resetStore: () => void;
}

// ─── Initial State ──────────────────────────────────────────────────

const initialStats: UserStats = {
  totalPoints: 0,
  totalStudyMinutes: 0,
  levelsCompleted: 0,
  currentStreak: 0,
  longestStreak: 0,
  lastStudyDate: '',
  badges: [],
};

const initialNotificationPrefs: NotificationPreferences = {
  dailyReminder: true,
  dailyReminderTime: '09:00',
  deadlineWarnings: true,
  streakWarnings: true,
  challengeNotifications: true,
};

// ─── Store Definition ───────────────────────────────────────────────

export const useStudyStore = create<StudyState>()(
  persist(
    (set, get) => ({
      // State
      onboardingComplete: false,
      onboardingData: {
        subjectTitle: '',
        sources: [],
        deadline: '',
        hoursPerWeek: 10,
        sections: [],
        assessmentScore: 0,
      },
      subjects: [],
      levels: [],
      dailyObjectives: [],
      quizzes: [],
      sessions: [],
      spacedRepCards: [],
      stats: { ...initialStats },
      notificationPrefs: { ...initialNotificationPrefs },
      activeSubjectId: null,
      activeQuiz: null,
      sessionFocusTime: 0,

      // ─── Onboarding Actions ─────────────────────────────────────
      setOnboardingSubject: (title) =>
        set((state) => ({
          onboardingData: { ...state.onboardingData, subjectTitle: title },
        })),

      setOnboardingSources: (sources) =>
        set((state) => ({
          onboardingData: { ...state.onboardingData, sources },
        })),

      setOnboardingDeadline: (deadline, hoursPerWeek) =>
        set((state) => ({
          onboardingData: { ...state.onboardingData, deadline, hoursPerWeek },
        })),

      setOnboardingSections: (sections) =>
        set((state) => ({
          onboardingData: { ...state.onboardingData, sections },
        })),

      setAssessmentScore: (score) =>
        set((state) => ({
          onboardingData: { ...state.onboardingData, assessmentScore: score },
        })),

      completeOnboarding: (subject, levels, objectives) =>
        set({
          onboardingComplete: true,
          subjects: [subject],
          levels,
          dailyObjectives: objectives,
          activeSubjectId: subject.id,
        }),

      // ─── Subject Actions ────────────────────────────────────────
      setActiveSubject: (id) => set({ activeSubjectId: id }),

      // ─── Level Actions ──────────────────────────────────────────
      setLevels: (levels) => set({ levels }),

      updateLevel: (levelId, updates) =>
        set((state) => ({
          levels: state.levels.map((l) =>
            l.id === levelId ? { ...l, ...updates } : l
          ),
        })),

      completeLevel: (levelId) => {
        const state = get();
        const level = state.levels.find((l) => l.id === levelId);
        if (!level) return;

        set((s) => ({
          levels: s.levels.map((l) =>
            l.id === levelId
              ? { ...l, status: 'completed' as const, completedAt: new Date().toISOString() }
              : l
          ),
          stats: {
            ...s.stats,
            totalPoints: s.stats.totalPoints + Points.LEVEL_PASSED,
            levelsCompleted: s.stats.levelsCompleted + 1,
          },
        }));

        // Unlock next level
        get().unlockNextLevel(levelId);
        get().checkBadgeEligibility();
      },

      failLevel: (levelId, score) =>
        set((state) => ({
          levels: state.levels.map((l) =>
            l.id === levelId
              ? {
                  ...l,
                  status: 'failed' as const,
                  quizAttempts: l.quizAttempts + 1,
                  lastQuizScore: score,
                }
              : l
          ),
        })),

      unlockNextLevel: (currentLevelId) => {
        const state = get();
        const currentLevel = state.levels.find((l) => l.id === currentLevelId);
        if (!currentLevel) return;

        const nextLevel = state.levels.find(
          (l) => l.levelNumber === currentLevel.levelNumber + 1
        );
        if (nextLevel && nextLevel.status === 'locked') {
          set((s) => ({
            levels: s.levels.map((l) =>
              l.id === nextLevel.id ? { ...l, status: 'active' as const } : l
            ),
          }));
        }
      },

      // ─── Objective Actions ──────────────────────────────────────
      setDailyObjectives: (objectives) => set({ dailyObjectives: objectives }),

      completeObjective: (objectiveId) => {
        const objective = get().dailyObjectives.find((o) => o.id === objectiveId);
        if (!objective) return;
        const completing = !objective.completed;
        const minutes = objective.estimatedMinutes;
        const activeLevelId =
          objective.levelId ?? get().levels.find((l) => l.status === 'active')?.id;

        set((state) => ({
          dailyObjectives: state.dailyObjectives.map((o) =>
            o.id === objectiveId ? { ...o, completed: completing } : o
          ),
          stats: {
            ...state.stats,
            totalPoints:
              state.stats.totalPoints +
              (completing ? Points.STUDY_SESSION_COMPLETE : -Points.STUDY_SESSION_COMPLETE),
          },
          levels: state.levels.map((l) =>
            l.id === activeLevelId
              ? {
                  ...l,
                  completedStudyMinutes: Math.max(
                    0,
                    l.completedStudyMinutes + (completing ? minutes : -minutes)
                  ),
                }
              : l
          ),
        }));
        if (completing) get().updateStreak();
      },

      // ─── Quiz Actions ──────────────────────────────────────────
      startQuiz: (quiz) => set({ activeQuiz: quiz }),

      answerQuestion: (questionId, answerIndex) =>
        set((state) => {
          if (!state.activeQuiz) return {};
          return {
            activeQuiz: {
              ...state.activeQuiz,
              questions: state.activeQuiz.questions.map((q) =>
                q.id === questionId ? { ...q, userAnswer: answerIndex } : q
              ),
            },
          };
        }),

      completeQuiz: () => {
        const state = get();
        if (!state.activeQuiz) return;

        const quiz = state.activeQuiz;
        const totalQuestions = quiz.questions.length;
        const correct = quiz.questions.filter(
          (q) => q.userAnswer === q.correctIndex
        ).length;
        const score = correct / totalQuestions;

        const completedQuiz: Quiz = {
          ...quiz,
          score,
          completedAt: new Date().toISOString(),
        };

        set((s) => ({
          quizzes: [...s.quizzes, completedQuiz],
          activeQuiz: null,
        }));
      },

      // ─── Session Actions ────────────────────────────────────────
      startSession: (session) =>
        set((state) => ({
          sessions: [...state.sessions, session],
        })),

      endSession: (sessionId) => {
        const state = get();
        const session = state.sessions.find((s) => s.id === sessionId);
        if (!session) return;

        const endedAt = new Date().toISOString();
        const duration = Math.round(
          (new Date(endedAt).getTime() - new Date(session.startedAt).getTime()) /
            60000
        );

        set((s) => ({
          sessions: s.sessions.map((sess) =>
            sess.id === sessionId
              ? { ...sess, endedAt, durationMinutes: duration }
              : sess
          ),
          stats: {
            ...s.stats,
            totalStudyMinutes: s.stats.totalStudyMinutes + duration,
            totalPoints: s.stats.totalPoints + Points.STUDY_SESSION_COMPLETE,
          },
          levels: s.levels.map((l) =>
            l.id === session.levelId
              ? { ...l, completedStudyMinutes: l.completedStudyMinutes + duration }
              : l
          ),
        }));

        get().updateStreak();
        get().checkBadgeEligibility();
      },

      incrementSessionFocusTime: () => set((state) => ({ sessionFocusTime: state.sessionFocusTime + 1 })),

      // ─── Spaced Repetition Actions ──────────────────────────────
      addSpacedRepCards: (cards) =>
        set((state) => ({
          spacedRepCards: [...state.spacedRepCards, ...cards],
        })),

      updateSpacedRepCard: (updatedCard) =>
        set((state) => ({
          spacedRepCards: state.spacedRepCards.map((c) =>
            c.id === updatedCard.id ? updatedCard : c
          ),
        })),

      // ─── Stats & Gamification Actions ───────────────────────────
      addPoints: (points) =>
        set((state) => ({
          stats: {
            ...state.stats,
            totalPoints: state.stats.totalPoints + points,
          },
        })),

      updateStreak: () => {
        const state = get();

        const toDay = (d: Date) => d.toISOString().slice(0, 10); // "YYYY-MM-DD"
        const today = toDay(new Date());
        const lastDay = state.stats.lastStudyDate
          ? toDay(new Date(state.stats.lastStudyDate))
          : '';

        if (lastDay === today) return; // already updated today, nothing to do

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const isConsecutive = lastDay === toDay(yesterday);

        const newStreak = isConsecutive ? state.stats.currentStreak + 1 : 1;

        set((s) => ({
          stats: {
            ...s.stats,
            currentStreak: newStreak,
            longestStreak: Math.max(newStreak, s.stats.longestStreak),
            lastStudyDate: new Date().toISOString(),
            totalPoints: s.stats.totalPoints + Points.STREAK_DAY,
          },
        }));
      },

      addBadge: (badge) =>
        set((state) => ({
          stats: {
            ...state.stats,
            badges: [...state.stats.badges, badge],
          },
        })),

      checkBadgeEligibility: () => {
        const state = get();
        const earnedIds = new Set(state.stats.badges.map((b) => b.id));

        const newBadges: Badge[] = [];

        BadgeDefinitions.forEach((def) => {
          if (earnedIds.has(def.id)) return;

          let earned = false;
          switch (def.condition) {
            case 'complete_first_session':
              earned = state.sessions.length > 0;
              break;
            case 'streak_3':
              earned = state.stats.currentStreak >= 3;
              break;
            case 'streak_7':
              earned = state.stats.currentStreak >= 7;
              break;
            case 'streak_30':
              earned = state.stats.currentStreak >= 30;
              break;
            case 'perfect_quiz':
              earned = state.quizzes.some((q) => q.score === 1);
              break;
            case 'early_completion':
              earned = state.levels.some(
                (l) =>
                  l.status === 'completed' &&
                  l.completedAt &&
                  new Date(l.completedAt) < new Date(l.deadline)
              );
              break;
            case 'levels_completed_5':
              earned = state.stats.levelsCompleted >= 5;
              break;
            case 'levels_completed_10':
              earned = state.stats.levelsCompleted >= 10;
              break;
            case 'points_500':
              earned = state.stats.totalPoints >= 500;
              break;
            case 'points_1000':
              earned = state.stats.totalPoints >= 1000;
              break;
          }

          if (earned) {
            newBadges.push({
              id: def.id,
              title: def.title,
              description: def.description,
              icon: def.icon,
              earnedAt: new Date().toISOString(),
            });
          }
        });

        if (newBadges.length > 0) {
          set((s) => ({
            stats: {
              ...s.stats,
              badges: [...s.stats.badges, ...newBadges],
            },
          }));
        }
      },

      // ─── Settings Actions ───────────────────────────────────────
      updateNotificationPrefs: (prefs) =>
        set((state) => ({
          notificationPrefs: { ...state.notificationPrefs, ...prefs },
        })),

      // ─── Reset ──────────────────────────────────────────────────
      resetStore: () =>
        set({
          onboardingComplete: false,
          onboardingData: {
            subjectTitle: '',
            sources: [],
            deadline: '',
            hoursPerWeek: 10,
            sections: [],
            assessmentScore: 0,
          },
          subjects: [],
          levels: [],
          dailyObjectives: [],
          quizzes: [],
          sessions: [],
          spacedRepCards: [],
          stats: { ...initialStats },
          notificationPrefs: { ...initialNotificationPrefs },
          activeSubjectId: null,
          activeQuiz: null,
          sessionFocusTime: 0,
        }),
    }),
    {
      name: 'studyquest-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        onboardingComplete: state.onboardingComplete,
        onboardingData: state.onboardingData,
        subjects: state.subjects,
        levels: state.levels,
        dailyObjectives: state.dailyObjectives,
        quizzes: state.quizzes,
        sessions: state.sessions,
        spacedRepCards: state.spacedRepCards,
        stats: state.stats,
        notificationPrefs: state.notificationPrefs,
        activeSubjectId: state.activeSubjectId,
      }),
    }
  )
);
