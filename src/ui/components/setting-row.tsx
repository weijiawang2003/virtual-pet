import { Switch, Text, View } from 'react-native';

import { useTheme } from '../theme/use-theme';

interface SettingRowProps {
  readonly label: string;
  readonly description?: string;
  readonly value: boolean;
  readonly onChange: (v: boolean) => void;
  readonly testID?: string;
}

export function SettingRow(props: SettingRowProps): React.JSX.Element {
  const { label, description, value, onChange, testID } = props;
  const { palette } = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomColor: palette.border,
        borderBottomWidth: 1,
      }}
    >
      <View style={{ flex: 1, paddingRight: 12 }}>
        <Text style={{ color: palette.text, fontSize: 16, fontWeight: '500' }}>{label}</Text>
        {description !== undefined && (
          <Text style={{ color: palette.textMuted, fontSize: 13, marginTop: 2 }}>
            {description}
          </Text>
        )}
      </View>
      <Switch accessibilityLabel={label} value={value} onValueChange={onChange} testID={testID} />
    </View>
  );
}
