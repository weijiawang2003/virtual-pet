import { computeSolar } from './solar';

// Shanghai, 2026-04-24 around noon UTC.
const SHANGHAI_LAT = 31.23;
const SHANGHAI_LON = 121.47;
const NOON_UTC_2026_04_24 = Date.UTC(2026, 3, 24, 12, 0, 0);

describe('computeSolar', () => {
  it('accepts Date and number inputs interchangeably', () => {
    const a = computeSolar(new Date(NOON_UTC_2026_04_24), SHANGHAI_LAT, SHANGHAI_LON);
    const b = computeSolar(NOON_UTC_2026_04_24, SHANGHAI_LAT, SHANGHAI_LON);
    expect(a).toEqual(b);
  });

  it('returns finite sunrise, sunset, solarNoon for temperate latitudes', () => {
    const s = computeSolar(NOON_UTC_2026_04_24, SHANGHAI_LAT, SHANGHAI_LON);
    expect(typeof s.sunriseMs).toBe('number');
    expect(typeof s.sunsetMs).toBe('number');
    expect(typeof s.solarNoonMs).toBe('number');
    expect(s.sunriseMs!).toBeLessThan(s.sunsetMs!);
  });

  it('moonPhase is in [0, 1) and moonIllumination is in [0, 1]', () => {
    const s = computeSolar(NOON_UTC_2026_04_24, SHANGHAI_LAT, SHANGHAI_LON);
    expect(s.moonPhase).toBeGreaterThanOrEqual(0);
    expect(s.moonPhase).toBeLessThan(1);
    expect(s.moonIllumination).toBeGreaterThanOrEqual(0);
    expect(s.moonIllumination).toBeLessThanOrEqual(1);
  });

  it('isDaylight is true at solar noon (local coord), false at local midnight', () => {
    const noon = computeSolar(NOON_UTC_2026_04_24, SHANGHAI_LAT, SHANGHAI_LON);
    // At Shanghai solar noon (~04:00 UTC), 12:00 UTC is past sunset in some seasons.
    // Use a timestamp that is definitely during daylight: pick the solarNoon itself.
    const atSolarNoon = computeSolar(noon.solarNoonMs ?? 0, SHANGHAI_LAT, SHANGHAI_LON);
    expect(atSolarNoon.isDaylight).toBe(true);

    const atMidnightLocal = computeSolar(
      (noon.solarNoonMs ?? 0) + 12 * 60 * 60 * 1000, // 12h later = local midnight-ish
      SHANGHAI_LAT,
      SHANGHAI_LON,
    );
    expect(atMidnightLocal.isDaylight).toBe(false);
  });

  it('returns null sunrise/sunset and isDaylight=false in polar night (high latitude, deep winter)', () => {
    // Longyearbyen, Svalbard — no sun from mid-Nov to late-Jan.
    const polarWinter = Date.UTC(2026, 11, 21, 12, 0, 0); // Dec 21
    const s = computeSolar(polarWinter, 78.22, 15.63);
    expect(s.sunriseMs).toBeNull();
    expect(s.sunsetMs).toBeNull();
    expect(s.isDaylight).toBe(false);
  });

  it('isDaylight is false at the stroke of sunrise minus 1ms', () => {
    const s = computeSolar(NOON_UTC_2026_04_24, SHANGHAI_LAT, SHANGHAI_LON);
    const beforeSunrise = computeSolar((s.sunriseMs ?? 0) - 1, SHANGHAI_LAT, SHANGHAI_LON);
    expect(beforeSunrise.isDaylight).toBe(false);
  });

  it('is pure — identical args produce deep-equal outputs', () => {
    const a = computeSolar(NOON_UTC_2026_04_24, SHANGHAI_LAT, SHANGHAI_LON);
    const b = computeSolar(NOON_UTC_2026_04_24, SHANGHAI_LAT, SHANGHAI_LON);
    expect(a).toEqual(b);
  });
});
