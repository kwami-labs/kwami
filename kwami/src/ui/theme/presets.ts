import type { ThemeConfig } from './types';

/**
 * Glass Preset - Modern glassmorphism theme
 * 
 * Translucent surfaces with backdrop blur, glow effects,
 * and vibrant accent colors.
 */
export const glassPreset: ThemeConfig = {
  variant: 'glass',
  mode: 'auto',

  colors: {
    // Primary colors
    primary: '#7c3aed',
    primaryHover: '#a855f7',
    secondary: '#38bdf8',
    secondaryHover: '#7dd3fc',
    tertiary: '#f472b6',
    tertiaryHover: '#fb923c',

    // Surface colors (translucent for glass effect)
    surface: 'rgba(255, 255, 255, 0.9)',
    surfaceAlt: 'rgba(255, 255, 255, 0.82)',
    surfaceHover: 'rgba(255, 255, 255, 0.95)',

    // Border colors
    border: 'rgba(15, 23, 42, 0.12)',
    borderHover: 'rgba(15, 23, 42, 0.24)',
    borderFocus: 'rgba(124, 58, 237, 0.45)',

    // Text colors
    text: '#0f172a',
    textMuted: 'rgba(15, 23, 42, 0.62)',
    textInverse: '#ffffff',

    // Accent colors
    accent: '#7c3aed',
    accentHover: '#a855f7',

    // Status colors
    success: '#16a34a',
    successHover: '#22c55e',
    warning: '#ea580c',
    warningHover: '#f97316',
    error: '#dc2626',
    errorHover: '#ef4444',
    info: '#0284c7',
    infoHover: '#0ea5e9',

    // Background
    background: 'rgba(250, 250, 250, 0.98)',
    backgroundAlt: 'rgba(248, 250, 252, 0.95)',
  },

  gradients: {
    primary: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
    secondary: 'linear-gradient(135deg, #38bdf8 0%, #7dd3fc 100%)',
    tertiary: 'linear-gradient(135deg, #f472b6 0%, #fb923c 100%)',
    surface: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
  },

  effects: {
    // Blur for glass effect
    blur: 20,
    blurSaturation: 180,

    // Opacity
    opacity: 0.9,
    surfaceOpacity: 0.9,

    // Borders
    borderRadius: 20,
    borderRadiusSmall: 12,
    borderRadiusLarge: 28,
    borderWidth: 1,

    // Shadows
    shadow: 'lg',
    shadowColor: 'rgba(15, 23, 42, 0.16)',

    // Glow effect
    glow: true,
    glowColor: 'rgba(124, 58, 237, 0.2)',
    glowIntensity: 0.3,
    glowSpread: 55,
  },

  spacing: {
    paddingXs: 6,
    paddingSm: 10,
    padding: 16,
    paddingMd: 20,
    paddingLg: 24,
    paddingXl: 32,

    gapXs: 4,
    gapSm: 8,
    gap: 12,
    gapMd: 16,
    gapLg: 20,
    gapXl: 28,

    inputPadding: 12,
    inputPaddingVertical: 10,
    inputPaddingHorizontal: 14,
  },

  typography: {
    fontFamily: 'Inter, "SF Pro Display", system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
    fontFamilyMono: '"JetBrains Mono", "Fira Code", Consolas, monospace',

    fontSizeXs: 11,
    fontSizeSm: 13,
    fontSize: 14,
    fontSizeMd: 16,
    fontSizeLg: 18,
    fontSizeXl: 22,
    fontSize2xl: 28,

    fontWeightNormal: 400,
    fontWeightMedium: 500,
    fontWeightSemibold: 600,
    fontWeightBold: 700,

    lineHeightTight: 1.2,
    lineHeight: 1.5,
    lineHeightRelaxed: 1.75,

    letterSpacingTight: -0.01,
    letterSpacing: 0.01,
    letterSpacingWide: 0.08,
  },

  animation: {
    duration: 250,
    durationFast: 150,
    durationSlow: 400,

    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easingEnter: 'cubic-bezier(0, 0, 0.2, 1)',
    easingExit: 'cubic-bezier(0.4, 0, 1, 1)',
  },
};

/**
 * Opaque Preset - Solid, non-transparent theme
 * 
 * Full opacity surfaces with subtle hover effects.
 * Clean and professional appearance.
 */
