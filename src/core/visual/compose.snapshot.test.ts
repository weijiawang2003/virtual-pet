import { compose } from './compose';
import { makeContext, makePet } from './__fixtures__/build-context';
import { synthesizeContext } from '../context/synthesize';
import type { LifeContextInputs, PermissionsView } from '../context/types';

const H = 60 * 60 * 1000;

const GRANTED: PermissionsView = Object.freeze({
  health: 'granted',
  location: 'granted',
  notifications: 'granted',
  calendar: 'granted',
  media: 'granted',
});

/**
 * 6 canonical (PetState × LifeContext) fixtures. The snapshot pins the
 * exact VisualState for each — any selector rule change (threshold tweak,
 * priority reorder, mapping table edit) will surface here before it
 * touches the UI.
 */
describe('compose — 6-fixture snapshot', () => {
  it('egg just hatched', () => {
    const pet = makePet('egg');
    const ctx = makeContext({ pet, nowMs: Date.UTC(2026, 3, 24, 2, 0, 0) });
    expect(compose(pet, ctx)).toMatchSnapshot();
  });

  it('baby hungry at daytime', () => {
    const pet = makePet('baby', { satiety: 15, energy: 60, happiness: 60 });
    const ctx = makeContext({ pet, nowMs: Date.UTC(2026, 3, 24, 2, 0, 0) });
    expect(compose(pet, ctx)).toMatchSnapshot();
  });

  it('child on a rainy day', () => {
    const pet = makePet('child', { satiety: 70, energy: 60, happiness: 80 });
    // Find a rainy day in the deterministic mock.
    let nowMs = Date.UTC(2026, 3, 24, 2, 0, 0);
    let inputs: LifeContextInputs = {
      pet,
      nowMs,
      tzOffsetMs: 8 * H,
      health: { steps: [], sleep: [], hrv: [] },
      location: { current: { lat: 31.23, lon: 121.47, timestampMs: nowMs }, events: [] },
      permissions: GRANTED,
    };
    let ctx = synthesizeContext(inputs);
    let tries = 0;
    while (ctx.weather?.condition !== 'rain' && tries < 10) {
      nowMs += 24 * H;
      inputs = {
        ...inputs,
        nowMs,
        location: { current: { lat: 31.23, lon: 121.47, timestampMs: nowMs }, events: [] },
      };
      ctx = synthesizeContext(inputs);
      tries += 1;
    }
    // Snapshot captures whatever this particular rainy day picks, frozen.
    expect(compose(pet, ctx)).toMatchSnapshot();
  });

  it('teen low mood at night', () => {
    const pet = makePet('teen', { satiety: 30, energy: 25, happiness: 20 });
    const ctx = makeContext({ pet, nowMs: Date.UTC(2026, 3, 24, 14, 0, 0) });
    expect(compose(pet, ctx)).toMatchSnapshot();
  });

  it('adult on Chinese New Year', () => {
    // 2026 CNY: Feb 17.
    const pet = makePet('adult', { satiety: 80, energy: 70, happiness: 80 });
    const nowMs = Date.UTC(2026, 1, 17, 4, 0, 0); // 12:00 local
    const ctx = makeContext({ pet, nowMs });
    expect(ctx.lunar.month).toBe(1);
    expect(ctx.lunar.day).toBe(1);
    expect(compose(pet, ctx)).toMatchSnapshot();
  });

  it('adult on full moon with low HRV', () => {
    const pet = makePet('adult', { satiety: 60, energy: 60, happiness: 60 });
    // Find a full-moon day.
    let nowMs = Date.UTC(2026, 3, 1, 14, 0, 0);
    const base: LifeContextInputs = {
      pet,
      nowMs,
      tzOffsetMs: 8 * H,
      health: {
        steps: [],
        sleep: [],
        hrv: [{ startAt: nowMs - 4 * H, endAt: nowMs - 3 * H, sdnnMs: 18 }],
      },
      location: { current: { lat: 31.23, lon: 121.47, timestampMs: nowMs }, events: [] },
      permissions: GRANTED,
    };
    let inputs = base;
    let ctx = synthesizeContext(inputs);
    let tries = 0;
    while (
      !(ctx.solar !== null && ctx.solar.moonPhase >= 0.48 && ctx.solar.moonPhase <= 0.52) &&
      tries < 30
    ) {
      nowMs += 24 * H;
      inputs = {
        ...base,
        nowMs,
        health: {
          steps: [],
          sleep: [],
          hrv: [{ startAt: nowMs - 4 * H, endAt: nowMs - 3 * H, sdnnMs: 18 }],
        },
        location: { current: { lat: 31.23, lon: 121.47, timestampMs: nowMs }, events: [] },
      };
      ctx = synthesizeContext(inputs);
      tries += 1;
    }
    expect(compose({ ...pet, bornAt: 0, ageMs: inputs.pet.ageMs }, ctx)).toMatchSnapshot();
  });
});
