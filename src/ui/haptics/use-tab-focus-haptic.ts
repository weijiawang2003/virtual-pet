import { useFocusEffect } from 'expo-router';
import { useCallback, useRef } from 'react';

import { useHaptics } from './use-haptics';

// Fires a light haptic each time a tab becomes focused, except on the very
// first focus (cold-launch entrance). NativeTabs (alpha) does not expose an
// `onPress`, so we hook focus instead.
export function useTabFocusHaptic(): void {
  const { trigger } = useHaptics();
  const isFirstFocus = useRef(true);

  useFocusEffect(
    useCallback(() => {
      if (isFirstFocus.current) {
        isFirstFocus.current = false;
        return;
      }
      trigger('light');
    }, [trigger]),
  );
}
