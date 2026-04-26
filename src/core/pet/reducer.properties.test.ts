import fc from 'fast-check';
import { createPet, reducer } from './reducer';
import type { Event, PetEventSource } from './types';

const arbSource: fc.Arbitrary<PetEventSource> = fc.constantFrom(
  'manual',
  'health',
  'inferred',
  'system',
);

const arbEvent: fc.Arbitrary<Event> = fc.oneof(
  fc.record({
    type: fc.constant('feed' as const),
    nutrition: fc.double({ min: -200, max: 200, noNaN: true }),
    source: arbSource,
  }),
  fc.record({
    type: fc.constant('play' as const),
    minutes: fc.double({ min: -200, max: 200, noNaN: true }),
    source: arbSource,
  }),
  fc.record({
    type: fc.constant('rest' as const),
    minutes: fc.double({ min: -200, max: 200, noNaN: true }),
    source: arbSource,
  }),
  fc.record({
    type: fc.constant('tick' as const),
    elapsedMs: fc.double({ min: 0, max: 10 * 60 * 60 * 1000, noNaN: true }),
    source: arbSource,
  }),
  fc.record({
    type: fc.constant('mood_adjust' as const),
    happiness: fc.double({ min: -50, max: 50, noNaN: true }),
    energy: fc.double({ min: -50, max: 50, noNaN: true }),
    satiety: fc.double({ min: -50, max: 50, noNaN: true }),
    source: arbSource,
  }),
  fc.record({
    type: fc.constant('bond_gain' as const),
    amount: fc.integer({ min: 0, max: 100 }),
    source: arbSource,
  }),
  fc.record({
    type: fc.constant('curiosity_hint' as const),
    until: fc.integer({ min: 0, max: Number.MAX_SAFE_INTEGER }),
    source: arbSource,
  }),
);

describe('reducer properties', () => {
  it('stats always stay within [0, 100]', () => {
    fc.assert(
      fc.property(fc.array(arbEvent, { maxLength: 50 }), (events) => {
        const end = events.reduce(reducer, createPet(0));
        expect(end.stats.satiety).toBeGreaterThanOrEqual(0);
        expect(end.stats.satiety).toBeLessThanOrEqual(100);
        expect(end.stats.energy).toBeGreaterThanOrEqual(0);
        expect(end.stats.energy).toBeLessThanOrEqual(100);
        expect(end.stats.happiness).toBeGreaterThanOrEqual(0);
        expect(end.stats.happiness).toBeLessThanOrEqual(100);
      }),
    );
  });

  // Stage monotonicity lives in stages.properties.test.ts. Here we only verify
  // that non-tick events leave the stage untouched.
  it('feed/play/rest never change stage', () => {
    const arbNonTick: fc.Arbitrary<Event> = fc.oneof(
      fc.record({
        type: fc.constant('feed' as const),
        nutrition: fc.double({ min: -200, max: 200, noNaN: true }),
        source: arbSource,
      }),
      fc.record({
        type: fc.constant('play' as const),
        minutes: fc.double({ min: -200, max: 200, noNaN: true }),
        source: arbSource,
      }),
      fc.record({
        type: fc.constant('rest' as const),
        minutes: fc.double({ min: -200, max: 200, noNaN: true }),
        source: arbSource,
      }),
    );
    fc.assert(
      fc.property(fc.array(arbNonTick, { maxLength: 50 }), (events) => {
        const end = events.reduce(reducer, createPet(0));
        expect(end.stage).toBe('egg');
      }),
    );
  });

  it('is pure — same state+event produces deeply equal output', () => {
    fc.assert(
      fc.property(arbEvent, (event) => {
        const pet = createPet(0);
        const a = reducer(pet, event);
        const b = reducer(pet, event);
        expect(a).toEqual(b);
      }),
    );
  });

  it('never mutates the input state object', () => {
    fc.assert(
      fc.property(arbEvent, (event) => {
        const pet = createPet(0);
        const snapshot = JSON.stringify(pet);
        reducer(pet, event);
        expect(JSON.stringify(pet)).toBe(snapshot);
      }),
    );
  });

  it('mood_adjust applies stat deltas with clamping', () => {
    const pet = createPet(0);
    const next = reducer(pet, {
      type: 'mood_adjust',
      happiness: -10,
      energy: 5,
      source: 'health',
    });
    expect(next.stats.happiness).toBe(60);
    expect(next.stats.energy).toBe(75);
    expect(next.stats.satiety).toBe(70); // unchanged
  });

  it('mood_adjust satiety-only path leaves energy / happiness untouched', () => {
    const pet = createPet(0);
    const next = reducer(pet, { type: 'mood_adjust', satiety: 8, source: 'health' });
    expect(next.stats.satiety).toBe(78);
    expect(next.stats.energy).toBe(70);
    expect(next.stats.happiness).toBe(70);
  });

  it('mood_adjust with no fields is a no-op', () => {
    const pet = createPet(0);
    const next = reducer(pet, { type: 'mood_adjust', source: 'health' });
    expect(next.stats).toEqual(pet.stats);
  });

  it('bond_gain adds to pendingBondGain (default 0)', () => {
    const pet = createPet(0);
    const a = reducer(pet, { type: 'bond_gain', amount: 5, source: 'health' });
    expect(a.pendingBondGain).toBe(5);
    const b = reducer(a, { type: 'bond_gain', amount: 3, source: 'health' });
    expect(b.pendingBondGain).toBe(8);
  });

  it('curiosity_hint takes max() with existing window', () => {
    const pet = createPet(0);
    const a = reducer(pet, { type: 'curiosity_hint', until: 100, source: 'inferred' });
    expect(a.curiosityHintUntil).toBe(100);
    // Smaller until shouldn't overwrite a larger active window.
    const b = reducer(a, { type: 'curiosity_hint', until: 50, source: 'inferred' });
    expect(b.curiosityHintUntil).toBe(100);
    // Larger until extends.
    const c = reducer(b, { type: 'curiosity_hint', until: 200, source: 'inferred' });
    expect(c.curiosityHintUntil).toBe(200);
  });
});
