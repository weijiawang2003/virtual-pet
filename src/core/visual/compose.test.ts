import { compose } from './compose';
import { makeContext, makePet } from './__fixtures__/build-context';

describe('compose', () => {
  it('returns a frozen VisualState with all fields', () => {
    const pet = makePet('baby');
    const v = compose(pet, makeContext({ pet }));
    expect(Object.isFrozen(v)).toBe(true);
    expect(v.sprite).toBeDefined();
    expect(v.animation).toBeDefined();
    expect(v.mood).toBeDefined();
    expect(v.background).toBeDefined();
    // bubble and hapticHint may be null, accessory may be null — that's valid.
    expect(['string', 'object']).toContain(typeof v.bubble); // string or null
  });

  it('is pure — same (pet, ctx) → deep-equal output', () => {
    const pet = makePet('teen', { satiety: 50, energy: 50, happiness: 50 });
    const ctx = makeContext({ pet });
    expect(compose(pet, ctx)).toEqual(compose(pet, ctx));
  });
});
