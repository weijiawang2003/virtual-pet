import type { Pet } from '../pet/types';
import type { PermissionsView } from '../nudge/types';

export type { PermissionsView };

// Core-local structural projections of provider types. These let core/context
// consume provider outputs via TS structural compat without importing from
// providers/** (CLAUDE.md §4).
export interface StepsSampleView {
  readonly startAt: number;
  readonly endAt: number;
  readonly value: number;
}

export type SleepStageView = 'awake' | 'light' | 'deep' | 'rem';

export interface SleepSampleView {
  readonly startAt: number;
  readonly endAt: number;
  readonly stage: SleepStageView;
}

export interface HRVSampleView {
  readonly startAt: number;
  readonly endAt: number;
  readonly sdnnMs: number;
}

export interface CoordView {
  readonly lat: number;
  readonly lon: number;
  readonly accuracyMeters?: number;
  readonly timestampMs: number;
}

export interface GeofenceEventView {
  readonly type: 'enter' | 'exit';
  readonly regionId: string;
  readonly at: number;
}

export interface HealthInputs {
  readonly steps: readonly StepsSampleView[];
  readonly sleep: readonly SleepSampleView[];
  readonly hrv: readonly HRVSampleView[];
}

export interface LocationInputs {
  readonly current: CoordView | null;
  readonly events: readonly GeofenceEventView[];
}

export interface LifeContextInputs {
  readonly pet: Pet;
  readonly nowMs: number;
  readonly tzOffsetMs: number;
  readonly health: HealthInputs;
  readonly location: LocationInputs;
  readonly permissions: PermissionsView;
}

export interface HealthSummary {
  readonly stepsLast24h: number;
  readonly avgHrvLast24h: number | null;
  readonly lastSleep: SleepSampleView | null;
}

export interface LocationSummary {
  readonly current: CoordView | null;
  readonly activeRegions: readonly string[];
}

export interface TimeOfDay {
  readonly hour: number;
  readonly dayOfWeek: number;
}

export interface LifeContext {
  readonly pet: Pet;
  readonly nowMs: number;
  readonly timeOfDay: TimeOfDay;
  readonly hourOfDay: number;
  readonly health: HealthSummary;
  readonly location: LocationSummary;
  readonly permissions: PermissionsView;
  readonly weather: null;
  readonly lunar: null;
}
