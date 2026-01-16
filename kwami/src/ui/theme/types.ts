/**
 * Theme Configuration Types
 * 
 * Comprehensive type system for runtime theme customization.
 * All visual properties can be configured by end users.
 */

export type ThemeVariant = 'glass' | 'opaque' | 'solid' | 'minimal' | 'custom';
export type ThemeMode = 'light' | 'dark' | 'auto';
export type ShadowSize = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

/**
 * Color tokens - semantic color system
 */
export interface ColorTokens {
  // Primary colors
  primary: string;
  primaryHover: string;
  secondary: string;
  secondaryHover: string;
  tertiary: string;
  tertiaryHover: string;

  // Surface colors
  surface: string;
  surfaceAlt: string;
  surfaceHover: string;

  // Border colors
  border: string;
  borderHover: string;
  borderFocus: string;

  // Text colors
  text: string;
  textMuted: string;
  textInverse: string;

  // Accent colors
  accent: string;
  accentHover: string;

  // Status colors
  success: string;
  successHover: string;
  warning: string;
  warningHover: string;
  error: string;
  errorHover: string;
  info: string;
  infoHover: string;

  // Background
  background: string;
  backgroundAlt: string;
}

/**
 * Effect tokens - visual effects like blur, glow, shadows
 */
export interface EffectTokens {
  // Blur effect (for glass morphism)
  blur: number;              // 0-40px
  blurSaturation: number;    // 100-200%

  // Opacity
  opacity: number;           // 0-1
  surfaceOpacity: number;    // 0-1

  // Borders
  borderRadius: number;      // px
  borderRadiusSmall: number; // px
  borderRadiusLarge: number; // px
  borderWidth: number;       // px

  // Shadows
  shadow: ShadowSize | string;
  shadowColor: string;

  // Glow effect
  glow: boolean;
  glowColor: string;
  glowIntensity: number;     // 0-1
  glowSpread: number;        // 0-100%
}

/**
 * Gradient tokens - predefined beautiful gradients
 */
export interface GradientTokens {
  primary: string;
  secondary: string;
  tertiary: string;
  surface: string;
  mesh?: string[];
}

/**
 * Spacing tokens - layout and spacing
 */
export interface SpacingTokens {
  // Component padding
  paddingXs: number;
  paddingSm: number;
  padding: number;
  paddingMd: number;
  paddingLg: number;
  paddingXl: number;

  // Component gaps
  gapXs: number;
  gapSm: number;
  gap: number;
  gapMd: number;
  gapLg: number;
  gapXl: number;

  // Input specific
  inputPadding: number;
  inputPaddingVertical: number;
  inputPaddingHorizontal: number;
}

/**
 * Typography tokens
 */
export interface TypographyTokens {
  fontFamily: string;
  fontFamilyMono: string;

  // Font sizes
  fontSizeXs: number;
  fontSizeSm: number;
  fontSize: number;
  fontSizeMd: number;
  fontSizeLg: number;
  fontSizeXl: number;
  fontSize2xl: number;

  // Font weights
  fontWeightNormal: number;
  fontWeightMedium: number;
  fontWeightSemibold: number;
  fontWeightBold: number;

  // Line heights
  lineHeightTight: number;
  lineHeight: number;
  lineHeightRelaxed: number;

  // Letter spacing
  letterSpacingTight: number;
  letterSpacing: number;
  letterSpacingWide: number;
}

/**
 * Animation tokens
 */
export interface AnimationTokens {
  duration: number;          // ms
  durationFast: number;      // ms
  durationSlow: number;      // ms

  easing: string;            // CSS easing function
  easingEnter: string;
  easingExit: string;
}

/**
 * Complete theme configuration
 */
export interface ThemeConfig {
  variant: ThemeVariant;
  mode: ThemeMode;

  colors: ColorTokens;
  gradients: GradientTokens;
  effects: EffectTokens;
  spacing: SpacingTokens;
  typography: TypographyTokens;
  animation: AnimationTokens;
}

/**
 * Partial theme config for user overrides
 */
export type PartialThemeConfig = {
  variant?: ThemeVariant;
  mode?: ThemeMode;
  colors?: Partial<ColorTokens>;
  gradients?: Partial<GradientTokens>;
  effects?: Partial<EffectTokens>;
  spacing?: Partial<SpacingTokens>;
  typography?: Partial<TypographyTokens>;
  animation?: Partial<AnimationTokens>;
};

/**
 * Theme change event
 */
export interface ThemeChangeEvent {
  previous: ThemeConfig;
  current: ThemeConfig;
}

/**
 * Theme change listener
 */
export type ThemeChangeListener = (event: ThemeChangeEvent) => void;
