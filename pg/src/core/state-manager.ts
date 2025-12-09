/**
 * State Manager
 * 
 * Centralized state management for the playground
 * Provides reactive state updates and persistence
 */

import { STORAGE_KEYS } from './config';
import type {
  SidebarState,
  AudioPlayerState,
  ThemeState,
  ColorPickerState,
  AgentManagerState,
  PlaygroundConfiguration
} from '../types/index.js';

// ============================================================================
// STATE DEFINITIONS
// ============================================================================

export const sidebarState = {
  left: 'mind',
  right: 'body',
  hidden: 'soul',
  menusCollapsed: false
};

export const sectionLabels = {
  mind: '🧠 Mind',
  body: '🧬 Body',
  soul: '✨ Soul'
};

export const audioPlayerState = {
  initialized: false,
  displayName: 'No audio loaded',
  lastVolume: 0.8,
  visible: false,
  playlist: [],
  currentIndex: 0,
  isCustomTrack: false
};

export const githubStarState = {
  initialized: false,
  lastFetchedAt: 0,
  starCount: '...'
};

export const themeState = {
  current: 'light',
  initialized: false
};

export const colorPickerState = {
  currentColor: '#667eea',
  glassEffectEnabled: false,
  dropdownOpen: false
};

export const agentManagerState = {
  initialized: false,
  agents: [],
  selectedAgent: null,
  apiKey: null,
  conversationActive: false
};

// ============================================================================
// STATE PERSISTENCE
// ============================================================================

/**
 * Save state to localStorage
 * @param {string} key - Storage key
 * @param {*} value - Value to store (will be JSON stringified)
 */
export function saveState(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Failed to save state for ${key}:`, error);
  }
}

/**
 * Load state from localStorage
 * @param {string} key - Storage key
 * @param {*} defaultValue - Default value if not found
 * @returns {*} Parsed value or default
 */
export function loadState(key, defaultValue = null) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Failed to load state for ${key}:`, error);
    return defaultValue;
  }
}

/**
 * Remove state from localStorage
 * @param {string} key - Storage key
 */
export function removeState(key) {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Failed to remove state for ${key}:`, error);
  }
}

/**
 * Clear all playground state
 */
export function clearAllState() {
  Object.values(STORAGE_KEYS).forEach(key => removeState(key));
}

// ============================================================================
// STATE OBSERVERS
// ============================================================================

const stateObservers = new Map();

/**
 * Subscribe to state changes
 * @param {string} stateName - Name of the state object
 * @param {Function} callback - Callback function (newState, oldState) => void
 * @returns {Function} Unsubscribe function
 */
export function observeState(stateName, callback) {
  if (!stateObservers.has(stateName)) {
    stateObservers.set(stateName, new Set());
  }
  
  stateObservers.get(stateName).add(callback);
  
  // Return unsubscribe function
  return () => {
    const observers = stateObservers.get(stateName);
    if (observers) {
      observers.delete(callback);
    }
  };
}

/**
 * Notify observers of state changes
 * @param {string} stateName - Name of the state object
 * @param {*} newState - New state value
 * @param {*} oldState - Previous state value
 */
export function notifyStateChange(stateName, newState, oldState) {
  const observers = stateObservers.get(stateName);
  if (observers) {
    observers.forEach(callback => {
      try {
        callback(newState, oldState);
      } catch (error) {
        console.error(`Error in state observer for ${stateName}:`, error);
      }
    });
  }
}

// ============================================================================
// GLOBAL STATE ACCESS
// ============================================================================

/**
 * Get current playground state snapshot
 * @returns {Object} Complete state snapshot
 */
export function getStateSnapshot() {
  return {
    sidebar: { ...sidebarState },
    audioPlayer: { ...audioPlayerState },
    github: { ...githubStarState },
    theme: { ...themeState },
    colorPicker: { ...colorPickerState },
    agentManager: { ...agentManagerState }
  };
}

/**
 * Export complete playground configuration
 * @returns {Object} Exportable configuration
 */
export function exportConfiguration() {
  return {
    version: '1.5.11',
    timestamp: new Date().toISOString(),
    state: getStateSnapshot(),
    blob: window.kwami?.body?.getParams?.() || {},
    background: loadState(STORAGE_KEYS.LAST_CONFIG, {}),
    personality: loadState(STORAGE_KEYS.PERSONALITIES, [])
  };
}

/**
 * Import playground configuration
 * @param {Object} config - Configuration object to import
 * @returns {boolean} Success status
 */
export function importConfiguration(config) {
  try {
    if (!config || typeof config !== 'object') {
      throw new Error('Invalid configuration format');
    }
    
    // Validate version compatibility
    if (config.version && parseFloat(config.version) > 2.0) {
      console.warn('Configuration from newer version, may have compatibility issues');
    }
    
    // Import state
    if (config.state) {
      Object.assign(sidebarState, config.state.sidebar || {});
      Object.assign(audioPlayerState, config.state.audioPlayer || {});
      Object.assign(themeState, config.state.theme || {});
      Object.assign(colorPickerState, config.state.colorPicker || {});
    }
    
    // Import blob configuration
    if (config.blob && window.kwami?.body) {
      window.kwami.body.updateParams(config.blob);
    }
    
    // Import background
    if (config.background) {
      saveState(STORAGE_KEYS.LAST_CONFIG, config.background);
    }
    
    // Import personalities
    if (config.personality) {
      saveState(STORAGE_KEYS.PERSONALITIES, config.personality);
    }
    
    return true;
  } catch (error) {
    console.error('Failed to import configuration:', error);
    return false;
  }
}

