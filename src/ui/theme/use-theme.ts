import { useContext } from 'react';

import { ThemeContext } from './theme-provider';
import type { Theme } from './types';

export function useTheme(): Theme {
  return useContext(ThemeContext);
}
