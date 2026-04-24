import { makeContext } from './__fixtures__/build-context';
import { selectBackground } from './select-background';

const H = 60 * 60 * 1000;

describe('selectBackground', () => {
  it('dawn at 05:00 local', () => {
    const nowMs = Date.UTC(2026, 3, 24, 21, 0, 0); // 21:00 UTC + 8h = 05:00 local
    expect(selectBackground(makeContext({ nowMs }))).toBe('dawn');
  });

  it('sunny at 10:00 local', () => {
    const nowMs = Date.UTC(2026, 3, 24, 2, 0, 0); // 02:00 UTC + 8h = 10:00 local
    expect(selectBackground(makeContext({ nowMs }))).toBe('sunny');
  });

  it('dusk at 18:00 local', () => {
    const nowMs = Date.UTC(2026, 3, 24, 10, 0, 0); // 10:00 UTC + 8h = 18:00 local
    expect(selectBackground(makeContext({ nowMs }))).toBe('dusk');
  });

  it('night at 22:00 local', () => {
    const nowMs = Date.UTC(2026, 3, 24, 14, 0, 0); // 14:00 UTC + 8h = 22:00 local
    expect(selectBackground(makeContext({ nowMs }))).toBe('night');
  });

  it('rain beats time-of-day', () => {
    let nowMs = Date.UTC(2026, 3, 24, 2, 0, 0); // local 10am, normally sunny
    let ctx = makeContext({
      nowMs,
      location: { current: { lat: 31.23, lon: 121.47, timestampMs: nowMs }, events: [] },
    });
    let tries = 0;
    while (ctx.weather?.condition !== 'rain' && tries < 10) {
      nowMs += 24 * H;
      ctx = makeContext({
        nowMs,
        location: { current: { lat: 31.23, lon: 121.47, timestampMs: nowMs }, events: [] },
      });
      tries += 1;
    }
    expect(ctx.weather?.condition).toBe('rain');
    expect(selectBackground(ctx)).toBe('rain');
  });

  it('cny beats everything', () => {
    // 2026 CNY: Feb 17. Pick a rainy time if possible; CNY should still win.
    const nowMs = Date.UTC(2026, 1, 17, 12, 0, 0);
    const ctx = makeContext({
      nowMs,
      location: { current: { lat: 31.23, lon: 121.47, timestampMs: nowMs }, events: [] },
    });
    expect(selectBackground(ctx)).toBe('cny');
  });

  it('snow branch (weather condition)', () => {
    // The mock weather never emits 'snow' from its 5-condition cycle, so we
    // build a context with a forged weather object. Use the underlying fake
    // via a hand-rolled structural context to exercise the branch.
    const base = makeContext({
      nowMs: Date.UTC(2026, 3, 24, 2, 0, 0),
      location: { current: { lat: 0, lon: 0, timestampMs: 0 }, events: [] },
    });
    // Build a frozen replacement with weather=snow.
    const withSnow = {
      ...base,
      weather: {
        tempC: -5,
        feelsLikeC: -8,
        condition: 'snow' as const,
        humidity: 0.8,
        observedAt: base.nowMs,
      },
    };
    expect(selectBackground(withSnow)).toBe('snow');
  });
});
