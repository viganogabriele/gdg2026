/**
 * Notification Service — expo-notifications wrapper
 */
import { Platform } from 'react-native';
import type { NotificationPreferences } from '@/types';

// Lazy import to avoid issues on web
let Notifications: typeof import('expo-notifications') | null = null;

async function getNotificationsModule() {
  if (!Notifications) {
    try {
      Notifications = await import('expo-notifications');
    } catch {
      console.warn('expo-notifications not available on this platform');
      return null;
    }
  }
  return Notifications;
}

export async function requestPermissions(): Promise<boolean> {
  if (Platform.OS === 'web') return false;

  const mod = await getNotificationsModule();
  if (!mod) return false;

  const { status: existingStatus } = await mod.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await mod.requestPermissionsAsync();
    finalStatus = status;
  }

  return finalStatus === 'granted';
}

export async function scheduleDailyReminder(
  time: string, // "HH:mm"
  title: string = 'Time to study!',
  body: string = 'Your study plan is waiting. Keep that streak going!'
): Promise<string | null> {
  const mod = await getNotificationsModule();
  if (!mod) return null;

  const [hours, minutes] = time.split(':').map(Number);

  const id = await mod.scheduleNotificationAsync({
    content: { title, body, sound: true },
    trigger: {
      type: mod.SchedulableTriggerInputTypes.DAILY,
      hour: hours,
      minute: minutes,
    },
  });

  return id;
}

export async function scheduleDeadlineWarning(
  deadline: string, // ISO date
  levelTitle: string
): Promise<string | null> {
  const mod = await getNotificationsModule();
  if (!mod) return null;

  const deadlineDate = new Date(deadline);
  const warningDate = new Date(deadlineDate.getTime() - 24 * 60 * 60 * 1000);

  if (warningDate <= new Date()) return null;

  const id = await mod.scheduleNotificationAsync({
    content: {
      title: 'Deadline Tomorrow!',
      body: `"${levelTitle}" is due tomorrow. Time to review!`,
      sound: true,
    },
    trigger: {
      type: mod.SchedulableTriggerInputTypes.DATE,
      date: warningDate,
    },
  });

  return id;
}

export async function scheduleStreakWarning(): Promise<string | null> {
  const mod = await getNotificationsModule();
  if (!mod) return null;

  // Schedule for 8 PM today if user hasn't studied
  const today = new Date();
  today.setHours(20, 0, 0, 0);

  if (today <= new Date()) {
    today.setDate(today.getDate() + 1);
  }

  const id = await mod.scheduleNotificationAsync({
    content: {
      title: "Don't break your streak!",
      body: "You haven't studied today. A quick session is all it takes!",
      sound: true,
    },
    trigger: {
      type: mod.SchedulableTriggerInputTypes.DATE,
      date: today,
    },
  });

  return id;
}

export async function cancelAllNotifications(): Promise<void> {
  const mod = await getNotificationsModule();
  if (!mod) return;

  await mod.cancelAllScheduledNotificationsAsync();
}

export async function setupNotifications(
  prefs: NotificationPreferences
): Promise<void> {
  const hasPermission = await requestPermissions();
  if (!hasPermission) return;

  await cancelAllNotifications();

  if (prefs.dailyReminder) {
    await scheduleDailyReminder(prefs.dailyReminderTime);
  }

  if (prefs.streakWarnings) {
    await scheduleStreakWarning();
  }
}
