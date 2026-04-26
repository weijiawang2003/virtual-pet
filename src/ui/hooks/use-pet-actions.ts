import { useCallback } from 'react';

import { usePetSnapshotStore } from '../store/pet-snapshot-store';
import { useVitalityStore } from '../store/vitality-store';
import { useHaptics } from '../haptics/use-haptics';

export interface PetActions {
  feed: () => void;
  play: () => void;
  rest: () => void;
  clean: () => void;
  reset: () => void;
}

const FEED_NUTRITION = 15;
const PLAY_MINUTES = 10;
const REST_MINUTES = 30;

// All UI actions go through this hook so haptics + dispatch + vitality stay
// in lockstep. Phase 23: feed/play/clean gate on vitality; if insufficient
// the action is a haptic-only no-op. Buttons should also be visually
// disabled, but this gate keeps state correct even if the UI lags.
export function usePetActions(): PetActions {
  const dispatch = usePetSnapshotStore((s) => s.dispatch);
  const reset = usePetSnapshotStore((s) => s.reset);
  const tryConsume = useVitalityStore((s) => s.tryConsume);
  const resetVitality = useVitalityStore((s) => s.reset);
  const haptics = useHaptics();

  const feed = useCallback(() => {
    haptics.trigger('light');
    if (!tryConsume('feed')) return;
    dispatch({ type: 'feed', nutrition: FEED_NUTRITION, source: 'manual' });
  }, [dispatch, haptics, tryConsume]);

  const play = useCallback(() => {
    haptics.trigger('light');
    if (!tryConsume('play')) return;
    dispatch({ type: 'play', minutes: PLAY_MINUTES, source: 'manual' });
  }, [dispatch, haptics, tryConsume]);

  const restAction = useCallback(() => {
    haptics.trigger('light');
    // Rest is free (cost = 0); still routes through tryConsume so future
    // logging hooks can see every action go through one path.
    tryConsume('rest');
    dispatch({ type: 'rest', minutes: REST_MINUTES, source: 'manual' });
  }, [dispatch, haptics, tryConsume]);

  const clean = useCallback(() => {
    haptics.trigger('light');
    if (!tryConsume('clean')) return;
    // No reducer event yet — placeholder until cleanliness lands.
  }, [haptics, tryConsume]);

  const resetAction = useCallback(() => {
    haptics.trigger('medium');
    reset();
    resetVitality();
  }, [haptics, reset, resetVitality]);

  return { feed, play, rest: restAction, clean, reset: resetAction };
}
