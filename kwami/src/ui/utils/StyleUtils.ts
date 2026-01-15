/**
 * StyleUtils
 * 
 * Utilities for evaluating and injecting CSS styles safely and efficiently.
 */

const injectedStyles = new Set<string>();

/**
 * Inject global styles into the document head using a given ID.
 * If a style tag with the ID already exists, it will be updated (or ignored if content matches).
 */
export function injectGlobalStyles(id: string, css: string): void {
    if (typeof document === 'undefined') return;

    // Avoid unnecessary DOM ops if we've already tracked this injection
    // Note: We intentionally don't track content in the Set for ID-based styles
    // to allow updates, but we could optimize this further.

    let style = document.getElementById(id) as HTMLStyleElement;

    if (!style) {
        style = document.createElement('style');
        style.id = id;
        document.head.appendChild(style);
    }

    if (style.textContent !== css) {
        style.textContent = css;
    }
}

/**
 * Inject a component's styles once.
 * Uses a simple hash of the CSS content to prevent duplication.
 */
export function injectComponentStyles(componentName: string, css: string): void {
    const key = `${componentName}:${css}`;
    if (injectedStyles.has(key)) return;

    injectGlobalStyles(`kwami-style-${componentName}`, css);
    injectedStyles.add(key);
}

/**
 * Remove styles by ID
 */
export function removeStyles(id: string): void {
    const style = document.getElementById(id);
    if (style?.parentNode) {
        style.parentNode.removeChild(style);
    }
}
