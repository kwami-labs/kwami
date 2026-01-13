export type GlassMode = 'light' | 'dark' | 'auto';

/**
 * Base palette tokens used across all glass components.
 */
export interface GlassPalette {
  surface: string;
  surfaceSecondary: string;
  outline: string;
  text: string;
  muted: string;
  accent: string;
  accentHover: string;
  glow: string;
}

export interface GlassTheme {
  mode: 'light' | 'dark';
  palette: GlassPalette;
  shadows: {
    soft: string;
    hard: string;
  };
}

export interface GlassAppearanceOverrides {
  borderRadius?: string;
  borderWidth?: string;
  padding?: string;
  gap?: string;
  blur?: string;
  transitionDuration?: string;
}

export interface BaseGlassProps {
  theme?: Partial<GlassTheme>;
  appearance?: GlassAppearanceOverrides;
  className?: string;
}

export type GlassContent = string | Node | Node[] | (() => Node | Node[]);

