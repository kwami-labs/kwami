/**
 * Kwami Playground - Main Entry Point
 * 
 * Modular, maintainable, and performant playground for KWAMI AI companion
 * @version 2.0.0
 */

import { Kwami } from 'kwami';
import { createMediaLoaderUI } from './media-loader-ui.js';
import mediaLoadingManager from './media-loading-manager.js';

// Core imports
import { DEFAULT_VALUES, DEFAULT_CAMERA_POSITION } from './core/config.js';
import { sidebarState, audioPlayerState } from './core/state-manager.js';

// UI imports
import { initializeSidebars } from './ui/sidebar-manager.js';
import { initializeThemeToggle } from './ui/theme-manager.js';
import { updateStatus, showError } from './ui/messages.js';

// Feature imports
import { initializeExportImport } from './features/export-import.js';
import { initializeKeyboardShortcuts } from './features/keyboard-shortcuts.js';

// Utils
import { debounce } from './utils/helpers.js';

// ============================================================================
// GLOBAL KWAMI INSTANCE
// ============================================================================

window.kwami = null;

// ============================================================================
// INITIALIZATION
// ============================================================================

/**
 * Initialize the playground
 */
async function initializePlayground() {
  try {
    // Show loading
    mediaLoadingManager.init();
    mediaLoadingManager.show('Initializing Kwami...');
    
    // Initialize UI systems
    initializeThemeToggle();
    initializeSidebars();
    initializeKeyboardShortcuts();
    initializeExportImport();
    
    // Initialize Kwami
    const canvas = document.getElementById('kwami-canvas');
    if (!canvas) {
      throw new Error('Canvas element not found');
    }
    
    window.kwami = new Kwami({
      canvas,
      body: {
        type: 'blob',
        params: DEFAULT_VALUES,
        camera: DEFAULT_CAMERA_POSITION
      }
    });
    
    // Wait for Kwami to be ready
    await window.kwami.ready();
    
    // Initialize features
    await initializeFeatures();
    
    // Hide loading overlay
    mediaLoadingManager.hide();
    
    updateStatus('✨ Kwami Playground ready!');
    
    console.log('🎮 Kwami Playground initialized successfully');
    console.log('Press ? for keyboard shortcuts');
    
  } catch (error) {
    console.error('Failed to initialize playground:', error);
    showError('Failed to initialize playground. Check console for details.');
    mediaLoadingManager.hide();
  }
}

/**
 * Initialize features after Kwami is ready
 */
async function initializeFeatures() {
  // Dynamically import heavy feature modules
  const [
    { initializeAudioPlayer },
    { initializeBodyControls },
    { initializeMindControls },
    { initializeSoulControls },
    { initializeBackgroundControls }
  ] = await Promise.all([
    import('./features/audio-player.js'),
    import('./features/body-controls.js'),
    import('./features/mind-controls.js'),
    import('./features/soul-controls.js'),
    import('./features/background-controls.js')
  ]);
  
  // Initialize all features
  initializeAudioPlayer();
  initializeBodyControls();
  initializeMindControls();
  initializeSoulControls();
  initializeBackgroundControls();
  
  // Initialize GitHub star button
  const { initializeGitHubStarButton } = await import('./features/github-stars.js');
  initializeGitHubStarButton();
}

// ============================================================================
// PERFORMANCE MONITORING
// ============================================================================

if (import.meta.env.DEV) {
  // Monitor performance in development
  let frameCount = 0;
  let lastTime = performance.now();
  
  function monitorPerformance() {
    frameCount++;
    const currentTime = performance.now();
    
    if (currentTime >= lastTime + 1000) {
      const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
      console.log(`⚡ FPS: ${fps}`);
      frameCount = 0;
      lastTime = currentTime;
    }
    
    requestAnimationFrame(monitorPerformance);
  }
  
  monitorPerformance();
}

// ============================================================================
// ERROR HANDLING
// ============================================================================

// Global error handler
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
  showError('An unexpected error occurred. Check console for details.');
});

// Unhandled promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  showError('An unexpected error occurred. Check console for details.');
});

// ============================================================================
// START PLAYGROUND
// ============================================================================

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializePlayground);
} else {
  initializePlayground();
}

// ============================================================================
// EXPORTS FOR DEBUGGING
// ============================================================================

if (import.meta.env.DEV) {
  window.__playground__ = {
    version: '2.0.0',
    kwami: () => window.kwami,
    state: sidebarState,
    audio: audioPlayerState,
    reload: () => window.location.reload(),
    export: () => import('./features/export-import.js').then(m => m.exportConfig()),
    import: (file) => import('./features/export-import.js').then(m => m.importConfig(file))
  };
  
  console.log('🔧 Debug utilities available at window.__playground__');
}

