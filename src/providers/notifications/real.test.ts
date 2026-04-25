// Per-file mock — this test runs in the `providers` jest project (Node env)
// which doesn't pull jest-setup.ts. Each method's behavior is asserted by
// calling the matching expo-notifications spy.
import { createRealNotificationProvider } from './real';
import * as Notifications from 'expo-notifications';

jest.mock('expo-notifications', () => ({
  scheduleNotificationAsync: jest.fn().mockResolvedValue('id-from-expo'),
  cancelScheduledNotificationAsync: jest.fn().mockResolvedValue(undefined),
  cancelAllScheduledNotificationsAsync: jest.fn().mockResolvedValue(undefined),
  getAllScheduledNotificationsAsync: jest.fn().mockResolvedValue([
    {
      identifier: 'n-1',
      content: { title: '吃饭啦', body: '', data: { kind: 'feed' } },
      trigger: { type: 'date', value: 1_000_000_000 },
    },
    {
      identifier: 'n-2',
      content: { title: '困了', body: '', data: null },
      trigger: { type: 'date', value: 1_000_500_000 },
    },
  ]),
  SchedulableTriggerInputTypes: { DATE: 'date' },
}));

const scheduleSpy = Notifications.scheduleNotificationAsync as jest.Mock;
const cancelSpy = Notifications.cancelScheduledNotificationAsync as jest.Mock;
const cancelAllSpy = Notifications.cancelAllScheduledNotificationsAsync as jest.Mock;
const listAllSpy = Notifications.getAllScheduledNotificationsAsync as jest.Mock;

describe('createRealNotificationProvider', () => {
  beforeEach(() => {
    scheduleSpy.mockClear();
    cancelSpy.mockClear();
    cancelAllSpy.mockClear();
    listAllSpy.mockClear();
  });

  it('schedule passes title/body/fireAt as a date trigger', async () => {
    const p = createRealNotificationProvider();
    const id = await p.schedule({
      title: '吃饭啦',
      body: '',
      fireAt: 1_700_000_000_000,
      data: { kind: 'feed' },
    });
    expect(id).toBe('id-from-expo');
    expect(scheduleSpy).toHaveBeenCalledTimes(1);
    const arg = scheduleSpy.mock.calls[0]![0] as {
      content: { title: string; body: string; data?: Record<string, unknown>; sound?: string };
      trigger: { type: string; date: number };
    };
    expect(arg.content.title).toBe('吃饭啦');
    expect(arg.content.body).toBe('');
    expect(arg.content.data).toEqual({ kind: 'feed' });
    expect(arg.trigger).toEqual({ type: 'date', date: 1_700_000_000_000 });
  });

  it('schedule omits sound when soundPolicy says no', async () => {
    const p = createRealNotificationProvider({ soundPolicy: { shouldPlaySound: () => false } });
    await p.schedule({ title: 't', body: '', fireAt: 1 });
    const arg = scheduleSpy.mock.calls[0]![0] as { content: { sound?: string } };
    expect(arg.content.sound).toBeUndefined();
  });

  it('schedule includes sound when policy says yes', async () => {
    const p = createRealNotificationProvider({ soundPolicy: { shouldPlaySound: () => true } });
    await p.schedule({ title: 't', body: '', fireAt: 1 });
    const arg = scheduleSpy.mock.calls[0]![0] as { content: { sound?: string } };
    expect(arg.content.sound).toBe('default');
  });

  it('cancel passes the id to expo', async () => {
    const p = createRealNotificationProvider();
    await p.cancel('xyz');
    expect(cancelSpy).toHaveBeenCalledWith('xyz');
  });

  it('cancelAll calls cancelAllScheduledNotificationsAsync', async () => {
    const p = createRealNotificationProvider();
    await p.cancelAll();
    expect(cancelAllSpy).toHaveBeenCalled();
  });

  it('listAll converts response shape to ScheduledNotification[]', async () => {
    const p = createRealNotificationProvider();
    const out = await p.listAll();
    expect(out).toHaveLength(2);
    expect(out[0]).toEqual({
      id: 'n-1',
      title: '吃饭啦',
      body: '',
      fireAt: 1_000_000_000,
      data: { kind: 'feed' },
    });
    expect(out[1]).toEqual({
      id: 'n-2',
      title: '困了',
      body: '',
      fireAt: 1_000_500_000,
    });
  });
});
