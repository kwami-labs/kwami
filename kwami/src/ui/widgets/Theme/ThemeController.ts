import { Component, ComponentProps } from '../../core/Component';
import { createButton } from '../../primitives/Button';
import { createSlider } from '../../primitives/Slider';
import { createColorPicker } from '../../primitives/ColorPicker';
import { getThemeProvider } from '../../theme/ThemeProvider';
import type { ThemeConfig, PartialThemeConfig } from '../../theme/types';

export interface ThemeControllerOptions extends ComponentProps {
    onClose?: () => void;
}

/**
 * ThemeController Widget
 * 
 * Standalone UI for managing global theme colors, gradients, and effects.
 */
export class ThemeController extends Component<ThemeControllerOptions> {
    private provider = getThemeProvider();

    constructor(props: ThemeControllerOptions) {
        super('div', { ...props, className: `kwami-theme-controller ${props.className || ''}` });
        this.render();
    }

    private render(): void {
        this.element.innerHTML = '';

        const currentTheme = this.provider.getTheme();

        // Header
        const header = document.createElement('div');
        header.className = 'kwami-theme-header';
        header.innerHTML = `
            <h3>Theme Controller</h3>
            <p>Customize your glassmorphic experience</p>
        `;
        this.element.appendChild(header);

        // Sections Container
        const sections = document.createElement('div');
        sections.className = 'kwami-theme-sections';

        // --- PRESETS SECTION ---
        const presetSection = this.createSection('Presets');
        const presetsGrid = document.createElement('div');
        presetsGrid.className = 'kwami-presets-grid';

        const themes = ['glass', 'dark-glass', 'opaque', 'solid', 'minimal'];
        themes.forEach(name => {
            const btn = createButton({
                label: name.charAt(0).toUpperCase() + name.slice(1).replace('-', ' '),
                variant: currentTheme.variant === name || (name === 'dark-glass' && currentTheme.mode === 'dark') ? 'primary' : 'secondary',
                size: 'sm',
                onClick: () => {
                    this.provider.selectTheme(name);
                    this.render(); // Re-render to update UI state
                }
            });
            presetsGrid.appendChild(btn.element);
        });
        presetSection.appendChild(presetsGrid);
        sections.appendChild(presetSection);

        // --- COLORS SECTION ---
        const colorSection = this.createSection('Colors');
        const colors = [
            { key: 'primary', label: 'Primary' },
            { key: 'secondary', label: 'Secondary' },
            { key: 'tertiary', label: 'Tertiary' }
        ];

        colors.forEach(({ key, label }) => {
            const picker = createColorPicker({
                label,
                value: (currentTheme.colors as any)[key],
                onChange: (val) => {
                    this.provider.updateTheme({
                        colors: { [key]: val, [`${key}Hover`]: val } // Simple hover sync for now
                    });
                }
            });
            colorSection.appendChild(picker.element);
        });
        sections.appendChild(colorSection);

        // --- EFFECTS SECTION ---
        const effectsSection = this.createSection('Glass Effects');

        const effects = [
            { key: 'blur', label: 'Backdrop Blur', min: 0, max: 40, unit: 'px' },
            { key: 'opacity', label: 'Main Opacity', min: 0, max: 1, step: 0.01 },
            { key: 'surfaceOpacity', label: 'Surface Opacity', min: 0, max: 1, step: 0.01 },
            { key: 'borderRadius', label: 'Corner Radius', min: 0, max: 40, unit: 'px' }
        ];

        effects.forEach(({ key, label, min, max, step, unit }) => {
            const slider = createSlider({
                label,
                min,
                max,
                step,
                unit,
                value: (currentTheme.effects as any)[key],
                onChange: (val) => {
                    this.provider.updateTheme({
                        effects: { [key]: val }
                    });
                }
            });
            effectsSection.appendChild(slider.element);
        });
        sections.appendChild(effectsSection);

        // --- GRADIENTS SECTION ---
        const gradientSection = this.createSection('Gradients');
        const gradientsGrid = document.createElement('div');
        gradientsGrid.className = 'kwami-gradients-grid';

        const gradientOptions = [
            { key: 'primary', label: 'Primary Gradient' },
            { key: 'secondary', label: 'Secondary' },
            { key: 'tertiary', label: 'Tertiary' }
        ];

        gradientOptions.forEach(({ key, label }) => {
            const btn = createButton({
                label,
                variant: 'secondary',
                size: 'sm',
                onClick: () => {
                    // This is a simple implementation, a real one might have a gradient builder
                    // For now, we just ensure the current gradient is visible/applied
                    console.log(`Setting active gradient: ${key}`);
                }
            });
            // Add a small preview circle
            const preview = document.createElement('div');
            preview.className = 'kwami-gradient-preview';
            preview.style.background = (currentTheme.gradients as any)[key];
            btn.element.prepend(preview);

            gradientsGrid.appendChild(btn.element);
        });
        gradientSection.appendChild(gradientsGrid);
        sections.appendChild(gradientSection);

        this.element.appendChild(sections);

        // Inject styles
        this.injectStyles();
    }

    private createSection(title: string): HTMLElement {
        const section = document.createElement('div');
        section.className = 'kwami-theme-section';
        const h4 = document.createElement('h4');
        h4.textContent = title;
        section.appendChild(h4);
        return section;
    }

    private injectStyles(): void {
        if (document.getElementById('kwami-theme-controller-styles')) return;

        const style = document.createElement('style');
        style.id = 'kwami-theme-controller-styles';
        style.textContent = `
            .kwami-theme-controller {
                width: 320px;
                padding: 24px;
                background: var(--kwami-color-surface);
                backdrop-filter: blur(var(--kwami-blur));
                border: var(--kwami-border-width) solid var(--kwami-color-border);
                border-radius: var(--kwami-radius-lg);
                box-shadow: var(--kwami-shadow);
                color: var(--kwami-color-text);
                display: flex;
                flex-direction: column;
                gap: 20px;
                max-height: 80vh;
                overflow-y: auto;
            }
            .kwami-theme-header h3 {
                margin: 0;
                font-size: 1.25rem;
                font-weight: 700;
            }
            .kwami-theme-header p {
                margin: 4px 0 0;
                font-size: 0.85rem;
                opacity: 0.7;
            }
            .kwami-theme-sections {
                display: flex;
                flex-direction: column;
                gap: 24px;
            }
            .kwami-theme-section h4 {
                margin: 0 0 12px;
                font-size: 0.9rem;
                text-transform: uppercase;
                letter-spacing: 0.05em;
                opacity: 0.5;
            }
            .kwami-presets-grid {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 8px;
            }
            .kwami-gradients-grid {
                display: flex;
                flex-direction: column;
                gap: 12px;
            }
            .kwami-gradient-preview {
                width: 16px;
                height: 16px;
                border-radius: 50%;
                margin-right: 8px;
                border: 1px solid rgba(255,255,255,0.2);
            }
        `;
        document.head.appendChild(style);
    }
}

/**
 * Factory function for ThemeController
 */
export function createThemeController(props: ThemeControllerOptions = {}): ThemeController {
    return new ThemeController(props);
}
