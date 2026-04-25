import { useTabFocusHaptic } from '../../src/ui/haptics/use-tab-focus-haptic';
import { HomeScreen } from '../../src/ui/screens/home-screen';

export default function HomeRoute(): React.JSX.Element {
  useTabFocusHaptic();
  return <HomeScreen />;
}
