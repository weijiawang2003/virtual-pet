import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type {
  PersonalityTag,
  Rarity,
  VaultEvent,
  VaultState,
  VaultedPet,
} from '../../core/vault/types';
import { INITIAL_STATE, reducer } from '../../core/vault/vault-reducer';
import type { Pet } from '../../core/pet/types';
import { mmkvStorage } from './zustand-mmkv';
import { usePetSnapshotStore } from './pet-snapshot-store';

let nextIdCounter = 1;
function generatePetId(): string {
  return `vp-${Date.now().toString(36)}-${(nextIdCounter++).toString(36)}`;
}

export interface VaultStoreState {
  readonly vault: VaultState;
  dispatch: (event: VaultEvent) => void;
  acquirePet: (params: {
    archetypeId: string;
    rarity: Rarity;
    personality: readonly PersonalityTag[];
    pet: Pet;
  }) => string;
  setActivePet: (petId: string) => void;
  syncActiveSnapshot: () => void;
  applyVaultTick: () => void;
  reset: () => void;
}

// Persisted vault. Active pet swap also writes the live pet snapshot from
// the pet-snapshot-store, so SET_ACTIVE_PET is the single chokepoint that
// keeps both stores in sync.
export const useVaultStore = create<VaultStoreState>()(
  persist(
    (set, get) => ({
      vault: INITIAL_STATE,
      dispatch: (event) => {
        set({ vault: reducer(get().vault, event) });
      },
      acquirePet: (params) => {
        const id = generatePetId();
        set({
          vault: reducer(get().vault, {
            type: 'acquire_pet',
            petId: id,
            archetypeId: params.archetypeId,
            rarity: params.rarity,
            personality: params.personality,
            pet: params.pet,
            now: Date.now(),
          }),
        });
        return id;
      },
      setActivePet: (petId) => {
        const state = get().vault;
        if (state.activePetId === petId) return;
        const target = state.entries[petId];
        if (target === undefined) return;
        // 1) Save the current live snapshot back into the OLD active entry.
        const livePet = usePetSnapshotStore.getState().pet;
        const synced =
          state.activePetId === null
            ? state
            : reducer(state, { type: 'sync_active_pet', pet: livePet, now: Date.now() });
        // 2) Switch active.
        const after = reducer(synced, { type: 'set_active_pet', petId, now: Date.now() });
        set({ vault: after });
        // 3) Load the new active's pet into the live snapshot.
        usePetSnapshotStore.setState((s) => ({ ...s, pet: target.pet }));
      },
      syncActiveSnapshot: () => {
        const state = get().vault;
        if (state.activePetId === null) return;
        const livePet = usePetSnapshotStore.getState().pet;
        set({
          vault: reducer(state, { type: 'sync_active_pet', pet: livePet, now: Date.now() }),
        });
      },
      applyVaultTick: () => {
        set({ vault: reducer(get().vault, { type: 'vault_tick', now: Date.now() }) });
      },
      reset: () => {
        set({ vault: INITIAL_STATE });
      },
    }),
    {
      name: 'vault',
      storage: createJSONStorage(() => mmkvStorage),
      version: 1,
      partialize: (state) => ({ vault: state.vault }),
    },
  ),
);

// Convenience selectors so consumers don't need to call selectors manually.
export function getActiveVaultedPet(): VaultedPet | null {
  const v = useVaultStore.getState().vault;
  if (v.activePetId === null) return null;
  return v.entries[v.activePetId] ?? null;
}
