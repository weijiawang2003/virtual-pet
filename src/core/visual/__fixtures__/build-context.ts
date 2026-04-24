import { synthesizeContext } from '../../context/synthesize';
import type { LifeContextInputs, PermissionsView } from '../../context/types';
import { createPet } from '../../pet/reducer';
import type { Pet, LifeStage } from '../../pet/types';

const H = 60 * 60 * 1000;

const ALL_GRANTED: PermissionsView = Object.freeze({
  health: 'granted',
  location: 'granted',
  notifications: 'granted',
  calendar: 'granted',
  media: 'granted',
});

const MS_FOR_STAGE: Record<LifeStage, number> = {
  egg: 0,
  baby: 2 * H,
  child: 10 * H,
  teen: 30 * H,
  adult: 100 * H,
};

export function makePet(stage: LifeStage, stats: Partial<Pet['stats']> = {}): Pet {
  const base = createPet(0);
  return {
    ...base,
    stage,
    ageMs: MS_FOR_STAGE[stage],
    stats: {
      satiety: 70,
      energy: 70,
      happiness: 70,
      ...stats,
    },
  };
}

export function makeContext(
  overrides: Partial<LifeContextInputs> = {},
): ReturnType<typeof synthesizeContext> {
  const pet = overrides.pet ?? makePet('baby');
  const inputs: LifeContextInputs = {
    pet,
    nowMs: Date.UTC(2026, 3, 24, 12, 0, 0),
    tzOffsetMs: 8 * H,
    health: { steps: [], sleep: [], hrv: [] },
    location: { current: null, events: [] },
    permissions: ALL_GRANTED,
    ...overrides,
  };
  return synthesizeContext(inputs);
}
