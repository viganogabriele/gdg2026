/**
 * Gamification constants — points, badges, thresholds
 */

export const Points = {
  STUDY_SESSION_COMPLETE: 10,
  LEVEL_PASSED: 50,
  STREAK_DAY: 20,
  PERFECT_QUIZ: 30,
  EARLY_COMPLETION: 25,
  SPACED_REP_CORRECT: 5,
  SPACED_REP_SESSION: 15,
} as const;

export const LevelThresholds = {
  PASS_PERCENTAGE: 0.7,
  MAX_QUIZ_ATTEMPTS_BEFORE_RESCHEDULE: 2,
} as const;

export const StreakMultipliers = {
  7: 1.5,   // 7-day streak = 1.5x points
  14: 2.0,  // 14-day streak = 2x points
  30: 3.0,  // 30-day streak = 3x points
} as const;

export const PomodoroDefaults = {
  WORK_MINUTES: 25,
  BREAK_MINUTES: 5,
  LONG_BREAK_MINUTES: 15,
  SESSIONS_BEFORE_LONG_BREAK: 4,
} as const;

export interface BadgeDefinition {
  id: string;
  title: string;
  description: string;
  icon: string; // Ionicons name
  condition: string; // human-readable condition
}

export const BadgeDefinitions: BadgeDefinition[] = [
  {
    id: 'first_session',
    title: 'First Steps',
    description: 'Complete your first study session',
    icon: 'award',
    condition: 'complete_first_session',
  },
  {
    id: 'streak_3',
    title: 'Getting Started',
    description: 'Maintain a 3-day study streak',
    icon: 'award',
    condition: 'streak_3',
  },
  {
    id: 'streak_7',
    title: 'On Fire',
    description: 'Maintain a 7-day study streak',
    icon: 'award',
    condition: 'streak_7',
  },
  {
    id: 'streak_30',
    title: 'Unstoppable',
    description: 'Maintain a 30-day study streak',
    icon: 'award',
    condition: 'streak_30',
  },
  {
    id: 'perfect_score',
    title: 'Perfect Score',
    description: 'Get 100% on a level quiz',
    icon: 'award',
    condition: 'perfect_quiz',
  },
  {
    id: 'early_bird',
    title: 'Early Bird',
    description: 'Complete a level before its deadline',
    icon: 'award',
    condition: 'early_completion',
  },
  {
    id: 'night_owl',
    title: 'Night Owl',
    description: 'Study after midnight',
    icon: 'award',
    condition: 'study_after_midnight',
  },
  {
    id: 'level_5',
    title: 'Scholar',
    description: 'Complete 5 levels',
    icon: 'award',
    condition: 'levels_completed_5',
  },
  {
    id: 'level_10',
    title: 'Master',
    description: 'Complete 10 levels',
    icon: 'award',
    condition: 'levels_completed_10',
  },
  {
    id: 'points_500',
    title: 'Point Collector',
    description: 'Earn 500 total points',
    icon: 'award',
    condition: 'points_500',
  },
  {
    id: 'points_1000',
    title: 'XP Hunter',
    description: 'Earn 1000 total points',
    icon: 'award',
    condition: 'points_1000',
  },
  {
    id: 'marathon',
    title: 'Marathon Runner',
    description: 'Study for 2+ hours in a single day',
    icon: 'award',
    condition: 'study_2_hours_day',
  },
];
