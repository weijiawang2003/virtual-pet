// Phase 0 intentional red-light test — primes Phase 1 TDD.
// `./reducer` does not yet exist; this will fail Jest with "Cannot find module".
// Phase 1's first job: create src/core/pet/reducer.ts exporting `createPet`.
/* eslint-disable import/no-unresolved -- Phase 1 will add ./reducer */
// @ts-expect-error Phase 1 will implement this module. Ref: docs/phases/01-state-machine.md
import { createPet } from './reducer';
/* eslint-enable import/no-unresolved */

describe('pet reducer (Phase 1 stub)', () => {
  it('createPet returns initial state with stage "egg"', () => {
    expect(createPet()).toEqual(expect.objectContaining({ stage: 'egg' }));
  });
});
