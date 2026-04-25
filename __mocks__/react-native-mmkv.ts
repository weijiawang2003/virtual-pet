// In-memory MMKV mock for Jest. react-native-mmkv v4 uses Nitro Modules which
// can't run under jest-expo's node/jsdom env, so we shim the surface our code
// touches with the v4 API: set / getString / getNumber / getBoolean /
// getBuffer / contains / remove / getAllKeys / clearAll / trim.

type Value = string | number | boolean | ArrayBuffer;

export interface MockMMKV {
  readonly id: string;
  readonly length: number;
  readonly size: number;
  readonly byteSize: number;
  readonly isReadOnly: boolean;
  readonly isEncrypted: boolean;
  set: (key: string, value: Value) => void;
  getString: (key: string) => string | undefined;
  getNumber: (key: string) => number | undefined;
  getBoolean: (key: string) => boolean | undefined;
  getBuffer: (key: string) => ArrayBuffer | undefined;
  contains: (key: string) => boolean;
  remove: (key: string) => boolean;
  getAllKeys: () => string[];
  clearAll: () => void;
  trim: () => void;
}

const stores = new Map<string, Map<string, Value>>();

function getStore(id: string): Map<string, Value> {
  let s = stores.get(id);
  if (s === undefined) {
    s = new Map<string, Value>();
    stores.set(id, s);
  }
  return s;
}

export function createMMKV(config: { id?: string } = {}): MockMMKV {
  const id = config.id ?? 'default';
  const store = getStore(id);
  return {
    get id(): string {
      return id;
    },
    get length(): number {
      return store.size;
    },
    get size(): number {
      return store.size;
    },
    get byteSize(): number {
      return store.size;
    },
    isReadOnly: false,
    isEncrypted: false,
    set(key, value) {
      store.set(key, value);
    },
    getString(key) {
      const v = store.get(key);
      return typeof v === 'string' ? v : undefined;
    },
    getNumber(key) {
      const v = store.get(key);
      return typeof v === 'number' ? v : undefined;
    },
    getBoolean(key) {
      const v = store.get(key);
      return typeof v === 'boolean' ? v : undefined;
    },
    getBuffer(key) {
      const v = store.get(key);
      return v instanceof ArrayBuffer ? v : undefined;
    },
    contains(key) {
      return store.has(key);
    },
    remove(key) {
      return store.delete(key);
    },
    getAllKeys() {
      return Array.from(store.keys());
    },
    clearAll() {
      store.clear();
    },
    trim() {
      // no-op
    },
  };
}

export function existsMMKV(): boolean {
  return true;
}

export function deleteMMKV(): void {
  // no-op for test env
}

// Hooks aren't used by Phase 14 stores; export no-ops in case other tests touch them.
export function useMMKV(): MockMMKV {
  return createMMKV();
}
export function useMMKVString(): [string | undefined, (v: string | undefined) => void] {
  let v: string | undefined;
  return [
    v,
    (next) => {
      v = next;
    },
  ];
}
export function useMMKVNumber(): [number | undefined, (v: number | undefined) => void] {
  let v: number | undefined;
  return [
    v,
    (next) => {
      v = next;
    },
  ];
}
export function useMMKVBoolean(): [boolean | undefined, (v: boolean | undefined) => void] {
  let v: boolean | undefined;
  return [
    v,
    (next) => {
      v = next;
    },
  ];
}
export function useMMKVObject<T>(): [T | undefined, (v: T | undefined) => void] {
  let v: T | undefined;
  return [
    v,
    (next) => {
      v = next;
    },
  ];
}
export function useMMKVBuffer(): [ArrayBuffer | undefined, (v: ArrayBuffer | undefined) => void] {
  let v: ArrayBuffer | undefined;
  return [
    v,
    (next) => {
      v = next;
    },
  ];
}
export function useMMKVListener(): void {
  // no-op
}
export function useMMKVKeys(): string[] {
  return [];
}
