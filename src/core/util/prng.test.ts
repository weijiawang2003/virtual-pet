import { mulberry32 } from './prng';

describe('mulberry32', () => {
  it('is deterministic: same seed → same sequence', () => {
    const a = mulberry32(42);
    const b = mulberry32(42);
    const seqA = [a(), a(), a(), a(), a()];
    const seqB = [b(), b(), b(), b(), b()];
    expect(seqA).toEqual(seqB);
  });

  it('returns floats in [0, 1)', () => {
    const rng = mulberry32(1);
    for (let i = 0; i < 200; i++) {
      const v = rng();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });

  it('different seeds produce different first draws', () => {
    expect(mulberry32(1)()).not.toBe(mulberry32(2)());
  });
});
