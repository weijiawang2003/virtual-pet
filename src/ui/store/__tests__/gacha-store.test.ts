import { storage } from '../mmkv';
import { useEssenceStore } from '../essence-store';
import { useGachaStore } from '../gacha-store';
import { usePetSnapshotStore } from '../pet-snapshot-store';
import { useVaultStore } from '../vault-store';
import { useVitalityStore } from '../vitality-store';

describe('useGachaStore', () => {
  beforeEach(() => {
    storage.clearAll();
    useGachaStore.persist.clearStorage();
    useVaultStore.persist.clearStorage();
    useVitalityStore.persist.clearStorage();
    useEssenceStore.persist.clearStorage();
    usePetSnapshotStore.persist.clearStorage();
    useGachaStore.getState().reset();
    useVaultStore.getState().reset();
    useVitalityStore.getState().reset();
    useEssenceStore.getState().reset();
    usePetSnapshotStore.getState().reset();
  });

  it('vitality pull on full vitality returns a pulled result and acquires into vault', () => {
    const status = useGachaStore.getState().pull('vitality');
    expect(status.kind).toBe('pulled');
    if (status.kind !== 'pulled') return;
    expect(status.result.rarity).not.toBe('SSR');
    expect(useVaultStore.getState().vault.entries[status.newVaultPetId]).toBeDefined();
    // Vitality is decremented (cost 20).
    expect(useVitalityStore.getState().vitality.current).toBe(80);
  });

  it('vitality pull rejects when insufficient vitality', () => {
    useVitalityStore.setState((s) => ({ vitality: { ...s.vitality, current: 5 } }));
    const status = useGachaStore.getState().pull('vitality');
    expect(status.kind).toBe('insufficient');
    if (status.kind !== 'insufficient') return;
    expect(status.resource).toBe('vitality');
    // Vault unchanged.
    expect(useVaultStore.getState().vault.order).toEqual([]);
    // Vitality NOT consumed on rejection.
    expect(useVitalityStore.getState().vitality.current).toBe(5);
  });

  it('essence pull rejects when insufficient essence', () => {
    const status = useGachaStore.getState().pull('essence');
    expect(status.kind).toBe('insufficient');
    if (status.kind !== 'insufficient') return;
    expect(status.resource).toBe('essence');
  });

  it('essence pull succeeds when essence is gained first', () => {
    useEssenceStore.getState().gain(50);
    const status = useGachaStore.getState().pull('essence');
    expect(status.kind).toBe('pulled');
    expect(useEssenceStore.getState().current).toBe(40);
  });

  it('pity counter advances on non-SSR essence pulls', () => {
    useEssenceStore.getState().gain(100);
    const beforeCounter = useGachaStore.getState().pity.essence;
    useGachaStore.getState().pull('essence');
    const afterCounter = useGachaStore.getState().pity.essence;
    // Either the counter incremented (non-SSR pull) or was reset to 0 (SSR pull).
    expect([beforeCounter + 1, 0]).toContain(afterCounter);
  });

  it('forces SSR on the 100th essence pull (pity)', () => {
    // Fast-forward pity to 99 by direct setState.
    useGachaStore.setState({ pity: { vitality: 0, essence: 99 } });
    useEssenceStore.getState().gain(50);
    const status = useGachaStore.getState().pull('essence');
    expect(status.kind).toBe('pulled');
    if (status.kind !== 'pulled') return;
    expect(status.result.rarity).toBe('SSR');
    expect(status.result.isPityHit).toBe(true);
    // Counter resets to 0 after the SSR pull.
    expect(useGachaStore.getState().pity.essence).toBe(0);
  });

  it('lastResult is persisted between pulls', () => {
    useGachaStore.getState().pull('vitality');
    expect(useGachaStore.getState().lastResult).not.toBeNull();
  });

  it('reset clears pity counters and lastResult', () => {
    useGachaStore.getState().pull('vitality');
    useGachaStore.getState().reset();
    expect(useGachaStore.getState().pity).toEqual({ vitality: 0, essence: 0 });
    expect(useGachaStore.getState().lastResult).toBeNull();
  });
});
