export type PermissionKind = 'health' | 'location' | 'notifications' | 'calendar' | 'media';

export type PermissionStatus = 'granted' | 'denied' | 'limited' | 'notDetermined';

export type PermissionSnapshot = Readonly<Record<PermissionKind, PermissionStatus>>;

export const PERMISSION_KINDS: readonly PermissionKind[] = [
  'health',
  'location',
  'notifications',
  'calendar',
  'media',
];

export const PERMISSION_STATUSES: readonly PermissionStatus[] = [
  'granted',
  'denied',
  'limited',
  'notDetermined',
];

export interface PermissionProvider {
  get(kind: PermissionKind): Promise<PermissionStatus>;
  request(kind: PermissionKind): Promise<PermissionStatus>;
  snapshot(): Promise<PermissionSnapshot>;
}
