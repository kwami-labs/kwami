import type { ThemeConfig, ShadowSize, ThemeVariant } from './types';

/**
 * ThemeEngine
 * 
 * Generates and injects CSS variables from theme configuration.
 * Supports runtime theme switching and variant-specific styling.
 */
export class ThemeEngine {
  private styleElement: HTMLStyleElement | null = null;
  private currentConfig: ThemeConfig | null = null;

  /**
   * Apply a theme configuration
   */
  apply(config: ThemeConfig): void {
    if (typeof document === 'undefined') {
      console.warn('ThemeEngine.apply() called in non-browser environment');
      return;
    }

    this.currentConfig = config;

    if (!this.styleElement) {
      this.styleElement = document.createElement('style');
      this.styleElement.id = 'kwami-theme';
      document.head.appendChild(this.styleElement);
    }

    const cssVars = this.generateCSSVariables(config);
    const variantStyles = this.generateVariantStyles(config.variant, config);
    const componentStyles = this.generateComponentStyles();

    this.styleElement.textContent = `
      :root {
        ${cssVars}
      }
      
      ${variantStyles}
      ${componentStyles}
    `;
  }

  /**
   * Get current theme configuration
   */
  getCurrent(): ThemeConfig | null {
    return this.currentConfig;
  }

  /**
   * Remove theme styles
   */
  destroy(): void {
    if (this.styleElement?.parentElement) {
      this.styleElement.parentElement.removeChild(this.styleElement);
    }
    this.styleElement = null;
    this.currentConfig = null;
  }

  /**
   * Generate CSS custom properties from theme config
   */
  private generateCSSVariables(config: ThemeConfig): string {
    const { colors, effects, spacing, typography, animation } = config;

    return `
      /* Colors */
      --kwami-color-primary: ${colors.primary};
      --kwami-color-primary-hover: ${colors.primaryHover};
      --kwami-color-secondary: ${colors.secondary};
      --kwami-color-secondary-hover: ${colors.secondaryHover};
      
      --kwami-color-surface: ${colors.surface};
      --kwami-color-surface-alt: ${colors.surfaceAlt};
      --kwami-color-surface-hover: ${colors.surfaceHover};
      
      --kwami-color-border: ${colors.border};
      --kwami-color-border-hover: ${colors.borderHover};
      --kwami-color-border-focus: ${colors.borderFocus};
      
      --kwami-color-text: ${colors.text};
      --kwami-color-text-muted: ${colors.textMuted};
      --kwami-color-text-inverse: ${colors.textInverse};
      
      --kwami-color-accent: ${colors.accent};
      --kwami-color-accent-hover: ${colors.accentHover};
      
      --kwami-color-success: ${colors.success};
      --kwami-color-success-hover: ${colors.successHover};
      --kwami-color-warning: ${colors.warning};
      --kwami-color-warning-hover: ${colors.warningHover};
      --kwami-color-error: ${colors.error};
      --kwami-color-error-hover: ${colors.errorHover};
      --kwami-color-info: ${colors.info};
      --kwami-color-info-hover: ${colors.infoHover};
      
      --kwami-color-background: ${colors.background};
      --kwami-color-background-alt: ${colors.backgroundAlt};
      
      /* Effects */
      --kwami-blur: ${effects.blur}px;
      --kwami-blur-saturation: ${effects.blurSaturation}%;
      --kwami-opacity: ${effects.opacity};
      --kwami-surface-opacity: ${effects.surfaceOpacity};
      
      --kwami-radius: ${effects.borderRadius}px;
      --kwami-radius-sm: ${effects.borderRadiusSmall}px;
      --kwami-radius-lg: ${effects.borderRadiusLarge}px;
      --kwami-border-width: ${effects.borderWidth}px;
      
      --kwami-shadow: ${this.resolveShadow(effects.shadow, effects.shadowColor)};
      --kwami-shadow-color: ${effects.shadowColor};
      
      --kwami-glow-enabled: ${effects.glow ? '1' : '0'};
      --kwami-glow-color: ${effects.glowColor};
      --kwami-glow-intensity: ${effects.glowIntensity};
      --kwami-glow-spread: ${effects.glowSpread}%;
      
      /* Spacing */
      --kwami-padding-xs: ${spacing.paddingXs}px;
      --kwami-padding-sm: ${spacing.paddingSm}px;
      --kwami-padding: ${spacing.padding}px;
      --kwami-padding-md: ${spacing.paddingMd}px;
      --kwami-padding-lg: ${spacing.paddingLg}px;
      --kwami-padding-xl: ${spacing.paddingXl}px;
      
      --kwami-gap-xs: ${spacing.gapXs}px;
      --kwami-gap-sm: ${spacing.gapSm}px;
      --kwami-gap: ${spacing.gap}px;
      --kwami-gap-md: ${spacing.gapMd}px;
      --kwami-gap-lg: ${spacing.gapLg}px;
      --kwami-gap-xl: ${spacing.gapXl}px;
      
      --kwami-input-padding: ${spacing.inputPadding}px;
      --kwami-input-padding-vertical: ${spacing.inputPaddingVertical}px;
      --kwami-input-padding-horizontal: ${spacing.inputPaddingHorizontal}px;
      
      /* Typography */
      --kwami-font-family: ${typography.fontFamily};
      --kwami-font-family-mono: ${typography.fontFamilyMono};
      
      --kwami-font-size-xs: ${typography.fontSizeXs}px;
      --kwami-font-size-sm: ${typography.fontSizeSm}px;
      --kwami-font-size: ${typography.fontSize}px;
      --kwami-font-size-md: ${typography.fontSizeMd}px;
      --kwami-font-size-lg: ${typography.fontSizeLg}px;
      --kwami-font-size-xl: ${typography.fontSizeXl}px;
      --kwami-font-size-2xl: ${typography.fontSize2xl}px;
      
      --kwami-font-weight-normal: ${typography.fontWeightNormal};
      --kwami-font-weight-medium: ${typography.fontWeightMedium};
      --kwami-font-weight-semibold: ${typography.fontWeightSemibold};
      --kwami-font-weight-bold: ${typography.fontWeightBold};
      
      --kwami-line-height-tight: ${typography.lineHeightTight};
      --kwami-line-height: ${typography.lineHeight};
      --kwami-line-height-relaxed: ${typography.lineHeightRelaxed};
      
      --kwami-letter-spacing-tight: ${typography.letterSpacingTight}em;
      --kwami-letter-spacing: ${typography.letterSpacing}em;
      --kwami-letter-spacing-wide: ${typography.letterSpacingWide}em;
      
      /* Animation */
      --kwami-duration: ${animation.duration}ms;
      --kwami-duration-fast: ${animation.durationFast}ms;
      --kwami-duration-slow: ${animation.durationSlow}ms;
      
      --kwami-easing: ${animation.easing};
      --kwami-easing-enter: ${animation.easingEnter};
      --kwami-easing-exit: ${animation.easingExit};
    `;
  }

