import { storage } from '../mmkv';
import { usePetSnapshotStore } from '../pet-snapshot-store';
import { useSettingsStore } from '../settings-store';

describe('usePetSnapshotStore', () => {
  beforeEach(() => {
    storage.clearAll();
    usePetSnapshotStore.persist.clearStorage();
    useSettingsStore.persist.clearStorage();
    useSettingsStore.getState().reset();
    usePetSnapshotStore.getState().reset();
  });

  it('initializes with a real Pet (never null) on first read', () => {
    const { pet } = usePetSnapshotStore.getState();
    expect(pet.stage).toBe('egg');
    expect(pet.stats.satiety).toBe(70);
    expect(pet.stats.energy).toBe(70);
    expect(pet.stats.happiness).toBe(70);
    expect(pet.ageMs).toBe(0);
  });

  it('dispatch routes events through the core reducer', () => {
    usePetSnapshotStore.getState().dispatch({ type: 'feed', nutrition: 20, source: 'manual' });
    expect(usePetSnapshotStore.getState().pet.stats.satiety).toBe(90);

    usePetSnapshotStore.getState().dispatch({ type: 'play', minutes: 10, source: 'manual' });
    expect(usePetSnapshotStore.getState().pet.stats.happiness).toBe(80);
    expect(usePetSnapshotStore.getState().pet.stats.energy).toBe(65);
  });

  it('applyTick advances ageMs by elapsedReal × demoSpeed', () => {
    useSettingsStore.getState().setDemoSpeed(60);
    const before = usePetSnapshotStore.getState();
    const lastBefore = before.lastTickedAt;

    // Push lastTickedAt 100ms into the past, then tick.
    usePetSnapshotStore.setState({ lastTickedAt: lastBefore - 100 });
    usePetSnapshotStore.getState().applyTick();

    const after = usePetSnapshotStore.getState();
    expect(after.pet.ageMs).toBeGreaterThan(0);
    expect(after.lastTickedAt).toBeGreaterThanOrEqual(lastBefore - 100);
  });

  it('applyTick caps elapsed at 7 days even when lastTickedAt is far in the past', () => {
    const now = Date.now();
    usePetSnapshotStore.setState({ lastTickedAt: now - 30 * 24 * 60 * 60 * 1000 });
    useSettingsStore.getState().setDemoSpeed(1);
    usePetSnapshotStore.getState().applyTick();
    const ageDays = usePetSnapshotStore.getState().pet.ageMs / (24 * 60 * 60 * 1000);
    expect(ageDays).toBeLessThanOrEqual(7.01);
  });

  it('reset returns the pet to a fresh egg', () => {
    usePetSnapshotStore.getState().dispatch({ type: 'feed', nutrition: 10, source: 'manual' });
    usePetSnapshotStore.getState().dispatch({ type: 'play', minutes: 5, source: 'manual' });
    usePetSnapshotStore.getState().reset();
    const { pet } = usePetSnapshotStore.getState();
    expect(pet.stage).toBe('egg');
    expect(pet.stats).toEqual({ satiety: 70, energy: 70, happiness: 70 });
    expect(pet.ageMs).toBe(0);
  });
});
