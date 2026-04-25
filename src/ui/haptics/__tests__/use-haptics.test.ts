import * as Haptics from 'expo-haptics';
import { renderHook, act } from '@testing-library/react-native';

import { storage } from '../../store/mmkv';
import { useSettingsStore } from '../../store/settings-store';
import { useHaptics } from '../use-haptics';

describe('useHaptics', () => {
  beforeEach(() => {
    storage.clearAll();
    useSettingsStore.persist.clearStorage();
    useSettingsStore.getState().reset();
    jest.clearAllMocks();
  });

  it('fires impactAsync when settings.haptics is true', () => {
    const { result } = renderHook(() => useHaptics());
    act(() => {
      result.current.trigger('light');
    });
    expect(Haptics.impactAsync).toHaveBeenCalledWith(Haptics.ImpactFeedbackStyle.Light);
  });

  it('is a no-op when settings.haptics is false', () => {
    useSettingsStore.getState().setHaptics(false);
    const { result } = renderHook(() => useHaptics());
    act(() => {
      result.current.trigger('heavy');
    });
    expect(Haptics.impactAsync).not.toHaveBeenCalled();
  });

  it('uses selectionAsync for "selection" intensity', () => {
    const { result } = renderHook(() => useHaptics());
    act(() => {
      result.current.trigger('selection');
    });
    expect(Haptics.selectionAsync).toHaveBeenCalled();
  });

  it('exposes the current enabled flag', () => {
    const { result } = renderHook(() => useHaptics());
    expect(result.current.enabled).toBe(true);
    act(() => {
      useSettingsStore.getState().setHaptics(false);
    });
    expect(useSettingsStore.getState().haptics).toBe(false);
  });
});
