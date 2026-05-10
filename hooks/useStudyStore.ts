/**
 * Zustand Store — Central state management with AsyncStorage persistence
 * Supports multiple roadmaps with independent data per subject
 */
import { BadgeDefinitions, Points } from '@/constants/gamification';
import type {
  Badge,
  DailyObjective,
  NotificationPreferences,
  Quiz,
  Roadmap,
  Source,
  SourceSection,
  SpacedRepetitionCard,
  StudyLevel,
  StudySession,
  Subject,
  UserStats
} from '@/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
function uid(): string {
  return Math.random().toString(36).substring(2, 11);
}

// ─── Store State ────────────────────────────────────────────────────

interface StudyState {
  // Onboarding
  onboardingComplete: boolean;
  isAddingRoadmap: boolean; // true when adding a new roadmap (not initial onboarding)
  onboardingData: {
    subjectTitle: string;
    sources: Source[];
    deadline: string;
    hoursPerWeek: number;
    sections: SourceSection[];
    assessmentScore: number;
  };

  // Multi-Roadmap
  roadmaps: Roadmap[];
  activeRoadmapId: string | null;

  // Core Data — derived from active roadmap (kept for backward compat)
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
  currentDayIndex: number;
  dayAdvanceReady: boolean;
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
  advanceToDay: (dayIndex: number) => void;
  setDayAdvanceReady: (ready: boolean) => void;

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

  // Actions — Multi-Roadmap
  startNewRoadmapOnboarding: () => void;
  switchRoadmap: (roadmapId: string) => void;
  deleteRoadmap: (roadmapId: string) => void;
  cancelAddRoadmap: () => void;

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
  tiltToFocusEnabled: true,
};

const initialOnboardingData = {
  subjectTitle: '',
  sources: [],
  deadline: '',
  hoursPerWeek: 10,
  sections: [],
  assessmentScore: 0,
};

// ─── Helpers ────────────────────────────────────────────────────────

/** Save active roadmap's mutable fields back into the roadmaps array */
function syncActiveRoadmapToArray(state: StudyState): Roadmap[] {
  let currentRoadmaps = state.roadmaps;

  // Migration for legacy state: if there's no active roadmap but subjects exist, create one
  if (!state.activeRoadmapId && state.subjects.length > 0) {
    const legacyId = uid();
    const legacyRoadmap: Roadmap = {
      id: legacyId,
      subject: state.subjects[0],
      levels: state.levels,
      dailyObjectives: state.dailyObjectives,
      spacedRepCards: state.spacedRepCards,
      quizzes: state.quizzes,
      sessions: state.sessions,
      currentDayIndex: state.currentDayIndex,
      dayAdvanceReady: state.dayAdvanceReady,
      onboardingData: { ...state.onboardingData },
    };
    currentRoadmaps = [...currentRoadmaps, legacyRoadmap];
  }

  const targetId = state.activeRoadmapId || (state.subjects.length > 0 ? currentRoadmaps[currentRoadmaps.length - 1].id : null);

  if (!targetId) return currentRoadmaps;

  return currentRoadmaps.map((rm) =>
    rm.id === targetId
      ? {
          ...rm,
          levels: state.levels,
          dailyObjectives: state.dailyObjectives,
          spacedRepCards: state.spacedRepCards,
          quizzes: state.quizzes,
          sessions: state.sessions,
          currentDayIndex: state.currentDayIndex,
          dayAdvanceReady: state.dayAdvanceReady,
          subject: state.subjects.find((s) => s.id === rm.subject.id) || rm.subject,
        }
      : rm
  );
}

/** Load a roadmap's data into the top-level state fields */
function loadRoadmapState(rm: Roadmap) {
  return {
    subjects: [rm.subject],
    levels: rm.levels,
    dailyObjectives: rm.dailyObjectives,
    spacedRepCards: rm.spacedRepCards,
    quizzes: rm.quizzes,
    sessions: rm.sessions,
    currentDayIndex: rm.currentDayIndex,
    dayAdvanceReady: rm.dayAdvanceReady,
    activeSubjectId: rm.subject.id,
    activeRoadmapId: rm.id,
  };
}

