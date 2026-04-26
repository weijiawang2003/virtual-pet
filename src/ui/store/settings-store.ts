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
  readonly notificationsEnabled: boolean;
  readonly notificationsAskedAt: number | null;
  // Phase 22 — three real-life-signal toggles. Default OFF; user opts in
  // via Settings or the signals onboarding screen.
  readonly signalsHealthEnabled: boolean;
  readonly signalsLocationEnabled: boolean;
  readonly signalsAppStateEnabled: boolean;
  readonly signalsOnboardingShownAt: number | null;
  setHaptics: (v: boolean) => void;
  setSound: (v: boolean) => void;
  setTheme: (m: ThemeMode) => void;
  setDemoSpeed: (s: DemoSpeed) => void;
  setOnboardingCompleted: (v: boolean) => void;
  setNotificationsEnabled: (v: boolean) => void;
  setNotificationsAskedAt: (t: number | null) => void;
  setSignalsHealthEnabled: (v: boolean) => void;
  setSignalsLocationEnabled: (v: boolean) => void;
  setSignalsAppStateEnabled: (v: boolean) => void;
  setSignalsOnboardingShownAt: (t: number | null) => void;
  reset: () => void;
}

const DEFAULT_STATE = {
  haptics: true,
  sound: true,
  theme: 'auto' as ThemeMode,
  demoSpeed: 1 as DemoSpeed,
  onboardingCompleted: false,
  notificationsEnabled: true,
  notificationsAskedAt: null as number | null,
  signalsHealthEnabled: false,
  signalsLocationEnabled: false,
  signalsAppStateEnabled: false,
  signalsOnboardingShownAt: null as number | null,
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
      setNotificationsEnabled: (v) => set({ notificationsEnabled: v }),
      setNotificationsAskedAt: (t) => set({ notificationsAskedAt: t }),
      setSignalsHealthEnabled: (v) => set({ signalsHealthEnabled: v }),
      setSignalsLocationEnabled: (v) => set({ signalsLocationEnabled: v }),
      setSignalsAppStateEnabled: (v) => set({ signalsAppStateEnabled: v }),
      setSignalsOnboardingShownAt: (t) => set({ signalsOnboardingShownAt: t }),
      reset: () => set({ ...DEFAULT_STATE }),
    }),
    {
      name: 'settings',
      storage: createJSONStorage(() => mmkvStorage),
      version: 4,
    },
  ),
);
