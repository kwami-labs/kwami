import { resolveGlassTheme } from '../../../legacy/theme';
import type { BaseGlassProps } from '../../../legacy/types';
import { createSlider } from '../../../primitives/Slider';
import { createColorPicker } from '../../../primitives/ColorPicker';
import { getCurrentTheme, updateTheme } from '../../../theme/ThemeProvider';
import type { PartialThemeConfig } from '../../../theme/types';

export interface ThemeSectionOptions extends BaseGlassProps {
  kwami?: any;
}

export class ThemeSection {
  private container: HTMLDivElement;
  private controls: Map<string, any> = new Map();

  constructor(private options: ThemeSectionOptions = {}) {
    this.container = this.createContainer();
    this.render();
  }

  private createContainer(): HTMLDivElement {
    const container = document.createElement('div');
    container.className = 'kwami-console-theme-section';
    Object.assign(container.style, {
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
      padding: '20px',
      overflowY: 'auto',
      height: '100%',
    });
    return container;
  }

  private createSection(title: string, description?: string): HTMLDivElement {
    const theme = resolveGlassTheme(this.options.theme?.mode ?? 'auto', this.options.theme);
    
    const section = document.createElement('div');
    section.className = 'theme-section kwami-surface';
    Object.assign(section.style, {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--kwami-gap-sm, 12px)',
      padding: 'var(--kwami-padding, 16px)',
      background: 'var(--kwami-color-surface-alt, rgba(255, 255, 255, 0.03))',
      border: 'var(--kwami-border-width, 1px) solid var(--kwami-color-border, rgba(148, 163, 184, 0.2))',
      borderRadius: 'var(--kwami-radius-sm, 12px)',
    });

    const header = document.createElement('div');
    Object.assign(header.style, {
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
      marginBottom: '8px',
    });

    const titleEl = document.createElement('h3');
    titleEl.textContent = title;
    Object.assign(titleEl.style, {
      margin: '0',
      fontSize: 'var(--kwami-font-size, 13px)',
      fontWeight: 'var(--kwami-font-weight-semibold, 600)',
      color: 'var(--kwami-color-text, #f8fafc)',
      letterSpacing: '0.02em',
    });

    header.appendChild(titleEl);

    if (description) {
      const descEl = document.createElement('p');
      descEl.textContent = description;
      Object.assign(descEl.style, {
        margin: '0',
        fontSize: 'var(--kwami-font-size-xs, 11px)',
        color: 'var(--kwami-color-text-muted, rgba(226, 232, 240, 0.7))',
        lineHeight: 'var(--kwami-line-height, 1.5)',
      });
      header.appendChild(descEl);
    }

