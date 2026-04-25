import { storage } from '../mmkv';
import { daysInMonth, useUserProfileStore } from '../user-profile-store';

describe('useUserProfileStore', () => {
  beforeEach(() => {
    storage.clearAll();
    useUserProfileStore.persist.clearStorage();
    useUserProfileStore.getState().clear();
  });

  it('starts with empty defaults', () => {
    const s = useUserProfileStore.getState();
    expect(s.name).toBe('');
    expect(s.birthday).toBeNull();
  });

  it('setName persists across re-reads (via the same store instance)', () => {
    useUserProfileStore.getState().setName('Pikachu');
    expect(useUserProfileStore.getState().name).toBe('Pikachu');
  });

  it('setBirthday accepts month/day', () => {
    useUserProfileStore.getState().setBirthday({ month: 4, day: 24 });
    expect(useUserProfileStore.getState().birthday).toEqual({ month: 4, day: 24 });
  });

  it('clear resets to defaults', () => {
    useUserProfileStore.getState().setName('X');
    useUserProfileStore.getState().setBirthday({ month: 1, day: 1 });
    useUserProfileStore.getState().clear();
    expect(useUserProfileStore.getState().name).toBe('');
    expect(useUserProfileStore.getState().birthday).toBeNull();
  });
});

describe('daysInMonth', () => {
  it('30/31-day months', () => {
    expect(daysInMonth(1)).toBe(31);
    expect(daysInMonth(4)).toBe(30);
    expect(daysInMonth(7)).toBe(31);
    expect(daysInMonth(11)).toBe(30);
    expect(daysInMonth(12)).toBe(31);
  });

  it('returns 29 for February (covers leap years too)', () => {
    expect(daysInMonth(2)).toBe(29);
  });
});
