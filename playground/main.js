import { Kwami } from '../index.ts';

window.kwami = null;

// Default values for body parameters
const DEFAULT_VALUES = {
  spikes: { x: 0.2, y: 0.2, z: 0.2 },
  time: { x: 1, y: 1, z: 1 },
  rotation: { x: 0, y: 0, z: 0 },
  colors: { x: '#ff0066', y: '#00ff66', z: '#6600ff' },
  scale: 4.0,
  resolution: 180,
  shininess: 100,
  wireframe: false,
  skin: 'tricolor'
};

// Default background gradient settings
const DEFAULT_BACKGROUND = {
  type: 'gradient',
  colors: ['#667eea', '#764ba2', '#f093fb'],
  direction: 'vertical',
  opacity: 1.0
};

// Default camera position
const DEFAULT_CAMERA_POSITION = {
  x: 0,
  y: 0,
  z: 12
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
      },
      scene: {
        cameraPosition: { x: 0, y: 0, z: 12 }
      }
    }
  });
  
  // Set initial scale after initialization
  window.kwami.body.blob.setScale(DEFAULT_VALUES.scale);

  // Initialize body controls event listeners
  initializeBodyControls();
  
  // Initialize background controls
  initializeBackgroundControls();

  // Initialize camera position controls
  initializeCameraControls();

  // Apply initial background
  applyBackground();

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
    
    // Wait for the audio to finish playing
    const audioElement = window.kwami.body.audio.getAudioElement();
    
    // Check if audio is still playing
    if (!audioElement.paused && !audioElement.ended) {
      await new Promise((resolve) => {
        // Fallback timeout in case something goes wrong (5 minutes max)
        const timeoutId = setTimeout(() => {
          resolve();
        }, 300000);
        
        const onEnded = () => {
          clearTimeout(timeoutId);
          resolve();
        };
        
        const onError = () => {
          clearTimeout(timeoutId);
          resolve();
        };
        
        audioElement.addEventListener('ended', onEnded, { once: true });
        audioElement.addEventListener('error', onError, { once: true });
      });
    }
    
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
  
  // Also randomize camera position for a different view angle
  const camera = window.kwami.body.getCamera();
  const randomCameraPos = {
    x: (Math.random() - 0.5) * 20, // -10 to 10
    y: (Math.random() - 0.5) * 20, // -10 to 10
    z: Math.random() * 15 + 5 // 5 to 20
  };
  camera.position.set(randomCameraPos.x, randomCameraPos.y, randomCameraPos.z);
  camera.lookAt(0, 0, 0); // Always look at the blob center
  
  // Update camera UI
  document.getElementById('camera-x').value = randomCameraPos.x;
  document.getElementById('camera-y').value = randomCameraPos.y;
  document.getElementById('camera-z').value = randomCameraPos.z;
  updateValueDisplay('camera-x-value', randomCameraPos.x, 1);
  updateValueDisplay('camera-y-value', randomCameraPos.y, 1);
  updateValueDisplay('camera-z-value', randomCameraPos.z, 1);
  
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
  
  // Reset camera position
  const camera = window.kwami.body.getCamera();
  camera.position.set(DEFAULT_CAMERA_POSITION.x, DEFAULT_CAMERA_POSITION.y, DEFAULT_CAMERA_POSITION.z);
  camera.lookAt(0, 0, 0);
  document.getElementById('camera-x').value = DEFAULT_CAMERA_POSITION.x;
  document.getElementById('camera-y').value = DEFAULT_CAMERA_POSITION.y;
  document.getElementById('camera-z').value = DEFAULT_CAMERA_POSITION.z;
  updateValueDisplay('camera-x-value', DEFAULT_CAMERA_POSITION.x, 1);
  updateValueDisplay('camera-y-value', DEFAULT_CAMERA_POSITION.y, 1);
  updateValueDisplay('camera-z-value', DEFAULT_CAMERA_POSITION.z, 1);
  
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

