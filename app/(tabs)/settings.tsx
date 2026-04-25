import { useTabFocusHaptic } from '../../src/ui/haptics/use-tab-focus-haptic';
import { SettingsScreen } from '../../src/ui/screens/settings-screen';

export default function SettingsRoute(): React.JSX.Element {
  useTabFocusHaptic();
  return <SettingsScreen />;
}
