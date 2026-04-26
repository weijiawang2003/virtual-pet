import type { Event, Pet } from '../pet/types';
import { assertNever } from '../util/assert-never';
import type { LifeSignal } from './types';

const ONE_HOUR_MS = 60 * 60 * 1000;
const CURIOSITY_HINT_WINDOW_MS = 6 * ONE_HOUR_MS;

// Pure function: LifeSignal + current pet → reducer Events. Returns
// `readonly Event[]` (possibly empty). Exhaustive over LifeSignal kinds.
//
// `pet` is currently unused — reserved for Phase 23+ personality / element
// modulation (a `glutton` pet might amplify FEED outputs, a `moon` element
// might double sleep rewards, etc.). Kept in the signature so future
// changes don't churn every call site.
export function translateSignal(signal: LifeSignal, _pet: Pet): readonly Event[] {
  switch (signal.type) {
    case 'steps_delta': {
      if (signal.count >= 10000) {
        return [
          { type: 'play', minutes: 20, source: 'health' },
          { type: 'feed', nutrition: 5, source: 'health' },
        ];
      }
      if (signal.count >= 5000) {
        return [{ type: 'play', minutes: 10, source: 'health' }];
      }
      return [];
    }
    case 'sleep_session': {
      if (signal.duration_minutes >= 7 * 60 && signal.quality === 'good') {
        return [{ type: 'rest', minutes: 60, source: 'health' }];
      }
      if (signal.duration_minutes < 5 * 60) {
        return [{ type: 'mood_adjust', happiness: -10, source: 'health' }];
      }
      return [];
    }
    case 'activity_classified': {
      if (signal.activity === 'running' || signal.activity === 'cycling') {
        return [
          { type: 'play', minutes: 20, source: 'health' },
          { type: 'feed', nutrition: 5, source: 'health' },
        ];
      }
      return [];
    }
    case 'idle_no_phone': {
      if (signal.duration_minutes >= 60) {
        return [{ type: 'rest', minutes: 30, source: 'inferred' }];
      }
      return [];
    }
    case 'heavy_phone_use': {
      if (signal.duration_minutes >= 90) {
        return [{ type: 'mood_adjust', happiness: -5, source: 'inferred' }];
      }
      return [];
    }
    case 'workout': {
      // Bond gain proportional to workout length. Min 1 so any workout
      // is acknowledged.
      const amount = Math.max(1, Math.floor(signal.duration_minutes / 2));
      return [{ type: 'bond_gain', amount, source: 'health' }];
    }
    case 'location_change': {
      if (signal.new_region) {
        return [
          {
            type: 'curiosity_hint',
            until: signal.at + CURIOSITY_HINT_WINDOW_MS,
            source: 'inferred',
          },
        ];
      }
      return [];
    }
    default:
      return assertNever(signal);
  }
}
