import { computeLunar } from './lunar';

const H = 60 * 60 * 1000;
const CST = 8 * H;

describe('computeLunar', () => {
  it('accepts Date and number inputs interchangeably', () => {
    const ts = Date.UTC(2026, 3, 24, 12, 0, 0);
    expect(computeLunar(new Date(ts), CST)).toEqual(computeLunar(ts, CST));
  });

  it('is deterministic across TZ offsets — defaults to UTC (tzOffset=0)', () => {
    const ts = Date.UTC(2026, 1, 17, 4, 0, 0);
    // At UTC 04:00 Feb 17, UTC-local date is Feb 17 → lunar 1-1 (CNY).
    const utc = computeLunar(ts);
    expect(utc.year).toBe(2026);
    expect(utc.month).toBe(1);
    expect(utc.day).toBe(1);
  });

  it('respects tz offset (CST = +8h pushes early-UTC dates back a day)', () => {
    const ts = Date.UTC(2026, 1, 17, 4, 0, 0);
    // In CST, Feb 17 04:00 UTC = Feb 17 12:00 CST → lunar 1-1 (CNY).
    const cst = computeLunar(ts, CST);
    expect(cst.year).toBe(2026);
    expect(cst.month).toBe(1);
    expect(cst.day).toBe(1);
  });

  it('before dawn in UTC but after dawn in CST → different lunar days possible', () => {
    const ts = Date.UTC(2026, 1, 16, 20, 0, 0); // Feb 16 20:00 UTC = Feb 17 04:00 CST
    const utc = computeLunar(ts);
    const cst = computeLunar(ts, CST);
    // UTC reads as Feb 16 (lunar 12-29); CST reads as Feb 17 (lunar 1-1).
    expect(utc.day).not.toBe(cst.day);
  });

  it('returns structural lunar info for a well-known date (2026-04-24 CST)', () => {
    const info = computeLunar(Date.UTC(2026, 3, 24, 12, 0, 0), CST);
    expect(info.year).toBe(2026);
    expect(info.month).toBe(3);
    expect(typeof info.day).toBe('number');
    expect(info.day).toBeGreaterThanOrEqual(1);
    expect(info.day).toBeLessThanOrEqual(30);
    expect(info.isLeapMonth).toBe(false);
    expect(typeof info.chineseLabel).toBe('string');
    expect(info.chineseLabel.length).toBeGreaterThan(0);
  });

  it('exposes solarTerm on a solar-term day (立夏, 2026-05-05 CST)', () => {
    const info = computeLunar(Date.UTC(2026, 4, 5, 12, 0, 0), CST);
    expect(info.solarTerm).toBe('立夏');
  });

  it('solarTerm is null on a non-solar-term day', () => {
    const info = computeLunar(Date.UTC(2026, 3, 24, 12, 0, 0), CST);
    expect(info.solarTerm).toBeNull();
  });

  it('is pure — same date+offset yields deep-equal output', () => {
    const ts = Date.UTC(2026, 3, 24);
    expect(computeLunar(ts, CST)).toEqual(computeLunar(ts, CST));
  });
});
