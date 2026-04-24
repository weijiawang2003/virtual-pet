import type { LifeStage, Pet } from './types';

export const STAGE_ORDER: readonly LifeStage[] = ['egg', 'baby', 'child', 'teen', 'adult'];

const H = 60 * 60 * 1000;

// Aggressive thresholds so QA sees transitions within a single test session.
// Phase 5+ can scale by a real-life pacing factor via ADR.
export const STAGE_THRESHOLDS_MS: Readonly<Record<LifeStage, number>> = Object.freeze({
  egg: 0,
  baby: 1 * H,
  child: 8 * H,
  teen: 24 * H,
  adult: 72 * H,
});

export function stageRank(stage: LifeStage): number {
  return STAGE_ORDER.indexOf(stage);
}

export function stageFromAge(ageMs: number): LifeStage {
  // Walk STAGE_ORDER monotonically; return the highest stage whose threshold is reached.
  let current: LifeStage = 'egg';
  for (const stage of STAGE_ORDER) {
    if (ageMs >= STAGE_THRESHOLDS_MS[stage]) {
      current = stage;
    }
  }
  return current;
}

// Pure stage-advance: never regresses, even if ageMs is smaller than current stage's floor.
export function advanceStage(pet: Pet): Pet {
  const target = stageFromAge(pet.ageMs);
  if (stageRank(target) <= stageRank(pet.stage)) return pet;
  return { ...pet, stage: target };
}
