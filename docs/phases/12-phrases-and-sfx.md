# Phase 12: Phrase pool + SFX maps

**Goal**: Materialize the `BubbleKey → Chinese text` map from Phase 11 and
the reducer-event → SFX map. Both pure TS, no network, no runtime deps.

**Dependencies**: Phase 1 (Pet events), Phase 9 (LifeContext), Phase 11
(BubbleKey enum).

## Deliverables

1. `src/core/util/prng.ts` — mulberry32 deterministic PRNG.
2. `src/core/phrases/pool.ts` — `POOL: Record<BubbleKey, readonly string[]>`.
   ≥ 8 phrases per daily key, ≥ 4 per festival key. `MIN_COUNT` constants
   exported for completeness tests.
3. `src/core/phrases/select.ts` — `selectPhrase(key, seed, recentlyUsed): string`.
   Deterministic via `seed`; avoids last N shown phrases.
4. `src/core/sfx/types.ts` — `SfxKey` enum + `SfxPreference` struct.
5. `src/core/sfx/map.ts` — `mapEventToSfx(event): SfxKey | null` exhaustive
   over reducer `Event` via `assertNever`.
6. `src/core/sfx/policy.ts` — `shouldPlaySfx(ctx, pref): boolean` respecting
   muted flag + quiet-hour window.

## Scope decisions

- **Tone**: all phrases warm/supportive, zero judgmental language. Explicitly
  excluded: "you should", "don't", "bad", "wrong", "lazy". Follows the study's
  companion-not-coach principle.
- **No emoji in phrases**: UI layer owns visual affordances; text stays clean.
- **`recentlyUsed` is caller-tracked**: selector is stateless — caller (Phase
  15+ UI) persists the last-3 window across sessions.
- **Budget behavior**: if every candidate is in `recentlyUsed`, fall back to
  the first phrase in the pool (deterministic, non-empty).
- **SFX `mapEventToSfx` only covers reducer events** (feed/play/rest/tick).
  UI-level SFX (tap-blop, evolve-shimmer, notification-chime, birthday-fanfare,
  deny-nope) are played directly by their call sites, not via this map. They
  live in `SfxKey` enum for type coverage.
- **`SfxPreference`** = `{ muted: boolean; respectQuietHours: boolean;
quietStartHour: number; quietEndHour: number }`. Quiet-hour window wraps
  midnight (e.g. 22 → 7).

## Invariants (tested)

1. `mulberry32` is deterministic: same seed → same sequence.
2. Every `BubbleKey` has ≥ `MIN_COUNT` phrases in POOL.
3. `selectPhrase(key, seed, recentlyUsed)` never returns `undefined`.
4. `selectPhrase` avoids recently-used phrases unless the pool is exhausted.
5. `mapEventToSfx` is total over `Event` (`assertNever` tombstone).
6. `shouldPlaySfx(ctx, { muted: true })` is always `false`.
