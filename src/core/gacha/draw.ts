import { ARCHETYPES } from '../vault/archetypes';
import type { Rarity, SpeciesArchetype } from '../vault/types';
import { shouldForceSSR } from './pity-tracker';
import type { GachaResult, PoolSpec, RarityWeights } from './types';

const RARITY_ORDER: readonly Rarity[] = ['N', 'R', 'SR', 'SSR'];

function pickRarity(weights: RarityWeights, prng: () => number): Rarity {
  const total = weights.N + weights.R + weights.SR + weights.SSR;
  // Defensive: if a pool ever sums to 0 (misconfig), bail to N rather than NaN.
  if (total <= 0) return 'N';
  const roll = prng() * total;
  let acc = 0;
  for (const r of RARITY_ORDER) {
    acc += weights[r];
    if (roll < acc) return r;
  }
  // PRNG returned exactly 1.0 (impossible per spec but guard anyway).
  return 'SSR';
}

function pickArchetype(
  rarity: Rarity,
  prng: () => number,
  pool: readonly SpeciesArchetype[],
): SpeciesArchetype {
  const candidates = pool.filter((a) => a.baseRarity === rarity);
  // Fall back to any archetype if a rarity has no archetypes (shouldn't
  // happen with the Phase 24 set, but keeps the function total).
  const list = candidates.length > 0 ? candidates : pool;
  const idx = Math.floor(prng() * list.length);
  return list[Math.min(idx, list.length - 1)]!;
}

// Pure pull function. Caller-supplied PRNG seed makes draws fully
// deterministic for tests + replay.
export function draw(
  spec: PoolSpec,
  prng: () => number,
  pityCounter: number,
  archetypePool: readonly SpeciesArchetype[] = ARCHETYPES,
): GachaResult {
  const forced = shouldForceSSR(pityCounter, spec);
  const rarity = forced ? 'SSR' : pickRarity(spec.weights, prng);
  const archetype = pickArchetype(rarity, prng, archetypePool);
  return {
    archetypeId: archetype.id,
    rarity,
    isPityHit: forced,
  };
}
