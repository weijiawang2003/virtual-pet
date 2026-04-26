import fc from 'fast-check';

import { createPet } from '../pet/reducer';
import type { Event } from '../pet/types';
import { translateSignal } from './translator';
import type { LifeSignal } from './types';

const PET = createPet(0);
const NOW = 1_000_000_000;

describe('translateSignal — steps_delta', () => {
  it('< 5000 → no events', () => {
    const out = translateSignal(
      { type: 'steps_delta', count: 4999, window_minutes: 60, at: NOW },
      PET,
    );
    expect(out).toEqual([]);
  });

  it('5000+ → play(10, health)', () => {
    const out = translateSignal(
      { type: 'steps_delta', count: 5000, window_minutes: 60, at: NOW },
      PET,
    );
    expect(out).toEqual([{ type: 'play', minutes: 10, source: 'health' }]);
  });

  it('10000+ → play(20) + feed(5), both health', () => {
    const out = translateSignal(
      { type: 'steps_delta', count: 10500, window_minutes: 360, at: NOW },
      PET,
    );
    expect(out).toEqual([
      { type: 'play', minutes: 20, source: 'health' },
      { type: 'feed', nutrition: 5, source: 'health' },
    ]);
  });
});

describe('translateSignal — sleep_session', () => {
  it('7h+ good → rest(60, health)', () => {
    const out = translateSignal(
      { type: 'sleep_session', duration_minutes: 7 * 60, quality: 'good', at: NOW },
      PET,
    );
    expect(out).toEqual([{ type: 'rest', minutes: 60, source: 'health' }]);
  });

  it('7h+ but quality fair → no events (quality matters)', () => {
    const out = translateSignal(
      { type: 'sleep_session', duration_minutes: 8 * 60, quality: 'fair', at: NOW },
      PET,
    );
    expect(out).toEqual([]);
  });

  it('< 5h → mood_adjust(happiness -10, health)', () => {
    const out = translateSignal(
      { type: 'sleep_session', duration_minutes: 4 * 60, quality: 'poor', at: NOW },
      PET,
    );
    expect(out).toEqual([{ type: 'mood_adjust', happiness: -10, source: 'health' }]);
  });

  it('5h–7h → no events (mid-band)', () => {
    const out = translateSignal(
      { type: 'sleep_session', duration_minutes: 6 * 60, quality: 'good', at: NOW },
      PET,
    );
    expect(out).toEqual([]);
  });
});

describe('translateSignal — activity_classified', () => {
  it('running → play(20) + feed(5)', () => {
    const out = translateSignal(
      {
        type: 'activity_classified',
        activity: 'running',
        duration_minutes: 30,
        at: NOW,
      },
      PET,
    );
    expect(out).toEqual([
      { type: 'play', minutes: 20, source: 'health' },
      { type: 'feed', nutrition: 5, source: 'health' },
    ]);
  });

  it('cycling → play(20) + feed(5)', () => {
    const out = translateSignal(
      {
        type: 'activity_classified',
        activity: 'cycling',
        duration_minutes: 45,
        at: NOW,
      },
      PET,
    );
    expect(out).toEqual([
      { type: 'play', minutes: 20, source: 'health' },
      { type: 'feed', nutrition: 5, source: 'health' },
    ]);
  });

  it('stationary → no events', () => {
    const out = translateSignal(
      {
        type: 'activity_classified',
        activity: 'stationary',
        duration_minutes: 120,
        at: NOW,
      },
      PET,
    );
    expect(out).toEqual([]);
  });

  it('walking → no events (walking is captured by steps_delta)', () => {
    const out = translateSignal(
      {
        type: 'activity_classified',
        activity: 'walking',
        duration_minutes: 30,
        at: NOW,
      },
      PET,
    );
    expect(out).toEqual([]);
  });
});

describe('translateSignal — idle_no_phone', () => {
  it('60min+ → rest(30, inferred)', () => {
    const out = translateSignal({ type: 'idle_no_phone', duration_minutes: 60, at: NOW }, PET);
    expect(out).toEqual([{ type: 'rest', minutes: 30, source: 'inferred' }]);
  });

  it('< 60min → no events', () => {
    const out = translateSignal({ type: 'idle_no_phone', duration_minutes: 59, at: NOW }, PET);
    expect(out).toEqual([]);
  });
});

describe('translateSignal — heavy_phone_use', () => {
  it('90min+ → mood_adjust(happiness -5, inferred)', () => {
    const out = translateSignal({ type: 'heavy_phone_use', duration_minutes: 100, at: NOW }, PET);
    expect(out).toEqual([{ type: 'mood_adjust', happiness: -5, source: 'inferred' }]);
  });

  it('< 90min → no events', () => {
    const out = translateSignal({ type: 'heavy_phone_use', duration_minutes: 60, at: NOW }, PET);
    expect(out).toEqual([]);
  });
});

