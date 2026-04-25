import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '../theme/use-theme';

export function MemoryScreen(): React.JSX.Element {
  const { palette } = useTheme();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: palette.background }}>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <Text style={{ color: palette.text, fontSize: 18, fontWeight: '600' }}>记忆</Text>
        <Text
          style={{
            color: palette.textMuted,
            fontSize: 13,
            marginTop: 8,
            textAlign: 'center',
            lineHeight: 20,
          }}
        >
          这里以后会回放重要瞬间。{'\n'}（Phase 16 落地）
        </Text>
      </View>
    </SafeAreaView>
  );
}
