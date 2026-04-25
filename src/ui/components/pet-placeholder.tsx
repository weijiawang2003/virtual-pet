import { Text, View } from 'react-native';

import { useTheme } from '../theme/use-theme';

const SIZE = 240;

export function PetPlaceholder(): React.JSX.Element {
  const { palette } = useTheme();
  return (
    <View
      accessibilityLabel="Pet placeholder"
      accessibilityRole="image"
      style={{
        width: SIZE,
        height: SIZE,
        backgroundColor: palette.placeholder,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text
        style={{
          color: palette.textMuted,
          fontSize: 14,
          fontWeight: '600',
          letterSpacing: 1.4,
        }}
      >
        PET HERE
      </Text>
    </View>
  );
}
