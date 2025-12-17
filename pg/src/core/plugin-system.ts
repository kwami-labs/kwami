/**
 * Plugin System
 * 
 * Extensible plugin architecture for Kwami Playground
 * Allows developers to create custom features and behaviors
 */

// ============================================================================
// PLUGIN TYPES
// ============================================================================

export interface PluginMetadata {
  name: string;
  version: string;
  author: string;
  description: string;
  dependencies?: string[];
  tags?: string[];
}

export interface PluginHooks {
  onInit?: () => void | Promise<void>;
  onDestroy?: () => void | Promise<void>;
  onBlobStateChange?: (state: string) => void;
  onAudioUpdate?: (audioData: Float32Array) => void;
  onParameterChange?: (paramName: string, value: any) => void;
  onBeforeRender?: (delta: number) => void;
  onAfterRender?: (delta: number) => void;
  onUserInteraction?: (event: Event) => void;
  onConfigExport?: (config: any) => any;
  onConfigImport?: (config: any) => any;
}

export interface PluginAPI {
  // Core API
  kwami: any;
  getBlob: () => any;
  getMind: () => any;
  getAudio: () => any;
  
  // State Management
  getState: (key: string) => any;
  setState: (key: string, value: any) => void;
  observeState: (key: string, callback: (value: any) => void) => () => void;
  
  // UI Helpers
  showMessage: (message: string, type?: 'info' | 'success' | 'error' | 'warning') => void;
  createUI: (html: string, target?: HTMLElement) => HTMLElement;
  
  // Event System
  on: (event: string, callback: Function) => () => void;
  emit: (event: string, data?: any) => void;
  
  // Performance
  measurePerformance: (name: string, fn: () => void) => void;
  getPerformanceMetrics: () => any;
}

export interface Plugin {
  metadata: PluginMetadata;
  hooks?: PluginHooks;
  install: (api: PluginAPI) => void | Promise<void>;
  uninstall?: () => void | Promise<void>;
}

// ============================================================================
// PLUGIN MANAGER
// ============================================================================

export class PluginManager {
  private plugins: Map<string, Plugin>;
  private pluginInstances: Map<string, any>;
  private eventListeners: Map<string, Set<Function>>;
  private api: PluginAPI;
  private initialized: boolean;

  constructor() {
    this.plugins = new Map();
    this.pluginInstances = new Map();
    this.eventListeners = new Map();
    this.initialized = false;
    this.api = this.createPluginAPI();
  }

  /**
   * Initialize plugin system
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      console.warn('[Plugin Manager] Already initialized');
      return;
    }

    console.log('[Plugin Manager] Initializing...');
    this.initialized = true;

    // Auto-load plugins from localStorage
    await this.loadSavedPlugins();

    console.log('[Plugin Manager] Initialized');
  }

  /**
   * Register a plugin
   */
  async register(plugin: Plugin): Promise<void> {
    const { name, version } = plugin.metadata;

    if (this.plugins.has(name)) {
      throw new Error(`Plugin "${name}" is already registered`);
    }

    // Check dependencies
    if (plugin.metadata.dependencies) {
      for (const dep of plugin.metadata.dependencies) {
        if (!this.plugins.has(dep)) {
          throw new Error(`Plugin "${name}" requires dependency "${dep}"`);
        }
      }
    }

    console.log(`[Plugin Manager] Registering plugin: ${name} v${version}`);
    this.plugins.set(name, plugin);

    // Auto-install if system is initialized
    if (this.initialized) {
      await this.install(name);
    }
  }

  /**
   * Unregister a plugin
   */
  async unregister(pluginName: string): Promise<void> {
    if (!this.plugins.has(pluginName)) {
      throw new Error(`Plugin "${pluginName}" is not registered`);
    }

    // Uninstall first
    if (this.pluginInstances.has(pluginName)) {
      await this.uninstall(pluginName);
    }

    console.log(`[Plugin Manager] Unregistering plugin: ${pluginName}`);
    this.plugins.delete(pluginName);
  }

  /**
   * Install a plugin
   */
  async install(pluginName: string): Promise<void> {
    const plugin = this.plugins.get(pluginName);
    if (!plugin) {
      throw new Error(`Plugin "${pluginName}" is not registered`);
    }

    if (this.pluginInstances.has(pluginName)) {
      console.warn(`[Plugin Manager] Plugin "${pluginName}" is already installed`);
      return;
    }

    console.log(`[Plugin Manager] Installing plugin: ${pluginName}`);

    try {
      // Call plugin install method
      await plugin.install(this.api);

      // Call onInit hook
      if (plugin.hooks?.onInit) {
        await plugin.hooks.onInit();
      }

      // Store instance
      this.pluginInstances.set(pluginName, plugin);

      // Save to localStorage
      this.saveInstalledPlugins();

      this.emit('plugin:installed', { name: pluginName });
      console.log(`[Plugin Manager] Plugin "${pluginName}" installed successfully`);
    } catch (error) {
      console.error(`[Plugin Manager] Failed to install plugin "${pluginName}":`, error);
      throw error;
    }
  }

