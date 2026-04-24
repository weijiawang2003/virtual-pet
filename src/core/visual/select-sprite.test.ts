import type { LifeStage } from '../pet/types';
import { makePet } from './__fixtures__/build-context';
import { selectSprite } from './select-sprite';
import type { MoodTag } from './types';

const STAGES: readonly LifeStage[] = ['egg', 'baby', 'child', 'teen', 'adult'];
const MOODS: readonly MoodTag[] = [
  'happy',
  'sleepy',
  'excited',
  'low',
  'curious',
  'cozy',
  'hungry',
  'dirty',
];

describe('selectSprite — total over stage × mood', () => {
  for (const stage of STAGES) {
    for (const mood of MOODS) {
      it(`returns a defined sprite for (${stage}, ${mood})`, () => {
        const sprite = selectSprite(makePet(stage), mood);
        expect(typeof sprite).toBe('string');
        expect(sprite.length).toBeGreaterThan(0);
      });
    }
  }
});

describe('selectSprite — stage gating', () => {
  it('egg returns "egg" regardless of mood', () => {
    for (const mood of MOODS) {
      expect(selectSprite(makePet('egg'), mood)).toBe('egg');
    }
  });

  it('baby excited collapses to happy sprite (no excited variant yet)', () => {
    expect(selectSprite(makePet('baby'), 'excited')).toBe('baby-happy');
  });

  it('teen excited has its own sprite', () => {
    expect(selectSprite(makePet('teen'), 'excited')).toBe('teen-excited');
  });

  it('adult cozy maps to adult-cozy', () => {
    expect(selectSprite(makePet('adult'), 'cozy')).toBe('adult-cozy');
  });
});
