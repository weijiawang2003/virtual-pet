import { applyDecay } from '../decay/decay';
import type { Pet } from '../pet/types';
import { assertNever } from '../util/assert-never';
import { getArchetype } from './archetypes';
import type { VaultEvent, VaultState, VaultedPet } from './types';

export const INITIAL_STATE: VaultState = Object.freeze({
  activePetId: null,
  entries: Object.freeze({}),
  order: Object.freeze([]),
});

// Inactive pets decay this many times slower than the active pet, and stop
// at floor=1 — they "sleep in the vault", they don't die there.
const INACTIVE_DECAY_DIVISOR = 5;
const INACTIVE_FLOOR = 1;

// Caller in vault_tick already guards elapsed > 0, so this never sees a
// non-positive arg. Kept narrowly typed instead of asserting.
function flooredDecay(pet: Pet, elapsedMs: number): Pet {
  const decayed = applyDecay(pet, elapsedMs / INACTIVE_DECAY_DIVISOR);
  return {
    ...decayed,
    stats: {
      satiety: Math.max(INACTIVE_FLOOR, decayed.stats.satiety),
      energy: Math.max(INACTIVE_FLOOR, decayed.stats.energy),
      happiness: Math.max(INACTIVE_FLOOR, decayed.stats.happiness),
    },
  };
}

// Patches a known entry. Callers must verify the id exists before calling.
function withEntry(
  state: VaultState,
  id: string,
  patch: (e: VaultedPet) => VaultedPet,
): VaultState {
  const e = state.entries[id]!;
  return {
    ...state,
    entries: { ...state.entries, [id]: patch(e) },
  };
}

export function reducer(state: VaultState, event: VaultEvent): VaultState {
  switch (event.type) {
    case 'acquire_pet': {
      // Reject duplicate ids — id is caller-supplied (deterministic for tests).
      if (state.entries[event.petId] !== undefined) return state;
      // Reject unknown archetype — fail loud rather than store garbage.
      if (getArchetype(event.archetypeId) === null) return state;
      const entry: VaultedPet = {
        id: event.petId,
        archetypeId: event.archetypeId,
        element: getArchetype(event.archetypeId)!.element,
        rarity: event.rarity,
        personality: event.personality,
        pet: event.pet,
        acquiredAt: event.now,
        lastActiveAt: event.now,
      };
      return {
        activePetId: state.activePetId ?? event.petId,
        entries: { ...state.entries, [event.petId]: entry },
        order: [...state.order, event.petId],
      };
    }
    case 'set_active_pet': {
      if (state.entries[event.petId] === undefined) return state;
      if (state.activePetId === event.petId) return state;
      return withEntry({ ...state, activePetId: event.petId }, event.petId, (e) => ({
        ...e,
        lastActiveAt: event.now,
      }));
    }
    case 'sync_active_pet': {
      if (state.activePetId === null) return state;
      // activePetId is set ⇒ entries[activePetId] always exists (set_active_pet
      // and acquire_pet both guarantee this). The non-null assertion here is
      // an invariant, not a defensive guard.
      return withEntry(state, state.activePetId, (e) => ({
        ...e,
        pet: event.pet,
        lastActiveAt: event.now,
      }));
    }
    case 'vault_tick': {
      // Apply slow decay to every inactive entry. Active pet ticks via the
      // existing pet snapshot store so we don't double-tick it here.
      const next: Record<string, VaultedPet> = {};
      let mutated = false;
      for (const id of state.order) {
        const e = state.entries[id]!;
        if (id === state.activePetId) {
          next[id] = e;
          continue;
        }
        const elapsed = event.now - e.lastActiveAt;
        if (elapsed <= 0) {
          next[id] = e;
          continue;
        }
        next[id] = { ...e, pet: flooredDecay(e.pet, elapsed), lastActiveAt: event.now };
        mutated = true;
      }
      if (!mutated) return state;
      return { ...state, entries: next };
    }
    default:
      return assertNever(event);
  }
}
