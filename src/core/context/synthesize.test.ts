import { createPet } from '../pet/reducer';
import { synthesizeContext } from './synthesize';
import type { LifeContextInputs, PermissionsView } from './types';

const H = 60 * 60 * 1000;
const DAY = 24 * H;

const ALL_GRANTED: PermissionsView = Object.freeze({
  health: 'granted',
  location: 'granted',
  notifications: 'granted',
  calendar: 'granted',
  media: 'granted',
});

function baseInputs(overrides: Partial<LifeContextInputs> = {}): LifeContextInputs {
  return {
    pet: createPet(0),
    nowMs: 10 * DAY,
    tzOffsetMs: 0,
    health: { steps: [], sleep: [], hrv: [] },
    location: { current: null, events: [] },
    permissions: ALL_GRANTED,
    ...overrides,
  };
}

describe('synthesizeContext — empty inputs', () => {
  it('returns zeros / nulls for empty health', () => {
    const ctx = synthesizeContext(baseInputs());
    expect(ctx.health).toEqual({ stepsLast24h: 0, avgHrvLast24h: null, lastSleep: null });
  });

  it('returns null current + empty activeRegions', () => {
    const ctx = synthesizeContext(baseInputs());
    expect(ctx.location.current).toBeNull();
    expect(ctx.location.activeRegions).toEqual([]);
  });

  it('weather and solar are null when location.current is null, lunar is always populated', () => {
    const ctx = synthesizeContext(baseInputs());
    expect(ctx.weather).toBeNull();
    expect(ctx.solar).toBeNull();
    expect(ctx.lunar).toEqual(
      expect.objectContaining({
        year: expect.any(Number),
        month: expect.any(Number),
        day: expect.any(Number),
      }),
    );
  });

  it('weather and solar are populated when location.current is present', () => {
    const nowMs = Date.UTC(2026, 3, 24, 12, 0, 0);
    const ctx = synthesizeContext(
      baseInputs({
        nowMs,
        location: {
          current: { lat: 31.23, lon: 121.47, timestampMs: nowMs },
          events: [],
        },
      }),
    );
    expect(ctx.weather).not.toBeNull();
    expect(ctx.solar).not.toBeNull();
    expect(ctx.weather!.observedAt).toBe(nowMs);
    expect(typeof ctx.solar!.moonPhase).toBe('number');
  });

  it('hourOfDay is in [0, 23]', () => {
    const ctx = synthesizeContext(baseInputs({ nowMs: 15 * H, tzOffsetMs: 0 }));
    expect(ctx.hourOfDay).toBeGreaterThanOrEqual(0);
    expect(ctx.hourOfDay).toBeLessThanOrEqual(23);
    expect(ctx.hourOfDay).toBe(15);
  });
});

describe('synthesizeContext — health aggregation', () => {
  it('sums steps strictly within the last 24h window', () => {
    const nowMs = 10 * DAY;
    const ctx = synthesizeContext(
      baseInputs({
        nowMs,
        health: {
          steps: [
            { startAt: nowMs - 25 * H, endAt: nowMs - 25 * H + 100, value: 1000 }, // stale
            { startAt: nowMs - 10 * H, endAt: nowMs - 9 * H, value: 2000 }, // in window
            { startAt: nowMs - 2 * H, endAt: nowMs - H, value: 500 }, // in window
          ],
          sleep: [],
          hrv: [],
        },
      }),
    );
    expect(ctx.health.stepsLast24h).toBe(2500);
  });

  it('averages HRV samples in the 24h window', () => {
    const nowMs = 10 * DAY;
    const ctx = synthesizeContext(
      baseInputs({
        nowMs,
        health: {
          steps: [],
          sleep: [],
          hrv: [
            { startAt: nowMs - 12 * H, endAt: nowMs - 11 * H, sdnnMs: 40 },
            { startAt: nowMs - 6 * H, endAt: nowMs - 5 * H, sdnnMs: 60 },
          ],
        },
      }),
    );
    expect(ctx.health.avgHrvLast24h).toBe(50);
  });

  it('ignores HRV samples outside the 24h window (stale and future)', () => {
    const nowMs = 10 * DAY;
    const ctx = synthesizeContext(
      baseInputs({
        nowMs,
        health: {
          steps: [],
          sleep: [],
          hrv: [
            { startAt: nowMs - 30 * H, endAt: nowMs - 29 * H, sdnnMs: 999 }, // stale (startAt < cutoff)
            { startAt: nowMs - H, endAt: nowMs + H, sdnnMs: 999 }, // future (endAt > nowMs)
            { startAt: nowMs - 6 * H, endAt: nowMs - 5 * H, sdnnMs: 42 }, // in-window
          ],
        },
      }),
    );
    expect(ctx.health.avgHrvLast24h).toBe(42);
  });

  it('picks the most recent sleep sample strictly before nowMs', () => {
    const nowMs = 10 * DAY;
    const ctx = synthesizeContext(
      baseInputs({
        nowMs,
        health: {
          steps: [],
          sleep: [
            { startAt: nowMs - 48 * H, endAt: nowMs - 40 * H, stage: 'deep' },
            { startAt: nowMs - 12 * H, endAt: nowMs - 6 * H, stage: 'rem' },
          ],
          hrv: [],
        },
      }),
    );
    expect(ctx.health.lastSleep?.stage).toBe('rem');
  });

  it('does not replace lastSleep when a later array entry is older', () => {
    // Exercises the short-circuit `sl.endAt > lastSleep.endAt` false branch.
    const nowMs = 10 * DAY;
    const ctx = synthesizeContext(
      baseInputs({
        nowMs,
        health: {
          steps: [],
          sleep: [
            { startAt: nowMs - 10 * H, endAt: nowMs - 5 * H, stage: 'rem' }, // newer (set first)
            { startAt: nowMs - 48 * H, endAt: nowMs - 40 * H, stage: 'deep' }, // older (should NOT replace)
          ],
          hrv: [],
        },
      }),
    );
    expect(ctx.health.lastSleep?.stage).toBe('rem');
  });

  it('ignores sleep samples that end in the future', () => {
    const nowMs = 10 * DAY;
    const ctx = synthesizeContext(
      baseInputs({
        nowMs,
        health: {
          steps: [],
          sleep: [{ startAt: nowMs - H, endAt: nowMs + H, stage: 'light' }],
          hrv: [],
        },
      }),
    );
    expect(ctx.health.lastSleep).toBeNull();
  });
});

