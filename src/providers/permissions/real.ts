import type { PermissionKind, PermissionProvider, PermissionSnapshot } from './types';

// TODO(Phase 4+ real-wiring): implement via expo-permissions-style APIs:
//   - HealthKit: @kingstinct/react-native-healthkit requestAuthorization
//   - location: expo-location.requestForegroundPermissionsAsync +
//               expo-location.requestBackgroundPermissionsAsync (separate)
//   - notifications: expo-notifications.getPermissionsAsync
//   - calendar: expo-calendar.requestCalendarPermissionsAsync
//   - media: expo-media-library.requestPermissionsAsync
// Needs Dev Client (Phase 4+ of product roadmap) + Info.plist usage strings.

const NOT_IMPLEMENTED = 'RealPermissionProvider is not wired — needs Dev Client build.';

export const realPermissionProvider: PermissionProvider = {
  get: (_kind: PermissionKind) => Promise.reject(new Error(NOT_IMPLEMENTED)),
  request: (_kind: PermissionKind) => Promise.reject(new Error(NOT_IMPLEMENTED)),
  snapshot: (): Promise<PermissionSnapshot> => Promise.reject(new Error(NOT_IMPLEMENTED)),
};
