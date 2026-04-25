import { createContext, useMemo, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';

import type { BackgroundKey } from '../../core/visual/types';
import { useSettingsStore } from '../store/settings-store';
import { DARK_BACKDROP_TINTS, DARK_PALETTE, LIGHT_BACKDROP_TINTS, LIGHT_PALETTE } from './palettes';
import type { ResolvedScheme, Theme } from './types';

const DEFAULT_THEME: Theme = {
  mode: 'auto',
  scheme: 'light',
  palette: LIGHT_PALETTE,
  backdropTintFor: () => LIGHT_BACKDROP_TINTS.sunny,
};

export const ThemeContext = createContext<Theme>(DEFAULT_THEME);

interface ThemeProviderProps {
  readonly children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps): React.JSX.Element {
  const mode = useSettingsStore((s) => s.theme);
  const systemScheme = useColorScheme();

  const theme = useMemo<Theme>(() => {
    const scheme: ResolvedScheme =
      mode === 'auto' ? (systemScheme === 'dark' ? 'dark' : 'light') : mode;
    const palette = scheme === 'dark' ? DARK_PALETTE : LIGHT_PALETTE;
    const tints = scheme === 'dark' ? DARK_BACKDROP_TINTS : LIGHT_BACKDROP_TINTS;
    return {
      mode,
      scheme,
      palette,
      backdropTintFor: (bg: BackgroundKey) => tints[bg],
    };
  }, [mode, systemScheme]);

  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}
