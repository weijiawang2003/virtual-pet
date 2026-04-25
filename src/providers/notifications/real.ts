import * as Notifications from 'expo-notifications';
import { SchedulableTriggerInputTypes } from 'expo-notifications';

import type { NotificationProvider, NotificationRequest, ScheduledNotification } from './types';

export interface SoundPolicy {
  shouldPlaySound(): boolean;
}

export interface RealNotificationProviderOptions {
  readonly soundPolicy?: SoundPolicy;
}

const DEFAULT_SOUND_POLICY: SoundPolicy = { shouldPlaySound: () => true };

interface ScheduledExpoNotification {
  readonly identifier: string;
  readonly content: {
    readonly title?: string | null;
    readonly body?: string | null;
    readonly data?: Record<string, unknown> | null;
  };
  readonly trigger: {
    readonly type?: string;
    readonly value?: number;
  } | null;
}

function fireAtFromTrigger(trigger: ScheduledExpoNotification['trigger']): number {
  if (trigger === null) return 0;
  if (typeof trigger.value === 'number') return trigger.value;
  return 0;
}

export function createRealNotificationProvider(
  opts: RealNotificationProviderOptions = {},
): NotificationProvider {
  const soundPolicy = opts.soundPolicy ?? DEFAULT_SOUND_POLICY;

  return {
    schedule: async (req: NotificationRequest): Promise<string> => {
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: req.title,
          body: req.body,
          ...(soundPolicy.shouldPlaySound() ? { sound: 'default' } : {}),
          ...(req.data !== undefined ? { data: req.data as Record<string, unknown> } : {}),
        },
        trigger: {
          type: SchedulableTriggerInputTypes.DATE,
          date: req.fireAt,
        },
      });
      return id;
    },

    cancel: async (id: string): Promise<void> => {
      await Notifications.cancelScheduledNotificationAsync(id);
    },

    cancelAll: async (): Promise<void> => {
      await Notifications.cancelAllScheduledNotificationsAsync();
    },

    listAll: async (): Promise<readonly ScheduledNotification[]> => {
      const raw =
        (await Notifications.getAllScheduledNotificationsAsync()) as unknown as readonly ScheduledExpoNotification[];
      return Object.freeze(
        raw.map((n) => {
          const title = n.content.title ?? '';
          const body = n.content.body ?? '';
          const fireAt = fireAtFromTrigger(n.trigger);
          const dataRaw = n.content.data;
          const base: ScheduledNotification = {
            id: n.identifier,
            title,
            body,
            fireAt,
            ...(dataRaw !== null && dataRaw !== undefined ? { data: dataRaw } : {}),
          };
          return base;
        }),
      );
    },
  };
}

// Default instance used by runtime-providers in production. Tests use the
// fake from src/providers/notifications/fake.ts.
export const realNotificationProvider: NotificationProvider = createRealNotificationProvider();
