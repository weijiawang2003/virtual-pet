import { useEffect, useState } from 'react';

import type { PermissionSnapshot } from '../../providers/permissions/types';
import { useRuntimeProviders } from '../providers/runtime-providers-context';

const DEFAULT_SNAPSHOT: PermissionSnapshot = Object.freeze({
  health: 'notDetermined',
  location: 'notDetermined',
  notifications: 'notDetermined',
  calendar: 'notDetermined',
  media: 'notDetermined',
});

// One-shot snapshot read on mount. A future phase will refresh on app
// foreground + after explicit permission requests.
export function usePermissionsSnapshot(): PermissionSnapshot {
  const { permissions } = useRuntimeProviders();
  const [snap, setSnap] = useState<PermissionSnapshot>(DEFAULT_SNAPSHOT);

  useEffect(() => {
    let cancelled = false;
    void permissions.snapshot().then((next) => {
      if (cancelled) return;
      setSnap(next);
    });
    return () => {
      cancelled = true;
    };
  }, [permissions]);

  return snap;
}
