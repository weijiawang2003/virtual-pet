import type { LifeSignal } from '../signals/types';
import { assertNever } from '../util/assert-never';

// Pure mapping LifeSignal → vitality delta. Positive deltas reward healthy
// behaviors; small negatives nudge against doom-scrolling. Most signals
// produce 0 — silence is the default. We never emit negatives outside the
// `heavy_phone_use` case (gentle philosophy: bad sleep doesn't punish, it
// just doesn't reward).
export function recoveryFromSignal(signal: LifeSignal): number {
  switch (signal.type) {
    case 'steps_delta':
      if (signal.count >= 10000) return 20;
      if (signal.count >= 5000) return 15;
      if (signal.count >= 1000) return 10;
      return 0;
    case 'sleep_session':
      if (signal.duration_minutes >= 7 * 60 && signal.quality === 'good') return 30;
      // Short sleep / fair quality: no reward, no penalty.
      return 0;
    case 'idle_no_phone':
      if (signal.duration_minutes >= 60) return 5;
      return 0;
    case 'heavy_phone_use':
      if (signal.duration_minutes >= 90) return -3;
      return 0;
    case 'workout':
      return 20;
    case 'activity_classified':
      // Translator already produces play+feed events; vitality boost only on
      // intense activities so we don't double-count walking.
      if (signal.activity === 'running' || signal.activity === 'cycling') return 10;
      return 0;
    case 'location_change':
      // Curiosity gets its own pet-state hint (Phase 21); no vitality move.
      return 0;
    default:
      // Defensive tombstone — exhaustiveness checked at compile time. Hitting
      // this means a new LifeSignal kind was added without updating this map.
      return assertNever(signal);
  }
}
