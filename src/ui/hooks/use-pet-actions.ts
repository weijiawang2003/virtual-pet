import { useCallback } from 'react';

import { usePetSnapshotStore } from '../store/pet-snapshot-store';
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

// All UI actions go through this hook so haptics + dispatch stay in lockstep.
// `clean` is a placeholder until cleanliness lands (own phase).
export function usePetActions(): PetActions {
  const dispatch = usePetSnapshotStore((s) => s.dispatch);
  const reset = usePetSnapshotStore((s) => s.reset);
  const haptics = useHaptics();

  const feed = useCallback(() => {
    haptics.trigger('light');
    dispatch({ type: 'feed', nutrition: FEED_NUTRITION, source: 'manual' });
  }, [dispatch, haptics]);

  const play = useCallback(() => {
    haptics.trigger('light');
    dispatch({ type: 'play', minutes: PLAY_MINUTES, source: 'manual' });
  }, [dispatch, haptics]);

  const restAction = useCallback(() => {
    haptics.trigger('light');
    dispatch({ type: 'rest', minutes: REST_MINUTES, source: 'manual' });
  }, [dispatch, haptics]);

  const clean = useCallback(() => {
    haptics.trigger('light');
    // No reducer event yet — Phase 18 adds cleanliness.
  }, [haptics]);

  const resetAction = useCallback(() => {
    haptics.trigger('medium');
    reset();
  }, [haptics, reset]);

  return { feed, play, rest: restAction, clean, reset: resetAction };
}
