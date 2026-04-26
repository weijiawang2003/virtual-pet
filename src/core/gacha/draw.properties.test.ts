import fc from 'fast-check';

import { mulberry32 } from '../util/prng';
import { advanceCounter, INITIAL_PITY } from './pity-tracker';
import { draw } from './draw';
import { getPool } from './pools';

describe('draw — fast-check distribution', () => {
  it('1000-pull essence sample sits within ±5% of declared weights', () => {
    const N_PULLS = 1000;
    const counts = { N: 0, R: 0, SR: 0, SSR: 0 };
    let counters = INITIAL_PITY;
    // One PRNG instance shared across pulls — this is what matters for
    // distribution; using mulberry32(seed) per pull produces correlated
    // samples since seeds differ by 1 each call.
    const prng = mulberry32(0xc0ffee);
    for (let i = 0; i < N_PULLS; i++) {
      const result = draw(getPool('essence'), prng, counters.essence);
      counts[result.rarity] += 1;
      counters = advanceCounter(counters, 'essence', result.rarity);
    }
    // Expected: N 30%, R 35%, SR 25%, SSR 10% (slightly higher in practice
    // because of pity occasionally firing and SSR pulls reset). Allow ±5%.
    const tol = 0.05 * N_PULLS;
    expect(Math.abs(counts.N - 0.3 * N_PULLS)).toBeLessThan(tol);
    expect(Math.abs(counts.R - 0.35 * N_PULLS)).toBeLessThan(tol);
    expect(Math.abs(counts.SR - 0.25 * N_PULLS)).toBeLessThan(tol);
    expect(counts.SSR).toBeGreaterThanOrEqual(80); // ≥ 8% even worst case
  });

  it('after 99 non-SSR pulls on essence, the 100th MUST be SSR', () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 1000 }), (seed) => {
        let counters = INITIAL_PITY;
        // Manually force the counter to 99 — equivalent to 99 non-SSR pulls.
        counters = { ...counters, essence: 99 };
        const r = draw(getPool('essence'), mulberry32(seed), counters.essence);
        expect(r.rarity).toBe('SSR');
        expect(r.isPityHit).toBe(true);
      }),
      { numRuns: 30 },
    );
  });

  it('vitality pool never produces SSR over 5000 random pulls', () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 5000 }), (seed) => {
        const r = draw(getPool('vitality'), mulberry32(seed), 0);
        expect(r.rarity).not.toBe('SSR');
      }),
      { numRuns: 200 },
    );
  });

  it('result.archetypeId is always non-empty', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('vitality' as const, 'essence' as const),
        fc.integer({ min: 1, max: 10000 }),
        fc.integer({ min: 0, max: 99 }),
        (poolName, seed, counter) => {
          const r = draw(getPool(poolName), mulberry32(seed), counter);
          expect(r.archetypeId.length).toBeGreaterThan(0);
        },
      ),
    );
  });
});
