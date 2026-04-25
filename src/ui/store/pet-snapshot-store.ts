import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { Pet } from '../../core/pet/types';
import { mmkvStorage } from './zustand-mmkv';

export interface PetSnapshotState {
  readonly pet: Pet | null;
  setPet: (p: Pet | null) => void;
  clear: () => void;
}

// Phase 14 stub: holds the latest serialized Pet across cold launches. Phase
// 15+ will wire the reducer's output into here. For now nothing writes to it.
export const usePetSnapshotStore = create<PetSnapshotState>()(
  persist(
    (set) => ({
      pet: null,
      setPet: (p) => set({ pet: p }),
      clear: () => set({ pet: null }),
    }),
    {
      name: 'pet-snapshot',
      storage: createJSONStorage(() => mmkvStorage),
      version: 1,
    },
  ),
);
