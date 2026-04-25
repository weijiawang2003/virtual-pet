import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { mmkvStorage } from './zustand-mmkv';

export interface BirthdayMD {
  readonly month: number;
  readonly day: number;
}

export interface UserProfileState {
  readonly name: string;
  readonly birthday: BirthdayMD | null;
  setName: (n: string) => void;
  setBirthday: (b: BirthdayMD | null) => void;
  clear: () => void;
}

const DEFAULT_STATE = {
  name: '',
  birthday: null as BirthdayMD | null,
};

export const useUserProfileStore = create<UserProfileState>()(
  persist(
    (set) => ({
      ...DEFAULT_STATE,
      setName: (n) => set({ name: n }),
      setBirthday: (b) => set({ birthday: b }),
      clear: () => set({ ...DEFAULT_STATE }),
    }),
    {
      name: 'user-profile',
      storage: createJSONStorage(() => mmkvStorage),
      version: 1,
    },
  ),
);

// 1-based; matches LifeContext.user.birthday {month, day} expectation.
export function daysInMonth(month: number): number {
  if (month === 2) return 29;
  if (month === 4 || month === 6 || month === 9 || month === 11) return 30;
  return 31;
}
