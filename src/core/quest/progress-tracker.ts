import type { LifeSignal } from '../signals/types';
import type { QuestType } from './types';

// Pure mapping from a LifeSignal to a quest progress delta. Returns 0 when
// the signal isn't relevant to that quest type, or when it would be a
// double-count (e.g., sleep_session sets progress, doesn't add).
//
// The reducer is the one that adds delta to `progress` and detects
// completion — this helper just answers "how much".
export function progressDeltaFor(questType: QuestType, signal: LifeSignal): number {
  switch (questType) {
    case 'walk':
      return signal.type === 'steps_delta' ? signal.count : 0;
    case 'sleep':
      // Replace-style: a sleep_session is a digest of one whole night,
      // so we treat it as "absolute progress" by emitting its full minutes.
      // The reducer clamps cumulative ≥ threshold for completion, so this
      // works as long as a single full sleep ≥ 7h crosses the bar.
      return signal.type === 'sleep_session' ? signal.duration_minutes : 0;
    case 'idle':
      return signal.type === 'idle_no_phone' ? signal.duration_minutes : 0;
    case 'visit_new_place':
      return signal.type === 'location_change' && signal.new_region ? 1 : 0;
    case 'play_with_pet':
    case 'feed_special':
      // Manual-action quests are progressed via a separate dispatch path;
      // life signals never advance them.
      return 0;
  }
}
