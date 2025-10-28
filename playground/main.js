import { Kwami } from '../index.ts';

window.kwami = null;

// Default values for body parameters
const DEFAULT_VALUES = {
  spikes: { x: 0.2, y: 0.2, z: 0.2 },
  time: { x: 1, y: 1, z: 1 },
  rotation: { x: 0, y: 0, z: 0 },
  colors: { x: '#ff0066', y: '#00ff66', z: '#6600ff' },
  scale: 1.0,
  resolution: 180,
  shininess: 100,
  wireframe: false,
  skin: 'tricolor'
};

// Initialize Kwami
const canvas = document.getElementById('kwami-canvas');

try {
  window.kwami = new Kwami(canvas, {
    body: {
      initialSkin: 'tricolor',
      blob: {
        resolution: 180,
        colors: {
          x: '#ff0066',
          y: '#00ff66',
          z: '#6600ff'
        }
      }
    }
  });

  // Initialize body controls event listeners
  initializeBodyControls();

  updateStatus('✅ Kwami initialized successfully!');
  updateStateIndicator(window.kwami.getState());
} catch (error) {
  showError('Failed to initialize Kwami: ' + error.message);
}

// Initialize Mind
window.initializeMind = async function() {
  const apiKey = document.getElementById('api-key').value.trim();
  const voiceId = document.getElementById('voice-id').value.trim();

  if (!apiKey) {
    showError('Please enter your ElevenLabs API Key');
    return;
  }

  try {
    updateStatus('🔄 Initializing Mind...');
    
    // Update Mind configuration
    window.kwami.mind.setVoiceId(voiceId);
    window.kwami.mind.config.apiKey = apiKey;
    
    await window.kwami.mind.initialize();
    
    document.getElementById('speak-btn').disabled = false;
    document.getElementById('init-btn').textContent = '✅ Mind Ready';
    document.getElementById('init-btn').disabled = true;
    
    updateStatus('✅ Mind initialized! Ready to speak.');
  } catch (error) {
    showError('Failed to initialize Mind: ' + error.message);
  }
};

// Load Personality
window.loadPersonality = async function(type) {
  try {
    updateStatus(`🔄 Loading ${type} personality...`);
    
    await window.kwami.soul.loadPersonality(`/assets/personalities/${type}.json`);
    
    const name = window.kwami.soul.getName();
    document.getElementById('personality-name').textContent = name;
    
    updateStatus(`✅ Loaded ${name} personality!`);
  } catch (error) {
    showError('Failed to load personality: ' + error.message);
  }
};

// Speak
window.speak = async function() {
  const text = document.getElementById('speak-text').value.trim();
  
  if (!text) {
    showError('Please enter text to speak');
    return;
  }

  try {
    updateStatus('🗣️ Speaking...');
    document.getElementById('speak-btn').disabled = true;
    
    await window.kwami.speak(text);
    
    updateStatus('✅ Speech complete!');
    document.getElementById('speak-btn').disabled = false;
  } catch (error) {
    showError('Failed to speak: ' + error.message);
    document.getElementById('speak-btn').disabled = false;
  }
};

// Randomize Blob
window.randomizeBlob = function() {
  window.kwami.body.blob.setRandomBlob();
  updateAllControlsFromBlob();
  updateStatus('🎲 Blob randomized!');
};

