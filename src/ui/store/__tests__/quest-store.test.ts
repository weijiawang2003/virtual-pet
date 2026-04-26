import { storage } from '../mmkv';
import { useEssenceStore } from '../essence-store';
import { usePetSnapshotStore } from '../pet-snapshot-store';
import { useQuestStore } from '../quest-store';

describe('useQuestStore', () => {
  beforeEach(() => {
    storage.clearAll();
    useQuestStore.persist.clearStorage();
    useEssenceStore.persist.clearStorage();
    usePetSnapshotStore.persist.clearStorage();
    useQuestStore.getState().reset();
    useEssenceStore.getState().reset();
    usePetSnapshotStore.getState().reset();
  });

  it('starts empty', () => {
    expect(useQuestStore.getState().quests.order).toEqual([]);
    expect(useQuestStore.getState().lastCompleted).toBeNull();
  });

  it('offer adds an offered quest under valid context', () => {
    const q = useQuestStore.getState().offer({
      petId: 'p1',
      vitalityCurrent: 80,
      hoursSinceLastQuest: null,
      recentSteps: 5000,
      recentSleepMinutes: 0,
      recentNewPlaces: 0,
    });
    expect(q).not.toBeNull();
    expect(useQuestStore.getState().quests.order.length).toBe(1);
  });

  it('offer returns null when conditions disqualify', () => {
    const q = useQuestStore.getState().offer({
      petId: null,
      vitalityCurrent: 80,
      hoursSinceLastQuest: null,
      recentSteps: 0,
      recentSleepMinutes: 0,
      recentNewPlaces: 0,
    });
    expect(q).toBeNull();
  });

  it('feedSignal advances and completes the quest, paying out rewards', () => {
    const q = useQuestStore.getState().offer({
      petId: 'p1',
      vitalityCurrent: 80,
      hoursSinceLastQuest: null,
      recentSteps: 0,
      recentSleepMinutes: 0,
      recentNewPlaces: 0,
    })!;
    useQuestStore.getState().accept(q.id);
    // Idle quest threshold = 60 min.
    useQuestStore.getState().feedSignal({ type: 'idle_no_phone', duration_minutes: 70, at: 1 });
    const stored = useQuestStore.getState().quests.quests[q.id];
    expect(stored?.state).toBe('completed');
    // Rewards paid out exactly once.
    expect(useEssenceStore.getState().current).toBe(q.rewardEssence);
    expect(usePetSnapshotStore.getState().pet.pendingBondGain).toBe(q.rewardBond);
    expect(useQuestStore.getState().lastCompleted?.id).toBe(q.id);
  });

  it('feedSignal does not pay rewards twice on extra signals', () => {
    const q = useQuestStore.getState().offer({
      petId: 'p1',
      vitalityCurrent: 80,
      hoursSinceLastQuest: null,
      recentSteps: 0,
      recentSleepMinutes: 0,
      recentNewPlaces: 0,
    })!;
    useQuestStore.getState().accept(q.id);
    useQuestStore.getState().feedSignal({ type: 'idle_no_phone', duration_minutes: 70, at: 1 });
    const after1 = useEssenceStore.getState().current;
    useQuestStore.getState().feedSignal({ type: 'idle_no_phone', duration_minutes: 70, at: 2 });
    expect(useEssenceStore.getState().current).toBe(after1);
  });

  it('feedSignal on irrelevant signal is a no-op', () => {
    const q = useQuestStore.getState().offer({
      petId: 'p1',
      vitalityCurrent: 80,
      hoursSinceLastQuest: null,
      recentSteps: 0,
      recentSleepMinutes: 0,
      recentNewPlaces: 0,
    })!;
    useQuestStore.getState().accept(q.id);
    // The default fallback offers idle; a steps signal shouldn't progress idle.
    useQuestStore
      .getState()
      .feedSignal({ type: 'steps_delta', count: 9999, window_minutes: 60, at: 1 });
    expect(useQuestStore.getState().quests.quests[q.id]?.progress).toBe(0);
  });

  it('feedSignal is a no-op when there is no active quest', () => {
    useQuestStore.getState().feedSignal({ type: 'idle_no_phone', duration_minutes: 90, at: 1 });
    expect(useQuestStore.getState().lastCompleted).toBeNull();
  });

  it('decline transitions offered → declined', () => {
    const q = useQuestStore.getState().offer({
      petId: 'p1',
      vitalityCurrent: 80,
      hoursSinceLastQuest: null,
      recentSteps: 0,
      recentSleepMinutes: 0,
      recentNewPlaces: 0,
    })!;
    useQuestStore.getState().decline(q.id);
    expect(useQuestStore.getState().quests.quests[q.id]?.state).toBe('declined');
  });

  it('applyExpiryTick marks past-deadline quests expired', () => {
    const q = useQuestStore.getState().offer(
      {
        petId: 'p1',
        vitalityCurrent: 80,
        hoursSinceLastQuest: null,
        recentSteps: 0,
        recentSleepMinutes: 0,
        recentNewPlaces: 0,
      },
      0,
    )!;
    // Manually shift expiresAt into the past.
    useQuestStore.setState((s) => ({
      quests: {
        ...s.quests,
        quests: { ...s.quests.quests, [q.id]: { ...q, expiresAt: 0 } },
      },
    }));
    useQuestStore.getState().applyExpiryTick();
    expect(useQuestStore.getState().quests.quests[q.id]?.state).toBe('expired');
  });

  it('clearLastCompleted resets the toast slot', () => {
    useQuestStore.setState((s) => ({
      ...s,
      lastCompleted: {
        id: 'foo',
        type: 'walk',
        threshold: 1,
        rewardEssence: 1,
        rewardBond: 1,
        expiresAt: 1,
        state: 'completed',
        progress: 1,
        petId: null,
        offeredAt: 0,
        acceptedAt: 0,
        completedAt: 0,
      },
    }));
    useQuestStore.getState().clearLastCompleted();
    expect(useQuestStore.getState().lastCompleted).toBeNull();
  });
});
