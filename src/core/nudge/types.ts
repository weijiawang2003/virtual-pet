import type { Pet, Stats } from '../pet/types';

// Core-local view of a permission snapshot. Keeps core free of provider imports
// per CLAUDE.md §4. Structurally compatible with providers/permissions/types
// PermissionSnapshot — TS structural typing lets a caller pass one as the other.
type PermissionsViewStatus = 'granted' | 'denied' | 'limited' | 'notDetermined';

export type PermissionsView = Readonly<{
  health: PermissionsViewStatus;
  location: PermissionsViewStatus;
  notifications: PermissionsViewStatus;
  calendar: PermissionsViewStatus;
  media: PermissionsViewStatus;
}>;

export type NudgeKind = 'feed' | 'rest' | 'play' | 'bedtime' | 'custom';

export interface Nudge {
  readonly kind: NudgeKind;
  readonly priority: number;
  readonly message: string;
  readonly requiresNotificationPermission: boolean;
  readonly suggestedAction?: 'feed' | 'play' | 'rest';
}

export type NudgeRule =
  | {
      readonly type: 'stat-threshold';
      readonly kind: NudgeKind;
      readonly stat: keyof Stats;
      readonly below: number;
      readonly priority: number;
      readonly message: string;
      readonly requiresNotificationPermission: boolean;
      readonly suggestedAction?: 'feed' | 'play' | 'rest';
    }
  | {
      readonly type: 'hour-window';
      readonly kind: NudgeKind;
      readonly hours: readonly number[];
      readonly priority: number;
      readonly message: string;
      readonly requiresNotificationPermission: boolean;
    };

export interface RecentNotification {
  readonly firedAt: number;
  readonly kind: NudgeKind;
}

export interface NudgeContext {
  readonly pet: Pet;
  readonly nowMs: number;
  readonly hourOfDay: number;
  readonly recentNotifications: readonly RecentNotification[];
  readonly permissions: PermissionsView;
}

export interface SelectOptions {
  readonly dailyBudget: number;
}

export const DEFAULT_DAILY_BUDGET = 3;
