import type { GlassMode, GlassTheme } from './types';

const lightTheme: GlassTheme = {
  mode: 'light',
  palette: {
    // Whiter / cleaner light mode
    surface: 'rgba(255, 255, 255, 0.90)',
    surfaceSecondary: 'rgba(255, 255, 255, 0.82)',
    outline: 'rgba(15, 23, 42, 0.09)',
    text: '#0f172a',
    muted: 'rgba(15, 23, 42, 0.62)',
    accent: '#7c3aed',
    accentHover: '#a855f7',
    glow: 'rgba(124, 58, 237, 0.2)',
  },
  shadows: {
    soft: '0 25px 60px rgba(15, 23, 42, 0.16)',
    hard: '0 30px 80px rgba(15, 23, 42, 0.22)',
  },
};

const darkTheme: GlassTheme = {
  mode: 'dark',
  palette: {
    surface: 'rgba(15, 18, 35, 0.78)',
    surfaceSecondary: 'rgba(26, 32, 56, 0.65)',
    outline: 'rgba(148, 163, 184, 0.2)',
    text: '#f8fafc',
    muted: 'rgba(226, 232, 240, 0.7)',
    accent: '#38bdf8',
    accentHover: '#7dd3fc',
    glow: 'rgba(56, 189, 248, 0.25)',
  },
  shadows: {
    soft: '0 25px 70px rgba(6, 8, 20, 0.55)',
    hard: '0 35px 95px rgba(6, 8, 20, 0.75)',
  },
};

export function resolveGlassTheme(
  mode: GlassMode = 'auto',
  overrides?: Partial<GlassTheme>,
): GlassTheme {
  let resolvedMode: 'light' | 'dark';

  if (mode === 'auto' && typeof window !== 'undefined' && window.matchMedia) {
    resolvedMode = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  } else if (mode === 'auto') {
    resolvedMode = 'light';
  } else {
    resolvedMode = mode;
  }

  const base = resolvedMode === 'dark' ? darkTheme : lightTheme;

  if (!overrides) return base;

  return {
    mode: overrides.mode ?? base.mode,
    palette: { ...base.palette, ...(overrides.palette ?? {}) },
    shadows: { ...base.shadows, ...(overrides.shadows ?? {}) },
  };
}

export { lightTheme as defaultLightTheme, darkTheme as defaultDarkTheme };