  /**
   * Uninstall a plugin
   */
  async uninstall(pluginName: string): Promise<void> {
    const plugin = this.pluginInstances.get(pluginName);
    if (!plugin) {
      console.warn(`[Plugin Manager] Plugin "${pluginName}" is not installed`);
      return;
    }

    console.log(`[Plugin Manager] Uninstalling plugin: ${pluginName}`);

    try {
      // Call onDestroy hook
      if (plugin.hooks?.onDestroy) {
        await plugin.hooks.onDestroy();
      }

      // Call plugin uninstall method
      if (plugin.uninstall) {
        await plugin.uninstall();
      }

      // Remove instance
      this.pluginInstances.delete(pluginName);

      // Save to localStorage
      this.saveInstalledPlugins();

      this.emit('plugin:uninstalled', { name: pluginName });
      console.log(`[Plugin Manager] Plugin "${pluginName}" uninstalled successfully`);
    } catch (error) {
      console.error(`[Plugin Manager] Failed to uninstall plugin "${pluginName}":`, error);
      throw error;
    }
  }

  /**
   * Get installed plugins
   */
  getInstalled(): string[] {
    return Array.from(this.pluginInstances.keys());
  }

  /**
   * Get available plugins
   */
  getAvailable(): PluginMetadata[] {
    return Array.from(this.plugins.values()).map(p => p.metadata);
  }

  /**
   * Check if plugin is installed
   */
  isInstalled(pluginName: string): boolean {
    return this.pluginInstances.has(pluginName);
  }

  /**
   * Get plugin metadata
   */
  getMetadata(pluginName: string): PluginMetadata | undefined {
    return this.plugins.get(pluginName)?.metadata;
  }

  /**
   * Trigger hook across all plugins
   */
  async triggerHook(hookName: keyof PluginHooks, ...args: any[]): Promise<void> {
    for (const [name, plugin] of this.pluginInstances) {
      const hook = plugin.hooks?.[hookName];
      if (hook) {
        try {
          await hook(...args);
        } catch (error) {
          console.error(`[Plugin Manager] Error in ${name}.${hookName}:`, error);
        }
      }
    }
  }

