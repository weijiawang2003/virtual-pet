import SunCalc from 'suncalc';
import type { SolarInfo } from './types';

// SunCalc's types guarantee Date (never undefined) — we only need to detect
// Invalid Date (NaN timestamp), which happens at high latitudes in polar night/day.
function safeMs(d: Date): number | null {
  const t = d.getTime();
  return Number.isNaN(t) ? null : t;
}

export function computeSolar(date: Date | number, lat: number, lon: number): SolarInfo {
  const d = typeof date === 'number' ? new Date(date) : date;
  const t = SunCalc.getTimes(d, lat, lon);
  const m = SunCalc.getMoonIllumination(d);
  const nowMs = d.getTime();

  const sunriseMs = safeMs(t.sunrise);
  const sunsetMs = safeMs(t.sunset);
  const solarNoonMs = safeMs(t.solarNoon);
  const isDaylight =
    sunriseMs !== null && sunsetMs !== null && nowMs >= sunriseMs && nowMs <= sunsetMs;

  return {
    sunriseMs,
    sunsetMs,
    solarNoonMs,
    moonPhase: m.phase,
    moonIllumination: m.fraction,
    isDaylight,
  };
}
