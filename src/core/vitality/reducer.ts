import { assertNever } from '../util/assert-never';
import type { VitalityEvent, VitalityState } from './types';

const ONE_HOUR_MS = 60 * 60 * 1000;
export const DEFAULT_CAP = 100;
export const DEFAULT_RECOVERY_RATE_PER_HOUR = 5;

export function createVitality(now: number = 0): VitalityState {
  return {
    current: DEFAULT_CAP,
    cap: DEFAULT_CAP,
    recoveryRatePerHour: DEFAULT_RECOVERY_RATE_PER_HOUR,
    lastUpdatedAt: now,
  };
}

function clamp(n: number, min: number, max: number): number {
  if (Number.isNaN(n)) return min;
  if (n < min) return min;
  if (n > max) return max;
  return n;
}

export function canConsume(state: VitalityState, amount: number): boolean {
  return state.current >= amount;
}

// Pure reducer. Insufficient `vitality_consume` returns the state unchanged
// (idempotent / no-op) — callers are expected to guard with `canConsume()`
// upstream and surface the rejection in their own UI layer.
export function reducer(state: VitalityState, event: VitalityEvent): VitalityState {
  switch (event.type) {
    case 'vitality_recover': {
      const next = clamp(state.current + event.amount, 0, state.cap);
      if (next === state.current) return state;
      return { ...state, current: next };
    }
    case 'vitality_consume': {
      if (!canConsume(state, event.amount)) return state;
      return { ...state, current: clamp(state.current - event.amount, 0, state.cap) };
    }
    case 'vitality_tick': {
      const elapsed = event.now - state.lastUpdatedAt;
      if (elapsed <= 0) return { ...state, lastUpdatedAt: event.now };
      const recovered = (elapsed / ONE_HOUR_MS) * state.recoveryRatePerHour;
      const next = clamp(state.current + recovered, 0, state.cap);
      return { ...state, current: next, lastUpdatedAt: event.now };
    }
    default:
      return assertNever(event);
  }
}
