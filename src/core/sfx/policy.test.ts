import { synthesizeContext } from '../context/synthesize';
import type { LifeContextInputs, PermissionsView } from '../context/types';
import { createPet } from '../pet/reducer';
import { DEFAULT_SFX_PREFERENCE, type SfxPreference } from './types';
import { shouldPlaySfx } from './policy';

const H = 60 * 60 * 1000;

const GRANTED: PermissionsView = Object.freeze({
  health: 'granted',
  location: 'granted',
  notifications: 'granted',
  calendar: 'granted',
  media: 'granted',
});

function ctxAt(hourLocal: number) {
  // Produce a context where hourOfDay equals the given local hour.
  // Use tzOffset = 0 and pick nowMs so floor(nowMs/hour) % 24 == hourLocal.
  const nowMs = hourLocal * H;
  const inputs: LifeContextInputs = {
    pet: createPet(0),
    nowMs,
    tzOffsetMs: 0,
    health: { steps: [], sleep: [], hrv: [] },
    location: { current: null, events: [] },
    permissions: GRANTED,
  };
  return synthesizeContext(inputs);
}

describe('shouldPlaySfx', () => {
  it('muted → always false, even at noon', () => {
    const pref: SfxPreference = { ...DEFAULT_SFX_PREFERENCE, muted: true };
    expect(shouldPlaySfx(ctxAt(12), pref)).toBe(false);
  });

  it('respectQuietHours off → true even at 03:00', () => {
    const pref: SfxPreference = { ...DEFAULT_SFX_PREFERENCE, respectQuietHours: false };
    expect(shouldPlaySfx(ctxAt(3), pref)).toBe(true);
  });

  it('default quiet window 22→07: false at 23:00', () => {
    expect(shouldPlaySfx(ctxAt(23), DEFAULT_SFX_PREFERENCE)).toBe(false);
  });

  it('default quiet window 22→07: false at 02:00', () => {
    expect(shouldPlaySfx(ctxAt(2), DEFAULT_SFX_PREFERENCE)).toBe(false);
  });

  it('default quiet window 22→07: true at 10:00', () => {
    expect(shouldPlaySfx(ctxAt(10), DEFAULT_SFX_PREFERENCE)).toBe(true);
  });

  it('non-wrapping window (10→12): true outside, false inside', () => {
    const pref: SfxPreference = {
      muted: false,
      respectQuietHours: true,
      quietStartHour: 10,
      quietEndHour: 12,
    };
    expect(shouldPlaySfx(ctxAt(11), pref)).toBe(false);
    expect(shouldPlaySfx(ctxAt(13), pref)).toBe(true);
    expect(shouldPlaySfx(ctxAt(9), pref)).toBe(true);
  });

  it('identical start/end hour → quiet window is empty', () => {
    const pref: SfxPreference = {
      muted: false,
      respectQuietHours: true,
      quietStartHour: 22,
      quietEndHour: 22,
    };
    expect(shouldPlaySfx(ctxAt(22), pref)).toBe(true);
  });
});
