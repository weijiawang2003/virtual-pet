import type { StateStorage } from 'zustand/middleware';

import { storage } from './mmkv';

// Zustand `persist` middleware speaks string-only StateStorage. MMKV's get/set
// string is a 1-to-1 fit; keeping this adapter ~20 lines avoids the
// `zustand-mmkv-storage` package (one less dep to audit).
export const mmkvStorage: StateStorage = {
  getItem: (name: string): string | null => {
    const v = storage.getString(name);
    return v ?? null;
  },
  setItem: (name: string, value: string): void => {
    storage.set(name, value);
  },
  removeItem: (name: string): void => {
    storage.remove(name);
  },
};
