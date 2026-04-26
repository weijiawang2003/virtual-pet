import { storage } from '../mmkv';
import { useSettingsStore } from '../settings-store';
import { useVitalityStore } from '../vitality-store';

describe('useVitalityStore', () => {
  beforeEach(() => {
    storage.clearAll();
    useVitalityStore.persist.clearStorage();
    useSettingsStore.persist.clearStorage();
    useSettingsStore.getState().reset();
    useVitalityStore.getState().reset();
  });

  it('starts at full vitality (100)', () => {
    expect(useVitalityStore.getState().vitality.current).toBe(100);
  });

  it('tryConsume(play) returns true when sufficient and decreases by cost', () => {
    const ok = useVitalityStore.getState().tryConsume('play');
    expect(ok).toBe(true);
    expect(useVitalityStore.getState().vitality.current).toBe(85);
  });

  it('tryConsume returns false when insufficient and leaves state unchanged', () => {
    useVitalityStore.setState((s) => ({
      vitality: { ...s.vitality, current: 5 },
    }));
    const ok = useVitalityStore.getState().tryConsume('play');
    expect(ok).toBe(false);
    expect(useVitalityStore.getState().vitality.current).toBe(5);
  });

  it('tryConsume(rest) succeeds when current=0 (free action)', () => {
    useVitalityStore.setState((s) => ({ vitality: { ...s.vitality, current: 0 } }));
    expect(useVitalityStore.getState().tryConsume('rest')).toBe(true);
    expect(useVitalityStore.getState().vitality.current).toBe(0);
  });

  it('recover adds amount and clamps at cap', () => {
    useVitalityStore.setState((s) => ({ vitality: { ...s.vitality, current: 90 } }));
    useVitalityStore.getState().recover(20, 'health');
    expect(useVitalityStore.getState().vitality.current).toBe(100);
  });

  it('recover with 0 amount is a no-op', () => {
    useVitalityStore.setState((s) => ({ vitality: { ...s.vitality, current: 50 } }));
    useVitalityStore.getState().recover(0, 'system');
    expect(useVitalityStore.getState().vitality.current).toBe(50);
  });

  it('applyTick(0 elapsed) is a no-op on current value', () => {
    useVitalityStore.setState((s) => ({ vitality: { ...s.vitality, current: 50 } }));
    useVitalityStore.getState().applyTick();
    expect(useVitalityStore.getState().vitality.current).toBe(50);
  });

  it('reset returns to fresh full state', () => {
    useVitalityStore.getState().tryConsume('gacha_premium');
    expect(useVitalityStore.getState().vitality.current).toBe(70);
    useVitalityStore.getState().reset();
    expect(useVitalityStore.getState().vitality.current).toBe(100);
  });

  it('dispatch passes through to the pure reducer', () => {
    useVitalityStore
      .getState()
      .dispatch({ type: 'vitality_consume', amount: 25, action: 'gacha_premium' });
    expect(useVitalityStore.getState().vitality.current).toBe(75);
  });
});
