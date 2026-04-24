# Phase 1: Pet state machine

**Goal**: Implement the pet reducer — the pure core of everything downstream.
Time-based decay is deferred to Phase 2; life-stage transitions are deferred to Phase 3.

**Dependencies**: Phase 0.

## Deliverables

1. `src/core/util/assert-never.ts` — exhaustive switch helper.
2. `src/core/util/clamp.ts` — `STAT_MIN`, `STAT_MAX`, `clampStat(n)`.
3. `src/core/pet/types.ts` — `LifeStage`, `Stats`, `Pet`, `Event` (discriminated union).
4. `src/core/pet/reducer.ts` — `createPet(now?)`, `reducer(state, event)`.
5. `src/core/pet/reducer.test.ts` — example-based tests (replaces Phase 0 red-light).
6. `src/core/pet/reducer.properties.test.ts` — fast-check invariant properties.

## Scope decisions (small, taken without asking)

- **Stats**: `satiety` (0 = starved, 100 = full), `energy`, `happiness`. All three use
  "higher = better" semantics so downstream decay and UI logic is uniform.
- **Initial state**: all three stats start at 70 (not 100 — a brand-new pet has room to
  gain and to lose, avoiding a uniformly-max starting condition that would hide decay bugs).
- **Events for Phase 1**: `feed { nutrition }`, `play { minutes }`, `rest { minutes }`.
  `play` intentionally trades energy for happiness so tests exercise two-stat updates.
  A `tick` event (time passes → decay) is **not** part of Phase 1 — Phase 2 owns it.
- **Life stage**: field exists (set to `'egg'` on creation); transitions happen in Phase 3.
  No events in Phase 1 mutate `stage`.

## Invariants (enforced, tested)

1. All stats always in `[0, 100]` after any `reducer` call.
2. `stage` never changes in Phase 1 (verify via property test).
3. `bornAt` never changes after creation.
4. `ageTicks` is `>= 0` and never decreases in Phase 1 (currently always 0; Phase 2 tests
   monotonic non-decreasing behavior under `tick`).
5. `reducer` is pure: calling twice with same args produces deep-equal results.

## Testing contract

- `pnpm typecheck` → 0 errors
- `pnpm lint` → 0 errors, 0 warnings
- `pnpm test` → all tests pass, core coverage ≥ 95%
- At least one fast-check property per invariant above (1, 2, 5).

## Non-goals

- No time decay (Phase 2).
- No stage transitions (Phase 3).
- No persistence (MMKV comes later).
- No UI wiring (Phase 1 is pure core).
