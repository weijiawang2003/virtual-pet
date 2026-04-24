# Phase 8: LocationProvider + geofence fake

**Goal**: A typed abstraction over location and geofence events with a fake
that drives a sequence of coords and region enter/exit events for tests.
Real expo-location wiring is stubbed.

**Dependencies**: Phase 0.

## Deliverables

1. `src/providers/location/types.ts` — `Coord`, `Region`, `GeofenceEvent`,
   `LocationProvider` interface.
2. `src/providers/location/fake.ts` — `createFakeLocationProvider()` with
   `setCurrent`, `watchRegion`, `subscribeGeofence`, `emitGeofence` helpers.
3. `src/providers/location/real.ts` — placeholder rejecting with
   "TODO: wire expo-location + expo-task-manager for geofencing".
4. Contract tests for the fake.

## Scope decisions

- **`Coord`** = `{ lat, lon, accuracyMeters?, timestampMs }`. No altitude /
  heading / speed — YAGNI for current phases.
- **`Region`** = `{ id, lat, lon, radiusMeters, name? }`. Circular only.
- **`GeofenceEvent`** = `{ type: 'enter' | 'exit'; regionId; at }`.
- **`watchRegion`** checks proximity of current coord on `setCurrent` and
  fires enter/exit through the geofence subscription. Deterministic — no
  timer dependency.
- **Real stub** rejects for async methods; `watchRegion` / `subscribeGeofence`
  throw synchronously. Forcing callers into error-handling keeps accidental
  prod use obvious.

## Invariants

1. `setCurrent(coord)` then `getCurrent()` returns that coord.
2. A coord inside a watched region emits exactly one `enter` event (not repeated
   while still inside).
3. Leaving the region emits exactly one `exit` event.
4. `dispose()` from `watchRegion` stops further enter/exit from that watcher.
