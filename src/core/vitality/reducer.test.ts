import {
  createVitality,
  DEFAULT_CAP,
  DEFAULT_RECOVERY_RATE_PER_HOUR,
  canConsume,
  reducer,
} from './reducer';
import type { VitalityEvent } from './types';

const ONE_HOUR = 60 * 60 * 1000;

describe('createVitality', () => {
  it('starts at cap (100), recovery rate 5/h', () => {
    const v = createVitality(0);
    expect(v.current).toBe(DEFAULT_CAP);
    expect(v.cap).toBe(DEFAULT_CAP);
    expect(v.recoveryRatePerHour).toBe(DEFAULT_RECOVERY_RATE_PER_HOUR);
    expect(v.lastUpdatedAt).toBe(0);
  });

  it('records the now arg as lastUpdatedAt', () => {
    expect(createVitality(123).lastUpdatedAt).toBe(123);
  });

  it('defaults now to 0 when omitted', () => {
    expect(createVitality().lastUpdatedAt).toBe(0);
  });
});

describe('canConsume', () => {
  it('true when current >= amount', () => {
    const v = { ...createVitality(0), current: 30 };
    expect(canConsume(v, 30)).toBe(true);
    expect(canConsume(v, 29)).toBe(true);
  });
  it('false when current < amount', () => {
    const v = { ...createVitality(0), current: 30 };
    expect(canConsume(v, 31)).toBe(false);
  });
});

describe('reducer — vitality_recover', () => {
  it('adds amount, clamped at cap', () => {
    const v = { ...createVitality(0), current: 95 };
    const next = reducer(v, { type: 'vitality_recover', amount: 20, source: 'health' });
    expect(next.current).toBe(100);
  });

  it('clamps at 0 for negative amounts', () => {
    const v = { ...createVitality(0), current: 2 };
    const next = reducer(v, { type: 'vitality_recover', amount: -10, source: 'inferred' });
    expect(next.current).toBe(0);
  });

  it('returns same reference when amount is 0 (no-op)', () => {
    const v = createVitality(0);
    const next = reducer(v, { type: 'vitality_recover', amount: 0, source: 'system' });
    expect(next).toBe(v);
  });

  it('NaN amount coerces current to 0 via clamp (defensive)', () => {
    const v = { ...createVitality(0), current: 50 };
    const next = reducer(v, { type: 'vitality_recover', amount: NaN, source: 'system' });
    expect(next.current).toBe(0);
  });

  it('does not mutate input', () => {
    const v = { ...createVitality(0), current: 50 };
    const snap = JSON.stringify(v);
    reducer(v, { type: 'vitality_recover', amount: 10, source: 'health' });
    expect(JSON.stringify(v)).toBe(snap);
  });
});

describe('reducer — vitality_consume', () => {
  it('subtracts amount when sufficient', () => {
    const v = { ...createVitality(0), current: 50 };
    const next = reducer(v, { type: 'vitality_consume', amount: 15, action: 'play' });
    expect(next.current).toBe(35);
  });

  it('returns state unchanged when insufficient', () => {
    const v = { ...createVitality(0), current: 5 };
    const next = reducer(v, { type: 'vitality_consume', amount: 15, action: 'play' });
    expect(next).toBe(v);
  });

  it('NaN amount is rejected as insufficient', () => {
    const v = { ...createVitality(0), current: 50 };
    const next = reducer(v, { type: 'vitality_consume', amount: NaN, action: 'feed' });
    expect(next).toBe(v);
  });
});

describe('reducer — vitality_tick', () => {
  it('recovers 5 over 1h at default rate', () => {
    const v = { ...createVitality(0), current: 50 };
    const next = reducer(v, { type: 'vitality_tick', now: ONE_HOUR });
    expect(next.current).toBe(55);
    expect(next.lastUpdatedAt).toBe(ONE_HOUR);
  });

  it('recovers fractional values for partial hours', () => {
    const v = { ...createVitality(0), current: 50 };
    const next = reducer(v, { type: 'vitality_tick', now: ONE_HOUR / 2 });
    expect(next.current).toBeCloseTo(52.5, 5);
  });

  it('clamps to cap on long sleeps', () => {
    const v = { ...createVitality(0), current: 80 };
    const next = reducer(v, { type: 'vitality_tick', now: 24 * ONE_HOUR });
    expect(next.current).toBe(100);
  });

  it('updates lastUpdatedAt even when elapsed <= 0', () => {
    const v = { ...createVitality(1000), current: 50 };
    const next = reducer(v, { type: 'vitality_tick', now: 500 });
    expect(next.current).toBe(50);
    expect(next.lastUpdatedAt).toBe(500);
  });

  it('zero-elapsed tick is idempotent on current value', () => {
    const v = { ...createVitality(1000), current: 50 };
    const next = reducer(v, { type: 'vitality_tick', now: 1000 });
    expect(next.current).toBe(50);
    expect(next.lastUpdatedAt).toBe(1000);
  });
});

describe('reducer — exhaustiveness', () => {
  it('throws on unknown event discriminant (assertNever tombstone)', () => {
    const v = createVitality(0);
    expect(() => reducer(v, { type: 'explode' } as unknown as VitalityEvent)).toThrow(
      /Unreachable/,
    );
  });
});
