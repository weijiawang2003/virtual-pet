import fc from 'fast-check';
import { compose } from './compose';
import { makeContext, makePet } from './__fixtures__/build-context';
import type { LifeStage } from '../pet/types';

const STAGES: readonly LifeStage[] = ['egg', 'baby', 'child', 'teen', 'adult'];

const arbStats = fc.record({
  satiety: fc.double({ min: 0, max: 100, noNaN: true }),
  energy: fc.double({ min: 0, max: 100, noNaN: true }),
  happiness: fc.double({ min: 0, max: 100, noNaN: true }),
});

const arbStage: fc.Arbitrary<LifeStage> = fc.constantFrom(...STAGES);
const arbHour = fc.integer({ min: 0, max: 23 });

const VALID_ANIMS = new Set([
  'idle',
  'bounce',
  'sleep',
  'eat',
  'cuddle',
  'dance',
  'yawn',
  'curious',
  'low',
  'full-moon-stare',
]);

const VALID_MOODS = new Set([
  'happy',
  'sleepy',
  'excited',
  'low',
  'curious',
  'cozy',
  'hungry',
  'dirty',
]);

const VALID_BACKGROUNDS = new Set(['sunny', 'rain', 'night', 'dawn', 'dusk', 'snow', 'cny']);

describe('compose properties', () => {
  it('every (stage × stats × hour) produces a VisualState with valid field values', () => {
    fc.assert(
      fc.property(arbStage, arbStats, arbHour, (stage, stats, hour) => {
        const pet = makePet(stage, stats);
        const nowMs = Date.UTC(2026, 3, 24, (hour + 16) % 24, 0, 0);
        const ctx = makeContext({ pet, nowMs });
        const v = compose(pet, ctx);
        expect(VALID_MOODS.has(v.mood)).toBe(true);
        expect(VALID_ANIMS.has(v.animation)).toBe(true);
        expect(VALID_BACKGROUNDS.has(v.background)).toBe(true);
        expect(v.sprite.length).toBeGreaterThan(0);
      }),
    );
  });

  it('is pure — same inputs produce deep-equal output', () => {
    fc.assert(
      fc.property(arbStage, arbStats, (stage, stats) => {
        const pet = makePet(stage, stats);
        const ctx = makeContext({ pet });
        expect(compose(pet, ctx)).toEqual(compose(pet, ctx));
      }),
    );
  });
});
