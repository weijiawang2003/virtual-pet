# Phase 4: PermissionProvider interface + fakes

**Goal**: A uniform permission abstraction across iOS permission kinds
(HealthKit, location, notifications, calendar, media) with all four iOS-native
statuses modeled. Real iOS wiring is deliberately deferred to a later phase
(needs Dev Client + entitlements — out of Phase 0-9 scope).

**Dependencies**: Phase 0.

## Deliverables

1. `src/providers/permissions/types.ts` — `PermissionKind`, `PermissionStatus`,
   `PermissionSnapshot`, `PermissionProvider` interface.
2. `src/providers/permissions/fake.ts` — `createFakePermissionProvider()` factory
   with seedable initial state and `set()` / `grantAll()` / `denyAll()` test helpers.
3. `src/providers/permissions/real.ts` — placeholder that throws. Will be
   implemented once native setup lands.
4. `src/providers/permissions/fake.test.ts` — 4×5 status/kind matrix contract
   tests + behavior tests for `set()`, `request()`, and `snapshot()`.
5. `src/providers/permissions/real.test.ts` — verifies all methods throw with a
   "not implemented" error (guards against accidental prod use).

## Scope decisions

- **Async API throughout**. Real iOS calls are async; the fake mirrors the shape
  so swap-in is free. All fake methods return resolved promises synchronously.
- **`request()` on the fake does not flip `notDetermined` → `granted`** by magic.
  The caller seeds or `set()`s the outcome; the fake just echoes back the
  current stored status. This keeps tests explicit about UX flow.
- **`snapshot()` returns a plain object**, not a Map, so it's trivially
  JSON-serializable for the Phase 9 context.

## Invariants

1. After `set(kind, status)`, `get(kind)` returns that status.
2. `snapshot()` contains exactly the five `PermissionKind` keys.
3. `request(kind)` is idempotent when status is already `granted` or `denied`.
