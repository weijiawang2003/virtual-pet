# Phase 20: Real sprites (baby + egg)

**Goal**: Replace PetSprite's emoji glyph with real PNG art wherever a
registered `(SpriteKey, MoodTag)` pair exists. Fall back to emoji for
unregistered cells so other stages don't regress.

**Dependencies**: Phase 16 (PetSprite), Phase 14 (expo-image already
installed).

## Deliverables

1. `src/ui/components/sprite-registry.ts` — `SpriteAsset`, `SPRITE_REGISTRY`
   (nested `Partial<Record<SpriteKey, Partial<Record<MoodTag, SpriteAsset>>>>`),
   `lookupSprite(sprite, mood)`. Module-level `require()` calls so Metro
   bundles the assets.
2. `src/ui/components/pet-sprite.tsx` — branch on `lookupSprite` result;
   real → `<expo-image>` 192×192, fallback → existing emoji + overlay
   path. Animation wrapper unchanged.
3. `src/ui/components/__tests__/pet-sprite.test.tsx` — registered-vs-
   unregistered cases.
4. `src/ui/components/__tests__/sprite-registry.test.ts` — pair-lookup
   semantics (excited resolves to a different asset than happy under the
   same SpriteKey).
5. `jest-setup.ts` — mock `expo-image` so the test renderer doesn't try
   to load native bindings.
6. Regenerate `home-screen.snapshot.test.tsx.snap` — egg now renders an
   image instead of an emoji `<Text>`.

## Coverage matrix shipped

| Pair                    | Asset              |
| ----------------------- | ------------------ |
| `egg`, _all 8 moods_    | `egg.png`          |
| `baby-happy`, `happy`   | `baby/happy.png`   |
| `baby-happy`, `excited` | `baby/excited.png` |
| `baby-sleepy`, `sleepy` | `baby/sleepy.png`  |
| `baby-hungry`, `hungry` | `baby/hungry.png`  |

## Decisions

- No fallback chain — missing pair → emoji directly.
- Image at 192×192 inside the 240×240 surface (visual padding).
- `pixelArt: true` stays on `SpriteAsset` for Phase 21+ (`expo-pixel-perfect`
  nearest-neighbor scaling); ignored this phase.

## Non-goals

- Pixel-perfect nearest-neighbor scaling (deferred).
- Child / teen / adult artwork (separate asset drop).
- baby-idle / baby-low art.
