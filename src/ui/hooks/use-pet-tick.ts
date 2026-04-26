import { useEffect } from 'react';

import { usePetSnapshotStore } from '../store/pet-snapshot-store';
import { useQuestStore } from '../store/quest-store';
import { useVitalityStore } from '../store/vitality-store';

const TICK_INTERVAL_MS = 1000;

// Mounts a single setInterval driving (1) pet stat decay, (2) vitality
// passive recovery, (3) quest expiry checks. Safe under StrictMode —
// every applyTick is idempotent against its own lastUpdated cursor.
export function usePetTick(intervalMs: number = TICK_INTERVAL_MS): void {
  const applyPetTick = usePetSnapshotStore((s) => s.applyTick);
  const applyVitalityTick = useVitalityStore((s) => s.applyTick);
  const applyQuestExpiry = useQuestStore((s) => s.applyExpiryTick);

  useEffect(() => {
    const tick = (): void => {
      applyPetTick();
      applyVitalityTick();
      applyQuestExpiry();
    };
    // Catch up immediately on mount (handles cold launch after kill).
    tick();
    const id = setInterval(tick, intervalMs);
    return () => {
      clearInterval(id);
    };
  }, [applyPetTick, applyVitalityTick, applyQuestExpiry, intervalMs]);
}
