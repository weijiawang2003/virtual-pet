import fc from 'fast-check';

import { createPet } from '../pet/reducer';
import { ARCHETYPES } from './archetypes';
import {
  getActivePet,
  getInactivePets,
  getPetsByElement,
  getPetsByRarity,
  getVaultPets,
  vaultSize,
} from './selectors';
import { INITIAL_STATE, reducer } from './vault-reducer';
import type { Rarity } from './types';

function acquire(state = INITIAL_STATE, petId = 'p1', archetypeId = 'moss', rarity: Rarity = 'N') {
  return reducer(state, {
    type: 'acquire_pet',
    petId,
    archetypeId,
    rarity,
    personality: ['lazy'],
    pet: createPet(0),
    now: 0,
  });
}

describe('selectors', () => {
  it('getActivePet returns null when no active', () => {
    expect(getActivePet(INITIAL_STATE)).toBeNull();
  });

  it('getActivePet returns the active VaultedPet', () => {
    const s = acquire(INITIAL_STATE, 'p1');
    expect(getActivePet(s)?.id).toBe('p1');
  });

  it('getActivePet returns null when activePetId points to a deleted entry (defensive)', () => {
    const s = { ...acquire(INITIAL_STATE, 'p1'), activePetId: 'ghost' };
    expect(getActivePet(s)).toBeNull();
  });

  it('getVaultPets returns entries in insertion order', () => {
    let s = acquire(INITIAL_STATE, 'p1');
    s = acquire(s, 'p2', 'flicker', 'R');
    s = acquire(s, 'p3', 'moonlin', 'SSR');
    const ids = getVaultPets(s).map((p) => p.id);
    expect(ids).toEqual(['p1', 'p2', 'p3']);
  });

  it('getVaultPets skips entries that exist in order but not entries (defensive)', () => {
    let s = acquire(INITIAL_STATE, 'p1');
    s = { ...s, order: ['p1', 'phantom'] };
    expect(getVaultPets(s).map((p) => p.id)).toEqual(['p1']);
  });

  it('getInactivePets excludes the active one', () => {
    let s = acquire(INITIAL_STATE, 'p1');
    s = acquire(s, 'p2', 'flicker', 'R');
    expect(getInactivePets(s).map((p) => p.id)).toEqual(['p2']);
  });

  it('getPetsByElement filters by element', () => {
    let s = acquire(INITIAL_STATE, 'p1', 'moss');
    s = acquire(s, 'p2', 'flicker');
    s = acquire(s, 'p3', 'briar');
    expect(
      getPetsByElement(s, 'grass')
        .map((p) => p.id)
        .sort(),
    ).toEqual(['p1', 'p3']);
    expect(getPetsByElement(s, 'fire').map((p) => p.id)).toEqual(['p2']);
  });

  it('getPetsByRarity filters by rarity', () => {
    let s = acquire(INITIAL_STATE, 'p1', 'moss', 'N');
    s = acquire(s, 'p2', 'flicker', 'R');
    s = acquire(s, 'p3', 'moonlin', 'SSR');
    expect(getPetsByRarity(s, 'SSR').map((p) => p.id)).toEqual(['p3']);
  });

  it('vaultSize equals order length', () => {
    let s = INITIAL_STATE;
    expect(vaultSize(s)).toBe(0);
    s = acquire(s, 'p1');
    expect(vaultSize(s)).toBe(1);
    s = acquire(s, 'p2', 'flicker');
    expect(vaultSize(s)).toBe(2);
  });
});

describe('selectors — fast-check invariants', () => {
  const arbArchetypeId = fc.constantFrom(...ARCHETYPES.map((a) => a.id));
  const arbRarity = fc.constantFrom('N' as const, 'R' as const, 'SR' as const, 'SSR' as const);

  it('order array entries always exist as keys in entries (after reducer ops)', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            petId: fc.string({ minLength: 1, maxLength: 8 }),
            archetypeId: arbArchetypeId,
            rarity: arbRarity,
          }),
          { maxLength: 30 },
        ),
        (acquisitions) => {
          let s = INITIAL_STATE;
          for (const { petId, archetypeId, rarity } of acquisitions) {
            s = reducer(s, {
              type: 'acquire_pet',
              petId,
              archetypeId,
              rarity,
              personality: [],
              pet: createPet(0),
              now: 0,
            });
          }
          for (const id of s.order) {
            expect(s.entries[id]).toBeDefined();
          }
        },
      ),
    );
  });

  it('activePetId either null or points to a valid entry', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            petId: fc.string({ minLength: 1, maxLength: 6 }),
            archetypeId: arbArchetypeId,
            rarity: arbRarity,
          }),
          { maxLength: 20 },
        ),
        (acquisitions) => {
          let s = INITIAL_STATE;
          for (const a of acquisitions) {
            s = reducer(s, {
              type: 'acquire_pet',
              petId: a.petId,
              archetypeId: a.archetypeId,
              rarity: a.rarity,
              personality: [],
              pet: createPet(0),
              now: 0,
            });
          }
          if (s.activePetId !== null) {
            expect(s.entries[s.activePetId]).toBeDefined();
          }
        },
      ),
    );
  });
});
