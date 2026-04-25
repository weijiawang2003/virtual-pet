import * as Haptics from 'expo-haptics';
import { renderHook, act } from '@testing-library/react-native';

import { storage } from '../../store/mmkv';
import { usePetSnapshotStore } from '../../store/pet-snapshot-store';
import { useSettingsStore } from '../../store/settings-store';
import { usePetActions } from '../use-pet-actions';

describe('usePetActions', () => {
  beforeEach(() => {
    storage.clearAll();
    usePetSnapshotStore.persist.clearStorage();
    useSettingsStore.persist.clearStorage();
    useSettingsStore.getState().reset();
    usePetSnapshotStore.getState().reset();
    jest.clearAllMocks();
  });

  it('feed dispatches a feed event and fires light haptic', () => {
    const { result } = renderHook(() => usePetActions());
    const before = usePetSnapshotStore.getState().pet.stats.satiety;
    act(() => {
      result.current.feed();
    });
    expect(usePetSnapshotStore.getState().pet.stats.satiety).toBeGreaterThan(before);
    expect(Haptics.impactAsync).toHaveBeenCalledWith(Haptics.ImpactFeedbackStyle.Light);
  });

  it('play dispatches a play event', () => {
    const { result } = renderHook(() => usePetActions());
    const before = usePetSnapshotStore.getState().pet.stats.happiness;
    act(() => {
      result.current.play();
    });
    expect(usePetSnapshotStore.getState().pet.stats.happiness).toBeGreaterThan(before);
  });

  it('rest dispatches a rest event', () => {
    useSettingsStore.getState().setDemoSpeed(1);
    // Wear down energy first by replaying play.
    usePetSnapshotStore.setState((s) => ({
      pet: { ...s.pet, stats: { ...s.pet.stats, energy: 30 } },
    }));
    const { result } = renderHook(() => usePetActions());
    act(() => {
      result.current.rest();
    });
    expect(usePetSnapshotStore.getState().pet.stats.energy).toBeGreaterThan(30);
  });

  it('clean only fires haptic; pet state unchanged (placeholder)', () => {
    const { result } = renderHook(() => usePetActions());
    const before = usePetSnapshotStore.getState().pet;
    act(() => {
      result.current.clean();
    });
    expect(Haptics.impactAsync).toHaveBeenCalled();
    expect(usePetSnapshotStore.getState().pet).toEqual(before);
  });

  it('reset resets the pet and fires medium haptic', () => {
    usePetSnapshotStore.getState().dispatch({ type: 'feed', nutrition: 30 });
    expect(usePetSnapshotStore.getState().pet.stats.satiety).toBe(100);

    const { result } = renderHook(() => usePetActions());
    act(() => {
      result.current.reset();
    });
    expect(usePetSnapshotStore.getState().pet.stats.satiety).toBe(70);
    expect(Haptics.impactAsync).toHaveBeenCalledWith(Haptics.ImpactFeedbackStyle.Medium);
  });

  it('haptics are skipped when settings.haptics is false', () => {
    useSettingsStore.getState().setHaptics(false);
    const { result } = renderHook(() => usePetActions());
    act(() => {
      result.current.feed();
    });
    expect(Haptics.impactAsync).not.toHaveBeenCalled();
  });
});
