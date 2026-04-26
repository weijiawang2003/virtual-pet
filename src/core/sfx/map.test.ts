import type { Event } from '../pet/types';
import { mapEventToSfx } from './map';

describe('mapEventToSfx', () => {
  it('feed → feed-crunch', () => {
    expect(mapEventToSfx({ type: 'feed', nutrition: 10, source: 'manual' })).toBe('feed-crunch');
  });

  it('play → play-giggle', () => {
    expect(mapEventToSfx({ type: 'play', minutes: 5, source: 'manual' })).toBe('play-giggle');
  });

  it('rest → sleep-snore', () => {
    expect(mapEventToSfx({ type: 'rest', minutes: 30, source: 'manual' })).toBe('sleep-snore');
  });

  it('tick → null (no sound per tick)', () => {
    expect(mapEventToSfx({ type: 'tick', elapsedMs: 60000, source: 'system' })).toBeNull();
  });

  it('mood_adjust / bond_gain / curiosity_hint → null (translator outputs are silent)', () => {
    expect(mapEventToSfx({ type: 'mood_adjust', happiness: -5, source: 'health' })).toBeNull();
    expect(mapEventToSfx({ type: 'bond_gain', amount: 3, source: 'health' })).toBeNull();
    expect(mapEventToSfx({ type: 'curiosity_hint', until: 1, source: 'inferred' })).toBeNull();
  });

  it('throws on unknown event discriminant (defensive assertNever tombstone)', () => {
    expect(() => mapEventToSfx({ type: 'explode' } as unknown as Event)).toThrow(/Unreachable/);
  });
});
