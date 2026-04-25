import { useMemo } from 'react';

import { synthesizeContext } from '../../core/context/synthesize';
import type { LifeContext, LifeContextInputs, PermissionsView } from '../../core/context/types';
import { usePetSnapshotStore } from '../store/pet-snapshot-store';
import { useNowMs } from './use-now-ms';

const ALL_GRANTED: PermissionsView = Object.freeze({
  health: 'granted',
  location: 'granted',
  notifications: 'granted',
  calendar: 'granted',
  media: 'granted',
});

// Beijing default. Phase 18+ will swap in user-selected or live coords.
const DEFAULT_COORD = Object.freeze({ lat: 39.9, lon: 116.4 });

function deviceTzOffsetMs(): number {
  // getTimezoneOffset returns minutes WEST of UTC; we want east-positive ms.
  return -new Date().getTimezoneOffset() * 60_000;
}

// Synthesizes a LifeContext on each tick using the live pet from the snapshot
// store and `Date.now()` as the clock. Memoized on (pet, nowMs) so downstream
// `compose` calls are cheap.
export function useLifeContext(): LifeContext {
  const pet = usePetSnapshotStore((s) => s.pet);
  const nowMs = useNowMs(1000);

  return useMemo<LifeContext>(() => {
    const inputs: LifeContextInputs = {
      pet,
      nowMs,
      tzOffsetMs: deviceTzOffsetMs(),
      health: { steps: [], sleep: [], hrv: [] },
      location: {
        current: { lat: DEFAULT_COORD.lat, lon: DEFAULT_COORD.lon, timestampMs: nowMs },
        events: [],
      },
      permissions: ALL_GRANTED,
    };
    return synthesizeContext(inputs);
  }, [pet, nowMs]);
}
