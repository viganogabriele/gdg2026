/**
 * AsyncStorage wrapper with typed access for all data types
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  SUBJECTS: 'studyquest_subjects',
  LEVELS: 'studyquest_levels',
  STATS: 'studyquest_stats',
  SESSIONS: 'studyquest_sessions',
  SR_CARDS: 'studyquest_sr_cards',
  QUIZZES: 'studyquest_quizzes',
  OBJECTIVES: 'studyquest_objectives',
  NOTIFICATION_PREFS: 'studyquest_notification_prefs',
  ONBOARDING_COMPLETE: 'studyquest_onboarding_complete',
} as const;

async function getItem<T>(key: string): Promise<T | null> {
  try {
    const value = await AsyncStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  } catch {
    console.warn(`Failed to read ${key} from storage`);
    return null;
  }
}

async function setItem<T>(key: string, value: T): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {
    console.warn(`Failed to write ${key} to storage`);
  }
}

async function removeItem(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
  } catch {
    console.warn(`Failed to remove ${key} from storage`);
  }
}

async function clearAll(): Promise<void> {
  try {
    const keys = Object.values(KEYS);
    await AsyncStorage.multiRemove(keys);
  } catch {
    console.warn('Failed to clear storage');
  }
}

export const StorageService = {
  KEYS,
  getItem,
  setItem,
  removeItem,
  clearAll,
};
