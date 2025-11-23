/**
 * Configuration Export/Import System
 * 
 * Allows users to save and load complete playground configurations
 */

import { exportConfiguration, importConfiguration } from '../core/state-manager.js';
import { downloadFile } from '../utils/helpers.js';
import { showSuccess, showError } from '../ui/messages.js';

/**
 * Export current configuration as JSON file
 */
export function exportConfig() {
  try {
    const config = exportConfiguration();
    const filename = `kwami-playground-${Date.now()}.json`;
    const data = JSON.stringify(config, null, 2);
    
    downloadFile(data, filename, 'application/json');
    showSuccess('Configuration exported successfully!');
  } catch (error) {
    console.error('Failed to export configuration:', error);
    showError('Failed to export configuration');
  }
}

/**
 * Import configuration from JSON file
 * @param {File} file - JSON file to import
 */
export async function importConfig(file) {
  try {
    const text = await file.text();
    const config = JSON.parse(text);
    
    const success = importConfiguration(config);
    
    if (success) {
      showSuccess('Configuration imported successfully!');
      
      // Reload page to apply all changes
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } else {
      showError('Failed to import configuration');
    }
  } catch (error) {
    console.error('Failed to import configuration:', error);
    showError('Invalid configuration file');
  }
}

/**
 * Initialize export/import controls
 */
export function initializeExportImport() {
  // Create export/import buttons in settings if they don't exist
  const settingsContainer = document.querySelector('.settings-section');
  
  if (settingsContainer && !document.getElementById('export-config-btn')) {
    const exportButton = document.createElement('button');
    exportButton.id = 'export-config-btn';
    exportButton.className = 'button-secondary';
    exportButton.textContent = '💾 Export Configuration';
    exportButton.onclick = exportConfig;
    
    const importButton = document.createElement('button');
    importButton.id = 'import-config-btn';
    importButton.className = 'button-secondary';
    importButton.textContent = '📥 Import Configuration';
    importButton.onclick = () => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
          importConfig(file);
        }
      };
      input.click();
    };
    
    settingsContainer.appendChild(exportButton);
    settingsContainer.appendChild(importButton);
  }
}

/**
 * Quick save current configuration
 * Saves to localStorage with timestamp
 */
export function quickSave() {
  try {
    const config = exportConfiguration();
    const saves = JSON.parse(localStorage.getItem('kwami_quick_saves') || '[]');
    
    saves.unshift({
      timestamp: new Date().toISOString(),
      config
    });
    
    // Keep only last 5 quick saves
    if (saves.length > 5) {
      saves.pop();
    }
    
    localStorage.setItem('kwami_quick_saves', JSON.stringify(saves));
    showSuccess('Configuration quick-saved!');
  } catch (error) {
    console.error('Failed to quick save:', error);
    showError('Failed to save configuration');
  }
}

/**
 * Load most recent quick save
 */
export function quickLoad() {
  try {
    const saves = JSON.parse(localStorage.getItem('kwami_quick_saves') || '[]');
    
    if (saves.length === 0) {
      showError('No saved configurations found');
      return;
    }
    
    const latest = saves[0];
    const success = importConfiguration(latest.config);
    
    if (success) {
      showSuccess('Configuration loaded!');
      setTimeout(() => window.location.reload(), 1000);
    } else {
      showError('Failed to load configuration');
    }
  } catch (error) {
    console.error('Failed to quick load:', error);
    showError('Failed to load configuration');
  }
}

// Add keyboard shortcut for quick save (Ctrl+S or Cmd+S)
document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 's') {
    e.preventDefault();
    quickSave();
  }
});

// Export to window
window.exportConfig = exportConfig;
window.importConfig = importConfig;
window.quickSave = quickSave;
window.quickLoad = quickLoad;

