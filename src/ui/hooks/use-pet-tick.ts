import { useEffect } from 'react';

import { usePetSnapshotStore } from '../store/pet-snapshot-store';

const TICK_INTERVAL_MS = 1000;

// Mounts a single setInterval that drives the reducer's tick event. Safe to
// mount in the root layout; React's StrictMode double-mount is a no-op
// because applyTick is idempotent (uses lastTickedAt as the cursor).
export function usePetTick(intervalMs: number = TICK_INTERVAL_MS): void {
  const applyTick = usePetSnapshotStore((s) => s.applyTick);

  useEffect(() => {
    // Catch up immediately on mount (handles cold launch after kill).
    applyTick();
    const id = setInterval(applyTick, intervalMs);
    return () => {
      clearInterval(id);
    };
  }, [applyTick, intervalMs]);
}
