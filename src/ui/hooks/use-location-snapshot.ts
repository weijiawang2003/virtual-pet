import { useEffect, useState } from 'react';

import type { Coord, GeofenceEvent } from '../../providers/location/types';
import { useRuntimeProviders } from '../providers/runtime-providers-context';

export interface LocationSnapshot {
  readonly current: Coord | null;
  readonly events: readonly GeofenceEvent[];
}

const EMPTY: LocationSnapshot = Object.freeze({
  current: null,
  events: Object.freeze([]),
});

export function useLocationSnapshot(): LocationSnapshot {
  const { location } = useRuntimeProviders();
  const [snap, setSnap] = useState<LocationSnapshot>(EMPTY);

  useEffect(() => {
    let cancelled = false;
    void location.getCurrent().then((current) => {
      if (cancelled) return;
      setSnap((s) => ({ current, events: s.events }));
    });
    const off = location.subscribeGeofence((event) => {
      setSnap((s) => ({ current: s.current, events: [...s.events, event] }));
    });
    return () => {
      cancelled = true;
      off();
    };
  }, [location]);

  return snap;
}
