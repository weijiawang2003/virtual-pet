import { mulberry32 } from '../util/prng';
import type { Quest, QuestType } from './types';

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

// Generator inputs — callers shape these from VaultedPet + life context +
// vitality. Keeping the input narrow lets generator stay pure / testable.
export interface QuestGenContext {
  readonly petId: string | null;
  readonly vitalityCurrent: number;
  // Hours since last quest completion / decline. null if never.
  readonly hoursSinceLastQuest: number | null;
  // Coarse signal of the user's recent activity: did they walk / sleep
  // well / explore / stay home a lot?
  readonly recentSteps: number;
  readonly recentSleepMinutes: number;
  readonly recentNewPlaces: number;
}

const VITALITY_FLOOR = 30;
const COOLDOWN_HOURS = 4;

interface QuestSpec {
  readonly type: QuestType;
  readonly threshold: number;
  readonly rewardEssence: number;
  readonly rewardBond: number;
}

function pickSpec(ctx: QuestGenContext, prng: () => number): QuestSpec {
  // Lightweight heuristic: prefer types the user is "warmed up" for so
  // they don't bounce off an impossible ask.
  const candidates: QuestSpec[] = [];
  if (ctx.recentSteps >= 1500) {
    candidates.push({ type: 'walk', threshold: 3000, rewardEssence: 5, rewardBond: 10 });
  }
  if (ctx.recentSleepMinutes >= 4 * 60) {
    candidates.push({ type: 'sleep', threshold: 7 * 60, rewardEssence: 5, rewardBond: 15 });
  }
  if (ctx.recentNewPlaces > 0) {
    candidates.push({ type: 'visit_new_place', threshold: 1, rewardEssence: 5, rewardBond: 10 });
  }
  // Always offer idle as a safe fallback — anyone can put the phone down.
  candidates.push({ type: 'idle', threshold: 60, rewardEssence: 3, rewardBond: 8 });
  const idx = Math.floor(prng() * candidates.length);
  return candidates[Math.min(idx, candidates.length - 1)]!;
}

// Pure quest generator. Returns null when conditions don't favor an offer
// (low vitality, recent quest cooldown, no active pet).
export function generateQuest(
  ctx: QuestGenContext,
  now: number,
  questId: string,
  seed: number = now,
): Quest | null {
  if (ctx.petId === null) return null;
  if (ctx.vitalityCurrent < VITALITY_FLOOR) return null;
  if (ctx.hoursSinceLastQuest !== null && ctx.hoursSinceLastQuest < COOLDOWN_HOURS) return null;

  const prng = mulberry32(seed);
  const spec = pickSpec(ctx, prng);

  return {
    id: questId,
    type: spec.type,
    threshold: spec.threshold,
    rewardEssence: spec.rewardEssence,
    rewardBond: spec.rewardBond,
    expiresAt: now + ONE_DAY_MS,
    state: 'offered',
    progress: 0,
    petId: ctx.petId,
    offeredAt: now,
    acceptedAt: null,
    completedAt: null,
  };
}
