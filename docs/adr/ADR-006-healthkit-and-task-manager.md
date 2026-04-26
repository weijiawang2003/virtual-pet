# ADR-006: Add `@kingstinct/react-native-healthkit` and `expo-task-manager`

**Status**: Accepted (Phase 22)
**Date**: 2026-04-26
**Approver**: human (Phase 22 prompt explicitly authorized; CLAUDE.md §3
already lists both packages in the locked tech stack)

## Context

Phase 21 built the `LifeSignal` interface and the pure `translateSignal`
function. Phase 22 ships the _producers_ — real iOS data sources that
push signals into the bus.

- **HealthKit access** requires `@kingstinct/react-native-healthkit`
  (Nitro Modules-backed; already lined up in CLAUDE.md §3 since
  Phase 0).
- **Background geofencing** (region enter/exit when the app isn't
  foregrounded) requires `expo-task-manager` to host the iOS background
  task that fires the location update. `expo-location` alone can do
  foreground-only watches.

Both are native modules. CLAUDE.md §7 mandates a NATIVE CHANGE
announcement; CLAUDE.md §2 mandates an ADR. This file is the latter.

## Decision

Add two runtime dependencies, pinned exactly:

| Package                                     | Purpose                                                      |
| ------------------------------------------- | ------------------------------------------------------------ |
| `@kingstinct/react-native-healthkit@14.0.0` | Steps / sleep / HRV / workout reads + observer subscriptions |
| `expo-task-manager` (SDK 54 matrix)         | iOS background task host for geofencing                      |

Both go into `dependencies` (runtime). Pin exact (no `~`/`^`) per
CLAUDE.md §3.

## Alternatives rejected

- **`react-native-health` (older, deprecated for Nitro)**: would work
  but Nitro's stricter typing + faster bridge are why CLAUDE.md picked
  the @kingstinct fork.
- **Polling location in foreground only, no expo-task-manager**: would
  silently drop region transitions while app is killed/backgrounded —
  unacceptable for the "pet reacts to your real life" promise.
- **A user-mode CoreMotion classifier** for activity_classified instead
  of HealthKit: HealthKit already exposes activity classification for
  workouts; rolling our own is needless duplication.

## Consequences

- **+** Real `steps_delta` / `sleep_session` / `workout` /
  `activity_classified` / `location_change` signals on device.
- **+** Permission request UX surfaces the iOS native prompt; users
  with denied permissions still get a fully-functional app via the
  fake fallback.
- **−** Dev Client rebuild required before runtime test (matches Phase
  14 / Phase 19 patterns). Two prebuild + pod install steps:
  - `npx expo prebuild --clean -p ios`
  - `cd ios && pod install`
- **−** Info.plist usage strings auto-injected by the Expo config
  plugins; no manual editing.
- **−** Nitro / expo-task-manager increase native binary size by
  ~1.5–2 MB on iOS. Acceptable.

## Verification

- `pnpm install` succeeds.
- `pnpm typecheck` / `pnpm lint` / `pnpm test:coverage` stay green
  (Phase 22 implementation lands in subsequent commits).
- Dev Client rebuild succeeds; cold-launch reaches Home without
  crashing on missing Info.plist entries.
- HealthKit permission request fires when user opts in via Settings.
- Location enter/exit fires on simulator location simulation.
