export type LifeStage = 'egg' | 'baby' | 'child' | 'teen' | 'adult';

export interface Stats {
  readonly satiety: number;
  readonly energy: number;
  readonly happiness: number;
}

export interface Pet {
  readonly stage: LifeStage;
  readonly stats: Stats;
  readonly ageMs: number;
  readonly bornAt: number;
  // Phase 21 — set by `bond_gain` events; drained by Phase 23 Vitality.
  readonly pendingBondGain?: number;
  // Phase 21 — set by `curiosity_hint` events when location enters a new
  // region. Phase 22+ bubble logic can read this to surface curiosity copy.
  readonly curiosityHintUntil?: number;
}

// Provenance tag on every Event so the reducer + tests can distinguish a
// user button-press from a health-derived dispatch from a system tick. Phase
// 22's SignalBus stamps 'health' / 'inferred'; Phase 21 stamps 'manual' /
// 'system' on existing dispatch sites.
export type PetEventSource = 'manual' | 'health' | 'inferred' | 'system';

export type Event =
  | { readonly type: 'feed'; readonly nutrition: number; readonly source: PetEventSource }
  | { readonly type: 'play'; readonly minutes: number; readonly source: PetEventSource }
  | { readonly type: 'rest'; readonly minutes: number; readonly source: PetEventSource }
  | { readonly type: 'tick'; readonly elapsedMs: number; readonly source: PetEventSource }
  // Phase 21 — translator output for negative real-life signals (e.g. short
  // sleep). Per-stat deltas; reducer clamps to [0, 100].
  | {
      readonly type: 'mood_adjust';
      readonly happiness?: number;
      readonly energy?: number;
      readonly satiety?: number;
      readonly source: PetEventSource;
    }
  // Phase 21 — accumulator for Phase 23 Vitality bond pool. Reducer adds
  // to Pet.pendingBondGain; Phase 23 reads + zeroes.
  | { readonly type: 'bond_gain'; readonly amount: number; readonly source: PetEventSource }
  // Phase 21 — wall-clock instant until which the pet is "curious about
  // a new place". Reducer takes max with existing window.
  | { readonly type: 'curiosity_hint'; readonly until: number; readonly source: PetEventSource };
