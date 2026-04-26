# Phase 22: Real-life signals (HealthKit + Location + AppState)

**Goal**: Replace the InMemoryFake providers with real iOS data sources for
HealthKit (steps / sleep / HRV / workouts), expo-location geofencing, and
AppState idle/heavy-use inference. Route every signal through Phase 21's
`translateSignal` and dispatch the resulting events to the pet store.

**Dependencies**: Phase 21 (signal types + translator); Phase 14
(expo-image / expo-haptics / etc. already installed).

## Native dependencies

`@kingstinct/react-native-healthkit` and `expo-task-manager` are added
this phase. CLAUDE.md §3 lists both in the locked stack; ADR-006
documents the actual install. **Dev Client rebuild required** before
runtime test on device.

## Deliverables

### Part A — HealthKit real provider

- `src/providers/health/real.ts` — replace not-implemented stub
- `requestAuthorization()` real iOS HealthKit prompt
- `getSteps/getSleep/getHRV/getWorkouts` query implementations
- `subscribe(metric, cb)` per-metric observer queries
- Signal emission: each new sample → `LifeSignal` → SignalBus

### Part B — SignalBus

- `src/providers/signals/signal-bus.ts` — central wire connecting all
  providers (health, location, AppState) to translator → pet store
- Initialize in `app/_layout.tsx`

### Part C — AppState inference

- AppState background/foreground transitions produce `idle_no_phone` /
  `heavy_phone_use` signals based on time deltas

### Part D — Location geofencing

- `expo-location startGeofencingAsync` + `expo-task-manager` for
  background region transitions (home circle, 100m)
- Region exit → `location_change { new_region: true }`

### Part E — Settings panel

- "Real Life Signals" section: Health / Location / AppState toggles
- Live signal log (debug, last 24h)

### Part F — Onboarding signal screen

- New step after birthday: explain each signal + 3 toggles
- Default OFF; user must opt in. "稍后再说" defers all.

## NATIVE CHANGE gate

After `npx expo install` completes this phase **STOPS** until the user:

1. Runs `npx expo prebuild --clean -p ios` (locally)
2. Runs `cd ios && pod install` if needed
3. Rebuilds the Dev Client (EAS build or `expo run:ios --device`)
4. Confirms the new Dev Client launches without crash

Then Parts A–F land in subsequent commits on this branch.

## Decisions

- **Real HealthKit fails gracefully** → fall back to InMemoryFake;
  app fully usable.
- **Settings toggles default OFF** for all three signal sources. User
  must opt in; matches the "no anxiety" design philosophy.
- **SignalBus is module-level singleton** initialized once at root
  layout; idempotent on StrictMode double-mount.
- **Translator output dispatched via existing pet-snapshot-store
  `dispatch`** — no new dispatch path; signal events flow through the
  same reducer as manual button events.
- **Test env keeps fake everything** — `process.env.NODE_ENV === 'test'`
  guard in real provider factories returns the fake (matches Phase 17
  pattern for notifications).
