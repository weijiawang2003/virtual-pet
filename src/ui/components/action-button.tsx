import { Pressable, Text, View } from 'react-native';

import { useHaptics } from '../haptics/use-haptics';
import { useTheme } from '../theme/use-theme';

const SIZE = 56;

interface ActionButtonProps {
  readonly label: string;
  readonly accessibilityLabel: string;
  readonly icon?: string;
  readonly onPress?: () => void;
  readonly onLongPress?: () => void;
  readonly disabled?: boolean;
  readonly testID?: string;
}

export function ActionButton(props: ActionButtonProps): React.JSX.Element {
  const { label, accessibilityLabel, icon, onPress, onLongPress, disabled = false, testID } = props;
  const { palette } = useTheme();
  const haptics = useHaptics();

  const handlePress = (): void => {
    if (disabled) return;
    haptics.trigger('light');
    onPress?.();
  };

  const handleLongPress = (): void => {
    if (onLongPress === undefined) return;
    haptics.trigger('selection');
    onLongPress();
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      hitSlop={8}
      onPress={handlePress}
      onLongPress={handleLongPress}
      testID={testID}
      style={({ pressed }) => ({
        width: SIZE,
        height: SIZE,
        borderRadius: SIZE / 2,
        backgroundColor: palette.surfaceMuted,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: disabled ? 0.4 : pressed ? 0.7 : 1,
      })}
    >
      <View>
        {icon !== undefined && <Text style={{ fontSize: 20, textAlign: 'center' }}>{icon}</Text>}
        <Text style={{ color: palette.text, fontSize: 11, fontWeight: '600', textAlign: 'center' }}>
          {label}
        </Text>
      </View>
    </Pressable>
  );
}
