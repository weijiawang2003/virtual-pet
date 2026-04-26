import { useEffect } from 'react';

import { usePetSnapshotStore } from '../store/pet-snapshot-store';
import { useVitalityStore } from '../store/vitality-store';

const TICK_INTERVAL_MS = 1000;

// Mounts a single setInterval that drives the reducer's tick event AND
// vitality passive recovery. Safe to mount in the root layout; React's
// StrictMode double-mount is a no-op because both applyTicks are idempotent
// (use lastTickedAt as the cursor).
export function usePetTick(intervalMs: number = TICK_INTERVAL_MS): void {
  const applyPetTick = usePetSnapshotStore((s) => s.applyTick);
  const applyVitalityTick = useVitalityStore((s) => s.applyTick);

  useEffect(() => {
    const tick = (): void => {
      applyPetTick();
      applyVitalityTick();
    };
    // Catch up immediately on mount (handles cold launch after kill).
    tick();
    const id = setInterval(tick, intervalMs);
    return () => {
      clearInterval(id);
    };
  }, [applyPetTick, applyVitalityTick, intervalMs]);
}
