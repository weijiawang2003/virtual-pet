import type { Rarity } from '../vault/types';

export type Pool = 'vitality' | 'essence';

export interface RarityWeights {
  readonly N: number;
  readonly R: number;
  readonly SR: number;
  readonly SSR: number;
}

export interface PoolSpec {
  readonly pool: Pool;
  readonly weights: RarityWeights;
  // Pulls without an SSR before guaranteed SSR. null disables pity (vitality pool).
  readonly pityThreshold: number | null;
  readonly cost: {
    readonly resource: 'vitality' | 'essence';
    readonly amount: number;
  };
}

export interface GachaResult {
  readonly archetypeId: string;
  readonly rarity: Rarity;
  // True when this draw was forced to SSR by pity instead of weighted random.
  readonly isPityHit: boolean;
}
