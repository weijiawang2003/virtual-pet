import type { LocationProvider } from '../location/types';
import type { LifeSignal } from '../../core/signals/types';

export interface LocationSignalSourceDeps {
  readonly location: LocationProvider;
  readonly emit: (signal: LifeSignal) => void;
  readonly homeRegionId?: string;
  readonly now?: () => number;
}

export interface LocationSignalSource {
  start(): () => void;
}

const DEFAULT_HOME_REGION = 'home';

// Subscribes to LocationProvider geofence events and emits LifeSignals.
// Today's wiring uses the in-memory Fake (Phase 8) — swapping to a real
// expo-location-backed provider later is a one-line factory change in
// runtime-providers.ts; this signal source is provider-agnostic.
//
// Semantics: every `exit` event from the home region produces a
// `location_change { new_region: true }` signal. Re-`enter` of home is
// not a "new region" per the design — only outbound transitions count.
export function createLocationSignalSource(deps: LocationSignalSourceDeps): LocationSignalSource {
  const homeRegionId = deps.homeRegionId ?? DEFAULT_HOME_REGION;

  return {
    start(): () => void {
      const dispose = deps.location.subscribeGeofence((event) => {
        if (event.regionId === homeRegionId && event.type === 'exit') {
          deps.emit({
            type: 'location_change',
            new_region: true,
            at: event.at,
          });
        }
      });
      return dispose;
    },
  };
}
