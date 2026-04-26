import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { createPet } from '../../core/pet/reducer';
import { draw } from '../../core/gacha/draw';
import { advanceCounter, INITIAL_PITY, type PityCounters } from '../../core/gacha/pity-tracker';
import { getPool } from '../../core/gacha/pools';
import type { GachaResult, Pool } from '../../core/gacha/types';
import { mulberry32 } from '../../core/util/prng';
import { getArchetype } from '../../core/vault/archetypes';
import type { PersonalityTag } from '../../core/vault/types';
import { mmkvStorage } from './zustand-mmkv';
import { useEssenceStore } from './essence-store';
import { useVaultStore } from './vault-store';
import { useVitalityStore } from './vitality-store';

export type PullStatus =
  | { readonly kind: 'idle' }
  | { readonly kind: 'insufficient'; readonly resource: 'vitality' | 'essence' }
  | { readonly kind: 'pulled'; readonly result: GachaResult; readonly newVaultPetId: string };

function samplePersonality(
  bias: readonly PersonalityTag[],
  prng: () => number,
): readonly PersonalityTag[] {
  if (bias.length === 0) return [];
  // 0..bias.length tags, sampled without replacement.
  const count = Math.floor(prng() * (bias.length + 1));
  const pool = [...bias];
  const out: PersonalityTag[] = [];
  for (let i = 0; i < count && pool.length > 0; i++) {
    const idx = Math.floor(prng() * pool.length);
    out.push(pool[idx]!);
    pool.splice(idx, 1);
  }
  return out;
}

export interface GachaStoreState {
  readonly pity: PityCounters;
  readonly lastResult: GachaResult | null;
  pull: (pool: Pool) => PullStatus;
  reset: () => void;
}

export const useGachaStore = create<GachaStoreState>()(
  persist(
    (set, get) => ({
      pity: INITIAL_PITY,
      lastResult: null,
      pull: (pool: Pool): PullStatus => {
        const spec = getPool(pool);
        // 1. Pay the cost
        if (spec.cost.resource === 'vitality') {
          const ok = useVitalityStore
            .getState()
            .tryConsume(pool === 'vitality' ? 'gacha_normal' : 'gacha_premium');
          if (!ok) return { kind: 'insufficient', resource: 'vitality' };
        } else {
          const ok = useEssenceStore.getState().consume(spec.cost.amount);
          if (!ok) return { kind: 'insufficient', resource: 'essence' };
        }
        // 2. Draw
        const seed = (Date.now() ^ Math.floor(Math.random() * 0xffffffff)) >>> 0;
        const prng = mulberry32(seed);
        const result = draw(spec, prng, get().pity[pool]);
        // 3. Update pity counter and last result
        const nextPity = advanceCounter(get().pity, pool, result.rarity);
        set({ pity: nextPity, lastResult: result });
        // 4. Acquire into vault
        const archetype = getArchetype(result.archetypeId)!;
        const personality = samplePersonality(archetype.personalityBias, prng);
        const newId = useVaultStore.getState().acquirePet({
          archetypeId: result.archetypeId,
          rarity: result.rarity,
          personality,
          pet: createPet(Date.now()),
        });
        return { kind: 'pulled', result, newVaultPetId: newId };
      },
      reset: () => set({ pity: INITIAL_PITY, lastResult: null }),
    }),
    {
      name: 'gacha',
      storage: createJSONStorage(() => mmkvStorage),
      version: 1,
      partialize: (state) => ({ pity: state.pity, lastResult: state.lastResult }),
    },
  ),
);
