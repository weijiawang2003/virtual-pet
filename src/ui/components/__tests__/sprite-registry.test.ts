import type { MoodTag } from '../../../core/visual/types';
import { SPRITE_REGISTRY, lookupSprite } from '../sprite-registry';

const ALL_MOODS: readonly MoodTag[] = [
  'happy',
  'sleepy',
  'excited',
  'low',
  'curious',
  'cozy',
  'hungry',
  'dirty',
];

describe('lookupSprite', () => {
  it('returns the egg asset for every mood at egg stage', () => {
    for (const m of ALL_MOODS) {
      const a = lookupSprite('egg', m);
      expect(a).not.toBeNull();
      expect(a?.pixelArt).toBe(true);
    }
  });

  it('returns the same asset reference for every egg+mood (one PNG, many tags)', () => {
    const first = lookupSprite('egg', 'happy');
    for (const m of ALL_MOODS) {
      expect(lookupSprite('egg', m)).toBe(first);
    }
  });

  it('baby-happy + happy and baby-happy + excited resolve to DIFFERENT assets', () => {
    const happy = lookupSprite('baby-happy', 'happy');
    const excited = lookupSprite('baby-happy', 'excited');
    expect(happy).not.toBeNull();
    expect(excited).not.toBeNull();
    expect(happy).not.toBe(excited);
  });

  it('baby-sleepy + sleepy is registered', () => {
    expect(lookupSprite('baby-sleepy', 'sleepy')).not.toBeNull();
  });

  it('baby-hungry + hungry is registered', () => {
    expect(lookupSprite('baby-hungry', 'hungry')).not.toBeNull();
  });

  it('returns null for unregistered SpriteKey (any mood)', () => {
    expect(lookupSprite('child-happy', 'happy')).toBeNull();
    expect(lookupSprite('teen-cozy', 'cozy')).toBeNull();
    expect(lookupSprite('adult-idle', 'happy')).toBeNull();
  });

  it('returns null for registered SpriteKey + unregistered mood', () => {
    // baby-happy is in the registry but only happy/excited cells are filled.
    expect(lookupSprite('baby-happy', 'sleepy')).toBeNull();
    expect(lookupSprite('baby-happy', 'low')).toBeNull();
    expect(lookupSprite('baby-happy', 'curious')).toBeNull();
  });

  it('SPRITE_REGISTRY is frozen', () => {
    expect(Object.isFrozen(SPRITE_REGISTRY)).toBe(true);
  });
});
