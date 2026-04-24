import { createPet, reducer } from './reducer';
import type { Event } from './types';

describe('createPet', () => {
  it('starts in the egg stage', () => {
    expect(createPet()).toEqual(expect.objectContaining({ stage: 'egg' }));
  });

  it('starts with all stats at 70', () => {
    expect(createPet().stats).toEqual({ satiety: 70, energy: 70, happiness: 70 });
  });

  it('records bornAt from the injected clock', () => {
    expect(createPet(42).bornAt).toBe(42);
  });

  it('starts with ageMs = 0', () => {
    expect(createPet().ageMs).toBe(0);
  });

  it('is pure — two calls with same arg are deeply equal', () => {
    expect(createPet(100)).toEqual(createPet(100));
  });
});

describe('reducer — feed', () => {
  it('increases satiety by nutrition', () => {
    const pet = createPet(0);
    const next = reducer(pet, { type: 'feed', nutrition: 10 });
    expect(next.stats.satiety).toBe(80);
  });

  it('clamps satiety at 100', () => {
    const pet = createPet(0);
    const next = reducer(pet, { type: 'feed', nutrition: 999 });
    expect(next.stats.satiety).toBe(100);
  });

  it('does not mutate the input state', () => {
    const pet = createPet(0);
    const snapshot = JSON.stringify(pet);
    reducer(pet, { type: 'feed', nutrition: 5 });
    expect(JSON.stringify(pet)).toBe(snapshot);
  });

  it('leaves energy and happiness untouched', () => {
    const pet = createPet(0);
    const next = reducer(pet, { type: 'feed', nutrition: 10 });
    expect(next.stats.energy).toBe(pet.stats.energy);
    expect(next.stats.happiness).toBe(pet.stats.happiness);
  });
});

describe('reducer — play', () => {
  it('increases happiness and decreases energy', () => {
    const pet = createPet(0);
    const next = reducer(pet, { type: 'play', minutes: 10 });
    expect(next.stats.happiness).toBe(80);
    expect(next.stats.energy).toBe(65);
  });

  it('clamps both stats', () => {
    const pet = createPet(0);
    const happy = reducer(pet, { type: 'play', minutes: 1000 });
    expect(happy.stats.happiness).toBe(100);
    expect(happy.stats.energy).toBe(0);
  });
});

describe('reducer — rest', () => {
  it('increases energy by minutes', () => {
    const pet = createPet(0);
    const next = reducer(pet, { type: 'rest', minutes: 20 });
    expect(next.stats.energy).toBe(90);
  });

  it('clamps energy at 100', () => {
    const pet = createPet(0);
    const next = reducer(pet, { type: 'rest', minutes: 500 });
    expect(next.stats.energy).toBe(100);
  });
});

describe('reducer — exhaustiveness', () => {
  it('throws on an unknown event discriminant (defensive, unreachable via types)', () => {
    const pet = createPet(0);
    expect(() => reducer(pet, { type: 'explode' } as unknown as Event)).toThrow(/Unreachable/);
  });
});

describe('reducer — tick (Phase 2)', () => {
  it('delegates to applyDecay for tick events', () => {
    const pet = createPet(0);
    const next = reducer(pet, { type: 'tick', elapsedMs: 60 * 60 * 1000 });
    expect(next.ageMs).toBe(60 * 60 * 1000);
    expect(next.stats.satiety).toBeLessThan(pet.stats.satiety);
  });
});

describe('reducer — Phase 1 invariants (non-tick events)', () => {
  const events: readonly Event[] = [
    { type: 'feed', nutrition: 15 },
    { type: 'play', minutes: 30 },
    { type: 'rest', minutes: 10 },
  ];

  it('never changes stage for feed/play/rest', () => {
    const pet = createPet(0);
    const end = events.reduce(reducer, pet);
    expect(end.stage).toBe('egg');
  });

  it('never changes bornAt', () => {
    const pet = createPet(42);
    const end = events.reduce(reducer, pet);
    expect(end.bornAt).toBe(42);
  });

  it('feed/play/rest never change ageMs', () => {
    const pet = createPet(0);
    const end = events.reduce(reducer, pet);
    expect(end.ageMs).toBe(0);
  });
});
