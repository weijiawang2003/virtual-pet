import { mulberry32 } from '../util/prng';
import { ARCHETYPES } from '../vault/archetypes';
import type { SpeciesArchetype } from '../vault/types';
import { draw } from './draw';
import { getPool } from './pools';

describe('draw — basic behavior', () => {
  it('returns an archetype id from the registry', () => {
    const result = draw(getPool('vitality'), mulberry32(1), 0);
    expect(ARCHETYPES.find((a) => a.id === result.archetypeId)).toBeDefined();
  });

  it('vitality pool never produces SSR (weight 0 + no pity)', () => {
    let prng = mulberry32(99);
    for (let i = 0; i < 200; i++) {
      const r = draw(getPool('vitality'), prng, i);
      expect(r.rarity).not.toBe('SSR');
      expect(r.isPityHit).toBe(false);
    }
    // Re-seed to defeat warning about unused var
    prng = mulberry32(0);
    expect(typeof prng).toBe('function');
  });

  it('essence pool with counter=99 forces SSR (pity)', () => {
    const r = draw(getPool('essence'), mulberry32(7), 99);
    expect(r.rarity).toBe('SSR');
    expect(r.isPityHit).toBe(true);
  });

  it('essence pool with counter<99 yields any rarity (no force)', () => {
    const r = draw(getPool('essence'), mulberry32(7), 0);
    expect(r.isPityHit).toBe(false);
  });

  it('archetypeId always matches a known archetype', () => {
    const known = new Set(ARCHETYPES.map((a) => a.id));
    for (let i = 0; i < 50; i++) {
      const r = draw(getPool('essence'), mulberry32(i + 1), 0);
      expect(known.has(r.archetypeId)).toBe(true);
    }
  });
});

describe('draw — pickRarity edge paths', () => {
  it('falls back to N when all weights are zero (defensive)', () => {
    const broken = {
      ...getPool('vitality'),
      weights: { N: 0, R: 0, SR: 0, SSR: 0 },
    };
    const r = draw(broken, mulberry32(1), 0);
    expect(r.rarity).toBe('N');
  });

  it('falls back to SSR when prng returns the maximum (boundary)', () => {
    // mulberry32 never actually returns 1.0; we synthesize one to exercise
    // the unreachable-in-practice "out of band" branch.
    const ones = (): number => 1;
    const r = draw(getPool('essence'), ones, 0);
    expect(r.rarity).toBe('SSR');
  });
});

describe('draw — pickArchetype edge paths', () => {
  it('falls back to any archetype when pool has no candidates of rolled rarity', () => {
    // A custom archetype pool with only N entries. Asking for SR via pity-
    // forced SSR (impossible in vitality due to weights, but test directly).
    const onlyN: readonly SpeciesArchetype[] = ARCHETYPES.filter((a) => a.baseRarity === 'N');
    // Use a pool with full SSR weight to drive the SSR rarity branch.
    const ssrOnly = {
      ...getPool('essence'),
      weights: { N: 0, R: 0, SR: 0, SSR: 100 },
    };
    const r = draw(ssrOnly, mulberry32(1), 0, onlyN);
    expect(r.rarity).toBe('SSR');
    // archetype came from N pool fallback
    expect(onlyN.some((a) => a.id === r.archetypeId)).toBe(true);
  });
});
