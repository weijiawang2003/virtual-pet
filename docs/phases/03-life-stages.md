# Phase 3: Life stage transitions

**Goal**: Drive `pet.stage` forward through `egg → baby → child → teen → adult`
based on elapsed age, and prove via property tests that the transition is
monotonic non-regressing under any legal event sequence.

**Dependencies**: Phase 1 + Phase 2.

## Deliverables

1. `src/core/pet/stages.ts` — `STAGE_ORDER`, `STAGE_THRESHOLDS_MS`, `stageFromAge`,
   `stageRank`, `advanceStage`.
2. `src/core/pet/reducer.ts` — `tick` handler now composes `applyDecay` then
   `advanceStage`. Other events remain stage-preserving.
3. `src/core/pet/stages.test.ts` — threshold table tests.
4. `src/core/pet/stages.properties.test.ts` — **fast-check monotonic property**:
   for any event sequence, `stageRank(end.stage) >= stageRank(start.stage)`.
5. Update `src/core/decay/decay.vtime.test.ts`: 48h expectation is now `teen`
   (24h threshold crossed), not `egg`.
6. Update `src/core/pet/reducer.properties.test.ts`: stage property rewritten
   from invariance to monotonicity.

## Scope decisions (small, taken without asking)

- **Thresholds** (in elapsed ms since birth):

  - `egg`: 0
  - `baby`: 1h
  - `child`: 8h
  - `teen`: 24h
  - `adult`: 72h

  These are aggressive for a real product — they exist so manual QA on a
  simulator sees a transition during a single test session. Phase 5+ can
  multiply by a "real-life pacing factor" behind an ADR.

- **Non-regression**: even if a tick somehow decreased `ageMs` (defensive),
  `advanceStage` never moves the stage backwards. Decay engine already coerces
  negative elapsed to 0, so this is a belt-and-braces guard.

- **Transitions fire on `tick` only**. `feed`/`play`/`rest` do not advance stage,
  even though in theory they could "age" the pet. Keep age purely time-driven.

## Invariants (enforced, tested)

1. `stageFromAge(ms)` matches the threshold table.
2. For any event `e` and pet `p`: `stageRank(reducer(p, e).stage) >= stageRank(p.stage)`.
3. `advanceStage(p)` is idempotent: `advanceStage(advanceStage(p))` equals `advanceStage(p)`.

## Testing contract

- `pnpm typecheck` → 0 errors
- `pnpm lint` → 0 errors, 0 warnings
- `pnpm test:coverage` → core ≥ 95% (we're at 100% and want to stay there)
- `pnpm test:virtual-time` → 48h snapshot updated + green
