import { makeContext, makePet } from './__fixtures__/build-context';
import { deriveMood } from './mood';

const H = 60 * 60 * 1000;

describe('deriveMood', () => {
  it('hungry when satiety < 30', () => {
    const pet = makePet('child', { satiety: 20 });
    expect(deriveMood(pet, makeContext({ pet }))).toBe('hungry');
  });

  it('sleepy late at night with low-ish energy', () => {
    // UTC 14:00 + tz 8h = 22:00 local (night).
    const pet = makePet('child', { energy: 35 });
    const ctx = makeContext({ pet, nowMs: Date.UTC(2026, 3, 24, 14, 0, 0) });
    expect(deriveMood(pet, ctx)).toBe('sleepy');
  });

  it('sleepy during daytime when energy is critically low (< 20)', () => {
    // UTC 06:00 + tz 8h = 14:00 local (daytime).
    const pet = makePet('teen', { energy: 10 });
    const ctx = makeContext({ pet, nowMs: Date.UTC(2026, 3, 24, 6, 0, 0) });
    expect(deriveMood(pet, ctx)).toBe('sleepy');
  });

  it('low when average of all stats is below 35', () => {
    const pet = makePet('teen', { satiety: 40, energy: 40, happiness: 20 });
    const ctx = makeContext({ pet });
    expect(deriveMood(pet, ctx)).toBe('low');
  });

  it('excited when happiness >= 85', () => {
    const pet = makePet('teen', { happiness: 90 });
    expect(deriveMood(pet, makeContext({ pet }))).toBe('excited');
  });

  it('curious when there is an active region and energy is decent', () => {
    const pet = makePet('child', { energy: 60 });
    const nowMs = Date.UTC(2026, 3, 24, 14, 0, 0);
    const ctx = makeContext({
      pet,
      nowMs,
      location: {
        current: { lat: 31.23, lon: 121.47, timestampMs: nowMs },
        events: [{ type: 'enter', regionId: 'home', at: nowMs - H }],
      },
    });
    expect(deriveMood(pet, ctx)).toBe('curious');
  });

  it('cozy in cloudy weather with no active region and decent energy', () => {
    // Use a location that will hit "cloudy" in the deterministic mock weather.
    // Try several dayOfYear offsets until we get cloudy.
    let nowMs = Date.UTC(2026, 3, 24, 14, 0, 0);
    let pet = makePet('teen', { energy: 50 });
    let ctx = makeContext({
      pet,
      nowMs,
      location: { current: { lat: 0, lon: 0, timestampMs: nowMs }, events: [] },
    });
    // Iterate days until weather condition is cloudy
    let tries = 0;
    while (ctx.weather?.condition !== 'cloudy' && tries < 20) {
      nowMs += 24 * H;
      ctx = makeContext({
        pet,
        nowMs,
        location: { current: { lat: 0, lon: 0, timestampMs: nowMs }, events: [] },
      });
      tries += 1;
    }
    expect(ctx.weather?.condition).toBe('cloudy');
    expect(deriveMood(pet, ctx)).toBe('cozy');
  });

  it('happy as the default', () => {
    const pet = makePet('teen', { satiety: 70, energy: 70, happiness: 60 });
    expect(deriveMood(pet, makeContext({ pet }))).toBe('happy');
  });

  it('is pure — same inputs → same output', () => {
    const pet = makePet('child', { satiety: 50, energy: 50, happiness: 50 });
    const ctx = makeContext({ pet });
    expect(deriveMood(pet, ctx)).toBe(deriveMood(pet, ctx));
  });
});
