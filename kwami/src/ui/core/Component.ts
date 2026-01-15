/**
 * Base Component Class
 * 
 * Provides a standard lifecycle and DOM management for UI components.
 * Replaces ad-hoc factory functions and disparate class implementations.
 */

export interface ComponentProps {
    className?: string;
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
