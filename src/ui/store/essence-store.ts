import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { mmkvStorage } from './zustand-mmkv';

export interface EssenceStoreState {
  readonly current: number;
  readonly lifetimeEarned: number;
  gain: (amount: number) => void;
  consume: (amount: number) => boolean;
  reset: () => void;
}

const DEFAULTS = { current: 0, lifetimeEarned: 0 };

export const useEssenceStore = create<EssenceStoreState>()(
  persist(
    (set, get) => ({
      ...DEFAULTS,
      gain: (amount) => {
        if (amount <= 0) return;
        set({
          current: get().current + amount,
          lifetimeEarned: get().lifetimeEarned + amount,
        });
      },
      consume: (amount) => {
        if (amount < 0) return false;
        if (get().current < amount) return false;
        set({ current: get().current - amount });
        return true;
      },
      reset: () => set({ ...DEFAULTS }),
    }),
    {
      name: 'essence',
      storage: createJSONStorage(() => mmkvStorage),
      version: 1,
      partialize: (state) => ({
        current: state.current,
        lifetimeEarned: state.lifetimeEarned,
      }),
    },
  ),
);
