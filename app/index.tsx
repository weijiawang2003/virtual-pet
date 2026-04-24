import { Text, View } from 'react-native';

export default function Home() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text accessibilityRole="header" accessibilityLabel="Virtual Pet — Phase 0">
        Virtual Pet — Phase 0
      </Text>
    </View>
  );
}
