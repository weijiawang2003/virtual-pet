import type { Rarity } from '../vault/types';
import type { Pool, PoolSpec } from './types';

export interface PityCounters {
  readonly vitality: number;
  readonly essence: number;
}

export const INITIAL_PITY: PityCounters = Object.freeze({
  vitality: 0,
  essence: 0,
});

// True when the pool's threshold has been reached AND the pool actually has
// a pity rule. Vitality pool's threshold is null → never forces.
export function shouldForceSSR(counter: number, spec: PoolSpec): boolean {
  if (spec.pityThreshold === null) return false;
  return counter + 1 >= spec.pityThreshold;
}

// Apply a result to the counter for one pool. SSR resets to 0; everything
// else increments. Other pool's counter is not touched.
export function advanceCounter(counters: PityCounters, pool: Pool, rarity: Rarity): PityCounters {
  const cur = counters[pool];
  const next = rarity === 'SSR' ? 0 : cur + 1;
  if (next === cur) return counters;
  return { ...counters, [pool]: next };
}
