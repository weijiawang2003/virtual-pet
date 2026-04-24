export type LifeStage = 'egg' | 'baby' | 'child' | 'teen' | 'adult';

export interface Stats {
  readonly satiety: number;
  readonly energy: number;
  readonly happiness: number;
}

export interface Pet {
  readonly stage: LifeStage;
  readonly stats: Stats;
  readonly ageTicks: number;
  readonly bornAt: number;
}

export type Event =
  | { readonly type: 'feed'; readonly nutrition: number }
  | { readonly type: 'play'; readonly minutes: number }
  | { readonly type: 'rest'; readonly minutes: number };
