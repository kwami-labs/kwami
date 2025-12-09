/**
 * Kwami Playground v1.5.8
 * 
 * Main entry point with all new features:
 * - TypeScript support
 * - State machine for blob states  
 * - Plugin system
 * - Performance profiler
 * - Component library
 * - E2E and unit tests
 */

// ============================================================================
// CORE EXPORTS
// ============================================================================

export { getBlobStateMachine, resetBlobStateMachine, BlobStateMachineService } from './core/blob-state-machine';
export type { BlobState, BlobContext, BlobEvent } from './core/blob-state-machine';

export { getPluginManager, resetPluginManager, PluginManager, performanceMonitorPlugin, autoSavePlugin } from './core/plugin-system';
export type { Plugin, PluginMetadata, PluginHooks, PluginAPI } from './core/plugin-system';

export { getPerformanceProfiler, getPerformanceHUD, resetPerformanceProfiler, PerformanceProfiler, PerformanceHUD } from './core/performance-profiler';
export type { PerformanceMetrics, PerformanceReport, MemoryMetrics, GPUMetrics } from './core/performance-profiler';

export * from './core/state-manager';
export * from './core/config';

// ============================================================================
// COMPONENT EXPORTS
// ============================================================================

export { Component, Button, Slider, Select, Modal, Tabs, Card, Toggle, Components } from './components/index';
export type { ButtonProps, SliderProps, SelectProps, ModalProps, TabsProps, CardProps, ToggleProps } from './components/index';

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type * from './types/index';

// ============================================================================
// VERSION
// ============================================================================

export const VERSION = '1.5.10';

// ============================================================================
// INITIALIZE ALL SYSTEMS
// ============================================================================

export async function initializePlayground(config?: {
  enableStateMachine?: boolean;
  enablePlugins?: boolean;
  enablePerformanceProfiler?: boolean;
  showPerformanceHUD?: boolean;
}) {
  console.log(`[Kwami Playground] Initializing v${VERSION}...`);

  const options = {
    enableStateMachine: true,
    enablePlugins: true,
    enablePerformanceProfiler: true,
    showPerformanceHUD: false,
    ...config
  };

  // Initialize State Machine
  if (options.enableStateMachine) {
    const stateMachine = getBlobStateMachine();
    console.log('[Kwami Playground] State Machine initialized');
  }

  // Initialize Plugin System
  if (options.enablePlugins) {
    const pluginManager = getPluginManager();
    await pluginManager.initialize();
    console.log('[Kwami Playground] Plugin System initialized');
  }

  // Initialize Performance Profiler
  if (options.enablePerformanceProfiler) {
    const profiler = getPerformanceProfiler();
    // Will be initialized with renderer later
    
    if (options.showPerformanceHUD) {
      const hud = getPerformanceHUD();
      hud.show();
    }
    
    console.log('[Kwami Playground] Performance Profiler initialized');
  }

  console.log(`[Kwami Playground] ✅ Fully initialized v${VERSION}`);
}

// ============================================================================
// GLOBAL API
// ============================================================================

if (typeof window !== 'undefined') {
  (window as any).__KWAMI_PLAYGROUND__ = {
    version: VERSION,
    getBlobStateMachine,
    getPluginManager,
    getPerformanceProfiler,
    getPerformanceHUD,
    initializePlayground
  };
}

