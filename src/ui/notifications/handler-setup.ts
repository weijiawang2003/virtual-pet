import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';

let installed = false;
let tapSubscription: Notifications.EventSubscription | null = null;

// Module-level setup. Call once at app boot. Subsequent calls are no-ops so
// React StrictMode double-mounts don't double-subscribe.
export function setupNotificationHandler(): void {
  if (installed) return;
  installed = true;

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: false,
      shouldShowList: false,
      shouldPlaySound: false,
      shouldSetBadge: true,
      // legacy keys some SDK versions still read
      shouldShowAlert: false,
    }),
  });

  tapSubscription = Notifications.addNotificationResponseReceivedListener(() => {
    router.replace('/');
  });
}

// Test escape hatch — undo setup so jest can re-run setupNotificationHandler.
export function __resetNotificationHandlerForTests(): void {
  installed = false;
  tapSubscription?.remove();
  tapSubscription = null;
}
