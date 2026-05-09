/**
 * Hook wrapping notification service with store integration
 */
import { useCallback } from 'react';
import { useStudyStore } from './useStudyStore';
import { setupNotifications, scheduleDeadlineWarning } from '@/services/notifications';

export function useNotifications() {
  const notificationPrefs = useStudyStore((s) => s.notificationPrefs);
  const levels = useStudyStore((s) => s.levels);

  const initNotifications = useCallback(async () => {
    await setupNotifications(notificationPrefs);

    // Schedule deadline warnings for active levels
    if (notificationPrefs.deadlineWarnings) {
      const activeLevels = levels.filter(
        (l) => l.status === 'active' || l.status === 'locked'
      );
      for (const level of activeLevels) {
        await scheduleDeadlineWarning(level.deadline, level.title);
      }
    }
  }, [notificationPrefs, levels]);

  return { initNotifications };
}
