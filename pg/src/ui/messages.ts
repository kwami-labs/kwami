/**
 * Message Display System
 * 
 * Handles status messages and error notifications
 */

import { UI_CONFIG } from '../core/config.js';

/**
 * Update status message
 * @param {string} message - Status message to display
 * @param {number} duration - Auto-dismiss duration in ms
 */
export function updateStatus(message, duration = UI_CONFIG.MESSAGE_AUTO_DISMISS) {
  const status = document.getElementById('status');
  if (!status) return;
  
  status.textContent = message;
  status.classList.remove('hidden');
  
  if (message && duration > 0) {
    setTimeout(() => {
      if (status.textContent === message) {
        status.textContent = '';
        status.classList.add('hidden');
      }
    }, duration);
  }
}

/**
 * Show error message
 * @param {string} message - Error message to display
 * @param {number} duration - Auto-dismiss duration in ms
 */
export function showError(message, duration = UI_CONFIG.ERROR_AUTO_DISMISS) {
  const error = document.getElementById('error');
  if (!error) return;
  
  error.textContent = message;
  error.classList.remove('hidden');
  
  if (message && duration > 0) {
    setTimeout(() => {
      if (error.textContent === message) {
        error.textContent = '';
        error.classList.add('hidden');
      }
    }, duration);
  }
}

/**
 * Clear all messages
 */
export function clearMessages() {
  updateStatus('', 0);
  showError('', 0);
}

/**
 * Show success message with icon
 * @param {string} message - Success message
 */
export function showSuccess(message) {
  updateStatus(`✅ ${message}`);
}

/**
 * Show warning message with icon
 * @param {string} message - Warning message
 */
export function showWarning(message) {
  updateStatus(`⚠️ ${message}`);
}

/**
 * Show info message with icon
 * @param {string} message - Info message
 */
export function showInfo(message) {
  updateStatus(`ℹ️ ${message}`);
}

/**
 * Show loading message
 * @param {string} message - Loading message
 */
export function showLoading(message) {
  updateStatus(`⏳ ${message}`, 0); // Don't auto-dismiss
}

// Export to window for backward compatibility
window.updateStatus = updateStatus;
window.showError = showError;

