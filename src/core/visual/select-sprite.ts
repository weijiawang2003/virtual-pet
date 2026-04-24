import type { Pet, LifeStage } from '../pet/types';
import type { MoodTag, SpriteKey } from './types';

// Exhaustive LifeStage × MoodTag → SpriteKey map. TS enforces completeness.
// Egg stage ignores mood (no emotions as an egg). Baby has fewer variants.
const SPRITE_MAP: Record<LifeStage, Record<MoodTag, SpriteKey>> = {
  egg: {
    happy: 'egg',
    sleepy: 'egg',
    excited: 'egg',
    low: 'egg',
    curious: 'egg',
    cozy: 'egg',
    hungry: 'egg',
    dirty: 'egg',
  },
  baby: {
    happy: 'baby-happy',
    sleepy: 'baby-sleepy',
    excited: 'baby-happy',
    low: 'baby-low',
    curious: 'baby-idle',
    cozy: 'baby-idle',
    hungry: 'baby-hungry',
    dirty: 'baby-idle',
  },
  child: {
    happy: 'child-happy',
    sleepy: 'child-sleepy',
    excited: 'child-happy',
    low: 'child-low',
    curious: 'child-curious',
    cozy: 'child-idle',
    hungry: 'child-hungry',
    dirty: 'child-dirty',
  },
  teen: {
    happy: 'teen-happy',
    sleepy: 'teen-sleepy',
    excited: 'teen-excited',
    low: 'teen-low',
    curious: 'teen-curious',
    cozy: 'teen-cozy',
    hungry: 'teen-hungry',
    dirty: 'teen-dirty',
  },
  adult: {
    happy: 'adult-happy',
    sleepy: 'adult-sleepy',
    excited: 'adult-excited',
    low: 'adult-low',
    curious: 'adult-curious',
    cozy: 'adult-cozy',
    hungry: 'adult-hungry',
    dirty: 'adult-dirty',
  },
};

export function selectSprite(pet: Pet, mood: MoodTag): SpriteKey {
  return SPRITE_MAP[pet.stage][mood];
}
