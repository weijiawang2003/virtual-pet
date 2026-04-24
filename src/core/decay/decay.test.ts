import fc from 'fast-check';
import { createPet } from '../pet/reducer';
import { applyDecay, DECAY_RATES_PER_HOUR, MS_PER_HOUR } from './decay';

describe('applyDecay — basic behavior', () => {
  it('is a no-op for elapsedMs = 0', () => {
    const pet = createPet(0);
    expect(applyDecay(pet, 0)).toEqual(pet);
  });

  it('coerces negative elapsed to 0 (no rewind)', () => {
    const pet = createPet(0);
    expect(applyDecay(pet, -1000)).toEqual(pet);
  });

  it('coerces non-finite elapsed to 0', () => {
    const pet = createPet(0);
    expect(applyDecay(pet, Number.NaN)).toEqual(pet);
    expect(applyDecay(pet, Number.POSITIVE_INFINITY)).toEqual(pet);
  });

  it('decreases stats linearly per hour', () => {
    const pet = createPet(0);
    const after1h = applyDecay(pet, MS_PER_HOUR);
    expect(after1h.stats.satiety).toBeCloseTo(70 - DECAY_RATES_PER_HOUR.satiety, 6);
    expect(after1h.stats.energy).toBeCloseTo(70 - DECAY_RATES_PER_HOUR.energy, 6);
    expect(after1h.stats.happiness).toBeCloseTo(70 - DECAY_RATES_PER_HOUR.happiness, 6);
  });

  it('clamps stats at 0 after long durations', () => {
    const pet = createPet(0);
    const after1000h = applyDecay(pet, 1000 * MS_PER_HOUR);
    expect(after1000h.stats).toEqual({ satiety: 0, energy: 0, happiness: 0 });
  });

  it('accumulates ageMs', () => {
    const pet = createPet(0);
    const next = applyDecay(pet, MS_PER_HOUR);
    expect(next.ageMs).toBe(MS_PER_HOUR);
    const next2 = applyDecay(next, MS_PER_HOUR);
    expect(next2.ageMs).toBe(2 * MS_PER_HOUR);
  });

  it('does not mutate the input pet', () => {
    const pet = createPet(0);
    const snap = JSON.stringify(pet);
    applyDecay(pet, MS_PER_HOUR);
    expect(JSON.stringify(pet)).toBe(snap);
  });
});

describe('applyDecay — properties', () => {
  const arbPositiveMs = fc.double({ min: 0, max: 10 * MS_PER_HOUR, noNaN: true });

  it('stats stay within [0, 100] for any elapsed', () => {
    fc.assert(
      fc.property(arbPositiveMs, (ms) => {
        const out = applyDecay(createPet(0), ms);
        expect(out.stats.satiety).toBeGreaterThanOrEqual(0);
        expect(out.stats.satiety).toBeLessThanOrEqual(100);
        expect(out.stats.energy).toBeGreaterThanOrEqual(0);
        expect(out.stats.energy).toBeLessThanOrEqual(100);
        expect(out.stats.happiness).toBeGreaterThanOrEqual(0);
        expect(out.stats.happiness).toBeLessThanOrEqual(100);
      }),
    );
  });

  it('ageMs is monotonic non-decreasing', () => {
    fc.assert(
      fc.property(arbPositiveMs, (ms) => {
        const pet = createPet(0);
        const after = applyDecay(pet, ms);
        expect(after.ageMs).toBeGreaterThanOrEqual(pet.ageMs);
      }),
    );
  });

  it('is linear before the clamp floor: applyDecay(a+b) ≈ applyDecay(a) then applyDecay(b)', () => {
    // Pick short durations so no stat hits the [0,100] clamp.
    const arbShort = fc.double({ min: 0, max: 5 * MS_PER_HOUR, noNaN: true });
    fc.assert(
      fc.property(arbShort, arbShort, (a, b) => {
        const pet = createPet(0);
        const sequential = applyDecay(applyDecay(pet, a), b);
        const combined = applyDecay(pet, a + b);
        expect(sequential.stats.satiety).toBeCloseTo(combined.stats.satiety, 6);
        expect(sequential.stats.energy).toBeCloseTo(combined.stats.energy, 6);
        expect(sequential.stats.happiness).toBeCloseTo(combined.stats.happiness, 6);
        expect(sequential.ageMs).toBeCloseTo(combined.ageMs, 6);
      }),
    );
  });
});
