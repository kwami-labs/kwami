/**
 * Kwami Theme System
 * 
 * Runtime theme customization with CSS variables.
 * Everything is configurable by end users.
 */

// Types
export type {
  ThemeConfig,
  PartialThemeConfig,
  ThemeVariant,
  ThemeMode,
  ShadowSize,
  ColorTokens,
  EffectTokens,
  SpacingTokens,
  TypographyTokens,
  AnimationTokens,
  ThemeChangeEvent,
  ThemeChangeListener,
} from './types';

// Theme Engine
export { ThemeEngine, getThemeEngine } from './ThemeEngine';

// Theme Provider
export {
  ThemeProvider,
  getThemeProvider,
  initializeTheme,
  setTheme,
  updateTheme,
  getCurrentTheme,
  onThemeChange,
} from './ThemeProvider';

// Presets
export {
  glassPreset,
  opaquePreset,
  solidPreset,
  minimalPreset,
  darkGlassPreset,
  getPreset,
  listPresets,
} from './presets';
