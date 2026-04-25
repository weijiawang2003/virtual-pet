import { createRuntimeProviders } from '../runtime-providers';

describe('createRuntimeProviders (default factory)', () => {
  it('returns the three required ports', () => {
    const r = createRuntimeProviders({ nowMs: Date.UTC(2026, 3, 24, 6) });
    expect(r.health).toBeDefined();
    expect(r.location).toBeDefined();
    expect(r.permissions).toBeDefined();
  });

  it('seeds health with steps in the last 24h totaling > 0', async () => {
    const nowMs = Date.UTC(2026, 3, 24, 6);
    const r = createRuntimeProviders({ nowMs });
    const steps = await r.health.getSteps(nowMs - 24 * 60 * 60 * 1000, nowMs);
    const total = steps.reduce((sum, s) => sum + s.value, 0);
    expect(total).toBeGreaterThan(0);
  });

  it('seeds permissions to granted (demo bypass)', async () => {
    const r = createRuntimeProviders({ nowMs: Date.UTC(2026, 3, 24, 6) });
    const snap = await r.permissions.snapshot();
    expect(snap.health).toBe('granted');
    expect(snap.notifications).toBe('granted');
  });

  it('seeds location with a current Beijing-ish coord', async () => {
    const r = createRuntimeProviders({ nowMs: Date.UTC(2026, 3, 24, 6) });
    const c = await r.location.getCurrent();
    expect(c).not.toBeNull();
    expect(c!.lat).toBeCloseTo(39.9, 0);
    expect(c!.lon).toBeCloseTo(116.4, 0);
  });
});
