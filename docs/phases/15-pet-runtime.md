# Phase 15: Pet runtime + UI wiring

**Goal**: Replace Phase 14's hardcoded placeholder values with the real reducer

- Clock + `synthesizeContext` + `compose` pipeline. Action buttons dispatch
  events; stats decay; bubble shows real phrases; background tint follows
  weather/time. Pet survives kill-and-relaunch via MMKV.

**Dependencies**: Phases 1–14.

## Deliverables

1. **Pet snapshot store** rewired:
   - Always non-null pet (created on first launch via `createPet(Date.now())`)
   - Adds `lastTickedAt` (UI-only timestamp; not part of core `Pet`)
   - `dispatch(event)` and `applyTick()` actions
   - `reset()` re-initializes a fresh pet
2. **Settings store** gains `demoSpeed: 1 | 10 | 60 | 600` (default 1 = realtime).
3. **Hooks**:
   - `useNowMs(intervalMs)` — re-renders on a tick
   - `useLifeContext()` — synthesizes the `LifeContext` (memoized on pet × nowMs)
   - `usePetActions()` — `feed/play/rest/clean/reset` with light haptic
   - `usePetTick()` — installs the global tick interval, idempotent across mounts
4. **Components**:
   - `bubble.tsx` — speech-bubble overlay, picks a phrase per current `BubbleKey`
   - `stat-ring.tsx` — same simple visual as Phase 14 placeholder, but data-driven
5. **Screens**:
   - `home-screen.tsx` — wired to `useLifeContext` + `usePetActions`; backdrop
     tint pulled from `theme.backdropTintFor(visual.background)`
   - `settings-screen.tsx` — adds demo-speed picker (Settings only)
6. **`app/_layout.tsx`** mounts `usePetTick()` so ageing runs whenever app is
   foregrounded.
7. **Tests**:
   - pet-snapshot-store init / dispatch / applyTick / catch-up across "launch"
   - `usePetActions` dispatches & fires haptic (mocked)
   - Updated Home snapshot reflecting wired state

## Scope decisions

- **`lastTickedAt` lives in the UI store, not core**. Core `Pet` stays pure.
- **Catch-up on cold launch**: on first `applyTick`, elapsed = `now − lastTickedAt`
  (could be hours after a kill); pet ages by that delta. Capped at 7 days to
  avoid pathological deltas from clock skew or test fixtures.
- **`clean` button** still shows a haptic but does nothing to state — reducer
  has no `clean` event yet. Dedicated phase will add cleanliness stat.
- **Tick interval**: 1000 ms. UI re-renders on each tick via `useNowMs(1000)`.
- **demoSpeed**: scalar applied to elapsedMs in `applyTick`. Persisted.
- **`useLifeContext` permissions**: hard-coded `granted` snapshot. Phase 17+
  will subscribe to a real provider.
- **`useLifeContext` location/health**: empty until Phases 17+. Solar/lunar/
  weather still compute (deterministic mock + lat/lon = device default
  Beijing for now).

## Invariants

1. Pet is **never null** after first render.
2. After `dispatch({type:'feed', nutrition:n})`, satiety in store ≥ old +n
   (clamped to 100).
3. After `applyTick()` with elapsed E ≥ 0, ageMs increases by ≤ E·demoSpeed.
4. After kill-and-relaunch (mocked by remounting the store), elapsed since last
   tick is applied exactly once.

## Non-goals

- Real pet artwork (Phase 16).
- HealthKit / Location / Notifications wiring (Phase 17+).
- Onboarding (set birthday, name) (Phase 18).
