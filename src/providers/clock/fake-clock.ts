import type { Clock } from './types';

export interface FakeClock extends Clock {
  advance(ms: number): void;
  setNow(ms: number): void;
}

// CLAUDE.md §6 — no classes. Factory returns a plain object capturing mutable state.
export function createFakeClock(initialMs: number = 0): FakeClock {
  let nowMs = initialMs;
  return {
    now: () => nowMs,
    advance: (ms: number) => {
      if (!Number.isFinite(ms) || ms < 0) {
        throw new Error(`FakeClock.advance requires finite ms ≥ 0, got ${ms}`);
      }
      nowMs += ms;
    },
    setNow: (ms: number) => {
      if (!Number.isFinite(ms)) {
        throw new Error(`FakeClock.setNow requires finite ms, got ${ms}`);
      }
      nowMs = ms;
    },
  };
}