  /**
   * Generate variant-specific styles
   */
  private generateVariantStyles(variant: ThemeVariant, config: ThemeConfig): string {
    const baseStyles = `
      .kwami-surface {
        position: relative;
        border-radius: var(--kwami-radius);
        border: var(--kwami-border-width) solid var(--kwami-color-border);
        box-shadow: var(--kwami-shadow);
        color: var(--kwami-color-text);
        transition: background var(--kwami-duration) var(--kwami-easing),
                    border var(--kwami-duration) var(--kwami-easing),
                    transform var(--kwami-duration) var(--kwami-easing),
                    box-shadow var(--kwami-duration) var(--kwami-easing);
      }
    `;

    switch (variant) {
      case 'glass':
        return `
          ${baseStyles}
          
          .kwami-surface {
            background: color-mix(in srgb, var(--kwami-color-surface) calc(var(--kwami-surface-opacity) * 100%), transparent);
            backdrop-filter: blur(var(--kwami-blur)) saturate(var(--kwami-blur-saturation));
            -webkit-backdrop-filter: blur(var(--kwami-blur)) saturate(var(--kwami-blur-saturation));
          }
          
          .kwami-surface::after {
            content: '';
            position: absolute;
            inset: 0;
            border-radius: inherit;
            pointer-events: none;
            opacity: 0;
            background: radial-gradient(
              circle at 20% 20%,
              color-mix(in srgb, var(--kwami-glow-color) calc(var(--kwami-glow-intensity) * 100%), transparent),
              transparent var(--kwami-glow-spread)
            );
            transition: opacity var(--kwami-duration) var(--kwami-easing);
            z-index: 0;
          }
          
          .kwami-surface:hover::after {
            opacity: var(--kwami-glow-enabled);
          }
          
          .kwami-surface > * {
            position: relative;
            z-index: 1;
          }
        `;

      case 'opaque':
        return `
          ${baseStyles}
          
          .kwami-surface {
            background: var(--kwami-color-surface);
            backdrop-filter: none;
          }
          
          .kwami-surface:hover {
            background: var(--kwami-color-surface-hover);
          }
        `;

      case 'solid':
        return `
          ${baseStyles}
          
          .kwami-surface {
            background: var(--kwami-color-surface);
            backdrop-filter: none;
            box-shadow: none;
          }
          
          .kwami-surface:hover {
            border-color: var(--kwami-color-border-hover);
          }
        `;

      case 'minimal':
        return `
          ${baseStyles}
          
          .kwami-surface {
            background: transparent;
            backdrop-filter: none;
            box-shadow: none;
            border: none;
          }
          
          .kwami-surface:hover {
            background: color-mix(in srgb, var(--kwami-color-border) 20%, transparent);
          }
        `;

      case 'custom':
      default:
        return baseStyles;
    }
  }

  /**
   * Generate base component styles
   */
  /**
   * Generate base component styles
   * @deprecated logic moved to individual components
   */
  private generateComponentStyles(): string {
    return '';
  }

  /**
   * Resolve shadow size to CSS shadow value
   */
  private resolveShadow(shadow: ShadowSize | string, color: string): string {
    // If it's a custom string, return as-is
    if (!['none', 'xs', 'sm', 'md', 'lg', 'xl', '2xl'].includes(shadow)) {
      return shadow;
    }

    const shadowSize = shadow as ShadowSize;

    const shadowMap: Record<ShadowSize, string> = {
      none: 'none',
      xs: `0 1px 2px ${color}`,
      sm: `0 2px 8px ${color}`,
      md: `0 8px 24px ${color}`,
      lg: `0 16px 48px ${color}`,
      xl: `0 24px 64px ${color}`,
      '2xl': `0 32px 96px ${color}`,
    };

    return shadowMap[shadowSize];
  }
}

/**
 * Global theme engine instance
 */
let globalThemeEngine: ThemeEngine | null = null;

/**
 * Get or create the global theme engine instance
 */
export function getThemeEngine(): ThemeEngine {
  if (!globalThemeEngine) {
    globalThemeEngine = new ThemeEngine();
  }
  return globalThemeEngine;
}
