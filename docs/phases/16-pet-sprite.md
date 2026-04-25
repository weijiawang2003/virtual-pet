# Phase 16: Pet sprite + animations

**Goal**: Replace the 240×240 gray placeholder with a stage- and mood-aware
sprite that animates per the `AnimationKey` chosen by `compose`. Real artwork
is a future asset phase; Phase 16 uses styled emoji as the sprite source so
animation, layering, and a11y can be exercised without art assets.

**Dependencies**: Phase 11 (visual selectors), Phase 14 (UI foundation),
Phase 15 (runtime wiring).

## Deliverables

1. `src/ui/components/animations/sprite-animations.ts` — animation parameter
   table per `AnimationKey` + a `useSpriteAnimation(key)` hook returning the
   Reanimated animated style.
2. `src/ui/components/pet-sprite.tsx` — emoji-based sprite. Reads
   `(SpriteKey, AnimationKey)` and renders an animated emoji + secondary mood
   emoji overlay. Replaces `pet-placeholder.tsx` in Home.
3. `src/ui/components/pet-placeholder.tsx` — kept as a fallback for tests
   that need a static sprite (deleted otherwise; rolled into pet-sprite).
4. Updated Home snapshot reflecting the new sprite component.

## Scope decisions

- **Emoji as sprite source**: zero asset deps. SpriteKey → primary emoji
  (always one of 🥚🐣🐥🐤🐔), MoodTag → optional secondary emoji overlay
  (💤 for sleepy, 😢 for hungry, etc.). When real art arrives, swap the
  primary emoji for `<expo-image>` keyed off the same SpriteKey table.
- **Reanimated v4 worklets**: animation styles via `useSharedValue` +
  `useAnimatedStyle`. Mock is set up by jest-setup so tests are inert.
- **AnimationKey priorities**: already enforced by Phase 11 `selectAnimation`.
  Phase 16 just provides the animation values.
- **a11y**: sprite View carries `accessibilityRole="image"` and
  `accessibilityLabel="<stage> · <mood>"`.

## Animation values

| AnimationKey    | Motion                     | Loop | Duration |
| --------------- | -------------------------- | ---- | -------- |
| idle            | translateY ±2              | yes  | 4s       |
| bounce          | translateY -10 → 0         | yes  | 1s       |
| sleep           | opacity 0.7 ↔ 1.0         | yes  | 2.5s     |
| eat             | scale 1.0 → 1.15 → 1.0     | yes  | 0.6s     |
| cuddle          | translateX ±3              | yes  | 3s       |
| dance           | rotate ±15°                | yes  | 0.5s     |
| yawn            | scale 1.0 → 1.1 → 1.0      | yes  | 2s       |
| curious         | rotate +5° (asymmetric)    | yes  | 1.5s     |
| low             | translateX ±1 (slow shake) | yes  | 3s       |
| full-moon-stare | opacity 0.85 ↔ 1.0 (slow) | yes  | 5s       |

## Tests

- `pet-sprite.test.tsx` — renders correct primary emoji per SpriteKey
  (smoke-checks all 31 keys + every animation).
- Home snapshot updated for the new sprite layout.
