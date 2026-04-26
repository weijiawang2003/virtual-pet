import type { Event } from '../pet/types';
import { assertNever } from '../util/assert-never';
import type { SfxKey } from './types';

// Exhaustive reducer-event → SfxKey. UI-layer-triggered SFX (tap-blop,
// evolve-shimmer, notification-chime, birthday-fanfare, deny-nope) are played
// by their call sites directly, not via this map — they're not reducer events.
export function mapEventToSfx(event: Event): SfxKey | null {
  switch (event.type) {
    case 'feed':
      return 'feed-crunch';
    case 'play':
      return 'play-giggle';
    case 'rest':
      return 'sleep-snore';
    case 'tick':
      return null;
    // Phase 21 — translator output. None of these events should ring an
    // SFX (mood adjust is silent, bond_gain is silent, curiosity_hint is
    // a state flag, not a notification).
    case 'mood_adjust':
    case 'bond_gain':
    case 'curiosity_hint':
      return null;
    default:
      return assertNever(event);
  }
}
