import { createPet } from '../../../core/pet/reducer';
import { storage } from '../mmkv';
import { usePetSnapshotStore } from '../pet-snapshot-store';
import { getActiveVaultedPet, useVaultStore } from '../vault-store';

describe('useVaultStore', () => {
  beforeEach(() => {
    storage.clearAll();
    usePetSnapshotStore.persist.clearStorage();
    useVaultStore.persist.clearStorage();
    useVaultStore.getState().reset();
    usePetSnapshotStore.getState().reset();
  });

  it('starts with empty vault and null active', () => {
    expect(useVaultStore.getState().vault.activePetId).toBeNull();
    expect(useVaultStore.getState().vault.order).toEqual([]);
    expect(getActiveVaultedPet()).toBeNull();
  });

  it('acquirePet adds an entry and returns its id; first acquire becomes active', () => {
    const id = useVaultStore.getState().acquirePet({
      archetypeId: 'moss',
      rarity: 'N',
      personality: ['lazy'],
      pet: createPet(0),
    });
    expect(typeof id).toBe('string');
    const state = useVaultStore.getState().vault;
    expect(state.activePetId).toBe(id);
    expect(state.order).toEqual([id]);
    expect(getActiveVaultedPet()?.archetypeId).toBe('moss');
  });

  it('setActivePet swaps the live snapshot and writes-back the old one', () => {
    const id1 = useVaultStore.getState().acquirePet({
      archetypeId: 'moss',
      rarity: 'N',
      personality: [],
      pet: { ...createPet(0), stats: { satiety: 70, energy: 70, happiness: 70 } },
    });
    const id2 = useVaultStore.getState().acquirePet({
      archetypeId: 'flicker',
      rarity: 'R',
      personality: ['energetic'],
      pet: { ...createPet(0), stats: { satiety: 50, energy: 60, happiness: 80 } },
    });
    // User feeds the active pet (id1) — snapshot updates.
    usePetSnapshotStore.setState((s) => ({
      ...s,
      pet: { ...s.pet, stats: { ...s.pet.stats, satiety: 99 } },
    }));
    // Switch to id2.
    useVaultStore.getState().setActivePet(id2);
    expect(useVaultStore.getState().vault.activePetId).toBe(id2);
    // Old active snapshot (id1) was synced into vault.
    expect(useVaultStore.getState().vault.entries[id1]?.pet.stats.satiety).toBe(99);
    // Live snapshot now reflects id2's pet.
    expect(usePetSnapshotStore.getState().pet.stats.satiety).toBe(50);
  });

  it('setActivePet on unknown id is a no-op', () => {
    const id = useVaultStore.getState().acquirePet({
      archetypeId: 'moss',
      rarity: 'N',
      personality: [],
      pet: createPet(0),
    });
    useVaultStore.getState().setActivePet('ghost');
    expect(useVaultStore.getState().vault.activePetId).toBe(id);
  });

  it('setActivePet on already-active id is a no-op', () => {
    const id = useVaultStore.getState().acquirePet({
      archetypeId: 'moss',
      rarity: 'N',
      personality: [],
      pet: createPet(0),
    });
    const before = useVaultStore.getState().vault;
    useVaultStore.getState().setActivePet(id);
    expect(useVaultStore.getState().vault).toBe(before);
  });

  it('syncActiveSnapshot writes the live pet back into the active entry', () => {
    const id = useVaultStore.getState().acquirePet({
      archetypeId: 'moss',
      rarity: 'N',
      personality: [],
      pet: createPet(0),
    });
    usePetSnapshotStore.setState((s) => ({
      ...s,
      pet: { ...s.pet, stats: { ...s.pet.stats, happiness: 12 } },
    }));
    useVaultStore.getState().syncActiveSnapshot();
    expect(useVaultStore.getState().vault.entries[id]?.pet.stats.happiness).toBe(12);
  });

  it('syncActiveSnapshot is a no-op when no active pet', () => {
    const before = useVaultStore.getState().vault;
    useVaultStore.getState().syncActiveSnapshot();
    expect(useVaultStore.getState().vault).toBe(before);
  });

  it('applyVaultTick is callable and produces a state', () => {
    useVaultStore.getState().acquirePet({
      archetypeId: 'moss',
      rarity: 'N',
      personality: [],
      pet: createPet(0),
    });
    expect(() => useVaultStore.getState().applyVaultTick()).not.toThrow();
  });

  it('reset returns to empty state', () => {
    useVaultStore.getState().acquirePet({
      archetypeId: 'moss',
      rarity: 'N',
      personality: [],
      pet: createPet(0),
    });
    useVaultStore.getState().reset();
    expect(useVaultStore.getState().vault.order).toEqual([]);
  });
});
