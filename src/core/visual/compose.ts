import type { LifeContext } from '../context/types';
import type { Pet } from '../pet/types';
import { deriveMood } from './mood';
import { selectAccessory } from './select-accessory';
import { selectAnimation } from './select-animation';
import { selectBackground } from './select-background';
import { selectBubble } from './select-bubble';
import { selectHaptic } from './select-haptic';
import { selectSprite } from './select-sprite';
import type { VisualState } from './types';

export function compose(pet: Pet, ctx: LifeContext): VisualState {
  const mood = deriveMood(pet, ctx);
  return Object.freeze({
    sprite: selectSprite(pet, mood),
    animation: selectAnimation(pet, ctx, mood),
    mood,
    accessory: selectAccessory(ctx),
    background: selectBackground(ctx),
    bubble: selectBubble(pet, ctx),
    hapticHint: selectHaptic(ctx),
  });
}