    section.appendChild(header);
    return section;
  }

  private render(): void {
    const currentTheme = getCurrentTheme();

    // Colors Section
    const colorsSection = this.createSection(
      'Colors',
      'Customize the color palette for all UI elements'
    );

    const primaryColor = createColorPicker({
      label: 'Primary Color',
      value: currentTheme.colors.primary,
      onChange: (color) => {
        updateTheme({ colors: { primary: color } });
      },
    });
    this.controls.set('primaryColor', primaryColor);
    colorsSection.appendChild(primaryColor.element);

    const accentColor = createColorPicker({
      label: 'Accent Color',
      value: currentTheme.colors.accent,
      onChange: (color) => {
        updateTheme({ colors: { accent: color } });
      },
    });
    this.controls.set('accentColor', accentColor);
    colorsSection.appendChild(accentColor.element);

    const surfaceColor = createColorPicker({
      label: 'Surface Color',
      value: currentTheme.colors.surface,
      onChange: (color) => {
        updateTheme({ colors: { surface: color } });
      },
    });
    this.controls.set('surfaceColor', surfaceColor);
    colorsSection.appendChild(surfaceColor.element);

    const textColor = createColorPicker({
      label: 'Text Color',
      value: currentTheme.colors.text,
      onChange: (color) => {
        updateTheme({ colors: { text: color } });
      },
    });
    this.controls.set('textColor', textColor);
    colorsSection.appendChild(textColor.element);

    this.container.appendChild(colorsSection);

    // Effects Section
    const effectsSection = this.createSection(
      'Effects',
      'Control blur, opacity, borders, and other visual effects'
    );

    const blurSlider = createSlider({
      label: 'Blur Intensity',
      min: 0,
      max: 40,
      step: 1,
      value: currentTheme.effects.blur,
      unit: 'px',
      onChange: (value) => {
        updateTheme({ effects: { blur: value } });
      },
    });
    this.controls.set('blur', blurSlider);
    effectsSection.appendChild(blurSlider.element);

    const opacitySlider = createSlider({
      label: 'Surface Opacity',
      min: 0,
      max: 1,
      step: 0.01,
      value: currentTheme.effects.surfaceOpacity,
      formatValue: (v) => (v * 100).toFixed(0) + '%',
      onChange: (value) => {
        updateTheme({ effects: { surfaceOpacity: value } });
      },
    });
    this.controls.set('opacity', opacitySlider);
    effectsSection.appendChild(opacitySlider.element);

    const borderRadiusSlider = createSlider({
      label: 'Border Radius',
      min: 0,
      max: 32,
      step: 1,
      value: currentTheme.effects.borderRadius,
      unit: 'px',
      onChange: (value) => {
        updateTheme({ effects: { borderRadius: value } });
      },
    });
    this.controls.set('borderRadius', borderRadiusSlider);
    effectsSection.appendChild(borderRadiusSlider.element);

    const borderWidthSlider = createSlider({
      label: 'Border Width',
      min: 0,
      max: 4,
      step: 0.5,
      value: currentTheme.effects.borderWidth,
      unit: 'px',
      onChange: (value) => {
        updateTheme({ effects: { borderWidth: value } });
      },
    });
    this.controls.set('borderWidth', borderWidthSlider);
    effectsSection.appendChild(borderWidthSlider.element);

    this.container.appendChild(effectsSection);

    // Spacing Section
    const spacingSection = this.createSection(
      'Spacing',
      'Adjust padding and gap values for UI elements'
    );

    const paddingSlider = createSlider({
      label: 'Default Padding',
      min: 4,
      max: 32,
      step: 2,
      value: currentTheme.spacing.padding,
      unit: 'px',
      onChange: (value) => {
        updateTheme({ spacing: { padding: value } });
      },
    });
    this.controls.set('padding', paddingSlider);
    spacingSection.appendChild(paddingSlider.element);

    const gapSlider = createSlider({
      label: 'Default Gap',
      min: 4,
      max: 24,
      step: 2,
      value: currentTheme.spacing.gap,
      unit: 'px',
      onChange: (value) => {
        updateTheme({ spacing: { gap: value } });
      },
    });
    this.controls.set('gap', gapSlider);
    spacingSection.appendChild(gapSlider.element);

    this.container.appendChild(spacingSection);

    // Typography Section
    const typographySection = this.createSection(
      'Typography',
      'Customize font sizes and text properties'
    );

    const fontSizeSlider = createSlider({
      label: 'Base Font Size',
      min: 12,
      max: 18,
      step: 1,
      value: currentTheme.typography.fontSize,
      unit: 'px',
      onChange: (value) => {
        updateTheme({ typography: { fontSize: value } });
      },
    });
    this.controls.set('fontSize', fontSizeSlider);
    typographySection.appendChild(fontSizeSlider.element);

    const fontWeightSlider = createSlider({
      label: 'Font Weight',
      min: 300,
      max: 700,
      step: 100,
      value: currentTheme.typography.fontWeightNormal,
      onChange: (value) => {
        updateTheme({ typography: { fontWeightNormal: value } });
      },
    });
    this.controls.set('fontWeight', fontWeightSlider);
    typographySection.appendChild(fontWeightSlider.element);

    this.container.appendChild(typographySection);

    // Animation Section
    const animationSection = this.createSection(
      'Animation',
      'Control transition speeds and easing'
    );

    const durationSlider = createSlider({
      label: 'Transition Duration',
      min: 100,
      max: 1000,
      step: 50,
      value: currentTheme.animation.duration,
      unit: 'ms',
      onChange: (value) => {
        updateTheme({ animation: { duration: value } });
      },
    });
    this.controls.set('duration', durationSlider);
    animationSection.appendChild(durationSlider.element);

    this.container.appendChild(animationSection);

    // Action buttons
    const actionsSection = this.createActionsSection();
    this.container.appendChild(actionsSection);
  }

  private createActionsSection(): HTMLDivElement {
    const theme = resolveGlassTheme(this.options.theme?.mode ?? 'auto', this.options.theme);
    
    const section = document.createElement('div');
    Object.assign(section.style, {
      display: 'flex',
      gap: 'var(--kwami-gap-sm, 12px)',
      padding: 'var(--kwami-padding, 16px)',
      borderTop: 'var(--kwami-border-width, 1px) solid var(--kwami-color-border, rgba(148, 163, 184, 0.2))',
      background: 'var(--kwami-color-background, rgba(0, 0, 0, 0.2))',
      position: 'sticky',
      bottom: '0',
      marginTop: 'auto',
    });

    const resetButton = document.createElement('button');
    resetButton.textContent = 'Reset to Default';
    resetButton.className = 'kwami-button';
    Object.assign(resetButton.style, {
      flex: '1',
      padding: 'var(--kwami-padding-sm, 10px) var(--kwami-padding, 16px)',
      background: 'var(--kwami-color-surface, rgba(255, 255, 255, 0.08))',
      border: 'var(--kwami-border-width, 1px) solid var(--kwami-color-border, rgba(148, 163, 184, 0.2))',
      borderRadius: 'var(--kwami-radius-sm, 8px)',
      color: 'var(--kwami-color-text, #f8fafc)',
      fontSize: 'var(--kwami-font-size-xs, 12px)',
      fontWeight: 'var(--kwami-font-weight-semibold, 600)',
      cursor: 'pointer',
      transition: 'all var(--kwami-duration-fast, 150ms) var(--kwami-easing, ease)',
    });

    resetButton.addEventListener('mouseenter', () => {
      resetButton.style.background = 'rgba(255, 255, 255, 0.12)';
      resetButton.style.transform = 'translateY(-1px)';
    });

    resetButton.addEventListener('mouseleave', () => {
      resetButton.style.background = 'rgba(255, 255, 255, 0.08)';
      resetButton.style.transform = 'translateY(0)';
    });

    resetButton.addEventListener('click', () => {
      // Reset to default theme
      updateTheme({
        variant: 'glass',
        mode: 'dark',
      });
      
      // Update all controls to reflect the reset values
      const currentTheme = getCurrentTheme();
      
      // Update color pickers
      this.controls.get('primaryColor')?.setValue(currentTheme.colors.primary);
      this.controls.get('accentColor')?.setValue(currentTheme.colors.accent);
      this.controls.get('surfaceColor')?.setValue(currentTheme.colors.surface);
      this.controls.get('textColor')?.setValue(currentTheme.colors.text);
      
      // Update sliders
      this.controls.get('blur')?.setValue(currentTheme.effects.blur);
      this.controls.get('opacity')?.setValue(currentTheme.effects.surfaceOpacity);
      this.controls.get('borderRadius')?.setValue(currentTheme.effects.borderRadius);
      this.controls.get('borderWidth')?.setValue(currentTheme.effects.borderWidth);
      this.controls.get('padding')?.setValue(currentTheme.spacing.padding);
      this.controls.get('gap')?.setValue(currentTheme.spacing.gap);
      this.controls.get('fontSize')?.setValue(currentTheme.typography.fontSize);
      this.controls.get('fontWeight')?.setValue(currentTheme.typography.fontWeightNormal);
      this.controls.get('duration')?.setValue(currentTheme.animation.duration);
    });

    section.appendChild(resetButton);
    return section;
  }

  getElement(): HTMLDivElement {
    return this.container;
  }

  dispose(): void {
    this.controls.forEach(control => control.destroy?.());
    this.controls.clear();
    this.container.remove();
  }
}