// ─── Store Definition ───────────────────────────────────────────────

export const useStudyStore = create<StudyState>()(
  persist(
    (set, get) => ({
      // State
      onboardingComplete: false,
      isAddingRoadmap: false,
      onboardingData: { ...initialOnboardingData },
      roadmaps: [],
      activeRoadmapId: null,
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
      currentDayIndex: 0,
      dayAdvanceReady: false,
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

      completeOnboarding: (subject, levels, objectives) => {
        const state = get();
        const roadmapId = uid();

        const newRoadmap: Roadmap = {
          id: roadmapId,
          subject,
          levels,
          dailyObjectives: objectives,
          spacedRepCards: [],
          quizzes: [],
          sessions: [],
          currentDayIndex: 0,
          dayAdvanceReady: false,
          onboardingData: { ...state.onboardingData },
        };

        // Sync the currently active roadmap back before switching
        const syncedRoadmaps = state.isAddingRoadmap
          ? syncActiveRoadmapToArray(state)
          : state.roadmaps;

        set({
          onboardingComplete: true,
          isAddingRoadmap: false,
          roadmaps: [...syncedRoadmaps, newRoadmap],
          activeRoadmapId: roadmapId,
          subjects: [subject],
          levels,
          dailyObjectives: objectives,
          spacedRepCards: [],
          quizzes: [],
          sessions: [],
          activeSubjectId: subject.id,
          currentDayIndex: 0,
          dayAdvanceReady: false,
          onboardingData: { ...initialOnboardingData },
        });
      },

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
            totalStudyMinutes: Math.max(
              0,
              state.stats.totalStudyMinutes + (completing ? minutes : -minutes)
            ),
          },
          levels: state.levels.map((l) => {
            if (l.id !== activeLevelId) return l;
            return {
              ...l,
              completedStudyMinutes: Math.max(
                0,
                l.completedStudyMinutes + (completing ? minutes : -minutes)
              ),
            };
          }),
        }));
        if (completing) get().updateStreak();
      },

      advanceToDay: (dayIndex: number) => {
        const state = get();
        const activeLevel = state.levels.find(l => l.status === 'active');
        if (!activeLevel || dayIndex >= activeLevel.topics.length) return;

        // Mark the previous day's topic as completed
        const prevTopicId = activeLevel.topics[state.currentDayIndex]?.id;
        if (prevTopicId) {
          set((s) => ({
            levels: s.levels.map((l) =>
              l.id === activeLevel.id
                ? { ...l, topics: l.topics.map(t => t.id === prevTopicId ? { ...t, completed: true } : t) }
                : l
            ),
          }));
        }

        const topic = activeLevel.topics[dayIndex];
        const newObjectives: DailyObjective[] = topic.arguments.map((arg) => ({
          id: uid(),
          title: `${topic.title}: ${arg}`,
          description: `Focus on: ${arg}`,
          sourceRefs: topic.sourceRefs,
          type: 'study' as const,
          completed: false,
          estimatedMinutes: 30,
          levelId: activeLevel.id,
          topicId: topic.id,
        }));

        set({
          currentDayIndex: dayIndex,
          dailyObjectives: newObjectives,
          dayAdvanceReady: false,
        });
      },

      setDayAdvanceReady: (ready: boolean) => set({ dayAdvanceReady: ready }),

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
        const answeredQuestions = quiz.questions.filter((q) => q.userAnswer !== undefined);
        const totalQuestions = answeredQuestions.length;
        const correct = answeredQuestions.filter(
          (q) => q.userAnswer === q.correctIndex
        ).length;
        const score = totalQuestions > 0 ? correct / totalQuestions : 0;

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

      // ─── Multi-Roadmap Actions ──────────────────────────────────

      startNewRoadmapOnboarding: () => {
        const state = get();
        // Sync current roadmap back before starting onboarding
        const syncedRoadmaps = syncActiveRoadmapToArray(state);
        set({
          roadmaps: syncedRoadmaps,
          isAddingRoadmap: true,
          onboardingComplete: false,
          onboardingData: { ...initialOnboardingData },
        });
      },

      switchRoadmap: (roadmapId: string) => {
        const state = get();
        const target = state.roadmaps.find((rm) => rm.id === roadmapId);
        if (!target || target.id === state.activeRoadmapId) return;

        // Sync current roadmap back first
        const syncedRoadmaps = syncActiveRoadmapToArray(state);

        // Load the target roadmap (re-find in synced array in case it was the current one)
        const freshTarget = syncedRoadmaps.find((rm) => rm.id === roadmapId) || target;

        set({
          roadmaps: syncedRoadmaps,
          ...loadRoadmapState(freshTarget),
          onboardingData: { ...freshTarget.onboardingData },
        });
      },

      deleteRoadmap: (roadmapId: string) => {
        const state = get();
        const syncedRoadmaps = syncActiveRoadmapToArray(state);
        const filtered = syncedRoadmaps.filter((rm) => rm.id !== roadmapId);

        if (filtered.length === 0) {
          // Deleted the last roadmap — go back to onboarding
          set({
            roadmaps: [],
            activeRoadmapId: null,
            onboardingComplete: false,
            isAddingRoadmap: false,
            subjects: [],
            levels: [],
            dailyObjectives: [],
            quizzes: [],
            sessions: [],
            spacedRepCards: [],
            activeSubjectId: null,
            currentDayIndex: 0,
            dayAdvanceReady: false,
            onboardingData: { ...initialOnboardingData },
          });
          return;
        }

        if (roadmapId === state.activeRoadmapId) {
          // Switch to another roadmap
          const nextRoadmap = filtered[0];
          set({
            roadmaps: filtered,
            ...loadRoadmapState(nextRoadmap),
            onboardingData: { ...nextRoadmap.onboardingData },
          });
        } else {
          set({ roadmaps: filtered });
        }
      },

      cancelAddRoadmap: () => {
        const state = get();
        if (!state.isAddingRoadmap) return;

        // Restore back to the active roadmap
        const activeRm = state.roadmaps.find((rm) => rm.id === state.activeRoadmapId);
        if (activeRm) {
          set({
            isAddingRoadmap: false,
            onboardingComplete: true,
            onboardingData: { ...initialOnboardingData },
            ...loadRoadmapState(activeRm),
          });
        } else if (state.roadmaps.length > 0) {
          // fallback: load the first roadmap
          const first = state.roadmaps[0];
          set({
            isAddingRoadmap: false,
            onboardingComplete: true,
            onboardingData: { ...initialOnboardingData },
            ...loadRoadmapState(first),
          });
        } else {
          // No roadmaps at all — stay in onboarding
          set({
            isAddingRoadmap: false,
            onboardingComplete: false,
            onboardingData: { ...initialOnboardingData },
          });
        }
      },

      // ─── Reset ──────────────────────────────────────────────────
      resetStore: () =>
        set({
          onboardingComplete: false,
          isAddingRoadmap: false,
          onboardingData: { ...initialOnboardingData },
          roadmaps: [],
          activeRoadmapId: null,
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
          currentDayIndex: 0,
          dayAdvanceReady: false,
          sessionFocusTime: 0,
        }),
    }),
    {
      name: 'studyquest-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        onboardingComplete: state.onboardingComplete,
        isAddingRoadmap: state.isAddingRoadmap,
        onboardingData: state.onboardingData,
        roadmaps: state.roadmaps,
        activeRoadmapId: state.activeRoadmapId,
        subjects: state.subjects,
        levels: state.levels,
        dailyObjectives: state.dailyObjectives,
        quizzes: state.quizzes,
        sessions: state.sessions,
        spacedRepCards: state.spacedRepCards,
        stats: state.stats,
        notificationPrefs: state.notificationPrefs,
        activeSubjectId: state.activeSubjectId,
        currentDayIndex: state.currentDayIndex,
        dayAdvanceReady: state.dayAdvanceReady,
      }),
    }
  )
);
