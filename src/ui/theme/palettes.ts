import type { BackdropTintMap, Palette } from './types';

export const LIGHT_PALETTE: Palette = Object.freeze({
  background: '#F7F6F3',
  surface: '#FFFFFF',
  surfaceMuted: '#EFEDE7',
  text: '#1A1A1A',
  textMuted: '#6B6B6B',
  accent: '#FF7A45',
  border: '#E2DFD8',
  placeholder: '#D6D3CC',
});

export const DARK_PALETTE: Palette = Object.freeze({
  background: '#0F0F10',
  surface: '#1A1A1C',
  surfaceMuted: '#2A2A2D',
  text: '#F2F2F2',
  textMuted: '#9A9A9E',
  accent: '#FF8C5A',
  border: '#2E2E32',
  placeholder: '#3A3A3D',
});

// BackgroundKey → translucent color overlay applied above the palette
// background. Pet sprite reads through; UI chrome uses the base palette.
export const LIGHT_BACKDROP_TINTS: BackdropTintMap = Object.freeze({
  sunny: 'rgba(255, 220, 140, 0.18)',
  rain: 'rgba(120, 150, 180, 0.20)',
  night: 'rgba(30, 40, 70, 0.22)',
  dawn: 'rgba(255, 180, 150, 0.18)',
  dusk: 'rgba(220, 140, 180, 0.18)',
  snow: 'rgba(220, 230, 240, 0.30)',
  cny: 'rgba(220, 60, 60, 0.22)',
});

export const DARK_BACKDROP_TINTS: BackdropTintMap = Object.freeze({
  sunny: 'rgba(255, 200, 100, 0.10)',
  rain: 'rgba(80, 100, 130, 0.18)',
  night: 'rgba(20, 25, 50, 0.30)',
  dawn: 'rgba(255, 150, 120, 0.12)',
  dusk: 'rgba(180, 100, 140, 0.15)',
  snow: 'rgba(150, 170, 200, 0.18)',
  cny: 'rgba(200, 50, 50, 0.25)',
});