// Reset to Defaults
window.resetToDefaults = function() {
  const blob = window.kwami.body.blob;
  
  // Apply defaults
  blob.setSpikes(DEFAULT_VALUES.spikes.x, DEFAULT_VALUES.spikes.y, DEFAULT_VALUES.spikes.z);
  blob.setTime(DEFAULT_VALUES.time.x, DEFAULT_VALUES.time.y, DEFAULT_VALUES.time.z);
  blob.setRotation(DEFAULT_VALUES.rotation.x, DEFAULT_VALUES.rotation.y, DEFAULT_VALUES.rotation.z);
  blob.setColors(DEFAULT_VALUES.colors.x, DEFAULT_VALUES.colors.y, DEFAULT_VALUES.colors.z);
  blob.setScale(DEFAULT_VALUES.scale);
  blob.setResolution(DEFAULT_VALUES.resolution);
  blob.setShininess(DEFAULT_VALUES.shininess);
  blob.setWireframe(DEFAULT_VALUES.wireframe);
  blob.setSkin(DEFAULT_VALUES.skin);
  
  // Update UI
  updateAllControlsFromBlob();
  updateStatus('🔄 Reset to defaults!');
};

// Helper function to format value display
function formatValue(value, decimals = 1) {
  return Number(value).toFixed(decimals);
}

// Update value display helper
function updateValueDisplay(id, value, decimals = 1) {
  const element = document.getElementById(id);
  if (element) {
    element.textContent = formatValue(value, decimals);
  }
}

// Update all controls from current blob state
function updateAllControlsFromBlob() {
  if (!window.kwami) return;
  
  const blob = window.kwami.body.blob;
  const spikes = blob.getSpikes();
  const time = blob.getTime();
  const rotation = blob.getRotation();
  const colors = blob.getColors();
  const scale = blob.getScale();
  const wireframe = blob.getWireframe();
  const skin = blob.getCurrentSkin();
  const shininess = blob.getShininess();
  
  // Update spikes
  ['x', 'y', 'z'].forEach(axis => {
    const slider = document.getElementById(`spike-${axis}`);
    const display = document.getElementById(`spike-${axis}-value`);
    if (slider && display) {
      slider.value = spikes[axis];
      display.textContent = formatValue(spikes[axis], 1);
    }
  });
  
  // Update time
  ['x', 'y', 'z'].forEach(axis => {
    const slider = document.getElementById(`time-${axis}`);
    const display = document.getElementById(`time-${axis}-value`);
    if (slider && display) {
      slider.value = time[axis];
      display.textContent = formatValue(time[axis], 1);
    }
  });
  
  // Update rotation
  ['x', 'y', 'z'].forEach(axis => {
    const slider = document.getElementById(`rotation-${axis}`);
    const display = document.getElementById(`rotation-${axis}-value`);
    if (slider && display) {
      slider.value = rotation[axis];
      display.textContent = formatValue(rotation[axis], 3);
    }
  });
  
  // Update colors
  ['x', 'y', 'z'].forEach(axis => {
    const colorPicker = document.getElementById(`color-${axis}`);
    if (colorPicker) {
      colorPicker.value = colors[axis];
    }
  });
  
  // Update scale
  const scaleSlider = document.getElementById('scale');
  const scaleDisplay = document.getElementById('scale-value');
  if (scaleSlider && scaleDisplay) {
    scaleSlider.value = scale;
    scaleDisplay.textContent = formatValue(scale, 1);
  }
  
  // Update shininess
  const shininessSlider = document.getElementById('shininess');
  const shininessDisplay = document.getElementById('shininess-value');
  if (shininessSlider && shininessDisplay) {
    shininessSlider.value = shininess;
    shininessDisplay.textContent = formatValue(shininess, 0);
  }
  
  // Update wireframe
  const wireframeCheckbox = document.getElementById('wireframe');
  if (wireframeCheckbox) {
    wireframeCheckbox.checked = wireframe;
  }
  
  // Update skin
  const skinSelect = document.getElementById('skin-type');
  if (skinSelect) {
    skinSelect.value = skin;
  }
}