export const opaquePreset: ThemeConfig = {
  variant: 'opaque',
  mode: 'auto',

  colors: {
    primary: '#6366f1',
    primaryHover: '#818cf8',
    secondary: '#06b6d4',
    secondaryHover: '#22d3ee',
    tertiary: '#ec4899',
    tertiaryHover: '#f472b6',

    surface: '#ffffff',
    surfaceAlt: '#f8fafc',
    surfaceHover: '#f1f5f9',

    border: '#e2e8f0',
    borderHover: '#cbd5e1',
    borderFocus: '#6366f1',

    text: '#0f172a',
    textMuted: '#64748b',
    textInverse: '#ffffff',

    accent: '#6366f1',
    accentHover: '#818cf8',

    success: '#10b981',
    successHover: '#34d399',
    warning: '#f59e0b',
    warningHover: '#fbbf24',
    error: '#ef4444',
    errorHover: '#f87171',
    info: '#3b82f6',
    infoHover: '#60a5fa',

    background: '#ffffff',
    backgroundAlt: '#f8fafc',
  },

  gradients: {
    primary: 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)',
    secondary: 'linear-gradient(135deg, #06b6d4 0%, #22d3ee 100%)',
    tertiary: 'linear-gradient(135deg, #ec4899 0%, #f472b6 100%)',
    surface: 'none',
  },

  effects: {
    blur: 0,              // No blur
    blurSaturation: 100,

    opacity: 1,
    surfaceOpacity: 1,

    borderRadius: 12,
    borderRadiusSmall: 8,
    borderRadiusLarge: 18,
    borderWidth: 1,

    shadow: 'md',
    shadowColor: 'rgba(0, 0, 0, 0.1)',

    glow: false,          // No glow
    glowColor: 'transparent',
    glowIntensity: 0,
    glowSpread: 0,
  },

  spacing: {
    paddingXs: 6,
    paddingSm: 10,
    padding: 16,
    paddingMd: 20,
    paddingLg: 24,
    paddingXl: 32,

    gapXs: 4,
    gapSm: 8,
    gap: 12,
    gapMd: 16,
    gapLg: 20,
    gapXl: 28,

    inputPadding: 12,
    inputPaddingVertical: 10,
    inputPaddingHorizontal: 14,
  },

  typography: {
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
    fontFamilyMono: 'Consolas, Monaco, monospace',

    fontSizeXs: 12,
    fontSizeSm: 13,
    fontSize: 14,
    fontSizeMd: 16,
    fontSizeLg: 18,
    fontSizeXl: 22,
    fontSize2xl: 28,

    fontWeightNormal: 400,
    fontWeightMedium: 500,
    fontWeightSemibold: 600,
    fontWeightBold: 700,

    lineHeightTight: 1.25,
    lineHeight: 1.5,
    lineHeightRelaxed: 1.75,

    letterSpacingTight: -0.01,
    letterSpacing: 0,
    letterSpacingWide: 0.025,
  },

  animation: {
    duration: 200,
    durationFast: 100,
    durationSlow: 350,

    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easingEnter: 'cubic-bezier(0, 0, 0.2, 1)',
    easingExit: 'cubic-bezier(0.4, 0, 1, 1)',
  },
};

/**
 * Solid Preset - Minimal shadows and effects
 * 
 * Flat design with bold borders and no shadows.
 * High contrast, accessibility-focused.
 */
