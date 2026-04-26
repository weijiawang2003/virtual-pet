import { Image as ExpoImage } from 'expo-image';
import { Text, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated from 'react-native-reanimated';

import type { LifeStage } from '../../core/pet/types';
import type { AnimationKey, MoodTag, SpriteKey } from '../../core/visual/types';
import { useTheme } from '../theme/use-theme';
import { useSpriteAnimation } from './animations/sprite-animations';
import { lookupSprite } from './sprite-registry';

const SIZE = 240;
const IMAGE_SIZE = 192;

// Stage-level fallback emoji when no real PNG is registered for the
// (SpriteKey, MoodTag) pair. Real artwork takes precedence in `PetSprite`.
const PRIMARY_EMOJI: Record<LifeStage, string> = {
  egg: '🥚',
  baby: '🐣',
  child: '🐥',
  teen: '🐤',
  adult: '🐔',
};

// MoodTag → optional secondary emoji laid below the primary in the emoji
// fallback path. `null` = no overlay.
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
  const asset = lookupSprite(sprite, mood);

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
        {asset !== null ? (
          <ExpoImage
            source={asset.source}
            contentFit="contain"
            style={{ width: IMAGE_SIZE, height: IMAGE_SIZE }}
            testID="pet-sprite-image"
          />
        ) : (
          <View
            testID="pet-sprite-emoji"
            style={{ alignItems: 'center', justifyContent: 'center' }}
          >
            <Text style={{ fontSize: 120 }}>{PRIMARY_EMOJI[stage]}</Text>
            {MOOD_OVERLAY[mood] !== null && (
              <Text style={{ fontSize: 28, marginTop: 4, opacity: 0.85 }}>
                {MOOD_OVERLAY[mood]}
              </Text>
            )}
          </View>
        )}
      </Animated.View>
    </View>
  );
}
