import type { NotificationProvider, NotificationRequest, ScheduledNotification } from './types';

export interface FakeNotificationProvider extends NotificationProvider {
  fireDue(nowMs: number): readonly ScheduledNotification[];
  reset(): void;
}

function sortByFire(entries: readonly ScheduledNotification[]): ScheduledNotification[] {
  return [...entries].sort((a, b) => a.fireAt - b.fireAt || a.id.localeCompare(b.id));
}

export function createFakeNotificationProvider(
  idPrefix: string = 'fake-notif',
): FakeNotificationProvider {
  let queue: ScheduledNotification[] = [];
  let counter = 0;

  const schedule = (req: NotificationRequest): Promise<string> => {
    counter += 1;
    const id = `${idPrefix}-${counter}`;
    queue = [...queue, { ...req, id }];
    return Promise.resolve(id);
  };

  const cancel = (id: string): Promise<void> => {
    queue = queue.filter((n) => n.id !== id);
    return Promise.resolve();
  };

  const cancelAll = (): Promise<void> => {
    queue = [];
    return Promise.resolve();
  };

  const listAll = (): Promise<readonly ScheduledNotification[]> =>
    Promise.resolve(Object.freeze(sortByFire(queue)));

  const fireDue = (nowMs: number): readonly ScheduledNotification[] => {
    const due = sortByFire(queue.filter((n) => n.fireAt <= nowMs));
    queue = queue.filter((n) => n.fireAt > nowMs);
    return Object.freeze(due);
  };

  const reset = (): void => {
    queue = [];
    counter = 0;
  };

  return { schedule, cancel, cancelAll, listAll, fireDue, reset };
}
