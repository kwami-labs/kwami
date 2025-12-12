/**
 * Keyboard Shortcuts System
 * 
 * Provides keyboard navigation and shortcuts for common actions
 */

import { sidebarState } from '../core/state-manager.js';
import { toggleMenus } from '../ui/sidebar-manager.js';
import { toggleTheme } from '../ui/theme-manager.js';
import { showInfo } from '../ui/messages.js';

// Shortcut definitions
const shortcuts = {
  // UI Controls
  Escape: { action: toggleMenus, description: 'Toggle sidebars' },
  h: { action: toggleMenus, description: 'Toggle sidebars' },
  t: { action: toggleTheme, description: 'Toggle theme' },

  // Blob randomization
  r: { action: () => window.randomizeBlob?.(), description: 'Random blob' },
  b: { action: () => window.randomizeBackground?.(), description: 'Random background' },

  // Sections
  1: { action: () => focusSection('mind'), description: 'Go to Mind' },
  2: { action: () => focusSection('body'), description: 'Go to Body' },
  3: { action: () => focusSection('soul'), description: 'Go to Soul' },

  // Audio
  Space: { action: () => toggleAudio(), description: 'Play/Pause audio', preventDefault: true },

  // Help
  '?': { action: showHelp, description: 'Show shortcuts' },
} as const;

/**
 * Focus on a specific section
 */
function focusSection(section: 'mind' | 'body' | 'soul') {
  if (sidebarState.left === section || sidebarState.right === section) {
    return; // Already visible
  }

  // Swap to make section visible
  if (sidebarState.hidden === section) {
    window.swapLeftSidebar?.();
  }
}

/**
 * Toggle audio playback
 */
function toggleAudio() {
  const playPauseBtn = document.getElementById('play-pause-btn');
  if (playPauseBtn) {
    playPauseBtn.click();
  }
}

/**
 * Show keyboard shortcuts help
 */
function showHelp() {
  const helpText = Object.entries(shortcuts)
    .map(([key, { description }]) => `${key}: ${description}`)
    .join('\n');
  
  showInfo('Keyboard Shortcuts:\n' + helpText);
  
  // Also log to console for better readability
  console.log('🎹 Keyboard Shortcuts:');
  Object.entries(shortcuts).forEach(([key, { description }]) => {
    console.log(`  ${key.padEnd(10)} → ${description}`);
  });
}

/**
 * Initialize keyboard shortcuts
 */
export function initializeKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    // Ignore if typing in input/textarea
    const target = e.target as Element | null;
    if (target?.matches?.('input, textarea, select')) {
      return;
    }
    
    const shortcut = shortcuts[e.key];
    
    if (shortcut) {
      if (shortcut.preventDefault) {
        e.preventDefault();
      }
      
      try {
        shortcut.action();
      } catch (error) {
        console.error(`Shortcut error for key '${e.key}':`, error);
      }
    }
  });
  
  // Show help on load (once)
  if (!localStorage.getItem('kwami_shortcuts_seen')) {
    setTimeout(() => {
      showInfo('Press ? for keyboard shortcuts');
      localStorage.setItem('kwami_shortcuts_seen', 'true');
    }, 2000);
  }
}

/**
 * Add custom shortcut
 * @param {string} key - Key to bind
 * @param {Function} action - Action to perform
 * @param {string} description - Description for help
 * @param {boolean} preventDefault - Whether to prevent default
 */
export function addShortcut(key, action, description, preventDefault = false) {
  shortcuts[key] = { action, description, preventDefault };
}

/**
 * Remove shortcut
 * @param {string} key - Key to unbind
 */
export function removeShortcut(key) {
  delete shortcuts[key];
}

/**
 * Get all shortcuts
 * @returns {Object} Shortcuts object
 */
export function getShortcuts() {
  return { ...shortcuts };
}

// Export to window
window.showKeyboardShortcuts = showHelp;

