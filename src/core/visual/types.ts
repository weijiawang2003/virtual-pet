import type { LifeStage } from '../pet/types';

export type MoodTag =
  | 'happy'
  | 'sleepy'
  | 'excited'
  | 'low'
  | 'curious'
  | 'cozy'
  | 'hungry'
  | 'dirty';

export type SpriteKey =
  | 'egg'
  | 'baby-idle'
  | 'baby-happy'
  | 'baby-sleepy'
  | 'baby-hungry'
  | 'baby-low'
  | 'child-idle'
  | 'child-happy'
  | 'child-curious'
  | 'child-sleepy'
  | 'child-hungry'
  | 'child-low'
  | 'child-dirty'
  | 'teen-idle'
  | 'teen-happy'
  | 'teen-excited'
  | 'teen-curious'
  | 'teen-sleepy'
  | 'teen-hungry'
  | 'teen-low'
  | 'teen-cozy'
  | 'teen-dirty'
  | 'adult-idle'
  | 'adult-happy'
  | 'adult-excited'
  | 'adult-curious'
  | 'adult-sleepy'
  | 'adult-hungry'
  | 'adult-low'
  | 'adult-cozy'
  | 'adult-dirty';

export type AnimationKey =
  | 'idle'
  | 'bounce'
  | 'sleep'
  | 'eat'
  | 'cuddle'
  | 'dance'
  | 'yawn'
  | 'curious'
  | 'low'
  | 'full-moon-stare';

export type AccessoryKey = 'raincoat' | 'party-hat' | 'cny-jacket' | 'sunglasses';

export type BackgroundKey = 'sunny' | 'rain' | 'night' | 'dawn' | 'dusk' | 'snow' | 'cny';

export type BubbleKey =
  | 'hungry'
  | 'tired'
  | 'playful'
  | 'worried'
  | 'happy'
  | 'excited'
  | 'cozy'
  | 'curious'
  | 'low'
  | 'cny'
  | 'birthday'
  | 'fullmoon';

export type HapticKey = 'light' | 'medium' | 'heavy';

export interface VisualState {
  readonly sprite: SpriteKey;
  readonly animation: AnimationKey;
  readonly mood: MoodTag;
  readonly accessory: AccessoryKey | null;
  readonly background: BackgroundKey;
  readonly bubble: BubbleKey | null;
  readonly hapticHint: HapticKey | null;
}

export type { LifeStage };
