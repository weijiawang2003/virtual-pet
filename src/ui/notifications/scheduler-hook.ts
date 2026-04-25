import { useEffect, useRef } from 'react';
import { AppState, type AppStateStatus, type NativeEventSubscription } from 'react-native';

import { useRuntimeProviders } from '../providers/runtime-providers-context';
import { usePetSnapshotStore } from '../store/pet-snapshot-store';
import { useSettingsStore } from '../store/settings-store';
import { planScheduledNotifications } from './predict-and-schedule';

function deviceTzOffsetMs(): number {
  return -new Date().getTimezoneOffset() * 60_000;
}

// AppState-driven scheduler:
//   background: cancelAll → plan → schedule top N (≤ daily budget).
//   active:     cancelAll (user is in-app; no need for pings).
// On settings.notificationsEnabled = false the hook becomes a no-op.
export function useNotificationScheduler(): void {
  const { notifications, permissions } = useRuntimeProviders();
  const lastStateRef = useRef<AppStateStatus>(AppState.currentState);

  useEffect(() => {
    const subscription: NativeEventSubscription = AppState.addEventListener('change', (next) => {
      const enabled = useSettingsStore.getState().notificationsEnabled;
      const prev = lastStateRef.current;
      lastStateRef.current = next;

      if (!enabled) {
        void notifications.cancelAll();
        return;
      }

      if (next === 'background' || next === 'inactive') {
        // Skip duplicate firing (inactive → background).
        if (prev === 'background') return;
        void (async () => {
          await notifications.cancelAll();
          const pet = usePetSnapshotStore.getState().pet;
          const snap = await permissions.snapshot();
          if (snap.notifications !== 'granted') return;
          const requests = planScheduledNotifications({
            pet,
            nowMs: Date.now(),
            tzOffsetMs: deviceTzOffsetMs(),
            permissions: snap,
          });
          for (const req of requests) {
            await notifications.schedule(req);
          }
        })();
      } else if (next === 'active') {
        void notifications.cancelAll();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [notifications, permissions]);
}
