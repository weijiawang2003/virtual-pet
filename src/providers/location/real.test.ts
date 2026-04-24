import { realLocationProvider } from './real';

describe('realLocationProvider (stub)', () => {
  it('getCurrent rejects with not-wired', async () => {
    await expect(realLocationProvider.getCurrent()).rejects.toThrow(/not wired/);
  });

  it('watchRegion throws synchronously', () => {
    expect(() =>
      realLocationProvider.watchRegion({ id: 'x', lat: 0, lon: 0, radiusMeters: 100 }),
    ).toThrow(/not wired/);
  });

  it('subscribeGeofence throws synchronously', () => {
    expect(() => realLocationProvider.subscribeGeofence(() => {})).toThrow(/not wired/);
  });
});
