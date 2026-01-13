import type { ThemeConfig, PartialThemeConfig, ThemeChangeListener } from './types';
import { ThemeEngine, getThemeEngine } from './ThemeEngine';
import { glassPreset } from './presets';

/**
 * ThemeProvider
 * 
 * Manages theme state, persistence, and reactivity.
 * Single source of truth for the application's theme.
 */
export class ThemeProvider {
  private engine: ThemeEngine;
  private currentTheme: ThemeConfig;
  private listeners: Set<ThemeChangeListener> = new Set();
  private storageKey: string;

  constructor(options: {
    initial?: ThemeConfig | PartialThemeConfig;
    storageKey?: string;
    autoLoad?: boolean;
  } = {}) {
    this.engine = getThemeEngine();
    this.storageKey = options.storageKey ?? 'kwami-theme';
    
    // Load from storage or use initial/default
    if (options.autoLoad !== false) {
      const stored = this.loadFromStorage();
      this.currentTheme = stored ?? (options.initial 
        ? this.mergeWithDefault(options.initial)
        : glassPreset);
    } else {
      this.currentTheme = options.initial 
        ? this.mergeWithDefault(options.initial)
        : glassPreset;
    }
    
    // Apply the theme
    this.engine.apply(this.currentTheme);
  }

  /**
   * Get the current theme configuration
   */
  getTheme(): ThemeConfig {
    return { ...this.currentTheme };
  }

  /**
   * Set a new theme (full or partial)
   */
  setTheme(theme: ThemeConfig | PartialThemeConfig, persist = true): void {
    const previous = this.currentTheme;
    
    // Merge with current if partial
    const newTheme = this.isFullThemeConfig(theme)
      ? theme
      : this.mergeWithDefault(theme);
    
    this.currentTheme = newTheme;
    this.engine.apply(newTheme);
    
    if (persist) {
      this.saveToStorage(newTheme);
    }
    
    // Notify listeners
    this.notifyListeners({ previous, current: newTheme });
  }

  /**
   * Update specific theme properties
   */
  updateTheme(partial: PartialThemeConfig, persist = true): void {
    const previous = this.currentTheme;
    
    const newTheme: ThemeConfig = {
      variant: partial.variant ?? this.currentTheme.variant,
      mode: partial.mode ?? this.currentTheme.mode,
      colors: { ...this.currentTheme.colors, ...(partial.colors ?? {}) },
      effects: { ...this.currentTheme.effects, ...(partial.effects ?? {}) },
      spacing: { ...this.currentTheme.spacing, ...(partial.spacing ?? {}) },
      typography: { ...this.currentTheme.typography, ...(partial.typography ?? {}) },
      animation: { ...this.currentTheme.animation, ...(partial.animation ?? {}) },
    };
    
    this.currentTheme = newTheme;
    this.engine.apply(newTheme);
    
    if (persist) {
      this.saveToStorage(newTheme);
    }
    
    this.notifyListeners({ previous, current: newTheme });
  }

  /**
   * Reset to default theme
   */
  reset(defaultTheme: ThemeConfig = glassPreset, persist = true): void {
    this.setTheme(defaultTheme, persist);
  }

