# Phase 5: NotificationProvider interface + in-memory fake

**Goal**: A scheduling abstraction for local notifications. The fake lets us
drive and inspect the queue in tests; real expo-notifications wiring is stubbed
until the runtime integration phase.

**Dependencies**: Phase 0.

## Deliverables

1. `src/providers/notifications/types.ts` — `ScheduledNotification`,
   `NotificationRequest`, `NotificationProvider`.
2. `src/providers/notifications/fake.ts` — `createFakeNotificationProvider()`
   backed by an in-memory queue. Exposes `listAll()`, `schedule()`, `cancel()`,
   `cancelAll()`, plus test-only `fireDue(now)` to simulate notifications firing.
3. `src/providers/notifications/real.ts` — placeholder rejecting with a
   "not wired — TODO(Phase 8): wire expo-notifications" message.
4. Contract tests for the fake (schedule/cancel/listAll/fireDue) plus rejection
   tests for the real stub.

## Scope decisions

- **IDs are fake-provider-generated** (monotonic counter with a stable prefix).
  That's enough to compare a returned id against a later `cancel()` call without
  needing UUIDs.
- **Async API** matches the real expo-notifications shape.
- **`fireDue(nowMs)` is a test helper, not on the interface** — production code
  never needs to manually fire notifications.
- **`listAll()` returns a frozen snapshot array** to prevent external mutation
  leaking back into the queue.

## Invariants

1. `schedule()` then `listAll()` contains that notification.
2. `cancel(id)` removes the matching entry; no-op if id is unknown.
3. `fireDue(now)` only removes entries whose `fireAt <= now`, returning them.
4. Entries returned by `listAll()` are sorted ascending by `fireAt` (stable id tiebreak).
