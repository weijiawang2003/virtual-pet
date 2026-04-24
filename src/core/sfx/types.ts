export type SfxKey =
  | 'feed-crunch'
  | 'play-giggle'
  | 'clean-splash'
  | 'sleep-snore'
  | 'evolve-shimmer'
  | 'tap-blop'
  | 'deny-nope'
  | 'notification-chime'
  | 'birthday-fanfare';

export interface SfxPreference {
  readonly muted: boolean;
  readonly respectQuietHours: boolean;
  readonly quietStartHour: number;
  readonly quietEndHour: number;
}

export const DEFAULT_SFX_PREFERENCE: SfxPreference = Object.freeze({
  muted: false,
  respectQuietHours: true,
  quietStartHour: 22,
  quietEndHour: 7,
});
