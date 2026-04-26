import type { MoodTag, SpriteKey } from '../../core/visual/types';

// Metro's `require('./*.png')` returns a numeric asset id. We type the
// registry as `number` (rather than RN's `ImageSourcePropType`, which
// triggers `exactOptionalPropertyTypes` friction with expo-image's
// stricter `ImageSource` union) so the value flows cleanly to <ExpoImage>.
export interface SpriteAsset {
  readonly source: number;
  readonly pixelArt: true;
}

// Metro requires literal-string require() at module scope for static asset
// bundling. Variables hold the resolved asset ids; the registry below maps
// (SpriteKey, MoodTag) cells onto these.
const EGG_ASSET: number = require('../../../assets/sprites/egg.png');
const BABY_HAPPY_ASSET: number = require('../../../assets/sprites/baby/happy.png');
const BABY_SLEEPY_ASSET: number = require('../../../assets/sprites/baby/sleepy.png');
const BABY_EXCITED_ASSET: number = require('../../../assets/sprites/baby/excited.png');
const BABY_HUNGRY_ASSET: number = require('../../../assets/sprites/baby/hungry.png');

const PIXEL = (source: number): SpriteAsset => Object.freeze({ source, pixelArt: true });

// Egg ignores mood — same PNG for every mood tag. Spelt out so TS sees a
// fully-populated map (no Partial gaps for the egg row).
function eggAllMoods(): Record<MoodTag, SpriteAsset> {
  const a = PIXEL(EGG_ASSET);
  return {
    happy: a,
    sleepy: a,
    excited: a,
    low: a,
    curious: a,
    cozy: a,
    hungry: a,
    dirty: a,
  };
}

// Helper: assigns the same asset to multiple moods on a single SpriteKey.
// Used for `baby-idle` (3 moods → happy.png as a neutral default) etc.
function assignAll(
  moods: readonly MoodTag[],
  asset: SpriteAsset,
): Partial<Record<MoodTag, SpriteAsset>> {
  const out: Partial<Record<MoodTag, SpriteAsset>> = {};
  for (const m of moods) out[m] = asset;
  return out;
}

// Pair registry. (SpriteKey, MoodTag) → asset. Unregistered cells return
// null from `lookupSprite`, signaling the caller to fall back to emoji.
//
// IMPORTANT: `mood='excited'` collapses onto `SpriteKey='baby-happy'` per
// `core/visual/select-sprite.ts`, so the excited variant is registered
// under that SpriteKey + the `excited` mood key — NOT under a hypothetical
// `baby-excited` SpriteKey (which doesn't exist). Same pattern for
// `baby-idle` (curious / cozy / dirty all collapse onto it).
export const SPRITE_REGISTRY: Partial<Record<SpriteKey, Partial<Record<MoodTag, SpriteAsset>>>> =
  Object.freeze({
    egg: eggAllMoods(),
    'baby-happy': Object.freeze({
      happy: PIXEL(BABY_HAPPY_ASSET),
      excited: PIXEL(BABY_EXCITED_ASSET),
    }),
    'baby-sleepy': Object.freeze({
      sleepy: PIXEL(BABY_SLEEPY_ASSET),
    }),
    'baby-hungry': Object.freeze({
      hungry: PIXEL(BABY_HUNGRY_ASSET),
    }),
    // baby-idle reachable via curious / cozy / dirty per select-sprite.ts.
    // No dedicated artwork yet → fall back to the happy PNG (neutral-positive).
    'baby-idle': Object.freeze(assignAll(['curious', 'cozy', 'dirty'], PIXEL(BABY_HAPPY_ASSET))),
    // baby-low reachable via low mood. Slumped sleepy art is the closest
    // available read until a dedicated low PNG ships.
    'baby-low': Object.freeze({
      low: PIXEL(BABY_SLEEPY_ASSET),
    }),
  });

export function lookupSprite(sprite: SpriteKey, mood: MoodTag): SpriteAsset | null {
  const row = SPRITE_REGISTRY[sprite];
  if (row === undefined) return null;
  const cell = row[mood];
  return cell ?? null;
}
