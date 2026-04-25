import { useTabFocusHaptic } from '../../src/ui/haptics/use-tab-focus-haptic';
import { MemoryScreen } from '../../src/ui/screens/memory-screen';

export default function MemoryRoute(): React.JSX.Element {
  useTabFocusHaptic();
  return <MemoryScreen />;
}