  /**
   * Event system - emit event
   */
  emit(event: string, data?: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`[Plugin Manager] Error in event listener for "${event}":`, error);
        }
      });
    }
  }

  /**
   * Event system - listen to event
   */
  on(event: string, callback: Function): () => void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(callback);

    // Return unsubscribe function
    return () => {
      const listeners = this.eventListeners.get(event);
      if (listeners) {
        listeners.delete(callback);
      }
    };
  }

  /**
   * Create Plugin API
   */
  private createPluginAPI(): PluginAPI {
    const self = this;

    return {
      // Core API
      get kwami() {
        return typeof window !== 'undefined' ? window.kwami : null;
      },
      
      getBlob() {
        return this.kwami?.body;
      },
      
      getMind() {
        return this.kwami?.mind;
      },
      
      getAudio() {
        return this.kwami?.body?.audio;
      },

      // State Management
      getState(key: string) {
        if (typeof window !== 'undefined' && window.localStorage) {
          const value = localStorage.getItem(`plugin:${key}`);
          return value ? JSON.parse(value) : null;
        }
        return null;
      },

      setState(key: string, value: any) {
        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.setItem(`plugin:${key}`, JSON.stringify(value));
        }
      },

      observeState(key: string, callback: (value: any) => void) {
        const storageHandler = (e: StorageEvent) => {
          if (e.key === `plugin:${key}`) {
            callback(e.newValue ? JSON.parse(e.newValue) : null);
          }
        };

        if (typeof window !== 'undefined') {
          window.addEventListener('storage', storageHandler);
        }

        return () => {
          if (typeof window !== 'undefined') {
            window.removeEventListener('storage', storageHandler);
          }
        };
      },

      // UI Helpers
      showMessage(message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info') {
        if (typeof window !== 'undefined') {
          const statusEl = document.getElementById('status');
          if (statusEl) {
            statusEl.textContent = message;
            statusEl.className = `message ${type}`;
            setTimeout(() => {
              statusEl.textContent = '';
              statusEl.className = 'message';
            }, 5000);
          }
        }
      },

      createUI(html: string, target?: HTMLElement) {
        const container = document.createElement('div');
        container.innerHTML = html;
        const element = container.firstElementChild as HTMLElement;

        if (target) {
          target.appendChild(element);
        }

        return element;
      },

      // Event System
      on(event: string, callback: Function) {
        return self.on(event, callback);
      },

      emit(event: string, data?: any) {
        self.emit(event, data);
      },

      // Performance
      measurePerformance(name: string, fn: () => void) {
        if (typeof window !== 'undefined' && window.performance) {
          const start = performance.now();
          fn();
          const end = performance.now();
          console.log(`[Performance] ${name}: ${(end - start).toFixed(2)}ms`);
        } else {
          fn();
        }
      },

      getPerformanceMetrics() {
        if (typeof window !== 'undefined' && window.performance) {
          return {
            memory: (performance as any).memory,
            navigation: performance.navigation,
            timing: performance.timing
          };
        }
        return null;
      }
    };
  }

  /**
   * Save installed plugins to localStorage
   */
  private saveInstalledPlugins(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      const installed = this.getInstalled();
      localStorage.setItem('kwami:installedPlugins', JSON.stringify(installed));
    }
  }

  /**
   * Load saved plugins from localStorage
   */
  private async loadSavedPlugins(): Promise<void> {
    if (typeof window !== 'undefined' && window.localStorage) {
      const saved = localStorage.getItem('kwami:installedPlugins');
      if (saved) {
        try {
          const plugins = JSON.parse(saved);
          for (const pluginName of plugins) {
            if (this.plugins.has(pluginName) && !this.pluginInstances.has(pluginName)) {
              await this.install(pluginName);
            }
          }
        } catch (error) {
          console.error('[Plugin Manager] Failed to load saved plugins:', error);
        }
      }
    }
  }

  /**
   * Cleanup and destroy plugin manager
   */
  async destroy(): Promise<void> {
    console.log('[Plugin Manager] Destroying...');

    // Uninstall all plugins
    for (const pluginName of this.getInstalled()) {
      await this.uninstall(pluginName);
    }

    // Clear all event listeners
    this.eventListeners.clear();

    this.initialized = false;
    console.log('[Plugin Manager] Destroyed');
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

let pluginManagerInstance: PluginManager | null = null;

export function getPluginManager(): PluginManager {
  if (!pluginManagerInstance) {
    pluginManagerInstance = new PluginManager();
  }
  return pluginManagerInstance;
}

export function resetPluginManager(): void {
  if (pluginManagerInstance) {
    pluginManagerInstance.destroy();
    pluginManagerInstance = null;
  }
}

// ============================================================================
// EXAMPLE PLUGINS
// ============================================================================

/**
 * Example: Performance Monitor Plugin
 */
export const performanceMonitorPlugin: Plugin = {
  metadata: {
    name: 'performance-monitor',
    version: '1.5.12',
    author: 'Kwami Team',
    description: 'Monitors and displays performance metrics',
    tags: ['performance', 'monitoring', 'debug']
  },
  
  hooks: {
    onInit() {
      console.log('[Performance Monitor] Initialized');
    },
    
    onBeforeRender(delta: number) {
      // Track frame time
      if (typeof window !== 'undefined' && (window as any).__perfMonitor) {
        (window as any).__perfMonitor.frameStart = performance.now();
      }
    },
    
    onAfterRender(delta: number) {
      // Calculate frame time
      if (typeof window !== 'undefined' && (window as any).__perfMonitor) {
        const frameTime = performance.now() - (window as any).__perfMonitor.frameStart;
        (window as any).__perfMonitor.frameTimes.push(frameTime);
        
        // Keep only last 60 frames
        if ((window as any).__perfMonitor.frameTimes.length > 60) {
          (window as any).__perfMonitor.frameTimes.shift();
        }
      }
    }
  },
  
  install(api: PluginAPI) {
    // Setup performance monitor
    if (typeof window !== 'undefined') {
      (window as any).__perfMonitor = {
        frameStart: 0,
        frameTimes: []
      };
      
      api.showMessage('Performance Monitor Plugin Installed', 'success');
    }
  },
  
  uninstall() {
    if (typeof window !== 'undefined') {
      delete (window as any).__perfMonitor;
    }
  }
};

/**
 * Example: Auto-Save Plugin
 */
export const autoSavePlugin: Plugin = {
  metadata: {
    name: 'auto-save',
    version: '1.5.12',
    author: 'Kwami Team',
    description: 'Automatically saves configuration every 5 minutes',
    tags: ['utility', 'backup']
  },
  
  hooks: {
    onInit() {
      console.log('[Auto-Save] Initialized');
    }
  },
  
  install(api: PluginAPI) {
    let intervalId: NodeJS.Timeout;
    
    intervalId = setInterval(() => {
      // Auto-save configuration
      const config = {
        timestamp: new Date().toISOString(),
        blob: api.getBlob()?.getParams?.()
      };
      
      api.setState('autoSave:lastBackup', config);
      console.log('[Auto-Save] Configuration backed up');
    }, 5 * 60 * 1000); // Every 5 minutes
    
    // Store interval ID for cleanup
    api.setState('autoSave:intervalId', intervalId);
    
    api.showMessage('Auto-Save Plugin Installed - Backing up every 5min', 'success');
  },
  
  async uninstall() {
    // Note: api is not available in uninstall, so we'll access state directly
    if (typeof window !== 'undefined' && window.localStorage) {
      const intervalIdStr = localStorage.getItem('plugin:autoSave:intervalId');
      if (intervalIdStr) {
        const intervalId = JSON.parse(intervalIdStr);
        clearInterval(intervalId);
        localStorage.removeItem('plugin:autoSave:intervalId');
      }
    }
  }
};


