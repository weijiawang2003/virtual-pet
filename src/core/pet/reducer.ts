import { assertNever } from '../util/assert-never';
import { clampStat } from '../util/clamp';
import type { Event, Pet, Stats } from './types';

const INITIAL_STATS: Stats = { satiety: 70, energy: 70, happiness: 70 };

// `now` is injectable so Phase 2's Clock-driven tests can pass a fixed timestamp.
export function createPet(now: number = Date.now()): Pet {
  return {
    stage: 'egg',
    stats: INITIAL_STATS,
    ageTicks: 0,
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
    default:
      return assertNever(event);
  }
}
