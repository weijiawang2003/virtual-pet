import fc from 'fast-check';
import { POOL } from './pool';
import { selectPhrase } from './select';

describe('selectPhrase', () => {
  it('returns a string from the pool for the given key', () => {
    const out = selectPhrase('hungry', 1);
    expect(POOL.hungry).toContain(out);
  });

  it('is deterministic: same seed + recentlyUsed → same output', () => {
    expect(selectPhrase('happy', 42)).toBe(selectPhrase('happy', 42));
  });

  it('avoids phrases in recentlyUsed when alternatives exist', () => {
    const first = selectPhrase('happy', 42);
    const second = selectPhrase('happy', 42, { recentlyUsed: [first] });
    expect(second).not.toBe(first);
  });

  it('when every phrase is in recentlyUsed, falls back to pool[0]', () => {
    const all = [...POOL.cny];
    const out = selectPhrase('cny', 42, { recentlyUsed: all });
    expect(out).toBe(POOL.cny[0]);
  });

  it('property: never returns empty string', () => {
    fc.assert(
      fc.property(fc.integer(), (seed) => {
        expect(selectPhrase('hungry', seed).length).toBeGreaterThan(0);
      }),
    );
  });

  it('property: with recentlyUsed window 3 and pool ≥ 2, two back-to-back picks can differ when we rotate the window', () => {
    fc.assert(
      fc.property(fc.integer(), (seed) => {
        let recentlyUsed: string[] = [];
        const seen = new Set<string>();
        for (let i = 0; i < 5; i++) {
          const phrase = selectPhrase('happy', seed + i, { recentlyUsed });
          seen.add(phrase);
          recentlyUsed = [phrase, ...recentlyUsed].slice(0, 3);
        }
        // Across 5 picks with rolling window, we should get ≥ 2 distinct phrases.
        expect(seen.size).toBeGreaterThanOrEqual(2);
      }),
    );
  });
});
