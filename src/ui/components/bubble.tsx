import { useMemo, useRef } from 'react';
import { Text, View } from 'react-native';

import { selectPhrase } from '../../core/phrases/select';
import type { BubbleKey } from '../../core/visual/types';
import { useTheme } from '../theme/use-theme';

interface BubbleProps {
  readonly bubbleKey: BubbleKey | null;
  readonly seedSalt?: number;
}

const RECENT_WINDOW = 3;

export function Bubble({ bubbleKey, seedSalt = 0 }: BubbleProps): React.JSX.Element | null {
  const { palette } = useTheme();
  const recentRef = useRef<string[]>([]);
  const lastKeyRef = useRef<BubbleKey | null>(null);

  // Re-pick the phrase only when the bubbleKey transitions; otherwise the same
  // phrase persists for the whole bubble lifetime.
  const phrase = useMemo<string | null>(() => {
    if (bubbleKey === null) {
      lastKeyRef.current = null;
      return null;
    }
    if (lastKeyRef.current === bubbleKey) return recentRef.current[0] ?? null;
    const seed = (Date.now() ^ seedSalt) | 0;
    const next = selectPhrase(bubbleKey, seed, { recentlyUsed: recentRef.current });
    recentRef.current = [next, ...recentRef.current].slice(0, RECENT_WINDOW);
    lastKeyRef.current = bubbleKey;
    return next;
  }, [bubbleKey, seedSalt]);

  if (phrase === null) return null;

  return (
    <View
      accessibilityRole="text"
      accessibilityLabel={`Bubble: ${phrase}`}
      style={{
        backgroundColor: palette.surface,
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: palette.border,
        maxWidth: 280,
        alignSelf: 'center',
      }}
    >
      <Text style={{ color: palette.text, fontSize: 14, lineHeight: 20 }}>{phrase}</Text>
    </View>
  );
}
