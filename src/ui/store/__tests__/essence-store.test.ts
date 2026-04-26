import { storage } from '../mmkv';
import { useEssenceStore } from '../essence-store';

describe('useEssenceStore', () => {
  beforeEach(() => {
    storage.clearAll();
    useEssenceStore.persist.clearStorage();
    useEssenceStore.getState().reset();
  });

  it('starts at 0 / 0', () => {
    expect(useEssenceStore.getState().current).toBe(0);
    expect(useEssenceStore.getState().lifetimeEarned).toBe(0);
  });

  it('gain increases current and lifetimeEarned', () => {
    useEssenceStore.getState().gain(10);
    expect(useEssenceStore.getState().current).toBe(10);
    expect(useEssenceStore.getState().lifetimeEarned).toBe(10);
    useEssenceStore.getState().gain(5);
    expect(useEssenceStore.getState().current).toBe(15);
    expect(useEssenceStore.getState().lifetimeEarned).toBe(15);
  });

  it('gain with non-positive amount is a no-op', () => {
    useEssenceStore.getState().gain(0);
    useEssenceStore.getState().gain(-5);
    expect(useEssenceStore.getState().current).toBe(0);
  });

  it('consume returns false when insufficient', () => {
    expect(useEssenceStore.getState().consume(10)).toBe(false);
    expect(useEssenceStore.getState().current).toBe(0);
  });

  it('consume returns true and decreases current', () => {
    useEssenceStore.getState().gain(20);
    expect(useEssenceStore.getState().consume(10)).toBe(true);
    expect(useEssenceStore.getState().current).toBe(10);
    // lifetimeEarned does not decrease.
    expect(useEssenceStore.getState().lifetimeEarned).toBe(20);
  });

  it('consume rejects negative amounts', () => {
    useEssenceStore.getState().gain(20);
    expect(useEssenceStore.getState().consume(-5)).toBe(false);
    expect(useEssenceStore.getState().current).toBe(20);
  });

  it('reset returns to defaults', () => {
    useEssenceStore.getState().gain(50);
    useEssenceStore.getState().reset();
    expect(useEssenceStore.getState().current).toBe(0);
    expect(useEssenceStore.getState().lifetimeEarned).toBe(0);
  });
});
