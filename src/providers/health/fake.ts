import type { Disposer, HealthKitProvider, HRVSample, SleepSample, StepsSample } from './types';

export interface FakeHealthKitSeed {
  readonly steps?: readonly StepsSample[];
  readonly sleep?: readonly SleepSample[];
  readonly hrv?: readonly HRVSample[];
}

export interface FakeHealthKitProvider extends HealthKitProvider {
  emit(metric: 'steps', s: StepsSample): void;
  emit(metric: 'sleep', s: SleepSample): void;
  emit(metric: 'hrv', s: HRVSample): void;
  inject(seed: FakeHealthKitSeed): void;
  reset(): void;
}

function withinWindow<T extends { startAt: number; endAt: number }>(
  arr: readonly T[],
  fromMs: number,
  toMs: number,
): T[] {
  return arr
    .filter((s) => s.startAt >= fromMs && s.endAt <= toMs)
    .sort((a, b) => a.startAt - b.startAt);
}

export function createFakeHealthKitProvider(seed: FakeHealthKitSeed = {}): FakeHealthKitProvider {
  let steps: StepsSample[] = [...(seed.steps ?? [])];
  let sleep: SleepSample[] = [...(seed.sleep ?? [])];
  let hrv: HRVSample[] = [...(seed.hrv ?? [])];

  const stepSubs = new Set<(s: StepsSample) => void>();
  const sleepSubs = new Set<(s: SleepSample) => void>();
  const hrvSubs = new Set<(s: HRVSample) => void>();

  function subscribe(metric: 'steps', cb: (s: StepsSample) => void): Disposer;
  function subscribe(metric: 'sleep', cb: (s: SleepSample) => void): Disposer;
  function subscribe(metric: 'hrv', cb: (s: HRVSample) => void): Disposer;
  function subscribe(metric: 'steps' | 'sleep' | 'hrv', cb: (s: never) => void): Disposer {
    if (metric === 'steps') {
      stepSubs.add(cb as (s: StepsSample) => void);
      return () => stepSubs.delete(cb as (s: StepsSample) => void);
    }
    if (metric === 'sleep') {
      sleepSubs.add(cb as (s: SleepSample) => void);
      return () => sleepSubs.delete(cb as (s: SleepSample) => void);
    }
    hrvSubs.add(cb as (s: HRVSample) => void);
    return () => hrvSubs.delete(cb as (s: HRVSample) => void);
  }

  function emit(metric: 'steps', s: StepsSample): void;
  function emit(metric: 'sleep', s: SleepSample): void;
  function emit(metric: 'hrv', s: HRVSample): void;
  function emit(metric: 'steps' | 'sleep' | 'hrv', s: StepsSample | SleepSample | HRVSample): void {
    if (metric === 'steps') {
      steps = [...steps, s as StepsSample];
      for (const cb of stepSubs) cb(s as StepsSample);
    } else if (metric === 'sleep') {
      sleep = [...sleep, s as SleepSample];
      for (const cb of sleepSubs) cb(s as SleepSample);
    } else {
      hrv = [...hrv, s as HRVSample];
      for (const cb of hrvSubs) cb(s as HRVSample);
    }
  }

  return {
    getSteps: (from, to) => Promise.resolve(Object.freeze(withinWindow(steps, from, to))),
    getSleep: (from, to) => Promise.resolve(Object.freeze(withinWindow(sleep, from, to))),
    getHRV: (from, to) => Promise.resolve(Object.freeze(withinWindow(hrv, from, to))),
    subscribe,
    emit,
    inject: (next) => {
      if (next.steps !== undefined) steps = [...steps, ...next.steps];
      if (next.sleep !== undefined) sleep = [...sleep, ...next.sleep];
      if (next.hrv !== undefined) hrv = [...hrv, ...next.hrv];
    },
    reset: () => {
      steps = [];
      sleep = [];
      hrv = [];
      stepSubs.clear();
      sleepSubs.clear();
      hrvSubs.clear();
    },
  };
}
