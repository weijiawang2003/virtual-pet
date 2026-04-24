import { realClock } from './real-clock';

describe('realClock', () => {
  it('now() returns a finite ms timestamp close to Date.now()', () => {
    const a = Date.now();
    const b = realClock.now();
    const c = Date.now();
    expect(Number.isFinite(b)).toBe(true);
    expect(b).toBeGreaterThanOrEqual(a);
    expect(b).toBeLessThanOrEqual(c);
  });
});
