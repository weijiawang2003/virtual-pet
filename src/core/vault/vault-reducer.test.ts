import { createPet } from '../pet/reducer';
import type { Pet } from '../pet/types';
import { INITIAL_STATE, reducer } from './vault-reducer';
import type { PersonalityTag, VaultEvent } from './types';

const ONE_HOUR_MS = 60 * 60 * 1000;

function basePet(): Pet {
  return createPet(0);
}

function acquire(
  state = INITIAL_STATE,
  petId = 'p1',
  archetypeId = 'moss',
  rarity: 'N' | 'R' | 'SR' | 'SSR' = 'N',
  personality: readonly PersonalityTag[] = ['lazy'],
  now = 1000,
) {
  return reducer(state, {
    type: 'acquire_pet',
    petId,
    archetypeId,
    rarity,
    personality,
    pet: basePet(),
    now,
  });
}

describe('INITIAL_STATE', () => {
  it('starts with no active pet, no entries, empty order', () => {
    expect(INITIAL_STATE.activePetId).toBeNull();
    expect(INITIAL_STATE.entries).toEqual({});
    expect(INITIAL_STATE.order).toEqual([]);
  });
});

describe('acquire_pet', () => {
  it('adds an entry and sets it as active when first', () => {
    const next = acquire();
    expect(next.activePetId).toBe('p1');
    expect(next.order).toEqual(['p1']);
    expect(next.entries['p1']?.archetypeId).toBe('moss');
    expect(next.entries['p1']?.element).toBe('grass');
    expect(next.entries['p1']?.rarity).toBe('N');
  });

  it('does NOT change activePetId when one is already active', () => {
    let s = acquire(INITIAL_STATE, 'p1');
    s = acquire(s, 'p2', 'flicker', 'R');
    expect(s.activePetId).toBe('p1');
    expect(s.order).toEqual(['p1', 'p2']);
  });

  it('rejects duplicate ids (returns same state)', () => {
    const s1 = acquire(INITIAL_STATE, 'p1');
    const s2 = acquire(s1, 'p1');
    expect(s2).toBe(s1);
  });

  it('rejects unknown archetype id', () => {
    const s = acquire(INITIAL_STATE, 'p1', 'phantom-of-tomorrow');
    expect(s).toBe(INITIAL_STATE);
  });

  it('records acquiredAt and lastActiveAt from the now arg', () => {
    const s = acquire(INITIAL_STATE, 'p1', 'moss', 'N', ['lazy'], 5_000);
    expect(s.entries['p1']?.acquiredAt).toBe(5_000);
    expect(s.entries['p1']?.lastActiveAt).toBe(5_000);
  });
});

describe('set_active_pet', () => {
  it('switches activePetId to a known entry', () => {
    let s = acquire(INITIAL_STATE, 'p1');
    s = acquire(s, 'p2', 'flicker', 'R');
    s = reducer(s, { type: 'set_active_pet', petId: 'p2', now: 9_000 });
    expect(s.activePetId).toBe('p2');
    expect(s.entries['p2']?.lastActiveAt).toBe(9_000);
  });

  it('is a no-op when target is unknown', () => {
    const s = acquire(INITIAL_STATE, 'p1');
    const next = reducer(s, { type: 'set_active_pet', petId: 'ghost', now: 1 });
    expect(next).toBe(s);
  });

  it('is a no-op when target is already active', () => {
    const s = acquire(INITIAL_STATE, 'p1');
    const next = reducer(s, { type: 'set_active_pet', petId: 'p1', now: 50 });
    expect(next).toBe(s);
  });
});

describe('sync_active_pet', () => {
  it('write-throughs the active entry pet', () => {
    let s = acquire(INITIAL_STATE, 'p1');
    const updated: Pet = { ...basePet(), stats: { satiety: 42, energy: 80, happiness: 55 } };
    s = reducer(s, { type: 'sync_active_pet', pet: updated, now: 2_000 });
    expect(s.entries['p1']?.pet.stats.satiety).toBe(42);
    expect(s.entries['p1']?.lastActiveAt).toBe(2_000);
  });

  it('is a no-op when activePetId is null', () => {
    const next = reducer(INITIAL_STATE, {
      type: 'sync_active_pet',
      pet: basePet(),
      now: 100,
    });
    expect(next).toBe(INITIAL_STATE);
  });
});

describe('vault_tick', () => {
  it('decays inactive pets at 5x slower rate, leaves active untouched', () => {
    let s = acquire(INITIAL_STATE, 'active', 'moss', 'N', ['lazy'], 0);
    s = acquire(s, 'inactive', 'flicker', 'R', ['energetic'], 0);
    // First tick → 24h elapsed for both. Active stays via activePetId='active'.
    s = reducer(s, { type: 'vault_tick', now: 24 * ONE_HOUR_MS });
    const active = s.entries['active']!;
    const inactive = s.entries['inactive']!;
    expect(active.pet.stats.satiety).toBe(70); // active untouched
    // Inactive: applyDecay over 24h/5 = 4.8h. satiety drop = 1.0/h * 4.8 = 4.8.
    expect(inactive.pet.stats.satiety).toBeCloseTo(70 - 4.8, 5);
  });

  it('floors inactive stats at 1 (vault pets do not die)', () => {
    let s = acquire(INITIAL_STATE, 'active', 'moss');
    s = acquire(s, 'sleeper', 'puffin', 'N', ['clingy'], 0);
    // Force a giant elapsed so naive decay would zero stats.
    s = reducer(s, { type: 'vault_tick', now: 365 * 24 * ONE_HOUR_MS });
    const sleeper = s.entries['sleeper']!;
    expect(sleeper.pet.stats.satiety).toBe(1);
    expect(sleeper.pet.stats.energy).toBe(1);
    expect(sleeper.pet.stats.happiness).toBe(1);
  });

  it('returns same state when there is nothing to decay', () => {
    const s = acquire(INITIAL_STATE, 'p1');
    const next = reducer(s, { type: 'vault_tick', now: 0 });
    expect(next).toBe(s);
  });

  it('inactive pet with non-positive elapsed is left untouched', () => {
    let s = acquire(INITIAL_STATE, 'active', 'moss', 'N', ['lazy'], 1_000);
    s = acquire(s, 'sleeper', 'flicker', 'R', ['energetic'], 1_000);
    // now < sleeper.lastActiveAt → elapsed <= 0 path on inactive pet.
    const next = reducer(s, { type: 'vault_tick', now: 500 });
    expect(next).toBe(s);
  });

  it('updates inactive lastActiveAt to now even with elapsed > 0', () => {
    let s = acquire(INITIAL_STATE, 'active');
    s = acquire(s, 'sleeper', 'flicker', 'R', ['energetic'], 100);
    s = reducer(s, { type: 'vault_tick', now: ONE_HOUR_MS });
    expect(s.entries['sleeper']?.lastActiveAt).toBe(ONE_HOUR_MS);
  });
});

describe('reducer — exhaustiveness', () => {
  it('throws on unknown event discriminant', () => {
    expect(() => reducer(INITIAL_STATE, { type: 'explode' } as unknown as VaultEvent)).toThrow(
      /Unreachable/,
    );
  });
});
