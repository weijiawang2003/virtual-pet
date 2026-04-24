import type { BubbleKey } from '../visual/types';
import { FESTIVAL_KEYS, MIN_COUNT_DAILY, MIN_COUNT_FESTIVAL, POOL, minCountFor } from './pool';

const ALL_KEYS: readonly BubbleKey[] = [
  'hungry',
  'tired',
  'playful',
  'worried',
  'happy',
  'excited',
  'cozy',
  'curious',
  'low',
  'cny',
  'birthday',
  'fullmoon',
];

describe('phrase pool — completeness', () => {
  it('has every BubbleKey as a pool entry', () => {
    for (const k of ALL_KEYS) {
      expect(POOL[k]).toBeDefined();
    }
  });

  it('daily keys have at least MIN_COUNT_DAILY phrases', () => {
    for (const k of ALL_KEYS) {
      if (FESTIVAL_KEYS.includes(k)) continue;
      expect(POOL[k].length).toBeGreaterThanOrEqual(MIN_COUNT_DAILY);
    }
  });

  it('festival keys have at least MIN_COUNT_FESTIVAL phrases', () => {
    for (const k of FESTIVAL_KEYS) {
      expect(POOL[k].length).toBeGreaterThanOrEqual(MIN_COUNT_FESTIVAL);
    }
  });

  it('every phrase is non-empty', () => {
    for (const k of ALL_KEYS) {
      for (const p of POOL[k]) {
        expect(p.length).toBeGreaterThan(0);
      }
    }
  });

  it('minCountFor returns the right threshold per key', () => {
    expect(minCountFor('hungry')).toBe(MIN_COUNT_DAILY);
    expect(minCountFor('birthday')).toBe(MIN_COUNT_FESTIVAL);
  });
});
