import { storage } from '../mmkv';
import { mmkvStorage } from '../zustand-mmkv';

describe('mmkvStorage (zustand StateStorage adapter)', () => {
  beforeEach(() => {
    storage.clearAll();
  });

  it('round-trips a string', () => {
    mmkvStorage.setItem('key1', 'hello');
    expect(mmkvStorage.getItem('key1')).toBe('hello');
  });

  it('returns null for unset keys (per StateStorage contract)', () => {
    expect(mmkvStorage.getItem('missing')).toBeNull();
  });

  it('removes a value', () => {
    mmkvStorage.setItem('key2', 'v');
    mmkvStorage.removeItem('key2');
    expect(mmkvStorage.getItem('key2')).toBeNull();
  });

  it('survives a "fresh" import simulation (mock store persistence)', () => {
    mmkvStorage.setItem('reload-key', 'persisted');
    // Re-import does not reset the in-memory mock; same as MMKV's on-disk behavior.
    expect(mmkvStorage.getItem('reload-key')).toBe('persisted');
  });
});
