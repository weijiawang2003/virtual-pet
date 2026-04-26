import { applyDecay } from '../decay/decay';
import { assertNever } from '../util/assert-never';
import { clampStat } from '../util/clamp';
import { advanceStage } from './stages';
import type { Event, Pet, Stats } from './types';

const INITIAL_STATS: Stats = { satiety: 70, energy: 70, happiness: 70 };

// `now` is injectable so Clock-driven tests can pass a fixed timestamp.
export function createPet(now: number = Date.now()): Pet {
  return {
    stage: 'egg',
    stats: INITIAL_STATS,
    ageMs: 0,
    bornAt: now,
  };
}

function withStats(pet: Pet, patch: Partial<Stats>): Pet {
  return {
    ...pet,
    stats: {
      satiety: clampStat(patch.satiety ?? pet.stats.satiety),
      energy: clampStat(patch.energy ?? pet.stats.energy),
      happiness: clampStat(patch.happiness ?? pet.stats.happiness),
    },
  };
}

export function reducer(state: Pet, event: Event): Pet {
  switch (event.type) {
    case 'feed':
      return withStats(state, { satiety: state.stats.satiety + event.nutrition });
    case 'play':
      return withStats(state, {
        happiness: state.stats.happiness + event.minutes,
        energy: state.stats.energy - event.minutes * 0.5,
      });
    case 'rest':
      return withStats(state, { energy: state.stats.energy + event.minutes });
    case 'tick':
      return advanceStage(applyDecay(state, event.elapsedMs));
    case 'mood_adjust': {
      // Multi-field stat delta. Per-field optional; reducer applies what's
      // present, clamps to [0, 100]. Used by the signal translator (sleep
      // < 5h, heavy phone use, etc.). Use a mutable local — withStats's
      // Partial<Stats> param is readonly, so we can't append in-place.
      const patch: { satiety?: number; energy?: number; happiness?: number } = {};
      if (event.satiety !== undefined) patch.satiety = state.stats.satiety + event.satiety;
      if (event.energy !== undefined) patch.energy = state.stats.energy + event.energy;
      if (event.happiness !== undefined) patch.happiness = state.stats.happiness + event.happiness;
      return withStats(state, patch);
    }
    case 'bond_gain':
      // Accumulator for Phase 23 Vitality. Just adds to the pending pool.
      return { ...state, pendingBondGain: (state.pendingBondGain ?? 0) + event.amount };
    case 'curiosity_hint':
      // max() so overlapping hints extend the window rather than clobber.
      return {
        ...state,
        curiosityHintUntil: Math.max(state.curiosityHintUntil ?? 0, event.until),
      };
    default:
      return assertNever(event);
  }
}
