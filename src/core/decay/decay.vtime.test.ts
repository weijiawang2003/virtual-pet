import { createPet, reducer } from '../pet/reducer';
import { createFakeClock } from '../../providers/clock/fake-clock';
import { MS_PER_HOUR } from './decay';

/**
 * 48-hour virtual-clock snapshot.
 *
 * Drives a FakeClock forward one hour at a time for 48 iterations. Each
 * iteration dispatches a `tick` event with the precise elapsed ms since the
 * last tick. Asserts deterministic stat values — regressions in decay rates,
 * clamp boundaries, or age accumulation will be caught here.
 */
describe('48h virtual-clock snapshot', () => {
  it('decays a brand-new pet across 48 one-hour ticks', () => {
    const clock = createFakeClock(0);
    let pet = createPet(clock.now());
    let lastTickAt = clock.now();

    for (let h = 1; h <= 48; h++) {
      clock.advance(MS_PER_HOUR);
      const elapsed = clock.now() - lastTickAt;
      pet = reducer(pet, { type: 'tick', elapsedMs: elapsed, source: 'system' });
      lastTickAt = clock.now();
    }

    // With rates {satiety: 1.0, energy: 0.5, happiness: 0.75} per hour from
    // starting stats of 70: satiety→max(0, 70-48)=22, energy→max(0, 70-24)=46,
    // happiness→max(0, 70-36)=34. All clamp-safe (no stat hits 0 within 48h).
    expect(pet.stats.satiety).toBeCloseTo(22, 6);
    expect(pet.stats.energy).toBeCloseTo(46, 6);
    expect(pet.stats.happiness).toBeCloseTo(34, 6);
    expect(pet.ageMs).toBe(48 * MS_PER_HOUR);
    expect(pet.stage).toBe('teen'); // 24h threshold crossed by Phase 3 transitions.
    expect(clock.now()).toBe(48 * MS_PER_HOUR);
  });

  it('is equivalent whether ticks are 1h × 48 or 48h × 1 (linear, pre-clamp)', () => {
    const pet0 = createPet(0);

    let stepped = pet0;
    for (let h = 0; h < 48; h++) {
      stepped = reducer(stepped, { type: 'tick', elapsedMs: MS_PER_HOUR, source: 'system' });
    }

    const bulk = reducer(pet0, { type: 'tick', elapsedMs: 48 * MS_PER_HOUR, source: 'system' });

    expect(stepped.stats.satiety).toBeCloseTo(bulk.stats.satiety, 6);
    expect(stepped.stats.energy).toBeCloseTo(bulk.stats.energy, 6);
    expect(stepped.stats.happiness).toBeCloseTo(bulk.stats.happiness, 6);
    expect(stepped.ageMs).toBe(bulk.ageMs);
  });
});
