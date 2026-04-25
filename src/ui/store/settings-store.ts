import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { ThemeMode } from '../theme/types';
import { mmkvStorage } from './zustand-mmkv';

export interface SettingsState {
  readonly haptics: boolean;
  readonly sound: boolean;
  readonly theme: ThemeMode;
  readonly onboardingCompleted: boolean;
  setHaptics: (v: boolean) => void;
  setSound: (v: boolean) => void;
  setTheme: (m: ThemeMode) => void;
  setOnboardingCompleted: (v: boolean) => void;
  reset: () => void;
}

const DEFAULT_STATE = {
  haptics: true,
  sound: true,
  theme: 'auto' as ThemeMode,
  onboardingCompleted: false,
} as const;

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...DEFAULT_STATE,
      setHaptics: (v) => set({ haptics: v }),
      setSound: (v) => set({ sound: v }),
      setTheme: (m) => set({ theme: m }),
      setOnboardingCompleted: (v) => set({ onboardingCompleted: v }),
      reset: () => set({ ...DEFAULT_STATE }),
    }),
    {
      name: 'settings',
      storage: createJSONStorage(() => mmkvStorage),
      version: 1,
    },
  ),
);
