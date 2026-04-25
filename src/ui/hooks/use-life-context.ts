import { useMemo } from 'react';

import { synthesizeContext } from '../../core/context/synthesize';
import type { LifeContext, LifeContextInputs } from '../../core/context/types';
import { usePetSnapshotStore } from '../store/pet-snapshot-store';
import { useUserProfileStore } from '../store/user-profile-store';
import { useHealthSamples } from './use-health-samples';
import { useLocationSnapshot } from './use-location-snapshot';
import { useNowMs } from './use-now-ms';
import { usePermissionsSnapshot } from './use-permissions-snapshot';

function deviceTzOffsetMs(): number {
  // getTimezoneOffset returns minutes WEST of UTC; we want east-positive ms.
  return -new Date().getTimezoneOffset() * 60_000;
}

// Synthesizes a LifeContext on each tick. Inputs come from runtime providers
// (Phase 17) and the persisted user profile (Phase 18).
export function useLifeContext(): LifeContext {
  const pet = usePetSnapshotStore((s) => s.pet);
  const nowMs = useNowMs(1000);
  const health = useHealthSamples(nowMs);
  const location = useLocationSnapshot();
  const permissions = usePermissionsSnapshot();
  const birthday = useUserProfileStore((s) => s.birthday);

  return useMemo<LifeContext>(() => {
    const inputs: LifeContextInputs = {
      pet,
      nowMs,
      tzOffsetMs: deviceTzOffsetMs(),
      health,
      location,
      permissions,
      ...(birthday !== null
        ? { user: { birthday: { month: birthday.month, day: birthday.day } } }
        : {}),
    };
    return synthesizeContext(inputs);
  }, [pet, nowMs, health, location, permissions, birthday]);
}
