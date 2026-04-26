// Phase 23 — Vitality is the meta-resource that gates user actions
// (feed/play/clean) and gacha pulls. It recovers passively over time and
// from positive real-life signals (steps, sleep, workouts).
//
// Pure types only — no RN, no zustand, no clock. The reducer takes wall-clock
// timestamps via VITALITY_TICK events; the store layer owns the clock.

export type VitalitySource =
  | 'manual' // dev "+50" button
  | 'health' // HealthKit-derived (steps_delta / sleep_session)
  | 'inferred' // AppState-derived (idle_no_phone / heavy_phone_use)
  | 'system' // passive tick recovery
  | 'gacha'; // refunds (currently unused; reserved for future)

export type VitalityAction = 'feed' | 'play' | 'clean' | 'rest' | 'gacha_normal' | 'gacha_premium';

export interface VitalityState {
  readonly current: number;
  readonly cap: number;
  readonly recoveryRatePerHour: number;
  readonly lastUpdatedAt: number;
}

export type VitalityEvent =
  | {
      readonly type: 'vitality_recover';
      readonly amount: number;
      readonly source: VitalitySource;
    }
  | {
      readonly type: 'vitality_consume';
      readonly amount: number;
      readonly action: VitalityAction;
    }
  | { readonly type: 'vitality_tick'; readonly now: number };
