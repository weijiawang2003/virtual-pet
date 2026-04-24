import { mulberry32 } from '../util/prng';
import type { BubbleKey } from '../visual/types';
import { POOL } from './pool';

export interface SelectOptions {
  // Last N phrases shown; caller persists across sessions. Default: 3.
  readonly recentlyUsed?: readonly string[];
}

// Deterministic phrase pick. Never returns undefined: POOL is non-empty per key
// (pool completeness test guards this). If every candidate is in recentlyUsed,
// falls back to the pool's first entry for stable behavior.
export function selectPhrase(key: BubbleKey, seed: number, opts: SelectOptions = {}): string {
  const all = POOL[key];
  const fallback = all[0] ?? '';
  const recent = opts.recentlyUsed ?? [];
  const candidates = all.filter((p) => !recent.includes(p));
  // Spec: if every phrase is in recentlyUsed, return the pool's first entry
  // deterministically (no random pick), so behavior is predictable.
  if (candidates.length === 0) return fallback;
  const rng = mulberry32(seed);
  const idx = Math.floor(rng() * candidates.length) % candidates.length;
  return candidates[idx] ?? fallback;
}
