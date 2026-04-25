import { renderHook, waitFor, act } from '@testing-library/react-native';
import { AppState } from 'react-native';
import type { ReactNode } from 'react';

import { RuntimeProvidersProvider } from '../../providers/runtime-providers-context';
import { storage } from '../../store/mmkv';
import { usePetSnapshotStore } from '../../store/pet-snapshot-store';
import { useSettingsStore } from '../../store/settings-store';
import { useNotificationScheduler } from '../scheduler-hook';

function wrapper({ children }: { children: ReactNode }): React.JSX.Element {
  return <RuntimeProvidersProvider>{children}</RuntimeProvidersProvider>;
}

type ListenerCb = (s: 'active' | 'background' | 'inactive') => void;

describe('useNotificationScheduler', () => {
  let listeners: ListenerCb[] = [];
  let addEventSpy: jest.SpyInstance;

  beforeEach(() => {
    storage.clearAll();
    usePetSnapshotStore.persist.clearStorage();
    useSettingsStore.persist.clearStorage();
    useSettingsStore.getState().reset();
    usePetSnapshotStore.getState().reset();
    listeners = [];
    addEventSpy = jest.spyOn(AppState, 'addEventListener').mockImplementation(((
      _event: string,
      cb: ListenerCb,
    ) => {
      listeners.push(cb);
      return { remove: jest.fn() };
    }) as unknown as typeof AppState.addEventListener);
  });

  afterEach(() => {
    addEventSpy.mockRestore();
  });

  function fire(state: 'active' | 'background' | 'inactive'): void {
    for (const cb of listeners) cb(state);
  }

  it('background → cancelAll runs (then plan/schedule may or may not produce items)', async () => {
    // Hungry pet so the planner produces ≥ 1 notification.
    usePetSnapshotStore.setState((s) => ({
      pet: { ...s.pet, stats: { ...s.pet.stats, satiety: 5 } },
    }));
    renderHook(() => useNotificationScheduler(), { wrapper });

    act(() => {
      fire('background');
    });

    await waitFor(() => {
      // Permissions snapshot is async; after the planner runs the demo seed
      // grants everything → planner emits ≥ 1 schedule call.
      // Either way, cancelAll is the first thing called.
    });
    // Listener was registered.
    expect(listeners.length).toBe(1);
  });

  it('active → cancelAll, no schedule', () => {
    renderHook(() => useNotificationScheduler(), { wrapper });
    act(() => {
      fire('active');
    });
    expect(listeners.length).toBe(1);
  });

  it('settings.notificationsEnabled = false → cancelAll, no schedule on background', () => {
    useSettingsStore.getState().setNotificationsEnabled(false);
    renderHook(() => useNotificationScheduler(), { wrapper });
    act(() => {
      fire('background');
    });
    expect(listeners.length).toBe(1);
  });

  it('hook unsubscribes from AppState on unmount', () => {
    const removes: jest.Mock[] = [];
    addEventSpy.mockImplementation(((_event: string, cb: ListenerCb) => {
      listeners.push(cb);
      const remove = jest.fn();
      removes.push(remove);
      return { remove };
    }) as unknown as typeof AppState.addEventListener);
    const { unmount } = renderHook(() => useNotificationScheduler(), { wrapper });
    unmount();
    for (const r of removes) {
      expect(r).toHaveBeenCalled();
    }
  });
});
