import type { Disposer, LocationProvider } from './types';

// TODO: wire expo-location + expo-task-manager.
//   - expo-location.getCurrentPositionAsync for getCurrent()
//   - expo-location.startGeofencingAsync + TaskManager task for background
//     enter/exit events (survives app background/kill).
//   Needs Info.plist NSLocationWhenInUseUsageDescription (+Always variant for
//   geofencing), UIBackgroundModes: location, and Dev Client.

const NOT_IMPLEMENTED = 'RealLocationProvider is not wired — TODO: wire expo-location.';

export const realLocationProvider: LocationProvider = {
  getCurrent: () => Promise.reject(new Error(NOT_IMPLEMENTED)),
  watchRegion: ((): Disposer => {
    throw new Error(NOT_IMPLEMENTED);
  }) as LocationProvider['watchRegion'],
  subscribeGeofence: ((): Disposer => {
    throw new Error(NOT_IMPLEMENTED);
  }) as LocationProvider['subscribeGeofence'],
};
