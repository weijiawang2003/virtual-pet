import { computeLunar } from '../env/lunar';
import { computeSolar } from '../env/solar';
import { mockWeather } from '../env/weather';
import type {
  GeofenceEventView,
  HealthInputs,
  HealthSummary,
  LifeContext,
  LifeContextInputs,
  LocationInputs,
  LocationSummary,
  SleepSampleView,
  TimeOfDay,
} from './types';

const MS_PER_HOUR = 60 * 60 * 1000;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

function summarizeHealth(health: HealthInputs, nowMs: number): HealthSummary {
  const cutoff = nowMs - MS_PER_DAY;

  let stepsLast24h = 0;
  for (const s of health.steps) {
    if (s.endAt <= nowMs && s.startAt >= cutoff) stepsLast24h += s.value;
  }

  let hrvSum = 0;
  let hrvCount = 0;
  for (const h of health.hrv) {
    if (h.endAt <= nowMs && h.startAt >= cutoff) {
      hrvSum += h.sdnnMs;
      hrvCount += 1;
    }
  }
  const avgHrvLast24h = hrvCount === 0 ? null : hrvSum / hrvCount;

  let lastSleep: SleepSampleView | null = null;
  for (const sl of health.sleep) {
    if (sl.endAt <= nowMs) {
      if (lastSleep === null || sl.endAt > lastSleep.endAt) lastSleep = sl;
    }
  }

  return { stepsLast24h, avgHrvLast24h, lastSleep };
}

function summarizeLocation(location: LocationInputs): LocationSummary {
  // Derive "active regions" from the event stream: a region is active iff its
  // most recent event is 'enter'. Single-pass, last-event-wins.
  const lastEventByRegion = new Map<string, GeofenceEventView>();
  for (const e of location.events) {
    const prev = lastEventByRegion.get(e.regionId);
    if (prev === undefined || e.at >= prev.at) lastEventByRegion.set(e.regionId, e);
  }

  const active: string[] = [];
  for (const [regionId, ev] of lastEventByRegion) {
    if (ev.type === 'enter') active.push(regionId);
  }
  active.sort();

  return {
    current: location.current,
    activeRegions: Object.freeze(active),
  };
}

function computeTimeOfDay(nowMs: number, tzOffsetMs: number): TimeOfDay {
  const localMs = nowMs + tzOffsetMs;
  const hour = Math.floor(localMs / MS_PER_HOUR) % 24;
  const normalizedHour = ((hour % 24) + 24) % 24;
  // Day of week: JS Date.getUTCDay is 0 = Sunday. We want 0 = Monday, 6 = Sunday
  // for easier "weekend" logic later. Do the transform manually without Date.
  const daysSinceEpoch = Math.floor(localMs / MS_PER_DAY);
  // 1970-01-01 was a Thursday → dayOfWeek index 3 in Mon=0 space.
  const dayOfWeek = (((daysSinceEpoch + 3) % 7) + 7) % 7;
  return { hour: normalizedHour, dayOfWeek };
}

export function synthesizeContext(inputs: LifeContextInputs): LifeContext {
  const time = computeTimeOfDay(inputs.nowMs, inputs.tzOffsetMs);
  const coord = inputs.location.current;
  const solar = coord !== null ? computeSolar(inputs.nowMs, coord.lat, coord.lon) : null;
  const weather = coord !== null ? mockWeather(coord.lat, coord.lon, inputs.nowMs) : null;
  const lunar = computeLunar(inputs.nowMs);
  return Object.freeze({
    pet: inputs.pet,
    nowMs: inputs.nowMs,
    timeOfDay: Object.freeze(time),
    hourOfDay: time.hour,
    health: Object.freeze(summarizeHealth(inputs.health, inputs.nowMs)),
    location: summarizeLocation(inputs.location),
    permissions: inputs.permissions,
    weather,
    lunar,
    solar,
  });
}
