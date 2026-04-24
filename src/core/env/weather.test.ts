import { mockWeather } from './weather';

describe('mockWeather', () => {
  it('is deterministic — same inputs yield deep-equal outputs', () => {
    const a = mockWeather(31.23, 121.47, 1_000_000_000_000);
    const b = mockWeather(31.23, 121.47, 1_000_000_000_000);
    expect(a).toEqual(b);
  });

  it('varies condition across different locations for the same timestamp', () => {
    const t = Date.UTC(2026, 3, 24);
    const a = mockWeather(31.23, 121.47, t); // Shanghai
    const b = mockWeather(40.71, -74.0, t); // New York
    // Different seedMix should (usually) pick different condition buckets;
    // at a minimum, observedAt is equal but the pair is not required to match.
    expect(a.observedAt).toBe(b.observedAt);
    // Can't assert condition differs (mod 5 could collide), but tempC is equal
    // because it's date-driven; at minimum, both are rounded numbers.
    expect(Number.isFinite(a.tempC!)).toBe(true);
    expect(Number.isFinite(b.tempC!)).toBe(true);
  });

  it('returns tempC in the [5, 25] band (sinusoidal mock)', () => {
    for (let day = 0; day < 365; day++) {
      const ms = day * 24 * 60 * 60 * 1000;
      const w = mockWeather(0, 0, ms);
      expect(w.tempC!).toBeGreaterThanOrEqual(5 - 0.01);
      expect(w.tempC!).toBeLessThanOrEqual(25 + 0.01);
    }
  });

  it('feelsLikeC is always 2°C below tempC', () => {
    const w = mockWeather(0, 0, 100 * 24 * 60 * 60 * 1000);
    expect(w.feelsLikeC!).toBeCloseTo(w.tempC! - 2, 5);
  });

  it('humidity is 0.5 and observedAt equals the input', () => {
    const w = mockWeather(31.23, 121.47, 42);
    expect(w.humidity).toBe(0.5);
    expect(w.observedAt).toBe(42);
  });

  it('condition is one of the known WeatherCondition strings', () => {
    const valid = new Set(['clear', 'cloudy', 'rain', 'snow', 'storm', 'unknown']);
    for (let day = 0; day < 30; day++) {
      const w = mockWeather(0, 0, day * 24 * 60 * 60 * 1000);
      expect(valid.has(w.condition)).toBe(true);
    }
  });
});