// Background control functions (using Canvas API)
function applyBackground() {
  const type = document.getElementById('bg-type').value;
  const opacity = parseFloat(document.getElementById('bg-opacity').value);
  
  if (type === 'transparent') {
    window.kwami.body.setBackgroundTransparent();
  } else if (type === 'solid') {
    const color = document.getElementById('bg-solid-color').value;
    window.kwami.body.setBackgroundColor(color, opacity);
  } else if (type === 'gradient') {
    const color1 = document.getElementById('bg-color-1').value;
    const color2 = document.getElementById('bg-color-2').value;
    const color3 = document.getElementById('bg-color-3').value;
    const direction = document.getElementById('bg-direction').value;
    
    window.kwami.body.setBackgroundGradient([color1, color2, color3], direction, opacity);
  }
}

window.randomizeBackground = function() {
  const type = document.getElementById('bg-type').value;
  
  // Random color generator
  const randomColor = () => '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
  
  if (type === 'solid') {
    document.getElementById('bg-solid-color').value = randomColor();
  } else if (type === 'gradient') {
    document.getElementById('bg-color-1').value = randomColor();
    document.getElementById('bg-color-2').value = randomColor();
    document.getElementById('bg-color-3').value = randomColor();
    
    // Random direction
    const directions = ['vertical', 'horizontal', 'radial'];
    document.getElementById('bg-direction').value = directions[Math.floor(Math.random() * directions.length)];
  }
  
  applyBackground();
  updateStatus('🎲 Background randomized!');
};

window.resetBackground = function() {
  // Reset to default values
  document.getElementById('bg-type').value = DEFAULT_BACKGROUND.type;
  document.getElementById('bg-color-1').value = DEFAULT_BACKGROUND.colors[0];
  document.getElementById('bg-color-2').value = DEFAULT_BACKGROUND.colors[1];
  document.getElementById('bg-color-3').value = DEFAULT_BACKGROUND.colors[2];
  document.getElementById('bg-direction').value = DEFAULT_BACKGROUND.direction;
  document.getElementById('bg-opacity').value = DEFAULT_BACKGROUND.opacity;
  updateValueDisplay('bg-opacity-value', DEFAULT_BACKGROUND.opacity, 2);
  
  // Show/hide appropriate controls
  const gradientControls = document.getElementById('gradient-controls');
  const solidControls = document.getElementById('solid-controls');
  const opacityControl = document.getElementById('opacity-control');
  
  if (DEFAULT_BACKGROUND.type === 'gradient') {
    gradientControls.style.display = 'block';
    solidControls.style.display = 'none';
    opacityControl.style.display = 'block';
  } else if (DEFAULT_BACKGROUND.type === 'solid') {
    gradientControls.style.display = 'none';
    solidControls.style.display = 'block';
    opacityControl.style.display = 'block';
  } else {
    gradientControls.style.display = 'none';
    solidControls.style.display = 'none';
    opacityControl.style.display = 'none';
  }
  
  applyBackground();
  updateStatus('🔄 Background reset to defaults!');
};

