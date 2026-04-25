import { renderHook, waitFor } from '@testing-library/react-native';
import type { ReactNode } from 'react';

import { RuntimeProvidersProvider } from '../../providers/runtime-providers-context';
import { storage } from '../../store/mmkv';
import { usePetSnapshotStore } from '../../store/pet-snapshot-store';
import { useSettingsStore } from '../../store/settings-store';
import { useLifeContext } from '../use-life-context';

function wrapper({ children }: { children: ReactNode }): React.JSX.Element {
  return <RuntimeProvidersProvider>{children}</RuntimeProvidersProvider>;
}

describe('useLifeContext', () => {
  beforeEach(() => {
    storage.clearAll();
    usePetSnapshotStore.persist.clearStorage();
    useSettingsStore.persist.clearStorage();
    useSettingsStore.getState().reset();
    usePetSnapshotStore.getState().reset();
  });

  it('returns a non-null pet on the very first render', () => {
    const { result } = renderHook(() => useLifeContext(), { wrapper });
    expect(result.current.pet).toBeDefined();
    expect(result.current.pet.stage).toBe('egg');
  });

  it('exposes timeOfDay and lunar info', () => {
    const { result } = renderHook(() => useLifeContext(), { wrapper });
    expect(result.current.hourOfDay).toBeGreaterThanOrEqual(0);
    expect(result.current.hourOfDay).toBeLessThanOrEqual(23);
    expect(result.current.lunar).toBeDefined();
  });

  it('reflects granted permissions from the runtime providers (after async settle)', async () => {
    const { result } = renderHook(() => useLifeContext(), { wrapper });
    await waitFor(() => {
      expect(result.current.permissions.health).toBe('granted');
    });
  });

  it('reflects current location from the runtime providers (after async settle)', async () => {
    const { result } = renderHook(() => useLifeContext(), { wrapper });
    await waitFor(() => {
      expect(result.current.location.current).not.toBeNull();
    });
    expect(result.current.solar).not.toBeNull();
    expect(result.current.weather).not.toBeNull();
  });
});
