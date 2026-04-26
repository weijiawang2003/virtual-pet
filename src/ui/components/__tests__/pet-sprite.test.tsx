import { render } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import type { AnimationKey, MoodTag, SpriteKey } from '../../../core/visual/types';
import { PetSprite } from '../pet-sprite';
import { ThemeProvider } from '../../theme/theme-provider';

const FRAME = {
  insets: { top: 0, bottom: 0, left: 0, right: 0 },
  frame: { x: 0, y: 0, width: 390, height: 844 },
};

function renderSprite(sprite: SpriteKey, mood: MoodTag, animation: AnimationKey) {
  return render(
    <SafeAreaProvider initialMetrics={FRAME}>
      <ThemeProvider>
        <PetSprite sprite={sprite} mood={mood} animation={animation} />
      </ThemeProvider>
    </SafeAreaProvider>,
  );
}

describe('PetSprite — registered assets render expo-image', () => {
  it('egg + happy → image (egg ignores mood)', () => {
    const { getByTestId, queryByTestId } = renderSprite('egg', 'happy', 'idle');
    expect(getByTestId('pet-sprite-image')).toBeTruthy();
    expect(queryByTestId('pet-sprite-emoji')).toBeNull();
  });

  it('egg + sleepy → image (egg ignores mood)', () => {
    const { getByTestId } = renderSprite('egg', 'sleepy', 'sleep');
    expect(getByTestId('pet-sprite-image')).toBeTruthy();
  });

  it('baby-happy + happy → image (registered)', () => {
    const { getByTestId } = renderSprite('baby-happy', 'happy', 'bounce');
    expect(getByTestId('pet-sprite-image')).toBeTruthy();
  });

  it('baby-happy + excited → image (different asset than happy)', () => {
    const { getByTestId } = renderSprite('baby-happy', 'excited', 'dance');
    expect(getByTestId('pet-sprite-image')).toBeTruthy();
  });

  it('baby-sleepy + sleepy → image (registered)', () => {
    const { getByTestId } = renderSprite('baby-sleepy', 'sleepy', 'sleep');
    expect(getByTestId('pet-sprite-image')).toBeTruthy();
  });

  it('baby-hungry + hungry → image (registered)', () => {
    const { getByTestId } = renderSprite('baby-hungry', 'hungry', 'idle');
    expect(getByTestId('pet-sprite-image')).toBeTruthy();
  });
});

describe('PetSprite — unregistered cells fall back to emoji', () => {
  it('baby-idle + curious → emoji (no asset)', () => {
    const { getByTestId, getByText, queryByTestId } = renderSprite(
      'baby-idle',
      'curious',
      'curious',
    );
    expect(getByTestId('pet-sprite-emoji')).toBeTruthy();
    expect(getByText('🐣')).toBeTruthy();
    expect(queryByTestId('pet-sprite-image')).toBeNull();
  });

  it('baby-low + low → emoji (no asset)', () => {
    const { getByTestId, getByText } = renderSprite('baby-low', 'low', 'low');
    expect(getByTestId('pet-sprite-emoji')).toBeTruthy();
    expect(getByText('🐣')).toBeTruthy();
  });

  it('child-curious + curious → emoji', () => {
    const { getByText, queryByTestId } = renderSprite('child-curious', 'curious', 'curious');
    expect(getByText('🐥')).toBeTruthy();
    expect(queryByTestId('pet-sprite-image')).toBeNull();
  });

  it('teen-excited + excited → emoji', () => {
    const { getByText } = renderSprite('teen-excited', 'excited', 'dance');
    expect(getByText('🐤')).toBeTruthy();
  });

  it('adult-cozy + cozy → emoji', () => {
    const { getByText } = renderSprite('adult-cozy', 'cozy', 'cuddle');
    expect(getByText('🐔')).toBeTruthy();
  });

  it('shows 💤 overlay when mood is sleepy on emoji path', () => {
    // teen-sleepy isn't registered → emoji path; sleepy overlay applies.
    const { getByText } = renderSprite('teen-sleepy', 'sleepy', 'sleep');
    expect(getByText('💤')).toBeTruthy();
  });

  it('emoji path shows no overlay for happy mood', () => {
    // child-happy isn't registered → emoji; happy mood has no overlay.
    const { queryByText } = renderSprite('child-happy', 'happy', 'bounce');
    expect(queryByText('💤')).toBeNull();
    expect(queryByText('😋')).toBeNull();
  });
});

describe('PetSprite — a11y + smoke', () => {
  it('a11y label encodes stage, mood, and animation', () => {
    const { getByLabelText } = renderSprite('adult-low', 'low', 'low');
    expect(getByLabelText('adult pet · low · low')).toBeTruthy();
  });

  // Render every animation key once on a path that hits both branches:
  // teen-idle is unregistered (emoji), egg is registered (image).
  const ANIMS: readonly AnimationKey[] = [
    'idle',
    'bounce',
    'sleep',
    'eat',
    'cuddle',
    'dance',
    'yawn',
    'curious',
    'low',
    'full-moon-stare',
  ];

  for (const anim of ANIMS) {
    it(`emoji branch renders without crashing for animation=${anim}`, () => {
      const { getByLabelText } = renderSprite('teen-idle', 'happy', anim);
      expect(getByLabelText(`teen pet · happy · ${anim}`)).toBeTruthy();
    });
    it(`image branch renders without crashing for animation=${anim}`, () => {
      const { getByLabelText } = renderSprite('egg', 'happy', anim);
      expect(getByLabelText(`egg pet · happy · ${anim}`)).toBeTruthy();
    });
  }
});
