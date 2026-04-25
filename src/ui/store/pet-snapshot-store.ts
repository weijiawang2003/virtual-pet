import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { createPet, reducer } from '../../core/pet/reducer';
import type { Event, Pet } from '../../core/pet/types';
import { mmkvStorage } from './zustand-mmkv';
import { useSettingsStore } from './settings-store';

const MAX_CATCHUP_MS = 7 * 24 * 60 * 60 * 1000;

function freshPet(now: number): { pet: Pet; lastTickedAt: number } {
  return { pet: createPet(now), lastTickedAt: now };
}

export interface PetSnapshotState {
  readonly pet: Pet;
  readonly lastTickedAt: number;
  dispatch: (event: Event) => void;
  applyTick: () => void;
  reset: () => void;
}

// Persisted store: holds the live pet + the last wall-clock tick timestamp.
// `lastTickedAt` lives here (not in core Pet) so the core stays pure.
export const usePetSnapshotStore = create<PetSnapshotState>()(
  persist(
    (set, get) => ({
      ...freshPet(Date.now()),
      dispatch: (event) => {
        set({ pet: reducer(get().pet, event) });
      },
      applyTick: () => {
        const now = Date.now();
        const { pet, lastTickedAt } = get();
        const elapsedReal = Math.max(0, Math.min(MAX_CATCHUP_MS, now - lastTickedAt));
        const speed = useSettingsStore.getState().demoSpeed;
        const elapsedSimulated = elapsedReal * speed;
        if (elapsedSimulated <= 0) {
          set({ lastTickedAt: now });
          return;
        }
        set({
          pet: reducer(pet, { type: 'tick', elapsedMs: elapsedSimulated }),
          lastTickedAt: now,
        });
      },
      reset: () => {
        set(freshPet(Date.now()));
      },
    }),
    {
      name: 'pet-snapshot',
      storage: createJSONStorage(() => mmkvStorage),
      version: 2,
      // Persist only data fields; actions are recreated each launch.
      partialize: (state) => ({ pet: state.pet, lastTickedAt: state.lastTickedAt }),
    },
  ),
);
