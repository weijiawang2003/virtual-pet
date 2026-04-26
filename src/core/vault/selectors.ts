import type { Element, Rarity, VaultState, VaultedPet } from './types';

export function getActivePet(state: VaultState): VaultedPet | null {
  if (state.activePetId === null) return null;
  return state.entries[state.activePetId] ?? null;
}

// Returns vault entries in insertion order — newest at the end.
export function getVaultPets(state: VaultState): readonly VaultedPet[] {
  const result: VaultedPet[] = [];
  for (const id of state.order) {
    const e = state.entries[id];
    if (e !== undefined) result.push(e);
  }
  return result;
}

export function getInactivePets(state: VaultState): readonly VaultedPet[] {
  return getVaultPets(state).filter((p) => p.id !== state.activePetId);
}

export function getPetsByElement(state: VaultState, element: Element): readonly VaultedPet[] {
  return getVaultPets(state).filter((p) => p.element === element);
}

export function getPetsByRarity(state: VaultState, rarity: Rarity): readonly VaultedPet[] {
  return getVaultPets(state).filter((p) => p.rarity === rarity);
}

export function vaultSize(state: VaultState): number {
  return state.order.length;
}
