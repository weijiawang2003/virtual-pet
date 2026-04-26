import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { generateQuest, type QuestGenContext } from '../../core/quest/generator';
import { progressDeltaFor } from '../../core/quest/progress-tracker';
import { getActiveQuest, INITIAL_STATE, reducer } from '../../core/quest/quest-reducer';
import type { LifeSignal } from '../../core/signals/types';
import type { Quest, QuestEvent, QuestStateContainer } from '../../core/quest/types';
import { mmkvStorage } from './zustand-mmkv';
import { useEssenceStore } from './essence-store';
import { usePetSnapshotStore } from './pet-snapshot-store';

let nextQuestCounter = 1;
function generateQuestId(): string {
  return `q-${Date.now().toString(36)}-${(nextQuestCounter++).toString(36)}`;
}

export interface QuestStoreState {
  readonly quests: QuestStateContainer;
  // Most recent transition to 'completed' — UI consumes + clears.
  readonly lastCompleted: Quest | null;
  dispatch: (event: QuestEvent) => void;
  offer: (ctx: QuestGenContext, now?: number) => Quest | null;
  accept: (questId: string) => void;
  decline: (questId: string) => void;
  feedSignal: (signal: LifeSignal) => void;
  applyExpiryTick: () => void;
  clearLastCompleted: () => void;
  reset: () => void;
}

export const useQuestStore = create<QuestStoreState>()(
  persist(
    (set, get) => ({
      quests: INITIAL_STATE,
      lastCompleted: null,
      dispatch: (event) => set({ quests: reducer(get().quests, event) }),
      offer: (ctx, now = Date.now()): Quest | null => {
        const q = generateQuest(ctx, now, generateQuestId());
        if (q === null) return null;
        set({ quests: reducer(get().quests, { type: 'quest_offer', quest: q }) });
        return q;
      },
      accept: (questId) => {
        set({
          quests: reducer(get().quests, { type: 'quest_accept', questId, now: Date.now() }),
        });
      },
      decline: (questId) => {
        set({
          quests: reducer(get().quests, { type: 'quest_decline', questId, now: Date.now() }),
        });
      },
      feedSignal: (signal) => {
        const active = getActiveQuest(get().quests);
        if (active === null) return;
        if (active.state !== 'accepted' && active.state !== 'in_progress') return;
        const delta = progressDeltaFor(active.type, signal);
        if (delta === 0) return;
        const before = get().quests.quests[active.id];
        const next = reducer(get().quests, {
          type: 'quest_progress',
          questId: active.id,
          delta,
          now: Date.now(),
        });
        set({ quests: next });
        const after = next.quests[active.id];
        if (
          before !== undefined &&
          after !== undefined &&
          before.state !== 'completed' &&
          after.state === 'completed'
        ) {
          // Pay out rewards. Bond goes to the pet snapshot's pendingBondGain;
          // Essence goes to the global currency.
          useEssenceStore.getState().gain(after.rewardEssence);
          usePetSnapshotStore
            .getState()
            .dispatch({ type: 'bond_gain', amount: after.rewardBond, source: 'system' });
          set({ lastCompleted: after });
        }
      },
      applyExpiryTick: () => {
        set({
          quests: reducer(get().quests, { type: 'quest_expire_check', now: Date.now() }),
        });
      },
      clearLastCompleted: () => set({ lastCompleted: null }),
      reset: () =>
        set({
          quests: INITIAL_STATE,
          lastCompleted: null,
        }),
    }),
    {
      name: 'quest',
      storage: createJSONStorage(() => mmkvStorage),
      version: 1,
      partialize: (state) => ({ quests: state.quests, lastCompleted: state.lastCompleted }),
    },
  ),
);