// Initialize body controls event listeners
function initializeBodyControls() {
  if (!window.kwami) return;
  
  const blob = window.kwami.body.blob;
  
  // Spikes sliders
  ['x', 'y', 'z'].forEach(axis => {
    const slider = document.getElementById(`spike-${axis}`);
    if (slider) {
      slider.addEventListener('input', (e) => {
        const value = parseFloat(e.target.value);
        const spikes = blob.getSpikes();
        spikes[axis] = value;
        blob.setSpikes(spikes.x, spikes.y, spikes.z);
        updateValueDisplay(`spike-${axis}-value`, value, 1);
      });
    }
  });
  
  // Time sliders
  ['x', 'y', 'z'].forEach(axis => {
    const slider = document.getElementById(`time-${axis}`);
    if (slider) {
      slider.addEventListener('input', (e) => {
        const value = parseFloat(e.target.value);
        const time = blob.getTime();
        time[axis] = value;
        blob.setTime(time.x, time.y, time.z);
        updateValueDisplay(`time-${axis}-value`, value, 1);
      });
    }
  });
  
  // Rotation sliders
  ['x', 'y', 'z'].forEach(axis => {
    const slider = document.getElementById(`rotation-${axis}`);
    if (slider) {
      slider.addEventListener('input', (e) => {
        const value = parseFloat(e.target.value);
        const rotation = blob.getRotation();
        rotation[axis] = value;
        blob.setRotation(rotation.x, rotation.y, rotation.z);
        updateValueDisplay(`rotation-${axis}-value`, value, 3);
      });
    }
  });
  
  // Color pickers
  ['x', 'y', 'z'].forEach(axis => {
    const colorPicker = document.getElementById(`color-${axis}`);
    if (colorPicker) {
      colorPicker.addEventListener('input', (e) => {
        const value = e.target.value;
        const colors = blob.getColors();
        colors[axis] = value;
        blob.setColors(colors.x, colors.y, colors.z);
      });
    }
  });
  
  // Scale slider
  const scaleSlider = document.getElementById('scale');
  if (scaleSlider) {
    scaleSlider.addEventListener('input', (e) => {
      const value = parseFloat(e.target.value);
      console.log('Setting scale to:', value);
      blob.setScale(value);
      console.log('Scale is now:', blob.getScale());
      updateValueDisplay('scale-value', value, 1);
    });
  } else {
    console.error('Scale slider not found!');
  }
  
  // Resolution slider
  const resolutionSlider = document.getElementById('resolution');
  if (resolutionSlider) {
    resolutionSlider.addEventListener('input', (e) => {
      const value = parseInt(e.target.value);
      blob.setResolution(value);
      updateValueDisplay('resolution-value', value, 0);
    });
  }
  
  // Shininess slider
  const shininessSlider = document.getElementById('shininess');
  if (shininessSlider) {
    shininessSlider.addEventListener('input', (e) => {
      const value = parseInt(e.target.value);
      blob.setShininess(value);
      updateValueDisplay('shininess-value', value, 0);
    });
  }
  
  // Wireframe checkbox
  const wireframeCheckbox = document.getElementById('wireframe');
  if (wireframeCheckbox) {
    wireframeCheckbox.addEventListener('change', (e) => {
      blob.setWireframe(e.target.checked);
    });
  }
  
  // Skin type selector
  const skinSelect = document.getElementById('skin-type');
  if (skinSelect) {
    skinSelect.addEventListener('change', (e) => {
      blob.setSkin(e.target.value);
      updateStatus(`👕 Changed to ${e.target.value} skin`);
    });
  }
}

// Helper functions
function updateStatus(message) {
  const status = document.getElementById('status');
  status.textContent = message;
}

function showError(message) {
  const error = document.getElementById('error');
  error.textContent = message;
  error.classList.add('show');
  setTimeout(() => error.classList.remove('show'), 5000);
}

function updateStateIndicator(state) {
  const indicator = document.getElementById('state-indicator');
  const stateText = document.getElementById('state-text');
  
  indicator.className = 'state-indicator state-' + state;
  stateText.textContent = state.toUpperCase();
}

// Monitor state changes
setInterval(() => {
  if (window.kwami) {
    updateStateIndicator(window.kwami.getState());
  }
}, 100);
