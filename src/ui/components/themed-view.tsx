import { View, type ViewProps, type ViewStyle } from 'react-native';

import { useTheme } from '../theme/use-theme';

interface ThemedViewProps extends ViewProps {
  readonly tone?: 'background' | 'surface' | 'surfaceMuted';
  readonly style?: ViewStyle | ViewStyle[];
}

export function ThemedView(props: ThemedViewProps): React.JSX.Element {
  const { tone = 'background', style, ...rest } = props;
  const { palette } = useTheme();
  const bg = palette[tone];
  const styles: ViewStyle[] = [{ backgroundColor: bg }];
  if (Array.isArray(style)) styles.push(...style);
  else if (style !== undefined) styles.push(style);
  return <View {...rest} style={styles} />;
}
