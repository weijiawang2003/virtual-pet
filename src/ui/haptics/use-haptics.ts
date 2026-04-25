import * as Haptics from 'expo-haptics';
import { useCallback } from 'react';

import { useSettingsStore } from '../store/settings-store';

export type HapticIntensity = 'light' | 'medium' | 'heavy' | 'selection';

const STYLE_MAP: Record<Exclude<HapticIntensity, 'selection'>, Haptics.ImpactFeedbackStyle> = {
  light: Haptics.ImpactFeedbackStyle.Light,
  medium: Haptics.ImpactFeedbackStyle.Medium,
  heavy: Haptics.ImpactFeedbackStyle.Heavy,
};

export interface HapticsApi {
  trigger: (intensity: HapticIntensity) => void;
  enabled: boolean;
}

// Wraps expo-haptics. No-op when settings.haptics is false. Failures are
// swallowed — haptics not firing must never crash a user action.
export function useHaptics(): HapticsApi {
  const enabled = useSettingsStore((s) => s.haptics);

  const trigger = useCallback(
    (intensity: HapticIntensity): void => {
      if (!enabled) return;
      try {
        if (intensity === 'selection') {
          void Haptics.selectionAsync();
        } else {
          void Haptics.impactAsync(STYLE_MAP[intensity]);
        }
      } catch {
        // Silent — haptics are an enhancement, never a blocker.
      }
    },
    [enabled],
  );

  return { trigger, enabled };
}