export const solidPreset: ThemeConfig = {
  variant: 'solid',
  mode: 'auto',

  colors: {
    primary: '#2563eb',
    primaryHover: '#3b82f6',
    secondary: '#059669',
    secondaryHover: '#10b981',
    tertiary: '#d97706',
    tertiaryHover: '#f59e0b',

    surface: '#ffffff',
    surfaceAlt: '#f9fafb',
    surfaceHover: '#f3f4f6',

    border: '#d1d5db',
    borderHover: '#9ca3af',
    borderFocus: '#2563eb',

    text: '#111827',
    textMuted: '#6b7280',
    textInverse: '#ffffff',

    accent: '#2563eb',
    accentHover: '#3b82f6',

    success: '#059669',
    successHover: '#10b981',
    warning: '#d97706',
    warningHover: '#f59e0b',
    error: '#dc2626',
    errorHover: '#ef4444',
    info: '#0284c7',
    infoHover: '#0ea5e9',

    background: '#ffffff',
    backgroundAlt: '#f9fafb',
  },

  gradients: {
    primary: 'none',
    secondary: 'none',
    tertiary: 'none',
    surface: 'none',
  },

  effects: {
    blur: 0,
    blurSaturation: 100,

    opacity: 1,
    surfaceOpacity: 1,

    borderRadius: 8,
    borderRadiusSmall: 4,
    borderRadiusLarge: 12,
    borderWidth: 2,        // Thicker borders

    shadow: 'none',        // No shadows
    shadowColor: 'transparent',

    glow: false,
    glowColor: 'transparent',
    glowIntensity: 0,
    glowSpread: 0,
  },

  spacing: {
    paddingXs: 8,
    paddingSm: 12,
    padding: 16,
    paddingMd: 20,
    paddingLg: 24,
    paddingXl: 32,

    gapXs: 6,
    gapSm: 10,
    gap: 14,
    gapMd: 18,
    gapLg: 22,
    gapXl: 30,

    inputPadding: 14,
    inputPaddingVertical: 12,
    inputPaddingHorizontal: 16,
  },

  typography: {
    fontFamily: 'system-ui, -apple-system, sans-serif',
    fontFamilyMono: 'monospace',

    fontSizeXs: 12,
    fontSizeSm: 14,
    fontSize: 15,
    fontSizeMd: 17,
    fontSizeLg: 19,
    fontSizeXl: 24,
    fontSize2xl: 30,

    fontWeightNormal: 400,
    fontWeightMedium: 500,
    fontWeightSemibold: 600,
    fontWeightBold: 700,

    lineHeightTight: 1.3,
    lineHeight: 1.6,
    lineHeightRelaxed: 1.8,

    letterSpacingTight: 0,
    letterSpacing: 0,
    letterSpacingWide: 0.01,
  },

  animation: {
    duration: 180,
    durationFast: 100,
    durationSlow: 300,

    easing: 'ease-in-out',
    easingEnter: 'ease-out',
    easingExit: 'ease-in',
  },
};

/**
 * Minimal Preset - Ultra-clean, borderless design
 * 
 * Nearly invisible UI elements with focus on content.
 * Subtle interactions, maximum breathing room.
 */
export const minimalPreset: ThemeConfig = {
  variant: 'minimal',
  mode: 'auto',

  colors: {
    primary: '#18181b',
    primaryHover: '#27272a',
    secondary: '#52525b',
    secondaryHover: '#71717a',
    tertiary: '#27272a',
    tertiaryHover: '#3f3f46',

    surface: 'transparent',
    surfaceAlt: 'rgba(0, 0, 0, 0.02)',
    surfaceHover: 'rgba(0, 0, 0, 0.04)',

    border: 'rgba(0, 0, 0, 0.06)',
    borderHover: 'rgba(0, 0, 0, 0.12)',
    borderFocus: 'rgba(0, 0, 0, 0.24)',

    text: '#09090b',
    textMuted: '#71717a',
    textInverse: '#ffffff',

    accent: '#18181b',
    accentHover: '#27272a',

    success: '#16a34a',
    successHover: '#22c55e',
    warning: '#ea580c',
    warningHover: '#f97316',
    error: '#dc2626',
    errorHover: '#ef4444',
    info: '#0284c7',
    infoHover: '#0ea5e9',

    background: '#ffffff',
    backgroundAlt: '#fafafa',
  },

  gradients: {
    primary: 'none',
    secondary: 'none',
    tertiary: 'none',
    surface: 'none',
  },

  effects: {
    blur: 0,
    blurSaturation: 100,

    opacity: 1,
    surfaceOpacity: 0,     // Fully transparent

    borderRadius: 6,
    borderRadiusSmall: 4,
    borderRadiusLarge: 10,
    borderWidth: 0,        // No borders by default

    shadow: 'none',
    shadowColor: 'transparent',

    glow: false,
    glowColor: 'transparent',
    glowIntensity: 0,
    glowSpread: 0,
  },

  spacing: {
    paddingXs: 4,
    paddingSm: 8,
    padding: 12,
    paddingMd: 16,
    paddingLg: 20,
    paddingXl: 28,

    gapXs: 4,
    gapSm: 6,
    gap: 10,
    gapMd: 14,
    gapLg: 18,
    gapXl: 24,

    inputPadding: 10,
    inputPaddingVertical: 8,
    inputPaddingHorizontal: 12,
  },

  typography: {
    fontFamily: 'system-ui, -apple-system, sans-serif',
    fontFamilyMono: 'monospace',

    fontSizeXs: 12,
    fontSizeSm: 13,
    fontSize: 14,
    fontSizeMd: 16,
    fontSizeLg: 18,
    fontSizeXl: 22,
    fontSize2xl: 28,

    fontWeightNormal: 400,
    fontWeightMedium: 450,
    fontWeightSemibold: 550,
    fontWeightBold: 650,

    lineHeightTight: 1.3,
    lineHeight: 1.6,
    lineHeightRelaxed: 1.8,

    letterSpacingTight: -0.02,
    letterSpacing: -0.01,
    letterSpacingWide: 0,
  },

  animation: {
    duration: 160,
    durationFast: 80,
    durationSlow: 280,

    easing: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
    easingEnter: 'cubic-bezier(0, 0, 0.2, 1)',
    easingExit: 'cubic-bezier(0.4, 0, 1, 1)',
  },
};

