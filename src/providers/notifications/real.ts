import type { NotificationProvider, NotificationRequest } from './types';

// TODO(Phase 8): wire expo-notifications
//   - expo-notifications.scheduleNotificationAsync for schedule()
//   - expo-notifications.cancelScheduledNotificationAsync for cancel()
//   - expo-notifications.getAllScheduledNotificationsAsync for listAll()
//   Needs Info.plist UNUserNotificationCenter permission + Dev Client.

const NOT_IMPLEMENTED = 'RealNotificationProvider is not wired — TODO(Phase 8).';

export const realNotificationProvider: NotificationProvider = {
  schedule: (_req: NotificationRequest) => Promise.reject(new Error(NOT_IMPLEMENTED)),
  cancel: (_id: string) => Promise.reject(new Error(NOT_IMPLEMENTED)),
  cancelAll: () => Promise.reject(new Error(NOT_IMPLEMENTED)),
  listAll: () => Promise.reject(new Error(NOT_IMPLEMENTED)),
};
