import type { FakeHealthKitProvider } from '../../providers/health/fake';
import type { FakeLocationProvider } from '../../providers/location/fake';
import type { FakePermissionProvider } from '../../providers/permissions/fake';

const H = 60 * 60 * 1000;
const MIN = 60 * 1000;

// Deterministic demo data so the home screen has plausible numbers without
// real HealthKit. Replaced once realHealthKitProvider is wired (later phase).
export function seedDefaultDemoData(opts: {
  health: FakeHealthKitProvider;
  location: FakeLocationProvider;
  permissions: FakePermissionProvider;
  nowMs: number;
}): void {
  const { health, location, permissions, nowMs } = opts;

  // Permissions: demo grants everything so the UI is unblocked.
  permissions.grantAll();

  // Steps: ~8000 spread across 8 buckets in the last 24h.
  health.inject({
    steps: [
      { startAt: nowMs - 22 * H, endAt: nowMs - 21 * H, value: 800 },
      { startAt: nowMs - 18 * H, endAt: nowMs - 17 * H, value: 1200 },
      { startAt: nowMs - 12 * H, endAt: nowMs - 11 * H, value: 950 },
      { startAt: nowMs - 9 * H, endAt: nowMs - 8 * H, value: 1500 },
      { startAt: nowMs - 6 * H, endAt: nowMs - 5 * H, value: 1100 },
      { startAt: nowMs - 4 * H, endAt: nowMs - 3 * H, value: 1300 },
      { startAt: nowMs - 2 * H, endAt: nowMs - H, value: 700 },
      { startAt: nowMs - 30 * MIN, endAt: nowMs - 5 * MIN, value: 450 },
    ],
    sleep: [{ startAt: nowMs - 14 * H, endAt: nowMs - 7 * H, stage: 'deep' }],
    hrv: [
      { startAt: nowMs - 18 * H, endAt: nowMs - 17 * H, sdnnMs: 42 },
      { startAt: nowMs - 12 * H, endAt: nowMs - 11 * H, sdnnMs: 51 },
      { startAt: nowMs - 6 * H, endAt: nowMs - 5 * H, sdnnMs: 47 },
      { startAt: nowMs - H, endAt: nowMs - 30 * MIN, sdnnMs: 49 },
    ],
  });

  // Location: pretend the user is "home" (Beijing). Emit one enter event.
  location.setCurrent({ lat: 39.9, lon: 116.4, timestampMs: nowMs });
  location.emitGeofence({ type: 'enter', regionId: 'home', at: nowMs - 4 * H });
}
