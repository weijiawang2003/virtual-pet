import { useEffect } from 'react';
import {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import type { AnimationKey } from '../../../core/visual/types';

interface AnimSpec {
  readonly translateY?: { from: number; to: number; duration: number };
  readonly translateX?: { from: number; to: number; duration: number };
  readonly scale?: { from: number; to: number; duration: number };
  readonly rotate?: { from: number; to: number; duration: number };
  readonly opacity?: { from: number; to: number; duration: number };
}

// Animation parameters per AnimationKey. Tweak values to adjust feel.
const ANIMATIONS: Record<AnimationKey, AnimSpec> = {
  idle: { translateY: { from: -2, to: 2, duration: 2000 } },
  bounce: { translateY: { from: 0, to: -10, duration: 500 } },
  sleep: { opacity: { from: 0.7, to: 1.0, duration: 1250 } },
  eat: { scale: { from: 1.0, to: 1.15, duration: 300 } },
  cuddle: { translateX: { from: -3, to: 3, duration: 1500 } },
  dance: { rotate: { from: -15, to: 15, duration: 250 } },
  yawn: { scale: { from: 1.0, to: 1.1, duration: 1000 } },
  curious: { rotate: { from: -5, to: 8, duration: 750 } },
  low: { translateX: { from: -1, to: 1, duration: 1500 } },
  'full-moon-stare': { opacity: { from: 0.85, to: 1.0, duration: 2500 } },
};

function loopBack(from: number, to: number, duration: number): number {
  'worklet';
  const easing = Easing.inOut(Easing.quad);
  return withRepeat(
    withSequence(withTiming(to, { duration, easing }), withTiming(from, { duration, easing })),
    -1,
    false,
  );
}

export function useSpriteAnimation(animation: AnimationKey): {
  animatedStyle: ReturnType<typeof useAnimatedStyle>;
} {
  const spec = ANIMATIONS[animation];
  const ty = useSharedValue<number>(spec.translateY?.from ?? 0);
  const tx = useSharedValue<number>(spec.translateX?.from ?? 0);
  const sc = useSharedValue<number>(spec.scale?.from ?? 1);
  const rt = useSharedValue<number>(spec.rotate?.from ?? 0);
  const op = useSharedValue<number>(spec.opacity?.from ?? 1);

  useEffect(() => {
    ty.value =
      spec.translateY !== undefined
        ? loopBack(spec.translateY.from, spec.translateY.to, spec.translateY.duration)
        : 0;
    tx.value =
      spec.translateX !== undefined
        ? loopBack(spec.translateX.from, spec.translateX.to, spec.translateX.duration)
        : 0;
    sc.value =
      spec.scale !== undefined ? loopBack(spec.scale.from, spec.scale.to, spec.scale.duration) : 1;
    rt.value =
      spec.rotate !== undefined
        ? loopBack(spec.rotate.from, spec.rotate.to, spec.rotate.duration)
        : 0;
    op.value =
      spec.opacity !== undefined
        ? loopBack(spec.opacity.from, spec.opacity.to, spec.opacity.duration)
        : 1;
    return () => {
      cancelAnimation(ty);
      cancelAnimation(tx);
      cancelAnimation(sc);
      cancelAnimation(rt);
      cancelAnimation(op);
    };
  }, [spec, ty, tx, sc, rt, op]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: ty.value },
      { translateX: tx.value },
      { scale: sc.value },
      { rotate: `${rt.value}deg` },
    ],
    opacity: op.value,
  }));

  return { animatedStyle };
}