describe('synthesizeContext — location activeRegions', () => {
  it('reports a region as active after a lone enter', () => {
    const ctx = synthesizeContext(
      baseInputs({
        location: {
          current: null,
          events: [{ type: 'enter', regionId: 'home', at: 1000 }],
        },
      }),
    );
    expect(ctx.location.activeRegions).toEqual(['home']);
  });

  it('drops a region when a later exit follows an earlier enter', () => {
    const ctx = synthesizeContext(
      baseInputs({
        location: {
          current: null,
          events: [
            { type: 'enter', regionId: 'home', at: 1000 },
            { type: 'exit', regionId: 'home', at: 2000 },
          ],
        },
      }),
    );
    expect(ctx.location.activeRegions).toEqual([]);
  });

  it('handles multiple regions independently', () => {
    const ctx = synthesizeContext(
      baseInputs({
        location: {
          current: null,
          events: [
            { type: 'enter', regionId: 'a', at: 1000 },
            { type: 'enter', regionId: 'b', at: 2000 },
            { type: 'exit', regionId: 'a', at: 3000 },
          ],
        },
      }),
    );
    expect([...ctx.location.activeRegions]).toEqual(['b']);
  });

  it('keeps the latest-at-time event when events arrive out of chronological order', () => {
    // Exercises the `e.at >= prev.at` false branch: later-in-array event
    // arrives with an older timestamp and must NOT clobber the newer one.
    const ctx = synthesizeContext(
      baseInputs({
        location: {
          current: null,
          events: [
            { type: 'enter', regionId: 'home', at: 5000 }, // newer — becomes "prev"
            { type: 'exit', regionId: 'home', at: 1000 }, // older — ignored (prev.at > e.at)
          ],
        },
      }),
    );
    expect(ctx.location.activeRegions).toEqual(['home']);
  });

  it('sorts activeRegions alphabetically for stable output', () => {
    const ctx = synthesizeContext(
      baseInputs({
        location: {
          current: null,
          events: [
            { type: 'enter', regionId: 'zoo', at: 1000 },
            { type: 'enter', regionId: 'alpha', at: 2000 },
            { type: 'enter', regionId: 'mid', at: 3000 },
          ],
        },
      }),
    );
    expect([...ctx.location.activeRegions]).toEqual(['alpha', 'mid', 'zoo']);
  });
});

describe('synthesizeContext — time of day', () => {
  it('applies tz offset to compute hour', () => {
    const nowMs = 0; // 00:00 UTC
    const ctx = synthesizeContext(baseInputs({ nowMs, tzOffsetMs: 8 * H }));
    expect(ctx.hourOfDay).toBe(8);
    expect(ctx.timeOfDay.hour).toBe(8);
  });

  it('exposes dayOfWeek where 0 = Monday, 6 = Sunday', () => {
    // 1970-01-01 00:00 UTC was a Thursday → dayOfWeek = 3.
    const ctx = synthesizeContext(baseInputs({ nowMs: 0, tzOffsetMs: 0 }));
    expect(ctx.timeOfDay.dayOfWeek).toBe(3);
  });
});

describe('synthesizeContext — purity + output shape', () => {
  it('is deterministic: same inputs → deep-equal outputs', () => {
    const inputs = baseInputs({
      nowMs: 10 * DAY,
      health: {
        steps: [{ startAt: 10 * DAY - H, endAt: 10 * DAY, value: 123 }],
        sleep: [],
        hrv: [],
      },
    });
    expect(synthesizeContext(inputs)).toEqual(synthesizeContext(inputs));
  });

  it('output is frozen', () => {
    const ctx = synthesizeContext(baseInputs());
    expect(Object.isFrozen(ctx)).toBe(true);
    expect(Object.isFrozen(ctx.health)).toBe(true);
    expect(Object.isFrozen(ctx.timeOfDay)).toBe(true);
  });
});
