import {
  createFakeHealthKitProvider,
  type FakeHealthKitProvider,
} from '../../providers/health/fake';
import {
  createFakeLocationProvider,
  type FakeLocationProvider,
} from '../../providers/location/fake';
import {
  createFakePermissionProvider,
  type FakePermissionProvider,
} from '../../providers/permissions/fake';
import { seedDefaultDemoData } from './seed-fake-data';

export interface RuntimeProviders {
  readonly health: FakeHealthKitProvider;
  readonly location: FakeLocationProvider;
  readonly permissions: FakePermissionProvider;
}

// Factory for the runtime tree. Swap individual factories here to flip from
// in-memory fakes to real native providers (later phase). The fakes get
// pre-seeded with demo data so the UI has plausible numbers from cold launch.
export function createRuntimeProviders(opts: { nowMs?: number } = {}): RuntimeProviders {
  const nowMs = opts.nowMs ?? Date.now();
  const health = createFakeHealthKitProvider();
  const location = createFakeLocationProvider();
  const permissions = createFakePermissionProvider();
  seedDefaultDemoData({ health, location, permissions, nowMs });
  return { health, location, permissions };
}
