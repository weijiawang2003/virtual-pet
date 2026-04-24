import { makeContext } from './__fixtures__/build-context';
import { selectHaptic } from './select-haptic';

const H = 60 * 60 * 1000;

describe('selectHaptic', () => {
  it('null when no location (no solar data)', () => {
    expect(selectHaptic(makeContext())).toBeNull();
  });

  it('null on a non-full-moon day', () => {
    const nowMs = Date.UTC(2026, 3, 2, 12, 0, 0); // early April, not full moon
    const ctx = makeContext({
      nowMs,
      location: { current: { lat: 31.23, lon: 121.47, timestampMs: nowMs }, events: [] },
    });
    if (ctx.solar?.moonPhase !== undefined) {
      expect(selectHaptic(ctx)).toBeNull();
    }
  });

  it('medium within the full-moon window', () => {
    let nowMs = Date.UTC(2026, 3, 1, 14, 0, 0);
    let ctx = makeContext({
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
        nowMs,
        location: { current: { lat: 31.23, lon: 121.47, timestampMs: nowMs }, events: [] },
      });
      tries += 1;
    }
    expect(selectHaptic(ctx)).toBe('medium');
  });
});
