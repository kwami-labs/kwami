import type { PartialThemeConfig } from '../theme/types';

/**
 * Base Component Class
 * 
 * Provides a standard lifecycle and DOM management for UI components.
 * Replaces ad-hoc factory functions and disparate class implementations.
 */

export interface ComponentProps {
    className?: string;
    theme?: PartialThemeConfig;
    [key: string]: any;
}

export abstract class Component<TProps extends ComponentProps = ComponentProps> {
    protected element: HTMLElement;
    protected props: TProps;
    protected mounted: boolean = false;

    constructor(tagName: string = 'div', props: TProps) {
        this.props = props;
        this.element = document.createElement(tagName);
        if (props.className) {
            this.element.className = props.className;
        }

        // Apply theme overrides if present
        if (props.theme) {
            this.applyThemeOverrides(props.theme);
        }
    }

    /**
     * Apply local theme overrides as CSS variables on the component element
     */
    private applyThemeOverrides(theme: PartialThemeConfig): void {
        const root = this.element;

        if (theme.colors) {
            Object.entries(theme.colors).forEach(([key, val]) => {
                const varName = `--kwami-color-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
                root.style.setProperty(varName, val as string);
            });
        }

        if (theme.gradients) {
            Object.entries(theme.gradients).forEach(([key, val]) => {
                const varName = `--kwami-gradient-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
                root.style.setProperty(varName, val as string);
            });
        }

        if (theme.effects) {
            // Mapping for effects to match ThemeEngine's variable names
            const effectMap: Record<string, string> = {
                blur: '--kwami-blur',
                blurSaturation: '--kwami-blur-saturation',
                opacity: '--kwami-opacity',
                surfaceOpacity: '--kwami-surface-opacity',
                borderRadius: '--kwami-radius',
                borderRadiusSmall: '--kwami-radius-sm',
                borderRadiusLarge: '--kwami-radius-lg',
                borderWidth: '--kwami-border-width',
                shadowColor: '--kwami-shadow-color',
                glowColor: '--kwami-glow-color',
                glowIntensity: '--kwami-glow-intensity',
                glowSpread: '--kwami-glow-spread'
            };

            Object.entries(theme.effects).forEach(([key, val]) => {
                const varName = effectMap[key];
                if (varName) {
                    const suffix = (key.includes('blur') || key.includes('Radius') || key === 'borderWidth') ? 'px' :
                        (key === 'blurSaturation' || key === 'glowSpread') ? '%' : '';
                    root.style.setProperty(varName, `${val}${suffix}`);
                }
            });
        }
    }

    /**
     * Return the root DOM element
     */
    public getElement(): HTMLElement {
        return this.element;
    }

    /**
     * Mount the component to a parent element
     */
    public mount(parent: HTMLElement): void {
        if (this.mounted) return;
        parent.appendChild(this.element);
        this.mounted = true;
        this.onMount();
    }

    /**
     * Remove from DOM and cleanup
     */
    public destroy(): void {
        if (this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
        this.mounted = false;
        this.onDestroy();
    }

    /**
     * Update properties and re-render if necessary
     */
    public update(newProps: Partial<TProps>): void {
        this.props = { ...this.props, ...newProps };
        this.onUpdate();
    }

    /**
     * Lifecycle hook: Called after mounting
     */
    protected onMount(): void { }

    /**
     * Lifecycle hook: Called after props update
     */
    protected onUpdate(): void { }

    /**
     * Lifecycle hook: Called before destruction
     */
    protected onDestroy(): void { }

    /**
     * Utility: Safe set text content (skips if unchanged)
     */
    protected setText(node: Node, text: string): void {
        if (node.textContent !== text) {
            node.textContent = text;
        }
    }

    /**
     * Utility: Set multiple attributes
     */
    protected setAttributes(el: HTMLElement, attrs: Record<string, string | boolean | undefined>): void {
        Object.entries(attrs).forEach(([key, val]) => {
            if (val === undefined || val === false) {
                el.removeAttribute(key);
            } else if (val === true) {
                el.setAttribute(key, '');
            } else {
                el.setAttribute(key, String(val));
            }
        });
    }
}
