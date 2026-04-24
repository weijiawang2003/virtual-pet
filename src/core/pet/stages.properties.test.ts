import fc from 'fast-check';
import { createPet, reducer } from './reducer';
import { stageRank } from './stages';
import type { Event } from './types';

const H = 60 * 60 * 1000;

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
  fc.record({
    type: fc.constant('tick' as const),
    elapsedMs: fc.double({ min: 0, max: 10 * H, noNaN: true }),
  }),
);

describe('stage monotonicity', () => {
  it('stage never regresses under any reducer event', () => {
    fc.assert(
      fc.property(arbEvent, (event) => {
        const pet = createPet(0);
        const after = reducer(pet, event);
        expect(stageRank(after.stage)).toBeGreaterThanOrEqual(stageRank(pet.stage));
      }),
    );
  });

  it('stage never regresses across arbitrary event sequences', () => {
    fc.assert(
      fc.property(fc.array(arbEvent, { maxLength: 200 }), (events) => {
        let pet = createPet(0);
        let prevRank = stageRank(pet.stage);
        for (const e of events) {
          pet = reducer(pet, e);
          const nextRank = stageRank(pet.stage);
          expect(nextRank).toBeGreaterThanOrEqual(prevRank);
          prevRank = nextRank;
        }
      }),
    );
  });

  it('after enough elapsed time, the pet reaches adult', () => {
    fc.assert(
      fc.property(fc.double({ min: 72 * H, max: 1000 * H, noNaN: true }), (totalMs) => {
        const pet = reducer(createPet(0), { type: 'tick', elapsedMs: totalMs });
        expect(pet.stage).toBe('adult');
      }),
    );
  });
});
