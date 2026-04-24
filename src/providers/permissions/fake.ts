import {
  PERMISSION_KINDS,
  type PermissionKind,
  type PermissionProvider,
  type PermissionSnapshot,
  type PermissionStatus,
} from './types';

export interface FakePermissionProvider extends PermissionProvider {
  set(kind: PermissionKind, status: PermissionStatus): void;
  grantAll(): void;
  denyAll(): void;
  reset(): void;
}

const DEFAULT_SNAPSHOT: PermissionSnapshot = Object.freeze({
  health: 'notDetermined',
  location: 'notDetermined',
  notifications: 'notDetermined',
  calendar: 'notDetermined',
  media: 'notDetermined',
});

function buildSnapshot(status: PermissionStatus): PermissionSnapshot {
  return Object.freeze({
    health: status,
    location: status,
    notifications: status,
    calendar: status,
    media: status,
  });
}

export function createFakePermissionProvider(
  seed: Partial<PermissionSnapshot> = {},
): FakePermissionProvider {
  let state: Record<PermissionKind, PermissionStatus> = { ...DEFAULT_SNAPSHOT, ...seed };

  return {
    get: (kind) => Promise.resolve(state[kind]),
    // request() echoes current status — tests control outcomes via set().
    request: (kind) => Promise.resolve(state[kind]),
    snapshot: () =>
      Promise.resolve(
        Object.freeze({
          health: state.health,
          location: state.location,
          notifications: state.notifications,
          calendar: state.calendar,
          media: state.media,
        }),
      ),
    set: (kind, status) => {
      state = { ...state, [kind]: status };
    },
    grantAll: () => {
      state = { ...buildSnapshot('granted') };
    },
    denyAll: () => {
      state = { ...buildSnapshot('denied') };
    },
    reset: () => {
      state = { ...DEFAULT_SNAPSHOT };
    },
  };
}

export function listPermissionKinds(): readonly PermissionKind[] {
  return PERMISSION_KINDS;
}
