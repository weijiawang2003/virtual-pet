import { makeContext, makePet } from './__fixtures__/build-context';
import { selectBubble } from './select-bubble';

const H = 60 * 60 * 1000;

describe('selectBubble', () => {
  it('returns null when nothing notable', () => {
    const pet = makePet('teen', { satiety: 70, energy: 70, happiness: 55 });
    expect(selectBubble(pet, makeContext({ pet }))).toBeNull();
  });

  it('birthday fires on the birthday date', () => {
    const pet = makePet('teen');
    const nowMs = Date.UTC(2026, 3, 24, 12, 0, 0);
    const ctx = makeContext({ pet, nowMs, user: { birthday: { month: 4, day: 24 } } });
    expect(selectBubble(pet, ctx)).toBe('birthday');
  });

  it('cny fires on lunar 1/1', () => {
    const pet = makePet('teen');
    const nowMs = Date.UTC(2026, 1, 17, 12, 0, 0);
    expect(selectBubble(pet, makeContext({ pet, nowMs }))).toBe('cny');
  });

  it('fullmoon fires when moonPhase ∈ [0.48, 0.52]', () => {
    const pet = makePet('teen');
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
    expect(selectBubble(pet, ctx)).toBe('fullmoon');
  });

  it('worried when HRV is low', () => {
    const pet = makePet('teen');
    const nowMs = Date.UTC(2026, 3, 24, 14, 0, 0);
    const ctx = makeContext({
      pet,
      nowMs,
      health: {
        steps: [],
        sleep: [],
        hrv: [{ startAt: nowMs - 4 * H, endAt: nowMs - 3 * H, sdnnMs: 15 }],
      },
    });
    expect(selectBubble(pet, ctx)).toBe('worried');
  });

  it('playful with high steps and decent happiness', () => {
    const pet = makePet('teen', { happiness: 70 });
    const nowMs = Date.UTC(2026, 3, 24, 14, 0, 0);
    const ctx = makeContext({
      pet,
      nowMs,
      health: {
        steps: [{ startAt: nowMs - 5 * H, endAt: nowMs - H, value: 9000 }],
        sleep: [],
        hrv: [],
      },
    });
    expect(selectBubble(pet, ctx)).toBe('playful');
  });

  it('hungry when satiety < 30', () => {
    const pet = makePet('baby', { satiety: 20 });
    expect(selectBubble(pet, makeContext({ pet }))).toBe('hungry');
  });

  it('tired when energy < 20', () => {
    const pet = makePet('teen', { satiety: 70, energy: 10, happiness: 70 });
    expect(selectBubble(pet, makeContext({ pet }))).toBe('tired');
  });

  it('low when average below 35', () => {
    const pet = makePet('teen', { satiety: 40, energy: 30, happiness: 20 });
    expect(selectBubble(pet, makeContext({ pet }))).toBe('low');
  });

  it('excited when happiness >= 85', () => {
    const pet = makePet('teen', { happiness: 95 });
    expect(selectBubble(pet, makeContext({ pet }))).toBe('excited');
  });

  it('cozy when cloudy weather + hours alive + decent energy', () => {
    const pet = makePet('teen', { energy: 60 });
    let nowMs = Date.UTC(2026, 3, 24, 14, 0, 0);
    let ctx = makeContext({
      pet,
      nowMs,
      location: { current: { lat: 0, lon: 0, timestampMs: nowMs }, events: [] },
    });
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
    expect(selectBubble(pet, ctx)).toBe('cozy');
  });

  it('curious with active region + energy >= 50', () => {
    const pet = makePet('teen', { energy: 60, happiness: 50 });
    const nowMs = Date.UTC(2026, 3, 24, 14, 0, 0);
    const ctx = makeContext({
      pet,
      nowMs,
      location: {
        current: { lat: 31.23, lon: 121.47, timestampMs: nowMs },
        events: [{ type: 'enter', regionId: 'home', at: nowMs - H }],
      },
    });
    expect(selectBubble(pet, ctx)).toBe('curious');
  });

  it('happy when happiness >= 70 (no other signals)', () => {
    const pet = makePet('teen', { happiness: 75 });
    expect(selectBubble(pet, makeContext({ pet }))).toBe('happy');
  });
});