describe('translateSignal — workout', () => {
  it('30min workout → bond_gain(15, health)', () => {
    const out = translateSignal(
      { type: 'workout', type_detail: 'strength', duration_minutes: 30, at: NOW },
      PET,
    );
    expect(out).toEqual([{ type: 'bond_gain', amount: 15, source: 'health' }]);
  });

  it('any nonzero workout grants at least 1 bond', () => {
    const out = translateSignal(
      { type: 'workout', type_detail: 'stretch', duration_minutes: 1, at: NOW },
      PET,
    );
    expect(out).toEqual([{ type: 'bond_gain', amount: 1, source: 'health' }]);
  });
});

describe('translateSignal — location_change', () => {
  it('new_region true → curiosity_hint(at + 6h, inferred)', () => {
    const out = translateSignal({ type: 'location_change', new_region: true, at: NOW }, PET);
    expect(out).toEqual([
      {
        type: 'curiosity_hint',
        until: NOW + 6 * 60 * 60 * 1000,
        source: 'inferred',
      },
    ]);
  });

  it('new_region false → no events', () => {
    const out = translateSignal({ type: 'location_change', new_region: false, at: NOW }, PET);
    expect(out).toEqual([]);
  });
});

describe('translateSignal — source classification', () => {
  function getSources(signals: readonly LifeSignal[]): readonly string[] {
    return signals.flatMap((s) => translateSignal(s, PET).map((e: Event) => e.source));
  }

  it('HealthKit-shaped signals all stamp source=health', () => {
    const sources = getSources([
      { type: 'steps_delta', count: 12000, window_minutes: 60, at: NOW },
      { type: 'sleep_session', duration_minutes: 7 * 60, quality: 'good', at: NOW },
      { type: 'activity_classified', activity: 'running', duration_minutes: 30, at: NOW },
      { type: 'workout', type_detail: 'yoga', duration_minutes: 20, at: NOW },
    ]);
    expect(sources.every((s) => s === 'health')).toBe(true);
  });

  it('AppState/Location signals stamp source=inferred', () => {
    const sources = getSources([
      { type: 'idle_no_phone', duration_minutes: 90, at: NOW },
      { type: 'heavy_phone_use', duration_minutes: 120, at: NOW },
      { type: 'location_change', new_region: true, at: NOW },
    ]);
    expect(sources.every((s) => s === 'inferred')).toBe(true);
  });
});

describe('translateSignal — properties (fast-check)', () => {
  const arbSignal: fc.Arbitrary<LifeSignal> = fc.oneof(
    fc.record({
      type: fc.constant('steps_delta' as const),
      count: fc.integer({ min: 0, max: 50000 }),
      window_minutes: fc.integer({ min: 1, max: 1440 }),
      at: fc.integer({ min: 0, max: 2_000_000_000 }),
    }),
    fc.record({
      type: fc.constant('sleep_session' as const),
      duration_minutes: fc.integer({ min: 0, max: 12 * 60 }),
      quality: fc.constantFrom('good', 'fair', 'poor') as fc.Arbitrary<'good' | 'fair' | 'poor'>,
      at: fc.integer({ min: 0, max: 2_000_000_000 }),
    }),
    fc.record({
      type: fc.constant('activity_classified' as const),
      activity: fc.constantFrom('stationary', 'walking', 'running', 'cycling') as fc.Arbitrary<
        'stationary' | 'walking' | 'running' | 'cycling'
      >,
      duration_minutes: fc.integer({ min: 0, max: 240 }),
      at: fc.integer({ min: 0, max: 2_000_000_000 }),
    }),
    fc.record({
      type: fc.constant('idle_no_phone' as const),
      duration_minutes: fc.integer({ min: 0, max: 720 }),
      at: fc.integer({ min: 0, max: 2_000_000_000 }),
    }),
    fc.record({
      type: fc.constant('heavy_phone_use' as const),
      duration_minutes: fc.integer({ min: 0, max: 720 }),
      at: fc.integer({ min: 0, max: 2_000_000_000 }),
    }),
    fc.record({
      type: fc.constant('workout' as const),
      type_detail: fc.string({ minLength: 1, maxLength: 16 }),
      duration_minutes: fc.integer({ min: 1, max: 240 }),
      at: fc.integer({ min: 0, max: 2_000_000_000 }),
    }),
    fc.record({
      type: fc.constant('location_change' as const),
      new_region: fc.boolean(),
      at: fc.integer({ min: 0, max: 2_000_000_000 }),
    }),
  );

  it('never throws and always returns an array', () => {
    fc.assert(
      fc.property(arbSignal, (signal) => {
        const out = translateSignal(signal, PET);
        expect(Array.isArray(out)).toBe(true);
      }),
    );
  });

  it('every emitted event has a source ∈ the legal four', () => {
    const legal = new Set(['manual', 'health', 'inferred', 'system']);
    fc.assert(
      fc.property(arbSignal, (signal) => {
        const out = translateSignal(signal, PET);
        for (const e of out) {
          expect(legal.has(e.source)).toBe(true);
        }
      }),
    );
  });
});
