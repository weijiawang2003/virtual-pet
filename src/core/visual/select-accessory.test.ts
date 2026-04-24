import { makeContext } from './__fixtures__/build-context';
import { selectAccessory } from './select-accessory';

const H = 60 * 60 * 1000;

describe('selectAccessory', () => {
  it('returns null by default', () => {
    expect(selectAccessory(makeContext())).toBeNull();
  });

  it('returns party-hat on the user birthday', () => {
    // 2026-04-24 UTC → month=4, day=24
    const nowMs = Date.UTC(2026, 3, 24, 12, 0, 0);
    const ctx = makeContext({ nowMs, user: { birthday: { month: 4, day: 24 } } });
    expect(selectAccessory(ctx)).toBe('party-hat');
  });

  it('returns cny-jacket on Chinese New Year (lunar 1/1)', () => {
    // 2026 Chinese New Year: 2026-02-17
    const nowMs = Date.UTC(2026, 1, 17, 12, 0, 0);
    const ctx = makeContext({ nowMs });
    expect(ctx.lunar.month).toBe(1);
    expect(ctx.lunar.day).toBe(1);
    expect(selectAccessory(ctx)).toBe('cny-jacket');
  });

  it('returns raincoat when weather is rain and no festivals', () => {
    // Find a date with rain in the deterministic mock, no CNY, no birthday.
    let nowMs = Date.UTC(2026, 3, 24, 14, 0, 0);
    let ctx = makeContext({
      nowMs,
      location: { current: { lat: 31.23, lon: 121.47, timestampMs: nowMs }, events: [] },
    });
    let tries = 0;
    while (ctx.weather?.condition !== 'rain' && tries < 10) {
      nowMs += 24 * H;
      ctx = makeContext({
        nowMs,
        location: { current: { lat: 31.23, lon: 121.47, timestampMs: nowMs }, events: [] },
      });
      tries += 1;
    }
    expect(ctx.weather?.condition).toBe('rain');
    expect(selectAccessory(ctx)).toBe('raincoat');
  });

  it('birthday wins over CNY when both match', () => {
    // Force both: birthday = Feb 17, date = 2026-02-17 which is also CNY.
    const nowMs = Date.UTC(2026, 1, 17, 12, 0, 0);
    const ctx = makeContext({ nowMs, user: { birthday: { month: 2, day: 17 } } });
    expect(selectAccessory(ctx)).toBe('party-hat');
  });

  it('birthday wins over rain', () => {
    const nowMs = Date.UTC(2026, 3, 24, 14, 0, 0);
    const ctx = makeContext({
      nowMs,
      user: { birthday: { month: 4, day: 24 } },
      location: { current: { lat: 31.23, lon: 121.47, timestampMs: nowMs }, events: [] },
    });
    expect(selectAccessory(ctx)).toBe('party-hat');
  });

  it('no user.birthday means birthday path is skipped', () => {
    const ctx = makeContext({ user: {} });
    expect(selectAccessory(ctx)).toBeNull();
  });
});
