import { computeLunar } from './lunar';

describe('computeLunar', () => {
  it('accepts Date and number inputs interchangeably', () => {
    const ts = Date.UTC(2026, 3, 24, 12, 0, 0);
    expect(computeLunar(new Date(ts))).toEqual(computeLunar(ts));
  });

  it('returns structural lunar info for a well-known date (2026-04-24 UTC)', () => {
    const info = computeLunar(Date.UTC(2026, 3, 24, 12, 0, 0));
    // 2026-04-24 falls in lunar month 3 (三月) of the Year of the Horse.
    expect(info.year).toBe(2026);
    expect(info.month).toBe(3);
    expect(typeof info.day).toBe('number');
    expect(info.day).toBeGreaterThanOrEqual(1);
    expect(info.day).toBeLessThanOrEqual(30);
    expect(info.isLeapMonth).toBe(false);
    expect(typeof info.chineseLabel).toBe('string');
    expect(info.chineseLabel.length).toBeGreaterThan(0);
  });

  it('exposes solarTerm on a solar-term day (立夏, 2026-05-05)', () => {
    const info = computeLunar(Date.UTC(2026, 4, 5, 12, 0, 0));
    expect(info.solarTerm).toBe('立夏');
  });

  it('solarTerm is null on a non-solar-term day', () => {
    const info = computeLunar(Date.UTC(2026, 3, 24, 12, 0, 0));
    expect(info.solarTerm).toBeNull();
  });

  it('is pure — same date yields deep-equal output', () => {
    const ts = Date.UTC(2026, 3, 24);
    expect(computeLunar(ts)).toEqual(computeLunar(ts));
  });
});
