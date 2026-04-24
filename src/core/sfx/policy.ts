import type { LifeContext } from '../context/types';
import type { SfxPreference } from './types';

function isInQuietHours(hour: number, startHour: number, endHour: number): boolean {
  // Window wraps midnight when startHour > endHour (e.g. 22 → 7 means 22:00–07:00).
  if (startHour === endHour) return false;
  if (startHour < endHour) {
    return hour >= startHour && hour < endHour;
  }
  return hour >= startHour || hour < endHour;
}

// Pure predicate. UI decides what to do with `false`; we don't emit side effects.
export function shouldPlaySfx(ctx: LifeContext, pref: SfxPreference): boolean {
  if (pref.muted) return false;
  if (
    pref.respectQuietHours &&
    isInQuietHours(ctx.hourOfDay, pref.quietStartHour, pref.quietEndHour)
  ) {
    return false;
  }
  return true;
}
