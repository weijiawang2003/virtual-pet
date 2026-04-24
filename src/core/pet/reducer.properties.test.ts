import fc from 'fast-check';
import { createPet, reducer } from './reducer';
import type { Event } from './types';

const arbEvent: fc.Arbitrary<Event> = fc.oneof(
  fc.record({
    type: fc.constant('feed' as const),
    nutrition: fc.double({ min: -200, max: 200, noNaN: true }),
  }),
  fc.record({
    type: fc.constant('play' as const),
    minutes: fc.double({ min: -200, max: 200, noNaN: true }),
  }),
  fc.record({
    type: fc.constant('rest' as const),
    minutes: fc.double({ min: -200, max: 200, noNaN: true }),
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

  it('stage is invariant under Phase 1 events', () => {
    fc.assert(
      fc.property(fc.array(arbEvent, { maxLength: 50 }), (events) => {
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
});