function initializeBackgroundControls() {
  // Background type selector
  const bgTypeSelect = document.getElementById('bg-type');
  if (bgTypeSelect) {
    bgTypeSelect.addEventListener('change', (e) => {
      const type = e.target.value;
      
      // Show/hide controls based on type
      const gradientControls = document.getElementById('gradient-controls');
      const solidControls = document.getElementById('solid-controls');
      const opacityControl = document.getElementById('opacity-control');
      
      if (type === 'gradient') {
        gradientControls.style.display = 'block';
        solidControls.style.display = 'none';
        opacityControl.style.display = 'block';
      } else if (type === 'solid') {
        gradientControls.style.display = 'none';
        solidControls.style.display = 'block';
        opacityControl.style.display = 'block';
      } else {
        gradientControls.style.display = 'none';
        solidControls.style.display = 'none';
        opacityControl.style.display = 'none';
      }
      
      applyBackground();
    });
  }
  
  // Opacity slider - apply in real-time
  const opacitySlider = document.getElementById('bg-opacity');
  if (opacitySlider) {
    opacitySlider.addEventListener('input', (e) => {
      updateValueDisplay('bg-opacity-value', e.target.value, 2);
      applyBackground();
    });
  }
  
  // Gradient color pickers - apply in real-time
  ['1', '2', '3'].forEach(num => {
    const colorPicker = document.getElementById(`bg-color-${num}`);
    if (colorPicker) {
      colorPicker.addEventListener('input', applyBackground);
    }
  });
  
  // Gradient direction selector
  const directionSelect = document.getElementById('bg-direction');
  if (directionSelect) {
    directionSelect.addEventListener('change', applyBackground);
  }
  
  // Solid color picker - apply in real-time
  const solidColorPicker = document.getElementById('bg-solid-color');
  if (solidColorPicker) {
    solidColorPicker.addEventListener('input', applyBackground);
  }
  
  // Set initial values
  document.getElementById('bg-color-1').value = DEFAULT_BACKGROUND.colors[0];
  document.getElementById('bg-color-2').value = DEFAULT_BACKGROUND.colors[1];
  document.getElementById('bg-color-3').value = DEFAULT_BACKGROUND.colors[2];
  document.getElementById('bg-direction').value = DEFAULT_BACKGROUND.direction;
  document.getElementById('bg-type').value = DEFAULT_BACKGROUND.type;
  document.getElementById('bg-opacity').value = DEFAULT_BACKGROUND.opacity;
}

// Camera position control functions
function initializeCameraControls() {
  const camera = window.kwami.body.getCamera();
  
  // Camera X position
  const cameraXSlider = document.getElementById('camera-x');
  if (cameraXSlider) {
    cameraXSlider.addEventListener('input', (e) => {
      const value = parseFloat(e.target.value);
      camera.position.x = value;
      camera.lookAt(0, 0, 0); // Always look at the blob center
      updateValueDisplay('camera-x-value', value, 1);
    });
  }
  
  // Camera Y position
  const cameraYSlider = document.getElementById('camera-y');
  if (cameraYSlider) {
    cameraYSlider.addEventListener('input', (e) => {
      const value = parseFloat(e.target.value);
      camera.position.y = value;
      camera.lookAt(0, 0, 0); // Always look at the blob center
      updateValueDisplay('camera-y-value', value, 1);
    });
  }
  
  // Camera Z position
  const cameraZSlider = document.getElementById('camera-z');
  if (cameraZSlider) {
    cameraZSlider.addEventListener('input', (e) => {
      const value = parseFloat(e.target.value);
      camera.position.z = value;
      camera.lookAt(0, 0, 0); // Always look at the blob center
      updateValueDisplay('camera-z-value', value, 1);
    });
  }
  
  // Set initial values
  document.getElementById('camera-x').value = DEFAULT_CAMERA_POSITION.x;
  document.getElementById('camera-y').value = DEFAULT_CAMERA_POSITION.y;
  document.getElementById('camera-z').value = DEFAULT_CAMERA_POSITION.z;
}


// Monitor state changes and camera position
setInterval(() => {
  if (window.kwami) {
    updateStateIndicator(window.kwami.getState());
    
    // Update camera position display
    const camera = window.kwami.body.getCamera();
    const currentX = parseFloat(document.getElementById('camera-x').value);
    const currentY = parseFloat(document.getElementById('camera-y').value);
    const currentZ = parseFloat(document.getElementById('camera-z').value);
    
    // Only update if values have changed (to avoid slider jumping while user is dragging)
    if (Math.abs(camera.position.x - currentX) > 0.1) {
      document.getElementById('camera-x').value = camera.position.x;
      updateValueDisplay('camera-x-value', camera.position.x, 1);
    }
    if (Math.abs(camera.position.y - currentY) > 0.1) {
      document.getElementById('camera-y').value = camera.position.y;
      updateValueDisplay('camera-y-value', camera.position.y, 1);
    }
    if (Math.abs(camera.position.z - currentZ) > 0.1) {
      document.getElementById('camera-z').value = camera.position.z;
      updateValueDisplay('camera-z-value', camera.position.z, 1);
    }
  }
}, 100);
