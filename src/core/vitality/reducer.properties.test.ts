import fc from 'fast-check';

import { createVitality, reducer } from './reducer';
import type { VitalityAction, VitalitySource } from './types';

const ONE_HOUR = 60 * 60 * 1000;

const arbSource: fc.Arbitrary<VitalitySource> = fc.constantFrom(
  'manual',
  'health',
  'inferred',
  'system',
  'gacha',
);
const arbAction: fc.Arbitrary<VitalityAction> = fc.constantFrom(
  'feed',
  'play',
  'clean',
  'rest',
  'gacha_normal',
  'gacha_premium',
);

const arbEvent = fc.oneof(
  fc.record({
    type: fc.constant('vitality_recover' as const),
    amount: fc.integer({ min: -50, max: 50 }),
    source: arbSource,
  }),
  fc.record({
    type: fc.constant('vitality_consume' as const),
    amount: fc.integer({ min: 0, max: 50 }),
    action: arbAction,
  }),
  fc.record({
    type: fc.constant('vitality_tick' as const),
    now: fc.integer({ min: 0, max: 365 * 24 * ONE_HOUR }),
  }),
);

describe('reducer — fast-check invariants', () => {
  it('current is always in [0, cap] and finite', () => {
    fc.assert(
      fc.property(fc.array(arbEvent, { maxLength: 100 }), (events) => {
        let v = createVitality(0);
        for (const e of events) {
          v = reducer(v, e);
          expect(v.current).toBeGreaterThanOrEqual(0);
          expect(v.current).toBeLessThanOrEqual(v.cap);
          expect(Number.isFinite(v.current)).toBe(true);
        }
      }),
    );
  });

  it('cap and recovery rate are immutable across any event sequence', () => {
    fc.assert(
      fc.property(fc.array(arbEvent, { maxLength: 50 }), (events) => {
        const initial = createVitality(0);
        let v = initial;
        for (const e of events) v = reducer(v, e);
        expect(v.cap).toBe(initial.cap);
        expect(v.recoveryRatePerHour).toBe(initial.recoveryRatePerHour);
      }),
    );
  });

  it('tick events monotonically advance lastUpdatedAt to now', () => {
    fc.assert(
      fc.property(
        fc.array(fc.integer({ min: 0, max: 1_000_000_000 }), { minLength: 1, maxLength: 30 }),
        (timestamps) => {
          let v = createVitality(0);
          for (const t of timestamps) {
            v = reducer(v, { type: 'vitality_tick', now: t });
            expect(v.lastUpdatedAt).toBe(t);
          }
        },
      ),
    );
  });
});

describe('24-hour passive-recovery snapshot', () => {
  it('from 0, recovers to ~120 over 24h, clamped at 100', () => {
    let v = { ...createVitality(0), current: 0 };
    // tick once per simulated hour
    for (let h = 1; h <= 24; h++) {
      v = reducer(v, { type: 'vitality_tick', now: h * ONE_HOUR });
    }
    expect(v.current).toBe(100);
  });

  it('from 50, reaches cap by hour 10 (5/h × 10 = 50 added)', () => {
    let v = { ...createVitality(0), current: 50 };
    for (let h = 1; h <= 10; h++) {
      v = reducer(v, { type: 'vitality_tick', now: h * ONE_HOUR });
    }
    expect(v.current).toBe(100);
  });

  it('one consume → tick recovers it back', () => {
    let v = createVitality(0);
    v = reducer(v, { type: 'vitality_consume', amount: 15, action: 'play' });
    expect(v.current).toBe(85);
    v = reducer(v, { type: 'vitality_tick', now: 3 * ONE_HOUR });
    expect(v.current).toBe(100);
  });
});
