import type { LifeContext } from '../context/types';
import type { HapticKey } from './types';

// State-derivable haptic only. Event-driven haptics (light on feed, heavy on
// evolve) are UI-layer responses to user actions — not derived from state.
// Here we return 'medium' during the full-moon window, else null.
export function selectHaptic(ctx: LifeContext): HapticKey | null {
  const phase = ctx.solar?.moonPhase;
  if (phase !== undefined && phase >= 0.48 && phase <= 0.52) return 'medium';
  return null;
}
