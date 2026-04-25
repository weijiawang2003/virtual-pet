import {
  createFakeHealthKitProvider,
  type FakeHealthKitProvider,
} from '../../providers/health/fake';
import {
  createFakeLocationProvider,
  type FakeLocationProvider,
} from '../../providers/location/fake';
import { createFakeNotificationProvider } from '../../providers/notifications/fake';
import { realNotificationProvider } from '../../providers/notifications/real';
import type { NotificationProvider } from '../../providers/notifications/types';
import {
  createFakePermissionProvider,
  type FakePermissionProvider,
} from '../../providers/permissions/fake';
import { seedDefaultDemoData } from './seed-fake-data';

export interface RuntimeProviders {
  readonly health: FakeHealthKitProvider;
  readonly location: FakeLocationProvider;
  readonly permissions: FakePermissionProvider;
  readonly notifications: NotificationProvider;
}

// Factory for the runtime tree. The fakes get pre-seeded with demo data so the
// UI has plausible numbers from cold launch. Notifications uses the **real**
// expo-notifications-backed provider in production and the in-memory fake
// under jest (NODE_ENV === 'test') so unit tests don't have to mock the
// native module surface.
export function createRuntimeProviders(opts: { nowMs?: number } = {}): RuntimeProviders {
  const nowMs = opts.nowMs ?? Date.now();
  const health = createFakeHealthKitProvider();
  const location = createFakeLocationProvider();
  const permissions = createFakePermissionProvider();
  seedDefaultDemoData({ health, location, permissions, nowMs });
  const notifications: NotificationProvider =
    process.env.NODE_ENV === 'test' ? createFakeNotificationProvider() : realNotificationProvider;
  return { health, location, permissions, notifications };
}
