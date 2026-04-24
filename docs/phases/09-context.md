# Phase 9: LifeContext synthesizer

**Goal**: A pure function that collapses every observable input (pet, health
samples, location events, time-of-day, permissions, plus TBD weather + lunar)
into a single `LifeContext` object consumable by the Phase 6 nudge selector.
Freezes a wire format that future rules and UI can depend on.

**Dependencies**: Phase 1 (Pet), Phase 7 samples, Phase 8 geofence events.
Structural types only — no provider imports in core.

## Deliverables

1. `src/core/context/types.ts` — `LifeContext`, `LifeContextInputs`, plus
   core-local `PermissionsView` (reused / re-exported from core/nudge/types or
   re-declared minimally — see decisions).
2. `src/core/context/synthesize.ts` — pure
   `synthesizeContext(inputs): LifeContext`.
3. `src/core/context/synthesize.test.ts` — example-based behavior.
4. `src/core/context/synthesize.snapshot.test.ts` — full snapshot against a
   fixed fixture to freeze the output shape.

## Scope decisions

- **`PermissionsView`** — since `core/nudge/types.ts` already defines this type,
  `core/context/types.ts` re-exports from there (single source of truth in core).
- **Weather and lunar** are represented as `weather: null` / `lunar: null` in
  `LifeContext` for now. Phase 11+ flips these to real values. Shape frozen now
  so downstream code can opt in via `?.` without the field appearing/disappearing.
- **Aggregation rules** (chosen, documented here so tests match):
  - `healthSummary.stepsLast24h` = sum of `StepsSample.value` where
    `endAt <= nowMs && startAt >= nowMs - 24h`.
  - `healthSummary.avgHrvLast24h` = average `sdnnMs` in same window; `null` if no samples.
  - `healthSummary.lastSleep` = the most recent `SleepSample` strictly before `nowMs`; `null` otherwise.
  - `location.current` = last `Coord` from inputs; `null` if absent.
  - `location.activeRegions` = set of `regionId` where the most recent event is
    `enter` and has no later `exit` (derived from the event list).
  - `timeOfDay.hour` = `Math.floor(((nowMs + tzOffsetMs) / 3600000) % 24)`.
- **`synthesizeContext` is pure** — no clock read, no Date parsing, no allocations
  of Set (frozen plain objects / arrays).

## Invariants

1. Same inputs → deep-equal output (pure).
2. `LifeContext.hourOfDay ∈ [0, 23]`.
3. Empty inputs don't throw; return context with nulls / zeros where appropriate.
4. Snapshot test pins the exact output shape.
