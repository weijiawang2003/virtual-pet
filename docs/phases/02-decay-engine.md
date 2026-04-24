# Phase 2: Decay engine + Clock provider

**Goal**: Time-driven stat decay, with a clock provider injected via pure data
(elapsed milliseconds), not by mutation. Must survive a 48h virtual-clock snapshot.

**Dependencies**: Phase 1.

## Deliverables

1. `src/providers/clock/types.ts` — `Clock` interface: `now(): number` (ms since epoch).
2. `src/providers/clock/real-clock.ts` — wraps `Date.now()`.
3. `src/providers/clock/fake-clock.ts` — factory returning `Clock & { advance(ms), setNow(ms) }`.
4. `src/core/decay/decay.ts` — pure `applyDecay(pet, elapsedMs): Pet`. Decay rates per hour:
   satiety 1.0, energy 0.5, happiness 0.75. All stats clamped to [0, 100].
5. `src/core/pet/types.ts` — rename `ageTicks` → `ageMs` (clearer: elapsed ms since birth).
6. `src/core/pet/reducer.ts` — add `{ type: 'tick'; elapsedMs: number }` event that
   delegates to `applyDecay`. Reducer remains pure; does **not** consult a Clock.
7. `src/core/decay/decay.vtime.test.ts` — **48h virtual-clock snapshot**. Drive a fake
   clock forward by 1-hour ticks for 48 iterations; assert stats match deterministic values.
8. Unit tests for fake-clock, applyDecay, and the new `tick` reducer branch.
9. New `providers` Jest project so `src/providers/**/*.test.ts` is discovered.

## Scope decisions (small, taken without asking)

- **Clock interface lives in `providers/`** (per CLAUDE.md §4 folder layout), not in
  `core/`. Core's decay function is kept clock-agnostic: it takes `elapsedMs` directly.
  Tests and Phase 4+ runtime wire `clock.now()` deltas into the pure function externally.
- **Decay is linear per hour**. Non-linear curves (exponential half-life, circadian
  sinusoids) are out of scope; Phase 5+ can introduce them via an ADR if needed.
- **Negative `elapsedMs` is coerced to 0** (defensive; a buggy caller must not rewind age).
- **`tick` with `elapsedMs = 0` is a no-op** (property: any such tick is idempotent).

## Invariants (enforced, tested via fast-check)

1. `applyDecay(pet, elapsed).stats.*` ∈ `[0, 100]` for any finite `elapsed`.
2. `applyDecay(pet, elapsed).ageMs >= pet.ageMs` (monotonic non-decreasing).
3. `applyDecay(pet, 0)` is deeply equal to `pet`.
4. `applyDecay(applyDecay(pet, a), b)` equals `applyDecay(pet, a + b)` for the stats and
   ageMs (linear decay property; holds until clamp floor kicks in).

## Testing contract

- `pnpm typecheck` → 0 errors
- `pnpm lint` → 0 errors, 0 warnings
- `pnpm test:coverage` → core lines/branches/functions ≥ 95%
- `pnpm test:virtual-time` → 48h snapshot green

## Non-goals

- No stage transitions (Phase 3).
- No scheduling / background tasks (needs expo-task-manager → Phase 4+).
- No real-world input (HealthKit, weather, etc.) affecting decay — Phase 5+.
