import { makeContext, makePet } from './__fixtures__/build-context';
import { selectAnimation } from './select-animation';

const H = 60 * 60 * 1000;

describe('selectAnimation', () => {
  it('sleep when sleepy at night', () => {
    // UTC 14:00 + 8h tz = 22:00 local (night).
    const pet = makePet('teen', { energy: 30 });
    const ctx = makeContext({ pet, nowMs: Date.UTC(2026, 3, 24, 14, 0, 0) });
    expect(selectAnimation(pet, ctx, 'sleepy')).toBe('sleep');
  });

  it('sleep when sleepy during day with critically low energy', () => {
    const pet = makePet('teen', { energy: 10 });
    const ctx = makeContext({ pet, nowMs: Date.UTC(2026, 3, 24, 6, 0, 0) });
    expect(selectAnimation(pet, ctx, 'sleepy')).toBe('sleep');
  });

  it('yawn when sleepy during daytime with moderate energy', () => {
    const pet = makePet('teen', { energy: 50 });
    const ctx = makeContext({ pet, nowMs: Date.UTC(2026, 3, 24, 6, 0, 0) });
    expect(selectAnimation(pet, ctx, 'sleepy')).toBe('yawn');
  });

  it('dance when excited', () => {
    const pet = makePet('teen', { happiness: 90 });
    const ctx = makeContext({ pet });
    expect(selectAnimation(pet, ctx, 'excited')).toBe('dance');
  });

  it('low animation when low mood', () => {
    const pet = makePet('teen', { happiness: 20 });
    const ctx = makeContext({ pet });
    expect(selectAnimation(pet, ctx, 'low')).toBe('low');
  });

  it('curious on rainy weather regardless of mood', () => {
    const pet = makePet('teen', { happiness: 70 });
    // Pick a day where the mock weather is rain.
    let nowMs = Date.UTC(2026, 0, 1, 14, 0, 0);
    let ctx = makeContext({
      pet,
      nowMs,
      location: { current: { lat: 31.23, lon: 121.47, timestampMs: nowMs }, events: [] },
    });
    let tries = 0;
    while (ctx.weather?.condition !== 'rain' && tries < 10) {
      nowMs += 24 * H;
      ctx = makeContext({
        pet,
        nowMs,
        location: { current: { lat: 31.23, lon: 121.47, timestampMs: nowMs }, events: [] },
      });
      tries += 1;
    }
    expect(ctx.weather?.condition).toBe('rain');
    expect(selectAnimation(pet, ctx, 'happy')).toBe('curious');
  });

  it('full-moon-stare wins over mood-mapped default', () => {
    // Construct a ctx with moonPhase in [0.48, 0.52]. We can force this by
    // computing solar for a date we know is near full moon.
    // 2026-04-01 is close to full moon. Try a few dates.
    const pet = makePet('adult', { happiness: 70 });
    let nowMs = Date.UTC(2026, 3, 1, 14, 0, 0);
    let ctx = makeContext({
      pet,
      nowMs,
      location: { current: { lat: 31.23, lon: 121.47, timestampMs: nowMs }, events: [] },
    });
    let tries = 0;
    while (
      !(ctx.solar !== null && ctx.solar.moonPhase >= 0.48 && ctx.solar.moonPhase <= 0.52) &&
      tries < 30
    ) {
      nowMs += 24 * H;
      ctx = makeContext({
        pet,
        nowMs,
        location: { current: { lat: 31.23, lon: 121.47, timestampMs: nowMs }, events: [] },
      });
      tries += 1;
    }
    expect(ctx.solar?.moonPhase).toBeGreaterThanOrEqual(0.48);
    expect(ctx.solar?.moonPhase).toBeLessThanOrEqual(0.52);
    // Non-rainy day needed so weather branch doesn't steal it.
    if (ctx.weather?.condition !== 'rain') {
      expect(selectAnimation(pet, ctx, 'happy')).toBe('full-moon-stare');
    }
  });

  it('mood-mapped default for happy = bounce', () => {
    const pet = makePet('teen', { happiness: 70 });
    const ctx = makeContext({ pet });
    expect(selectAnimation(pet, ctx, 'happy')).toBe('bounce');
  });

  it('mood-mapped default for curious', () => {
    const pet = makePet('child');
    expect(selectAnimation(pet, makeContext({ pet }), 'curious')).toBe('curious');
  });

  it('mood-mapped default for cozy', () => {
    const pet = makePet('teen');
    expect(selectAnimation(pet, makeContext({ pet }), 'cozy')).toBe('cuddle');
  });

  it('mood-mapped default for hungry = idle', () => {
    const pet = makePet('baby', { satiety: 10 });
    expect(selectAnimation(pet, makeContext({ pet }), 'hungry')).toBe('idle');
  });

  it('mood-mapped default for dirty = idle', () => {
    const pet = makePet('child');
    expect(selectAnimation(pet, makeContext({ pet }), 'dirty')).toBe('idle');
  });

  it('mood-mapped default for sleepy during the day with normal energy = yawn', () => {
    const pet = makePet('teen', { energy: 50 });
    const ctx = makeContext({ pet, nowMs: Date.UTC(2026, 3, 24, 6, 0, 0) });
    expect(selectAnimation(pet, ctx, 'sleepy')).toBe('yawn');
  });
});
