import { NativeTabs } from 'expo-router/unstable-native-tabs';

export default function TabsLayout(): React.JSX.Element {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index" options={{ title: 'Home', icon: { sf: 'house.fill' } }} />
      <NativeTabs.Trigger
        name="memory"
        options={{ title: 'Memory', icon: { sf: 'photo.on.rectangle' } }}
      />
      <NativeTabs.Trigger
        name="settings"
        options={{ title: 'Settings', icon: { sf: 'gearshape.fill' } }}
      />
    </NativeTabs>
  );
}
