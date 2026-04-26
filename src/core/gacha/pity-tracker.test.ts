import { getPool } from './pools';
import { advanceCounter, INITIAL_PITY, shouldForceSSR } from './pity-tracker';

describe('shouldForceSSR', () => {
  it('always false for vitality pool (no pity threshold)', () => {
    const v = getPool('vitality');
    expect(shouldForceSSR(0, v)).toBe(false);
    expect(shouldForceSSR(99, v)).toBe(false);
    expect(shouldForceSSR(9999, v)).toBe(false);
  });

  it('false for essence pool below threshold-1 (next pull would still be free)', () => {
    const e = getPool('essence');
    expect(shouldForceSSR(0, e)).toBe(false);
    expect(shouldForceSSR(98, e)).toBe(false);
  });

  it('true on the 100th pull (counter+1 >= threshold)', () => {
    const e = getPool('essence');
    expect(shouldForceSSR(99, e)).toBe(true);
  });

  it('stays true beyond threshold (defensive — caller should reset on SSR)', () => {
    const e = getPool('essence');
    expect(shouldForceSSR(150, e)).toBe(true);
  });
});

describe('advanceCounter', () => {
  it('increments on N/R/SR for the targeted pool only', () => {
    let c = INITIAL_PITY;
    c = advanceCounter(c, 'essence', 'N');
    expect(c).toEqual({ vitality: 0, essence: 1 });
    c = advanceCounter(c, 'essence', 'R');
    c = advanceCounter(c, 'essence', 'SR');
    expect(c).toEqual({ vitality: 0, essence: 3 });
  });

  it('resets to 0 on SSR', () => {
    let c = { vitality: 0, essence: 50 };
    c = advanceCounter(c, 'essence', 'SSR');
    expect(c.essence).toBe(0);
  });

  it('returns the same reference when result already 0 and rolling SSR', () => {
    const c = INITIAL_PITY;
    expect(advanceCounter(c, 'essence', 'SSR')).toBe(c);
  });

  it('does not affect other pools', () => {
    let c = INITIAL_PITY;
    c = advanceCounter(c, 'essence', 'R');
    expect(c.vitality).toBe(0);
    c = advanceCounter(c, 'vitality', 'N');
    expect(c.essence).toBe(1);
    expect(c.vitality).toBe(1);
  });
});
