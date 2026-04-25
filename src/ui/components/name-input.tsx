import { TextInput, type TextInputProps } from 'react-native';

import { useTheme } from '../theme/use-theme';

interface NameInputProps {
  readonly value: string;
  readonly onChangeText: (next: string) => void;
  readonly placeholder?: string;
  readonly testID?: string;
}

const MAX_LEN = 24;

export function NameInput(props: NameInputProps): React.JSX.Element {
  const { value, onChangeText, placeholder, testID } = props;
  const { palette } = useTheme();

  const tiProps: TextInputProps = {
    value,
    onChangeText: (t: string) => onChangeText(t.slice(0, MAX_LEN)),
    placeholder,
    placeholderTextColor: palette.textMuted,
    autoCapitalize: 'none',
    autoCorrect: false,
    maxLength: MAX_LEN,
    testID,
    accessibilityLabel: placeholder ?? 'Pet name',
    style: {
      backgroundColor: palette.surface,
      color: palette.text,
      borderColor: palette.border,
      borderWidth: 1,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      fontSize: 18,
    },
  };

  return <TextInput {...tiProps} />;
}
