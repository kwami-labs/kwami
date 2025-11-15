/**
 * Media Loader UI Component
 * 
 * Provides a reusable UI component for loading media from files or URLs
 * Integrates with the MediaLoader core utility
 */

import { MediaLoader } from '../src/core/utils/MediaLoader.js';

/**
 * Create a media loader UI component
 * 
 * @param {Object} options Configuration options
 * @param {string} options.type - Media type: 'image', 'video', or 'audio'
 * @param {string} options.label - Label text (e.g., "Background Image")
 * @param {Function} options.onLoad - Callback when media is loaded (url, source) => void
 * @param {Function} options.onError - Callback for errors (error) => void
 * @param {string[]} options.presets - Optional preset URLs/paths for dropdown
 * @param {boolean} options.showPresets - Whether to show presets dropdown (default: true)
 * @returns {HTMLElement} The media loader component
 */
export function createMediaLoaderUI(options) {
  const {
    type,
    label,
    onLoad,
    onError,
    presets = [],
    showPresets = true
  } = options;

  // Create container
  const container = document.createElement('div');
  container.className = 'media-loader-container';

  // Create tabs for different input methods
  const tabsHTML = `
    <div class="media-loader-tabs">
      ${showPresets && presets.length > 0 ? '<button class="media-loader-tab active" data-tab="presets">📋 Presets</button>' : ''}
      <button class="media-loader-tab ${!showPresets || presets.length === 0 ? 'active' : ''}" data-tab="url">🔗 URL</button>
      <button class="media-loader-tab" data-tab="file">📁 Upload</button>
    </div>
  `;

  // Create content areas
  const contentHTML = `
    <div class="media-loader-content">
      <!-- Presets Tab -->
      ${showPresets && presets.length > 0 ? `
      <div class="media-loader-tab-content active" data-content="presets">
        <div class="input-group">
          <label>${label} - Presets</label>
          <select class="media-loader-preset-select">
            <option value="">-- Select ${type} --</option>
            ${presets.map(preset => {
              const name = typeof preset === 'string' ? 
                preset.split('/').pop().split('.')[0].replace(/-/g, ' ') : 
                preset.name;
              const value = typeof preset === 'string' ? preset : preset.value;
              return `<option value="${value}">${name}</option>`;
            }).join('')}
          </select>
        </div>
      </div>
      ` : ''}
      
      <!-- URL Tab -->
      <div class="media-loader-tab-content ${!showPresets || presets.length === 0 ? 'active' : ''}" data-content="url">
        <div class="input-group">
          <label>${label} - URL</label>
          <div class="media-loader-url-input-group">
            <input 
              type="text" 
              class="media-loader-url-input" 
              placeholder="https://example.com/${type}.${type === 'image' ? 'jpg' : type === 'video' ? 'mp4' : 'mp3'}"
            >
            <button class="media-loader-url-btn button-secondary" title="Load from URL">
              <span class="media-loader-icon">🔗</span>
              <span class="media-loader-text">Load</span>
            </button>
          </div>
          <small class="media-loader-hint">
            Paste a direct link to ${type === 'image' ? 'an image' : type === 'video' ? 'a video' : 'an audio file'}
            (${MediaLoader.getAllowedExtensions(type).join(', ')})
          </small>
        </div>
      </div>
      
      <!-- File Upload Tab -->
      <div class="media-loader-tab-content" data-content="file">
        <div class="input-group">
          <label>${label} - Upload File</label>
          <div class="media-loader-upload-area">
            <input 
              type="file" 
              class="media-loader-file-input" 
              accept="${MediaLoader.getAcceptAttribute(type)}"
              style="display: none;"
            >
            <button class="media-loader-upload-btn button-secondary" title="Choose file to upload">
              <span class="media-loader-icon">📁</span>
              <span class="media-loader-text">Choose File</span>
            </button>
            <div class="media-loader-dropzone" title="Drag and drop ${type} here">
              <div class="media-loader-dropzone-content">
                <span class="media-loader-dropzone-icon">📎</span>
                <span class="media-loader-dropzone-text">Drop ${type} here</span>
              </div>
            </div>
          </div>
          <small class="media-loader-hint">
            Max size: 100MB | Formats: ${MediaLoader.getAllowedExtensions(type).join(', ')}
          </small>
        </div>
      </div>
      
      <!-- Status Message -->
      <div class="media-loader-status" style="display: none;">
        <span class="media-loader-status-icon"></span>
        <span class="media-loader-status-text"></span>
      </div>
    </div>
  `;

  container.innerHTML = tabsHTML + contentHTML;

  // Get elements
  const tabs = container.querySelectorAll('.media-loader-tab');
  const tabContents = container.querySelectorAll('.media-loader-tab-content');
  const urlInput = container.querySelector('.media-loader-url-input');
  const urlBtn = container.querySelector('.media-loader-url-btn');
  const fileInput = container.querySelector('.media-loader-file-input');
  const uploadBtn = container.querySelector('.media-loader-upload-btn');
  const dropzone = container.querySelector('.media-loader-dropzone');
  const presetSelect = container.querySelector('.media-loader-preset-select');
  const statusEl = container.querySelector('.media-loader-status');
  const statusIcon = container.querySelector('.media-loader-status-icon');
  const statusText = container.querySelector('.media-loader-status-text');

  // Show status message
  function showStatus(message, isError = false) {
    statusEl.style.display = 'flex';
    statusIcon.textContent = isError ? '⚠️' : '✅';
    statusText.textContent = message;
    statusEl.className = `media-loader-status ${isError ? 'error' : 'success'}`;
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
      statusEl.style.display = 'none';
    }, 3000);
  }

  // Tab switching
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const tabName = tab.dataset.tab;
      
      // Update active tab
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      
      // Update active content
      tabContents.forEach(content => {
        if (content.dataset.content === tabName) {
          content.classList.add('active');
        } else {
          content.classList.remove('active');
        }
      });
    });
  });

  // Preset selection
  if (presetSelect) {
    presetSelect.addEventListener('change', async (e) => {
      const value = e.target.value;
      if (!value) return;

      try {
        showStatus(`Loading ${type}...`, false);
        if (onLoad) {
          onLoad(value, 'preset');
        }
        showStatus(`${type.charAt(0).toUpperCase() + type.slice(1)} loaded successfully!`, false);
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        showStatus(errorMsg, true);
        if (onError) {
          onError(new Error(errorMsg));
        }
      }
    });
  }

  // URL loading
  if (urlBtn && urlInput) {
    const loadFromURL = async () => {
      const url = urlInput.value.trim();
      if (!url) {
        showStatus('Please enter a URL', true);
        return;
      }

      try {
        showStatus('Validating URL...', false);
        
        const result = await MediaLoader.loadFromURL(url, {
          type,
          onLoad: (validatedUrl, source) => {
            showStatus(`${type.charAt(0).toUpperCase() + type.slice(1)} loaded from URL!`, false);
            if (onLoad) {
              onLoad(validatedUrl, source);
            }
          },
          onError: (error) => {
            showStatus(error.message, true);
            if (onError) {
              onError(error);
            }
          }
        });

        if (!result.valid && result.error) {
          showStatus(result.error, true);
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Failed to load URL';
        showStatus(errorMsg, true);
        if (onError) {
          onError(new Error(errorMsg));
        }
      }
    };

    urlBtn.addEventListener('click', loadFromURL);
    urlInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        loadFromURL();
      }
    });
  }

  // File upload
  if (uploadBtn && fileInput) {
    uploadBtn.addEventListener('click', () => {
      fileInput.click();
    });

    fileInput.addEventListener('change', async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      try {
        showStatus('Loading file...', false);
        
        const result = await MediaLoader.loadFromFile(file, {
          type,
          onLoad: (url, source) => {
            showStatus(`${file.name} loaded successfully!`, false);
            if (onLoad) {
              onLoad(url, source);
            }
          },
          onError: (error) => {
            showStatus(error.message, true);
            if (onError) {
              onError(error);
            }
          }
        });

        if (!result.valid && result.error) {
          showStatus(result.error, true);
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Failed to load file';
        showStatus(errorMsg, true);
        if (onError) {
          onError(new Error(errorMsg));
        }
      } finally {
        fileInput.value = ''; // Reset input
      }
    });
  }

  // Drag and drop
  if (dropzone && fileInput) {
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
      });
    });

    ['dragenter', 'dragover'].forEach(eventName => {
      dropzone.addEventListener(eventName, () => {
        dropzone.classList.add('dragover');
      });
    });

    ['dragleave', 'drop'].forEach(eventName => {
      dropzone.addEventListener(eventName, () => {
        dropzone.classList.remove('dragover');
      });
    });

    dropzone.addEventListener('drop', async (e) => {
      const files = e.dataTransfer?.files;
      if (!files || files.length === 0) return;

      const file = files[0];
      
      try {
        showStatus('Loading dropped file...', false);
        
        const result = await MediaLoader.loadFromFile(file, {
          type,
          onLoad: (url, source) => {
            showStatus(`${file.name} loaded successfully!`, false);
            if (onLoad) {
              onLoad(url, source);
            }
          },
          onError: (error) => {
            showStatus(error.message, true);
            if (onError) {
              onError(error);
            }
          }
        });

        if (!result.valid && result.error) {
          showStatus(result.error, true);
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Failed to load dropped file';
        showStatus(errorMsg, true);
        if (onError) {
          onError(new Error(errorMsg));
        }
      }
    });
  }

  return container;
}

