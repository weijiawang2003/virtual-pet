import { useTabFocusHaptic } from '../../src/ui/haptics/use-tab-focus-haptic';
import { VaultScreen } from '../../src/ui/screens/vault-screen';

export default function VaultRoute(): React.JSX.Element {
  useTabFocusHaptic();
  return <VaultScreen />;
}
