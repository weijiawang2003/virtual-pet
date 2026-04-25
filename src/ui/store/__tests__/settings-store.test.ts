import { storage } from '../mmkv';
import { useSettingsStore } from '../settings-store';

describe('useSettingsStore', () => {
  beforeEach(() => {
    storage.clearAll();
    useSettingsStore.persist.clearStorage();
    useSettingsStore.getState().reset();
  });

  it('exposes default values', () => {
    const s = useSettingsStore.getState();
    expect(s.haptics).toBe(true);
    expect(s.sound).toBe(true);
    expect(s.theme).toBe('auto');
    expect(s.onboardingCompleted).toBe(false);
  });

  it('toggles haptics', () => {
    useSettingsStore.getState().setHaptics(false);
    expect(useSettingsStore.getState().haptics).toBe(false);
  });

  it('switches theme mode', () => {
    useSettingsStore.getState().setTheme('dark');
    expect(useSettingsStore.getState().theme).toBe('dark');
  });

  it('reset returns every field to defaults', () => {
    const state = useSettingsStore.getState();
    state.setHaptics(false);
    state.setSound(false);
    state.setTheme('dark');
    state.setOnboardingCompleted(true);
    state.reset();

    const after = useSettingsStore.getState();
    expect(after.haptics).toBe(true);
    expect(after.sound).toBe(true);
    expect(after.theme).toBe('auto');
    expect(after.onboardingCompleted).toBe(false);
  });
});