/**
 * Dark Glass Preset - Dark mode glassmorphism
 */
export const darkGlassPreset: ThemeConfig = {
  ...glassPreset,
  mode: 'dark',

  colors: {
    primary: '#8b5cf6',
    primaryHover: '#a78bfa',
    secondary: '#38bdf8',
    secondaryHover: '#7dd3fc',
    tertiary: '#f472b6',
    tertiaryHover: '#fb923c',

    surface: 'rgba(15, 18, 35, 0.78)',
    surfaceAlt: 'rgba(26, 32, 56, 0.65)',
    surfaceHover: 'rgba(15, 18, 35, 0.88)',

    border: 'rgba(148, 163, 184, 0.2)',
    borderHover: 'rgba(148, 163, 184, 0.35)',
    borderFocus: 'rgba(56, 189, 248, 0.45)',

    text: '#f8fafc',
    textMuted: 'rgba(226, 232, 240, 0.7)',
    textInverse: '#0f172a',

    accent: '#38bdf8',
    accentHover: '#7dd3fc',

    success: '#22c55e',
    successHover: '#4ade80',
    warning: '#f97316',
    warningHover: '#fb923c',
    error: '#ef4444',
    errorHover: '#f87171',
    info: '#0ea5e9',
    infoHover: '#38bdf8',

    background: 'rgba(3, 7, 18, 0.98)',
    backgroundAlt: 'rgba(15, 23, 42, 0.95)',
  },

  gradients: {
    primary: 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)',
    secondary: 'linear-gradient(135deg, #38bdf8 0%, #7dd3fc 100%)',
    tertiary: 'linear-gradient(135deg, #f472b6 0%, #fb923c 100%)',
    surface: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
  },

  effects: {
    ...glassPreset.effects,
    shadow: 'xl',
    shadowColor: 'rgba(0, 0, 0, 0.55)',
    glowColor: 'rgba(56, 189, 248, 0.25)',
  },
};

/**
 * Get a preset by name
 */
export function getPreset(name: 'glass' | 'opaque' | 'solid' | 'minimal' | 'dark-glass'): ThemeConfig {
  const presets = {
    glass: glassPreset,
    opaque: opaquePreset,
    solid: solidPreset,
    minimal: minimalPreset,
    'dark-glass': darkGlassPreset,
  };

  return presets[name];
}

/**
 * List all available presets
 */
export function listPresets(): Array<{ name: string; description: string; config: ThemeConfig }> {
  return [
    {
      name: 'glass',
      description: 'Modern glassmorphism with translucent surfaces and glow effects',
      config: glassPreset,
    },
    {
      name: 'opaque',
      description: 'Solid, non-transparent surfaces with subtle hover effects',
      config: opaquePreset,
    },
    {
      name: 'solid',
      description: 'Flat design with bold borders and no shadows',
      config: solidPreset,
    },
    {
      name: 'minimal',
      description: 'Ultra-clean, borderless design with focus on content',
      config: minimalPreset,
    },
    {
      name: 'dark-glass',
      description: 'Dark mode glassmorphism with vibrant accents',
      config: darkGlassPreset,
    },
  ];
}
