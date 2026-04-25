import type { BackgroundKey } from '../../core/visual/types';

export type ThemeMode = 'light' | 'dark' | 'auto';

export type ResolvedScheme = 'light' | 'dark';

export interface Palette {
  readonly background: string;
  readonly surface: string;
  readonly surfaceMuted: string;
  readonly text: string;
  readonly textMuted: string;
  readonly accent: string;
  readonly border: string;
  readonly placeholder: string;
}

export type BackdropTintMap = Readonly<Record<BackgroundKey, string>>;

export interface Theme {
  readonly mode: ThemeMode;
  readonly scheme: ResolvedScheme;
  readonly palette: Palette;
  readonly backdropTintFor: (bg: BackgroundKey) => string;
}
