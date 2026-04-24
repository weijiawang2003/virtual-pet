import type { WeatherCondition, WeatherLite } from './types';

const CONDITIONS: readonly WeatherCondition[] = ['clear', 'cloudy', 'rain', 'clear', 'cloudy'];
const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Deterministic mock weather. Keyed to dayOfYear + lat + lon so:
 *   - tests with fixed inputs are stable,
 *   - different locations yield different conditions.
 *
 * Replaced in Phase 12+ by a WeatherKit-backed provider. The shape stays.
 */
export function mockWeather(lat: number, lon: number, nowMs: number): WeatherLite {
  const dayOfYear = Math.floor(nowMs / MS_PER_DAY) % 365;
  const tempC = 15 + 10 * Math.sin((dayOfYear / 365) * Math.PI * 2);
  const seedMix = Math.floor(Math.abs(lat * 13 + lon * 17)) % CONDITIONS.length;
  const condIdx = (dayOfYear + seedMix) % CONDITIONS.length;
  // Math guarantees condIdx is a valid index; non-null assertion avoids a
  // dead ?? branch that coverage can never reach.
  const condition = CONDITIONS[condIdx]!;
  return {
    tempC: Math.round(tempC * 10) / 10,
    feelsLikeC: Math.round((tempC - 2) * 10) / 10,
    condition,
    humidity: 0.5,
    observedAt: nowMs,
  };
}
