import { clampStat, STAT_MAX, STAT_MIN } from './clamp';

describe('clampStat', () => {
  it('passes through values inside [0, 100]', () => {
    expect(clampStat(0)).toBe(0);
    expect(clampStat(50)).toBe(50);
    expect(clampStat(100)).toBe(100);
  });

  it('floors values below 0', () => {
    expect(clampStat(-1)).toBe(0);
    expect(clampStat(-Infinity)).toBe(0);
  });

  it('caps values above 100', () => {
    expect(clampStat(101)).toBe(100);
    expect(clampStat(Infinity)).toBe(100);
  });

  it('coerces NaN to STAT_MIN', () => {
    expect(clampStat(Number.NaN)).toBe(STAT_MIN);
  });

  it('exposes STAT_MIN and STAT_MAX constants', () => {
    expect(STAT_MIN).toBe(0);
    expect(STAT_MAX).toBe(100);
  });
});
