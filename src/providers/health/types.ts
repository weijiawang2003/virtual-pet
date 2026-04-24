export interface StepsSample {
  readonly startAt: number;
  readonly endAt: number;
  readonly value: number;
  readonly source?: string;
}

export type SleepStage = 'awake' | 'light' | 'deep' | 'rem';

export interface SleepSample {
  readonly startAt: number;
  readonly endAt: number;
  readonly stage: SleepStage;
  readonly source?: string;
}

export interface HRVSample {
  readonly startAt: number;
  readonly endAt: number;
  readonly sdnnMs: number;
  readonly source?: string;
}

export type HealthSample = StepsSample | SleepSample | HRVSample;

export type HealthMetric = 'steps' | 'sleep' | 'hrv';

export type Disposer = () => void;

export interface HealthKitProvider {
  getSteps(fromMs: number, toMs: number): Promise<readonly StepsSample[]>;
  getSleep(fromMs: number, toMs: number): Promise<readonly SleepSample[]>;
  getHRV(fromMs: number, toMs: number): Promise<readonly HRVSample[]>;
  subscribe(metric: 'steps', cb: (s: StepsSample) => void): Disposer;
  subscribe(metric: 'sleep', cb: (s: SleepSample) => void): Disposer;
  subscribe(metric: 'hrv', cb: (s: HRVSample) => void): Disposer;
}
