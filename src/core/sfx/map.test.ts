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

  it('throws on unknown event discriminant (defensive assertNever tombstone)', () => {
    expect(() => mapEventToSfx({ type: 'explode' } as unknown as Event)).toThrow(/Unreachable/);
  });
});
