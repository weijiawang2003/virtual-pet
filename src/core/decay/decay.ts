import type { Pet } from '../pet/types';
import { clampStat } from '../util/clamp';

export const MS_PER_HOUR = 60 * 60 * 1000;

// Stats decay linearly with elapsed time. Rates are per-hour deltas.
// Phase 5+ may introduce context-sensitive rates (sleep, weather, HRV) via an ADR.
export const DECAY_RATES_PER_HOUR = Object.freeze({
  satiety: 1.0,
  energy: 0.5,
  happiness: 0.75,
});

export function applyDecay(pet: Pet, elapsedMs: number): Pet {
  const safeElapsed = Number.isFinite(elapsedMs) && elapsedMs > 0 ? elapsedMs : 0;
  const hours = safeElapsed / MS_PER_HOUR;
  return {
    ...pet,
    ageMs: pet.ageMs + safeElapsed,
    stats: {
      satiety: clampStat(pet.stats.satiety - DECAY_RATES_PER_HOUR.satiety * hours),
      energy: clampStat(pet.stats.energy - DECAY_RATES_PER_HOUR.energy * hours),
      happiness: clampStat(pet.stats.happiness - DECAY_RATES_PER_HOUR.happiness * hours),
    },
  };
}
