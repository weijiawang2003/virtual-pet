# Phase 11: Visual state machine (pure TS, no React)

**Goal**: Map `(Pet, LifeContext) → VisualState`. Pure functions only; no React
imports, no RN. This is the data source Phase 15+ UI will render.

**Dependencies**: Phase 1 (Pet), Phase 9 (LifeContext), Phase 10 (env fields).

## Deliverables

1. `src/core/visual/types.ts` — `VisualState`, `SpriteKey`, `AnimationKey`,
   `MoodTag`, `AccessoryKey`, `BackgroundKey`, `BubbleKey`, `HapticKey`.
2. `src/core/visual/mood.ts` — `deriveMood(pet, ctx): MoodTag`. Split from
   `selectSprite` so the mapping layers stay testable in isolation.
3. `src/core/visual/select-sprite.ts` — `selectSprite(pet, mood): SpriteKey`
   as an exhaustive `Record<LifeStage, Record<MoodTag, SpriteKey>>` lookup.
4. `src/core/visual/select-animation.ts` — priority-driven rule table:
   sleep > emotional > weather > full-moon-stare > mood > idle.
5. `src/core/visual/select-accessory.ts` — birthday > CNY > rain > null.
6. `src/core/visual/select-background.ts` — CNY > snow > rain > time-of-day.
7. `src/core/visual/select-bubble.ts` — returns `BubbleKey | null` (text
   resolution deferred to Phase 12).
8. `src/core/visual/select-haptic.ts` — state-driven haptic hints. Feed/evolve
   haptics are UI-level event responses, not state-derivable; this module
   only emits `'medium'` for full-moon mood. Rest is `null`.
9. `src/core/visual/compose.ts` — `compose(pet, ctx): VisualState`.
10. Unit tests per selector, a compose snapshot with 6 fixtures, and a
    fast-check safety property.

## Scope decisions

- **Add `context.user`**: optional field `{ birthday?: { month, day } }` on
  `LifeContext` + `LifeContextInputs`. Null-safe so existing tests pass
  unchanged. Birthday is month/day (no year) for anniversary matching.
- **`compose(pet, ctx)`**: user-spec'd signature even though `pet === ctx.pet`.
  Redundant but explicit.
- **`'dirty'` mood + `'eat'` animation**: in the enum per spec, but never
  emitted from current `deriveMood` (no cleanliness stat yet; `eat` only
  plays on feed-event reaction at UI layer). Tests force the branches via
  exhaustive-map reads.
- **Full moon window**: `moonPhase ∈ [0.48, 0.52]`.
- **Priority tie-breakers**: documented inline per-selector. Follow
  declaration order for equal-priority rules (stable).

## Invariants (property-tested)

1. For any `(pet, ctx)`, `compose` returns `VisualState` with every required
   field present (no `undefined`).
2. `selectSprite` is total over `LifeStage × MoodTag`.
3. `selectAnimation` returns `'idle'` as a safety default for any input not
   matched by priority rules.
4. Pure throughout — same `(pet, ctx)` → deep-equal output.

## Non-goals

- Actual phrase text (that's Phase 12; here we emit `BubbleKey`).
- Image / audio asset paths (UI layer maps keys to assets).
- Reading a Clock — all inputs come via `ctx.nowMs`.
