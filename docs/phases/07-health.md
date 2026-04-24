# Phase 7: HealthKit provider + in-memory fake

**Goal**: A typed abstraction over HealthKit-style data (steps, sleep, HRV) with
a deterministic fake that accepts injected sample sequences and supports push
subscriptions. Real @kingstinct/react-native-healthkit wiring is stubbed.

**Dependencies**: Phase 0.

## Deliverables

1. `src/providers/health/types.ts` — sample types (`StepsSample`, `SleepSample`,
   `HRVSample`), `HealthKitProvider` interface with `getSteps` / `getSleep` /
   `getHRV` (time-window queries) and `subscribe` (push).
2. `src/providers/health/fake.ts` — `createFakeHealthKitProvider({ samples })`.
   Filters injected samples by time window. `subscribe` registers callbacks;
   test-only `emit(sample)` pushes to subscribers.
3. `src/providers/health/real.ts` — placeholder rejecting with TODO(Phase 10)
   for `@kingstinct/react-native-healthkit` wiring.
4. Contract tests for the fake (query-by-window, subscribe/unsubscribe, emit)
   plus rejection tests for the real stub.

## Scope decisions

- **Sample shape**: flat objects with `{ startAt, endAt, value, source? }`. Close
  to what HealthKit returns, not aspirationally richer. Sleep gets an additional
  `stage: 'awake' | 'light' | 'deep' | 'rem'`.
- **Query returns an array**, not a stream. Real HealthKit supports both; the
  array form covers Phase 9 synthesis needs.
- **`subscribe` returns a disposer function** (not a subscription object). Keeps
  the fake trivially testable and matches idiomatic RN patterns.
- **HRV returned as SDNN ms** — the most common unit exposed by HealthKit.
- **No aggregation helpers in Phase 7** (e.g. no "total steps in last 24h").
  Phase 9 context synthesizer owns aggregation. Provider stays dumb.

## Invariants

1. `getSteps(from, to)` returns only samples with `startAt >= from` and `endAt <= to`.
2. `subscribe` then `emit` delivers the sample to the subscriber; after dispose
   it does not.
3. Reordering injected samples does not change query results (sort order stable
   by startAt asc).
