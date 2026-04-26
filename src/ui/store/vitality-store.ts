import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { canConsume, createVitality, reducer } from '../../core/vitality/reducer';
import { VITALITY_COSTS } from '../../core/vitality/costs';
import type {
  VitalityAction,
  VitalityEvent,
  VitalitySource,
  VitalityState,
} from '../../core/vitality/types';
import { mmkvStorage } from './zustand-mmkv';
import { useSettingsStore } from './settings-store';

const MAX_CATCHUP_MS = 7 * 24 * 60 * 60 * 1000;

export interface VitalityStoreState {
  readonly vitality: VitalityState;
  readonly lastTickedAt: number;
  dispatch: (event: VitalityEvent) => void;
  applyTick: () => void;
  recover: (amount: number, source: VitalitySource) => void;
  tryConsume: (action: VitalityAction) => boolean;
  reset: () => void;
}

function fresh(now: number): { vitality: VitalityState; lastTickedAt: number } {
  return { vitality: createVitality(now), lastTickedAt: now };
}

export const useVitalityStore = create<VitalityStoreState>()(
  persist(
    (set, get) => ({
      ...fresh(Date.now()),
      dispatch: (event) => {
        set({ vitality: reducer(get().vitality, event) });
      },
      applyTick: () => {
        const now = Date.now();
        const { vitality, lastTickedAt } = get();
        const elapsedReal = Math.max(0, Math.min(MAX_CATCHUP_MS, now - lastTickedAt));
        const speed = useSettingsStore.getState().demoSpeed;
        const elapsedSimulated = elapsedReal * speed;
        if (elapsedSimulated <= 0) {
          set({ lastTickedAt: now });
          return;
        }
        const projectedNow = vitality.lastUpdatedAt + elapsedSimulated;
        set({
          vitality: reducer(vitality, { type: 'vitality_tick', now: projectedNow }),
          lastTickedAt: now,
        });
      },
      recover: (amount, source) => {
        if (amount === 0) return;
        set({
          vitality: reducer(get().vitality, { type: 'vitality_recover', amount, source }),
        });
      },
      tryConsume: (action) => {
        const cost = VITALITY_COSTS[action];
        const v = get().vitality;
        if (!canConsume(v, cost)) return false;
        set({
          vitality: reducer(v, { type: 'vitality_consume', amount: cost, action }),
        });
        return true;
      },
      reset: () => {
        set(fresh(Date.now()));
      },
    }),
    {
      name: 'vitality',
      storage: createJSONStorage(() => mmkvStorage),
      version: 1,
      partialize: (state) => ({ vitality: state.vitality, lastTickedAt: state.lastTickedAt }),
    },
  ),
);
