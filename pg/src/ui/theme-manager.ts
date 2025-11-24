/**
 * Theme Manager
 * 
 * Handles light/dark theme switching and persistence
 */

import { themeState, saveState, loadState } from '../core/state-manager.js';
import { STORAGE_KEYS } from '../core/config.js';

/**
 * Apply theme to document
 * @param {string} theme - 'light' or 'dark'
 */
export function applyTheme(theme) {
  const body = document.body;
  const icon = document.getElementById('theme-toggle-icon');
  
  if (theme === 'dark') {
    body.classList.add('dark-mode');
    if (icon) icon.textContent = '☀️';
  } else {
    body.classList.remove('dark-mode');
    if (icon) icon.textContent = '🌙';
  }
  
  themeState.current = theme;
  saveState(STORAGE_KEYS.THEME, theme);
  
  // Update theme toggle button accessibility
  const toggleButton = document.getElementById('theme-toggle-btn');
  if (toggleButton) {
    const label = theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme';
    toggleButton.setAttribute('aria-label', label);
    toggleButton.setAttribute('title', label);
  }
}

/**
 * Toggle between light and dark theme
 */
export function toggleTheme() {
  const newTheme = themeState.current === 'light' ? 'dark' : 'light';
  applyTheme(newTheme);
}

/**
 * Initialize theme system
 */
export function initializeThemeToggle() {
  if (themeState.initialized) return;
  
  // Load saved theme or detect system preference
  const savedTheme = loadState(STORAGE_KEYS.THEME);
  
  let initialTheme = 'light';
  if (savedTheme) {
    initialTheme = savedTheme;
  } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    initialTheme = 'dark';
  }
  
  applyTheme(initialTheme);
  
  // Listen for theme toggle button
  const toggleButton = document.getElementById('theme-toggle-btn');
  if (toggleButton) {
    toggleButton.addEventListener('click', toggleTheme);
  }
  
  // Listen for system theme changes
  if (window.matchMedia) {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', (e) => {
      if (!loadState(STORAGE_KEYS.THEME)) {
        applyTheme(e.matches ? 'dark' : 'light');
      }
    });
  }
  
  themeState.initialized = true;
}

/**
 * Get current theme
 * @returns {string} Current theme ('light' or 'dark')
 */
export function getCurrentTheme() {
  return themeState.current;
}

/**
 * Check if dark mode is active
 * @returns {boolean} True if dark mode
 */
export function isDarkMode() {
  return themeState.current === 'dark';
}

// Export to window for HTML onclick handlers
window.toggleTheme = toggleTheme;

