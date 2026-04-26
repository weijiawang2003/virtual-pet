import {
  queryCategorySamples,
  queryQuantitySamples,
  queryWorkoutSamples,
  requestAuthorization,
  subscribeToChanges,
} from '@kingstinct/react-native-healthkit';

import type { Disposer, HealthKitProvider, HRVSample, SleepSample, StepsSample } from './types';

const STEP_ID = 'HKQuantityTypeIdentifierStepCount' as const;
const HRV_ID = 'HKQuantityTypeIdentifierHeartRateVariabilitySDNN' as const;
const SLEEP_ID = 'HKCategoryTypeIdentifierSleepAnalysis' as const;
const WORKOUT_ID = 'HKWorkoutTypeIdentifier' as const;

const READ_PERMISSIONS = [STEP_ID, HRV_ID, SLEEP_ID, WORKOUT_ID] as const;

interface QuantitySample {
  readonly startDate: string | Date;
  readonly endDate: string | Date;
  readonly quantity: number;
  readonly sourceRevision?: { readonly source?: { readonly name?: string } };
}

interface CategorySample {
  readonly startDate: string | Date;
  readonly endDate: string | Date;
  readonly value: number; // CategoryValueSleepAnalysis: 0=InBed, 1=Asleep, 2=Awake, 3-5 staged
}

function toMs(d: string | Date): number {
  return typeof d === 'string' ? Date.parse(d) : d.getTime();
}

function toStepsSample(s: QuantitySample): StepsSample {
  const sample: StepsSample = {
    startAt: toMs(s.startDate),
    endAt: toMs(s.endDate),
    value: s.quantity,
  };
  const src = s.sourceRevision?.source?.name;
  return src !== undefined ? { ...sample, source: src } : sample;
}

function toHrvSample(s: QuantitySample): HRVSample {
  const sample: HRVSample = {
    startAt: toMs(s.startDate),
    endAt: toMs(s.endDate),
    sdnnMs: s.quantity,
  };
  const src = s.sourceRevision?.source?.name;
  return src !== undefined ? { ...sample, source: src } : sample;
}

function toSleepStage(value: number): SleepSample['stage'] {
  // CategoryValueSleepAnalysis: 0 = InBed, 1 = Asleep (legacy),
  // 3 = AsleepCore, 4 = AsleepDeep, 5 = AsleepREM, 2 = Awake.
  if (value === 4) return 'deep';
  if (value === 5) return 'rem';
  if (value === 3 || value === 1) return 'light';
  return 'awake';
}

function toSleepSample(s: CategorySample): SleepSample {
  return {
    startAt: toMs(s.startDate),
    endAt: toMs(s.endDate),
    stage: toSleepStage(s.value),
  };
}

// Type-erase generic HK query options to avoid spreading the Nitro generics
// across the module surface. The actual HealthKit calls accept the exact
// shape; we only need from / to / unit.
async function queryStepsRaw(fromMs: number, toMs_: number): Promise<readonly QuantitySample[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- HK query option generics intentionally erased
  const result = await (queryQuantitySamples as any)(STEP_ID, {
    from: new Date(fromMs),
    to: new Date(toMs_),
    unit: 'count',
  });
  return (result as readonly QuantitySample[]) ?? [];
}

async function queryHrvRaw(fromMs: number, toMs_: number): Promise<readonly QuantitySample[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- HK query option generics intentionally erased
  const result = await (queryQuantitySamples as any)(HRV_ID, {
    from: new Date(fromMs),
    to: new Date(toMs_),
    unit: 'ms',
  });
  return (result as readonly QuantitySample[]) ?? [];
}

async function querySleepRaw(fromMs: number, toMs_: number): Promise<readonly CategorySample[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- HK query option generics intentionally erased
  const result = await (queryCategorySamples as any)(SLEEP_ID, {
    from: new Date(fromMs),
    to: new Date(toMs_),
  });
  return (result as readonly CategorySample[]) ?? [];
}

export interface RealHealthKitProvider extends HealthKitProvider {
  requestPermissionsAsync(): Promise<boolean>;
}

// Real iOS HealthKit provider. Wraps @kingstinct/react-native-healthkit.
// Unauthorized queries return [] gracefully (HealthKit silently denies
// rather than throwing). subscribe() registers an observer; the callback
// fires when HealthKit reports new data — caller is expected to re-query
// to fetch the new samples.
export function createRealHealthKitProvider(): RealHealthKitProvider {
  return {
    async requestPermissionsAsync(): Promise<boolean> {
      try {
        await requestAuthorization({ toRead: READ_PERMISSIONS, toShare: [] });
        return true;
      } catch {
        return false;
      }
    },

    async getSteps(fromMs, toMs_): Promise<readonly StepsSample[]> {
      const raw = await queryStepsRaw(fromMs, toMs_);
      return Object.freeze(raw.map(toStepsSample));
    },

    async getSleep(fromMs, toMs_): Promise<readonly SleepSample[]> {
      const raw = await querySleepRaw(fromMs, toMs_);
      return Object.freeze(raw.map(toSleepSample));
    },

    async getHRV(fromMs, toMs_): Promise<readonly HRVSample[]> {
      const raw = await queryHrvRaw(fromMs, toMs_);
      return Object.freeze(raw.map(toHrvSample));
    },

    subscribe(metric, cb): Disposer {
      // subscribeToChanges takes an array of types and a single callback.
      // We register one subscription per metric so the typed cb shape is
      // preserved upstream.
      const idMap = {
        steps: STEP_ID,
        sleep: SLEEP_ID,
        hrv: HRV_ID,
      } as const;
      const id = idMap[metric];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- subscribeToChanges signature is loose; we proxy raw events
      const sub = (subscribeToChanges as any)([id], () => {
        // The HK API doesn't push the new sample; consumers re-query. We
        // surface a lightweight "something changed" by emitting a synthetic
        // sample at "now" with value 0 — Phase 22's health-signal-source
        // ignores this and queries the provider directly.
        const now = Date.now();
        if (metric === 'steps') {
          (cb as (s: StepsSample) => void)({ startAt: now, endAt: now, value: 0 });
        } else if (metric === 'sleep') {
          (cb as (s: SleepSample) => void)({
            startAt: now,
            endAt: now,
            stage: 'awake',
          });
        } else {
          (cb as (s: HRVSample) => void)({ startAt: now, endAt: now, sdnnMs: 0 });
        }
      });
      return () => {
        // subscribeToChanges returns { remove: () => void } per the @kingstinct API
        if (typeof sub?.remove === 'function') sub.remove();
      };
    },
  };
}

// Singleton used by runtime-providers in non-test environments.
export const realHealthKitProvider: RealHealthKitProvider = createRealHealthKitProvider();

// Internal exports for testing — allows asserting payload shape from a
// mocked @kingstinct module.
export const __test__ = {
  STEP_ID,
  HRV_ID,
  SLEEP_ID,
  WORKOUT_ID,
  READ_PERMISSIONS,
  toStepsSample,
  toHrvSample,
  toSleepSample,
  toSleepStage,
} as const;

export { queryWorkoutSamples };
