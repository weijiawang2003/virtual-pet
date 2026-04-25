import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { ThemeMode } from '../theme/types';
import { mmkvStorage } from './zustand-mmkv';

export type DemoSpeed = 1 | 10 | 60 | 600;
export const DEMO_SPEED_OPTIONS: readonly DemoSpeed[] = [1, 10, 60, 600];

export interface SettingsState {
  readonly haptics: boolean;
  readonly sound: boolean;
  readonly theme: ThemeMode;
  readonly demoSpeed: DemoSpeed;
  readonly onboardingCompleted: boolean;
  setHaptics: (v: boolean) => void;
  setSound: (v: boolean) => void;
  setTheme: (m: ThemeMode) => void;
  setDemoSpeed: (s: DemoSpeed) => void;
  setOnboardingCompleted: (v: boolean) => void;
  reset: () => void;
}

const DEFAULT_STATE = {
  haptics: true,
  sound: true,
  theme: 'auto' as ThemeMode,
  demoSpeed: 1 as DemoSpeed,
  onboardingCompleted: false,
} as const;

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...DEFAULT_STATE,
      setHaptics: (v) => set({ haptics: v }),
      setSound: (v) => set({ sound: v }),
      setTheme: (m) => set({ theme: m }),
      setDemoSpeed: (s) => set({ demoSpeed: s }),
      setOnboardingCompleted: (v) => set({ onboardingCompleted: v }),
      reset: () => set({ ...DEFAULT_STATE }),
    }),
    {
      name: 'settings',
      storage: createJSONStorage(() => mmkvStorage),
      version: 2,
    },
  ),
);
