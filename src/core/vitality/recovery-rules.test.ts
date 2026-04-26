import fc from 'fast-check';

import type { LifeSignal } from '../signals/types';
import { recoveryFromSignal } from './recovery-rules';

const NOW = 1_000_000;

describe('recoveryFromSignal — steps_delta', () => {
  it('< 1000 → 0', () => {
    expect(
      recoveryFromSignal({ type: 'steps_delta', count: 999, window_minutes: 60, at: NOW }),
    ).toBe(0);
  });
  it('1000 → +10', () => {
    expect(
      recoveryFromSignal({ type: 'steps_delta', count: 1000, window_minutes: 60, at: NOW }),
    ).toBe(10);
  });
  it('5000 → +15', () => {
    expect(
      recoveryFromSignal({ type: 'steps_delta', count: 5500, window_minutes: 60, at: NOW }),
    ).toBe(15);
  });
  it('10000+ → +20', () => {
    expect(
      recoveryFromSignal({ type: 'steps_delta', count: 12000, window_minutes: 60, at: NOW }),
    ).toBe(20);
  });
});

describe('recoveryFromSignal — sleep_session', () => {
  it('7h+ good → +30', () => {
    expect(
      recoveryFromSignal({
        type: 'sleep_session',
        duration_minutes: 7 * 60,
        quality: 'good',
        at: NOW,
      }),
    ).toBe(30);
  });
  it('< 5h → 0 (gentle, no penalty)', () => {
    expect(
      recoveryFromSignal({
        type: 'sleep_session',
        duration_minutes: 4 * 60,
        quality: 'poor',
        at: NOW,
      }),
    ).toBe(0);
  });
  it('7h fair → 0 (only good quality earns the boost)', () => {
    expect(
      recoveryFromSignal({
        type: 'sleep_session',
        duration_minutes: 8 * 60,
        quality: 'fair',
        at: NOW,
      }),
    ).toBe(0);
  });
});

describe('recoveryFromSignal — idle / heavy phone use', () => {
  it('idle 60min+ → +5', () => {
    expect(recoveryFromSignal({ type: 'idle_no_phone', duration_minutes: 60, at: NOW })).toBe(5);
  });
  it('idle < 60min → 0', () => {
    expect(recoveryFromSignal({ type: 'idle_no_phone', duration_minutes: 30, at: NOW })).toBe(0);
  });
  it('heavy phone 90min+ → -3', () => {
    expect(recoveryFromSignal({ type: 'heavy_phone_use', duration_minutes: 120, at: NOW })).toBe(
      -3,
    );
  });
  it('heavy phone < 90min → 0', () => {
    expect(recoveryFromSignal({ type: 'heavy_phone_use', duration_minutes: 60, at: NOW })).toBe(0);
  });
});

describe('recoveryFromSignal — workout / activity / location', () => {
  it('workout (any duration) → +20', () => {
    expect(
      recoveryFromSignal({
        type: 'workout',
        type_detail: 'yoga',
        duration_minutes: 5,
        at: NOW,
      }),
    ).toBe(20);
  });
  it('activity_classified running → +10', () => {
    expect(
      recoveryFromSignal({
        type: 'activity_classified',
        activity: 'running',
        duration_minutes: 30,
        at: NOW,
      }),
    ).toBe(10);
  });
  it('activity_classified walking → 0', () => {
    expect(
      recoveryFromSignal({
        type: 'activity_classified',
        activity: 'walking',
        duration_minutes: 30,
        at: NOW,
      }),
    ).toBe(0);
  });
  it('location_change → 0', () => {
    expect(recoveryFromSignal({ type: 'location_change', new_region: true, at: NOW })).toBe(0);
  });
});

describe('recoveryFromSignal — fast-check', () => {
  const arbSignal = fc.oneof<fc.Arbitrary<LifeSignal>[]>(
    fc.record({
      type: fc.constant('steps_delta' as const),
      count: fc.integer({ min: 0, max: 50000 }),
      window_minutes: fc.constantFrom(60, 360, 1440),
      at: fc.integer({ min: 0, max: 2_000_000_000 }),
    }),
    fc.record({
      type: fc.constant('sleep_session' as const),
      duration_minutes: fc.integer({ min: 0, max: 600 }),
      quality: fc.constantFrom('good' as const, 'fair' as const, 'poor' as const),
      at: fc.integer({ min: 0, max: 2_000_000_000 }),
    }),
    fc.record({
      type: fc.constant('idle_no_phone' as const),
      duration_minutes: fc.integer({ min: 0, max: 600 }),
      at: fc.integer({ min: 0, max: 2_000_000_000 }),
    }),
    fc.record({
      type: fc.constant('heavy_phone_use' as const),
      duration_minutes: fc.integer({ min: 0, max: 600 }),
      at: fc.integer({ min: 0, max: 2_000_000_000 }),
    }),
    fc.record({
      type: fc.constant('workout' as const),
      type_detail: fc.constantFrom('yoga', 'run', 'cycle'),
      duration_minutes: fc.integer({ min: 0, max: 600 }),
      at: fc.integer({ min: 0, max: 2_000_000_000 }),
    }),
    fc.record({
      type: fc.constant('activity_classified' as const),
      activity: fc.constantFrom(
        'stationary' as const,
        'walking' as const,
        'running' as const,
        'cycling' as const,
      ),
      duration_minutes: fc.integer({ min: 0, max: 600 }),
      at: fc.integer({ min: 0, max: 2_000_000_000 }),
    }),
    fc.record({
      type: fc.constant('location_change' as const),
      new_region: fc.boolean(),
      at: fc.integer({ min: 0, max: 2_000_000_000 }),
    }),
  );

  it('always returns a finite integer in [-3, 30]', () => {
    fc.assert(
      fc.property(arbSignal, (signal) => {
        const v = recoveryFromSignal(signal);
        expect(Number.isFinite(v)).toBe(true);
        expect(v).toBeGreaterThanOrEqual(-3);
        expect(v).toBeLessThanOrEqual(30);
      }),
    );
  });

  it('throws on unknown signal kind (defensive assertNever tombstone)', () => {
    expect(() => recoveryFromSignal({ type: 'tornado_landed' } as unknown as LifeSignal)).toThrow(
      /Unreachable/,
    );
  });
});
