import type { Pool, PoolSpec } from './types';

// Two banners. Vitality pool is the daily cheap pull (no SSR, no pity).
// Essence pool is the rare premium pull with SSR and a 100-pull pity floor.
//
// Weights are interpreted as a *probability distribution* — they sum to 100
// for every pool, but the draw fn normalizes anyway so future tuning doesn't
// need to add up cleanly.
const POOLS: Readonly<Record<Pool, PoolSpec>> = Object.freeze({
  vitality: Object.freeze({
    pool: 'vitality' as const,
    weights: Object.freeze({ N: 70, R: 25, SR: 5, SSR: 0 }),
    pityThreshold: null,
    cost: Object.freeze({ resource: 'vitality' as const, amount: 20 }),
  }),
  essence: Object.freeze({
    pool: 'essence' as const,
    weights: Object.freeze({ N: 30, R: 35, SR: 25, SSR: 10 }),
    pityThreshold: 100,
    cost: Object.freeze({ resource: 'essence' as const, amount: 10 }),
  }),
});

export function getPool(pool: Pool): PoolSpec {
  return POOLS[pool];
}

export const ALL_POOLS: readonly Pool[] = Object.freeze(['vitality', 'essence']);
