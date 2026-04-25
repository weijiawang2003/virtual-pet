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

describe('PetSprite', () => {
  it('renders the egg primary glyph for sprite=egg', () => {
    const { getByLabelText, getByText } = renderSprite('egg', 'happy', 'idle');
    expect(getByLabelText('egg pet · happy · idle')).toBeTruthy();
    expect(getByText('🥚')).toBeTruthy();
  });

  it('renders 🐣 for any baby sprite', () => {
    const { getByText } = renderSprite('baby-happy', 'happy', 'bounce');
    expect(getByText('🐣')).toBeTruthy();
  });

  it('renders 🐥 for any child sprite', () => {
    const { getByText } = renderSprite('child-curious', 'curious', 'curious');
    expect(getByText('🐥')).toBeTruthy();
  });

  it('renders 🐤 for any teen sprite', () => {
    const { getByText } = renderSprite('teen-excited', 'excited', 'dance');
    expect(getByText('🐤')).toBeTruthy();
  });

  it('renders 🐔 for any adult sprite', () => {
    const { getByText } = renderSprite('adult-cozy', 'cozy', 'cuddle');
    expect(getByText('🐔')).toBeTruthy();
  });

  it('shows 💤 overlay when mood is sleepy', () => {
    const { getByText } = renderSprite('teen-sleepy', 'sleepy', 'sleep');
    expect(getByText('💤')).toBeTruthy();
  });

  it('shows no overlay for happy mood (the default)', () => {
    const { queryByText } = renderSprite('child-happy', 'happy', 'bounce');
    expect(queryByText('💤')).toBeNull();
    expect(queryByText('😋')).toBeNull();
  });

  it('a11y label encodes stage, mood, and animation', () => {
    const { getByLabelText } = renderSprite('adult-low', 'low', 'low');
    expect(getByLabelText('adult pet · low · low')).toBeTruthy();
  });

  // Smoke-render every animation to make sure no hook combo crashes.
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
    it(`renders without crashing for animation=${anim}`, () => {
      const { getByLabelText } = renderSprite('teen-idle', 'happy', anim);
      expect(getByLabelText(`teen pet · happy · ${anim}`)).toBeTruthy();
    });
  }
});
