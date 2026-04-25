import { Text, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated from 'react-native-reanimated';

import type { LifeStage } from '../../core/pet/types';
import type { AnimationKey, MoodTag, SpriteKey } from '../../core/visual/types';
import { useTheme } from '../theme/use-theme';
import { useSpriteAnimation } from './animations/sprite-animations';

const SIZE = 240;

// SpriteKey → primary stage emoji. Phase 16 uses styled emoji as the sprite
// source so we can ship animation + a11y without art assets. Real sprite art
// will swap the primary emoji for `<expo-image>` keyed off SpriteKey.
const PRIMARY_EMOJI: Record<LifeStage, string> = {
  egg: '🥚',
  baby: '🐣',
  child: '🐥',
  teen: '🐤',
  adult: '🐔',
};

// MoodTag → optional secondary emoji laid below the primary as a status
// modifier. `null` = no overlay (default mood for stage).
const MOOD_OVERLAY: Record<MoodTag, string | null> = {
  happy: null,
  sleepy: '💤',
  excited: '🎉',
  low: '💧',
  curious: '❓',
  cozy: '☕',
  hungry: '😋',
  dirty: '🌫️',
};

function spriteKeyToStage(key: SpriteKey): LifeStage {
  if (key === 'egg') return 'egg';
  if (key.startsWith('baby-')) return 'baby';
  if (key.startsWith('child-')) return 'child';
  if (key.startsWith('teen-')) return 'teen';
  return 'adult';
}

interface PetSpriteProps {
  readonly sprite: SpriteKey;
  readonly mood: MoodTag;
  readonly animation: AnimationKey;
}

export function PetSprite(props: PetSpriteProps): React.JSX.Element {
  const { sprite, mood, animation } = props;
  const { palette } = useTheme();
  const { animatedStyle } = useSpriteAnimation(animation);

  const stage = spriteKeyToStage(sprite);
  const primary = PRIMARY_EMOJI[stage];
  const overlay = MOOD_OVERLAY[mood];

  return (
    <View
      accessibilityRole="image"
      accessibilityLabel={`${stage} pet · ${mood} · ${animation}`}
      style={{
        width: SIZE,
        height: SIZE,
        borderRadius: 24,
        backgroundColor: palette.surface,
        borderWidth: 1,
        borderColor: palette.border,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      <Animated.View style={animatedStyle as unknown as StyleProp<ViewStyle>}>
        <View style={{ alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontSize: 120 }}>{primary}</Text>
          {overlay !== null && (
            <Text style={{ fontSize: 28, marginTop: 4, opacity: 0.85 }}>{overlay}</Text>
          )}
        </View>
      </Animated.View>
    </View>
  );
}