  /**
   * Subscribe to theme changes
   */
  subscribe(listener: ThemeChangeListener): () => void {
    this.listeners.add(listener);
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Save theme to localStorage
   */
  private saveToStorage(theme: ThemeConfig): void {
    if (typeof window === 'undefined' || !window.localStorage) {
      return;
    }
    
    try {
      window.localStorage.setItem(this.storageKey, JSON.stringify(theme));
    } catch (error) {
      console.warn('Failed to save theme to localStorage:', error);
    }
  }

  /**
   * Load theme from localStorage
   */
  private loadFromStorage(): ThemeConfig | null {
    if (typeof window === 'undefined' || !window.localStorage) {
      return null;
    }
    
    try {
      const stored = window.localStorage.getItem(this.storageKey);
      if (!stored) return null;
      
      const parsed = JSON.parse(stored);
      
      // Validate that it's a valid theme config
      if (this.isFullThemeConfig(parsed)) {
        return parsed;
      }
      
      return null;
    } catch (error) {
      console.warn('Failed to load theme from localStorage:', error);
      return null;
    }
  }

  /**
   * Clear theme from localStorage
   */
  clearStorage(): void {
    if (typeof window === 'undefined' || !window.localStorage) {
      return;
    }
    
    try {
      window.localStorage.removeItem(this.storageKey);
    } catch (error) {
      console.warn('Failed to clear theme from localStorage:', error);
    }
  }

  /**
   * Export theme as JSON
   */
  exportTheme(): string {
    return JSON.stringify(this.currentTheme, null, 2);
  }

  /**
   * Import theme from JSON
   */
  importTheme(json: string, persist = true): boolean {
    try {
      const parsed = JSON.parse(json);
      
      if (this.isFullThemeConfig(parsed)) {
        this.setTheme(parsed, persist);
        return true;
      }
      
      console.error('Invalid theme config in JSON');
      return false;
    } catch (error) {
      console.error('Failed to parse theme JSON:', error);
      return false;
    }
  }

  /**
   * Notify all listeners of theme change
   */
  private notifyListeners(event: { previous: ThemeConfig; current: ThemeConfig }): void {
    this.listeners.forEach((listener) => {
      try {
        listener(event);
      } catch (error) {
        console.error('Error in theme change listener:', error);
      }
    });
  }

  /**
   * Merge partial config with default theme
   */
  private mergeWithDefault(partial: PartialThemeConfig): ThemeConfig {
    const base = glassPreset;
    
    return {
      variant: partial.variant ?? base.variant,
      mode: partial.mode ?? base.mode,
      colors: { ...base.colors, ...(partial.colors ?? {}) },
      effects: { ...base.effects, ...(partial.effects ?? {}) },
      spacing: { ...base.spacing, ...(partial.spacing ?? {}) },
      typography: { ...base.typography, ...(partial.typography ?? {}) },
      animation: { ...base.animation, ...(partial.animation ?? {}) },
    };
  }

  /**
   * Type guard to check if config is a full ThemeConfig
   */
  private isFullThemeConfig(config: any): config is ThemeConfig {
    return (
      config &&
      typeof config === 'object' &&
      'variant' in config &&
      'mode' in config &&
      'colors' in config &&
      'effects' in config &&
      'spacing' in config &&
      'typography' in config &&
      'animation' in config
    );
  }

  /**
   * Destroy the provider and clean up
   */
  destroy(): void {
    this.listeners.clear();
  }
}

/**
 * Global theme provider instance
 */
let globalThemeProvider: ThemeProvider | null = null;

/**
 * Get or create the global theme provider
 */
export function getThemeProvider(options?: {
  initial?: ThemeConfig | PartialThemeConfig;
  storageKey?: string;
  autoLoad?: boolean;
}): ThemeProvider {
  if (!globalThemeProvider) {
    globalThemeProvider = new ThemeProvider(options);
  }
  return globalThemeProvider;
}

/**
 * Initialize the global theme provider with options
 */
export function initializeTheme(options?: {
  initial?: ThemeConfig | PartialThemeConfig;
  storageKey?: string;
  autoLoad?: boolean;
}): ThemeProvider {
  if (globalThemeProvider) {
    globalThemeProvider.destroy();
  }
  globalThemeProvider = new ThemeProvider(options);
  return globalThemeProvider;
}

/**
 * Convenience function to set the global theme
 */
export function setTheme(theme: ThemeConfig | PartialThemeConfig, persist = true): void {
  getThemeProvider().setTheme(theme, persist);
}

/**
 * Convenience function to update theme properties
 */
export function updateTheme(partial: PartialThemeConfig, persist = true): void {
  getThemeProvider().updateTheme(partial, persist);
}

/**
 * Convenience function to get the current theme
 */
export function getCurrentTheme(): ThemeConfig {
  return getThemeProvider().getTheme();
}

/**
 * Convenience function to subscribe to theme changes
 */
export function onThemeChange(listener: ThemeChangeListener): () => void {
  return getThemeProvider().subscribe(listener);
}
