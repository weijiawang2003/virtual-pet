// Real-life signals fed into the pet engine. Phase 22 SignalBus produces
// these from HealthKit / Location / AppState providers; the translator
// turns them into reducer Events.

export type LifeSignal =
  | {
      readonly type: 'steps_delta';
      readonly count: number;
      readonly window_minutes: number;
      readonly at: number;
    }
  | {
      readonly type: 'sleep_session';
      readonly duration_minutes: number;
      readonly quality: 'good' | 'fair' | 'poor';
      readonly at: number;
    }
  | {
      readonly type: 'activity_classified';
      readonly activity: 'stationary' | 'walking' | 'running' | 'cycling';
      readonly duration_minutes: number;
      readonly at: number;
    }
  | { readonly type: 'idle_no_phone'; readonly duration_minutes: number; readonly at: number }
  | {
      readonly type: 'heavy_phone_use';
      readonly duration_minutes: number;
      readonly at: number;
    }
  | {
      readonly type: 'workout';
      readonly type_detail: string;
      readonly duration_minutes: number;
      readonly at: number;
    }
  | { readonly type: 'location_change'; readonly new_region: boolean; readonly at: number };

export type LifeSignalKind = LifeSignal['type'];
