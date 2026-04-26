// Phase 24 — Vault holds every pet the user has ever acquired (gacha pulls,
// seeded starters, etc.). One pet at a time is "active" and lives in the
// existing pet snapshot store; the rest sit in the vault and decay slowly.

import type { Pet } from '../pet/types';

export type Element = 'grass' | 'water' | 'fire' | 'crystal' | 'moon' | 'shadow' | 'gold' | 'void';

export type Rarity = 'N' | 'R' | 'SR' | 'SSR';

export type PersonalityTag =
  | 'gluttonous'
  | 'sleepy'
  | 'clingy'
  | 'lonely'
  | 'curious'
  | 'lazy'
  | 'energetic'
  | 'shy';

export interface DecayModifiers {
  readonly satiety?: number;
  readonly energy?: number;
  readonly happiness?: number;
}

// Static species data. Read by gacha (Phase 25) and rendered in vault cards.
export interface SpeciesArchetype {
  readonly id: string;
  readonly displayName: { readonly zhCN: string; readonly en: string };
  readonly element: Element;
  readonly baseRarity: Rarity;
  readonly decayModifiers?: DecayModifiers;
  // Tags drawn (with sampling) when this archetype is acquired. Phase 24
  // stores a static bias list; the gacha layer does the actual sampling.
  readonly personalityBias: readonly PersonalityTag[];
}

// One concrete pet instance owned by the user. Phase 25 gacha produces
// these via ACQUIRE_PET. The `pet` field is the live core Pet (stats etc).
export interface VaultedPet {
  readonly id: string;
  readonly archetypeId: string;
  readonly element: Element;
  readonly rarity: Rarity;
  readonly personality: readonly PersonalityTag[];
  readonly pet: Pet;
  readonly acquiredAt: number;
  readonly lastActiveAt: number;
}

export interface VaultState {
  readonly activePetId: string | null;
  readonly entries: Readonly<Record<string, VaultedPet>>;
  readonly order: readonly string[];
}

export type VaultEvent =
  | {
      readonly type: 'acquire_pet';
      readonly petId: string;
      readonly archetypeId: string;
      readonly rarity: Rarity;
      readonly personality: readonly PersonalityTag[];
      readonly pet: Pet;
      readonly now: number;
    }
  | {
      readonly type: 'set_active_pet';
      readonly petId: string;
      readonly now: number;
    }
  | {
      readonly type: 'sync_active_pet';
      readonly pet: Pet;
      readonly now: number;
    }
  | { readonly type: 'vault_tick'; readonly now: number };
