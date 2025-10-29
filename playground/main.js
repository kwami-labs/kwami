import { Kwami } from '../index.ts';

window.kwami = null;

// Sidebar management: Mind, Body, Soul rotating system
const sidebarState = {
  left: 'mind',  // Initially Mind is on the left
  right: 'body', // Initially Body is on the right
  hidden: 'soul' // Initially Soul is hidden
};

const sectionLabels = {
  mind: '🤖 Mind',
  body: '🎨 Body',
  soul: '✨ Soul'
};

// Initialize sidebars
function initializeSidebars() {
  renderSidebar('left', sidebarState.left);
  renderSidebar('right', sidebarState.right);
  updateSwapButtons();
}

// Render a section into a sidebar
function renderSidebar(side, section) {
  const template = document.getElementById(`${section}-template`);
  const content = template.content.cloneNode(true);
  const container = document.getElementById(`${side}-content`);
  
  // Clear existing content
  container.innerHTML = '';
  
  // Append new content
  container.appendChild(content);
  
  // Re-initialize event listeners for the new content if needed
  if (side === 'left' && section === 'mind') {
    // Mind section specific initialization will happen after Kwami is created
  }
  if (side === 'right' && section === 'body') {
    // Body section specific initialization will happen after Kwami is created
  }
}

// Swap left sidebar
window.swapLeftSidebar = function() {
  // Current: left shows X, right shows Y, hidden is Z
  // After: left shows Z (hidden), right shows Y (same), hidden is X (was left)
  const newLeft = sidebarState.hidden;
  const newHidden = sidebarState.left;
  
  sidebarState.left = newLeft;
  sidebarState.hidden = newHidden;
  
  renderSidebar('left', sidebarState.left);
  updateSwapButtons();
  
  // Re-initialize controls if needed
  setTimeout(() => {
    if (window.kwami) {
      if (sidebarState.left === 'body') {
        initializeBodyControls();
        initializeBackgroundControls();
        initializeCameraControls();
      } else if (sidebarState.left === 'soul') {
        initializeSoulControls();
      }
    }
  }, 100);
};

// Swap right sidebar
window.swapRightSidebar = function() {
  // Current: left shows X, right shows Y, hidden is Z
  // After: left shows X (same), right shows Z (hidden), hidden is Y (was right)
  const newRight = sidebarState.hidden;
  const newHidden = sidebarState.right;
  
  sidebarState.right = newRight;
  sidebarState.hidden = newHidden;
  
  renderSidebar('right', sidebarState.right);
  updateSwapButtons();
  
  // Re-initialize controls if needed
  setTimeout(() => {
    if (window.kwami) {
      if (sidebarState.right === 'body') {
        initializeBodyControls();
        initializeBackgroundControls();
        initializeCameraControls();
      } else if (sidebarState.right === 'soul') {
        initializeSoulControls();
      }
    }
  }, 100);
};

// Update swap button labels
function updateSwapButtons() {
  const leftBtn = document.getElementById('left-swap-text');
  const rightBtn = document.getElementById('right-swap-text');
  
  if (leftBtn) {
    leftBtn.textContent = `→ ${sectionLabels[sidebarState.hidden]}`;
  }
  if (rightBtn) {
    rightBtn.textContent = `${sectionLabels[sidebarState.hidden]} ←`;
  }
}

// Initialize Soul controls with current values
function initializeSoulControls() {
  if (!window.kwami || !window.kwami.soul) return;
  
  const nameInput = document.getElementById('soul-name');
  const personalityInput = document.getElementById('soul-personality');
  const systemPromptInput = document.getElementById('soul-system-prompt');
  const responseLengthInput = document.getElementById('soul-response-length');
  const emotionalToneInput = document.getElementById('soul-emotional-tone');
  const nameDisplay = document.getElementById('personality-name');
  
  // Populate with current values
  if (nameInput && window.kwami.soul.config.name) {
    nameInput.value = window.kwami.soul.config.name;
  }
  if (personalityInput && window.kwami.soul.config.personality) {
    personalityInput.value = window.kwami.soul.config.personality;
  }
  if (systemPromptInput && window.kwami.soul.config.systemPrompt) {
    systemPromptInput.value = window.kwami.soul.config.systemPrompt;
  }
  if (responseLengthInput && window.kwami.soul.config.responseLength) {
    responseLengthInput.value = window.kwami.soul.config.responseLength;
  }
  if (emotionalToneInput && window.kwami.soul.config.emotionalTone) {
    emotionalToneInput.value = window.kwami.soul.config.emotionalTone;
  }
  if (nameDisplay && window.kwami.soul.config.name) {
    nameDisplay.textContent = window.kwami.soul.config.name;
  }
}

// Soul configuration function
window.applySoulConfig = function() {
  const name = document.getElementById('soul-name')?.value || 'Kwami';
  const personality = document.getElementById('soul-personality')?.value || '';
  const systemPrompt = document.getElementById('soul-system-prompt')?.value || '';
  const responseLength = document.getElementById('soul-response-length')?.value || 'medium';
  const emotionalTone = document.getElementById('soul-emotional-tone')?.value || 'warm';
  
  if (window.kwami && window.kwami.soul) {
    window.kwami.soul.config.name = name;
    window.kwami.soul.config.personality = personality;
    window.kwami.soul.config.systemPrompt = systemPrompt;
    window.kwami.soul.config.responseLength = responseLength;
    window.kwami.soul.config.emotionalTone = emotionalTone;
    
    // Update personality name display if it exists
    const nameDisplay = document.getElementById('personality-name');
    if (nameDisplay) {
      nameDisplay.textContent = name;
    }
    
    updateStatus(`✅ Soul configuration applied for ${name}!`);
  }
};

// Default values for body parameters
const DEFAULT_VALUES = {
  spikes: { x: 0.2, y: 0.2, z: 0.2 },
  time: { x: 1, y: 1, z: 1 },
  rotation: { x: 0, y: 0, z: 0 },
  colors: { x: '#ff0066', y: '#00ff66', z: '#6600ff' },
  scale: 4.0,
  resolution: 180,
  shininess: 50,
  wireframe: false,
  skin: 'tricolor'
};

// Default background settings
const DEFAULT_BACKGROUND = {
  type: 'gradient',
  colors: ['#667eea', '#764ba2', '#f093fb'],
  direction: 'vertical',
  opacity: 1.0
};

const BACKGROUND_IMAGES = [
  'binary-reality.jpg',
  'black-candle.jpg',
  'black-hole.jpg',
  'black-sea.jpg',
  'black-windows.jpg',
  'black.jpg',
  'galaxy.jpg',
  'galaxy2.jpg',
  'gargantua.jpg',
  'interstellar.png',
  'sahara.jpeg',
  'skinet.png',
  'skynet.png',
  'universe.jpg',
  'white-tree.jpg'
];

// Counter for background randomization clicks
let backgroundRandomizeClickCount = 0;

// Default camera position
const DEFAULT_CAMERA_POSITION = {
  x: -0.9,
  y: 7.3,
  z: -1.8
};

// Initialize sidebars first
initializeSidebars();

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
        cameraPosition: { x: -0.9, y: 7.3, z: -1.8 }
      }
    }
  });
  
  // Set initial scale after initialization
  window.kwami.body.blob.setScale(DEFAULT_VALUES.scale);

  // Enable click interaction by default
  window.kwami.body.enableBlobInteraction();

  // Initialize body controls event listeners
  initializeBodyControls();
  
  // Initialize background controls
  initializeBackgroundControls();

  // Initialize camera position controls
  initializeCameraControls();

  // Randomize blob on page load (but keep scale at 4)
  window.kwami.body.blob.setRandomBlob();
  window.kwami.body.blob.setScale(4.0);
  
  // Set camera to default position (don't randomize)
  const camera = window.kwami.body.getCamera();
  camera.position.set(DEFAULT_CAMERA_POSITION.x, DEFAULT_CAMERA_POSITION.y, DEFAULT_CAMERA_POSITION.z);
  camera.lookAt(0, 0, 0);
  
  // Update camera UI
  document.getElementById('camera-x').value = DEFAULT_CAMERA_POSITION.x;
  document.getElementById('camera-y').value = DEFAULT_CAMERA_POSITION.y;
  document.getElementById('camera-z').value = DEFAULT_CAMERA_POSITION.z;
  updateValueDisplay('camera-x-value', DEFAULT_CAMERA_POSITION.x, 1);
  updateValueDisplay('camera-y-value', DEFAULT_CAMERA_POSITION.y, 1);
  updateValueDisplay('camera-z-value', DEFAULT_CAMERA_POSITION.z, 1);
  
  // Randomize gradient background (colors, direction, opacity)
  window.randomizeBackground();
  
  // Set random background image
  const randomImage = BACKGROUND_IMAGES[Math.floor(Math.random() * BACKGROUND_IMAGES.length)];
  const bgImageSelect = document.getElementById('bg-image');
  if (bgImageSelect) {
    bgImageSelect.value = randomImage;
  }
  setBackgroundImage(randomImage);
  
  // Update all UI controls to reflect random blob state
  updateAllControlsFromBlob();

  updateStatus('✅ Kwami initialized with random appearance!');
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

// Export GLB
window.exportGLB = function() {
  if (window.kwami && window.kwami.body && window.kwami.body.blob) {
    window.kwami.body.blob.exportGLTF();
    updateStatus('💾 Downloading GLB file...');
  } else {
    showError('Kwami not initialized yet!');
  }
};

// Randomize Blob
window.randomizeBlob = function() {
  // Save current skin and scale
  const currentSkin = window.kwami.body.blob.currentSkin;
  const currentScale = 4.0;
  
  // Randomize the blob
  window.kwami.body.blob.setRandomBlob();
  
  // Restore scale to 4
  window.kwami.body.blob.setScale(currentScale);
  
  // Restore the skin
  window.kwami.body.blob.setSkin(currentSkin);
  
  // Don't randomize camera - keep it at current position
  // User can manually adjust camera with sliders or mouse controls
  
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

// Export Scene as GLB
window.exportScene = async function() {
  try {
    updateStatus('📦 Preparing export...');
    
    // Import GLTFExporter dynamically from esm.sh (properly resolves dependencies)
    const { GLTFExporter } = await import('https://esm.sh/three@0.160.0/examples/jsm/exporters/GLTFExporter.js');
    
    const exporter = new GLTFExporter();
    const scene = window.kwami.body.getScene();
    
    // Parse the entire scene with animations
    exporter.parse(
      scene,
      (result) => {
        // Create blob and download
        const blob = new Blob([result], { type: 'model/gltf-binary' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `kwami-scene-${Date.now()}.glb`;
        link.click();
        
        // Cleanup
        setTimeout(() => URL.revokeObjectURL(link.href), 100);
        
        updateStatus('✅ Scene exported as GLB!');
      },
      (error) => {
        console.error('Export error:', error);
        updateStatus('❌ Export failed: ' + error.message);
      },
      {
        binary: true,
        animations: [], // Include animations if any
        includeCustomExtensions: true,
      }
    );
  } catch (error) {
    console.error('Failed to export scene:', error);
    updateStatus('❌ Export failed: ' + error.message);
  }
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
  
  // Light intensity slider
  const lightIntensitySlider = document.getElementById('light-intensity');
  if (lightIntensitySlider) {
    lightIntensitySlider.addEventListener('input', (e) => {
      const value = parseFloat(e.target.value);
      blob.setLightIntensity(value);
      updateValueDisplay('light-intensity-value', value, 1);
    });
  }
  
  // Wireframe checkbox
  const wireframeCheckbox = document.getElementById('wireframe');
  if (wireframeCheckbox) {
    wireframeCheckbox.addEventListener('change', (e) => {
      blob.setWireframe(e.target.checked);
    });
  }
  
  // Click interaction checkbox
  const clickInteractionCheckbox = document.getElementById('click-interaction');
  if (clickInteractionCheckbox) {
    clickInteractionCheckbox.addEventListener('change', (e) => {
      if (e.target.checked) {
        window.kwami.body.enableBlobInteraction();
        updateStatus('👆 Click interaction enabled - Click the blob!');
      } else {
        window.kwami.body.disableBlobInteraction();
        updateStatus('🚫 Click interaction disabled');
      }
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
  
  // Touch strength slider
  const touchStrengthSlider = document.getElementById('touch-strength');
  if (touchStrengthSlider) {
    touchStrengthSlider.addEventListener('input', (e) => {
      const value = parseFloat(e.target.value);
      blob.touchStrength = value;
      updateValueDisplay('touch-strength-value', value, 1);
    });
  }
  
  // Touch duration slider
  const touchDurationSlider = document.getElementById('touch-duration');
  if (touchDurationSlider) {
    touchDurationSlider.addEventListener('input', (e) => {
      const value = parseInt(e.target.value);
      blob.touchDuration = value;
      updateValueDisplay('touch-duration-value', value, 0);
    });
  }
  
  // Max touches slider
  const maxTouchesSlider = document.getElementById('max-touches');
  if (maxTouchesSlider) {
    maxTouchesSlider.addEventListener('input', (e) => {
      const value = parseInt(e.target.value);
      blob.maxTouchPoints = value;
      updateValueDisplay('max-touches-value', value, 0);
    });
  }
  
  // Transition speed slider
  const transitionSpeedSlider = document.getElementById('transition-speed');
  if (transitionSpeedSlider) {
    transitionSpeedSlider.addEventListener('input', (e) => {
      const value = parseFloat(e.target.value);
      blob.transitionSpeed = value;
      updateValueDisplay('transition-speed-value', value, 2);
    });
  }
  
  // Thinking duration slider
  const thinkingDurationSlider = document.getElementById('thinking-duration');
  if (thinkingDurationSlider) {
    thinkingDurationSlider.addEventListener('input', (e) => {
      const value = parseInt(e.target.value);
      blob.thinkingDuration = value * 1000; // Convert to milliseconds
      updateValueDisplay('thinking-duration-value', value, 0);
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
  // Random color generator
  const randomColor = () => '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
  
  // Increment click counter
  backgroundRandomizeClickCount++;
  
  // Always use gradient
  document.getElementById('bg-type').value = 'gradient';
  
  // Show gradient controls
  document.getElementById('gradient-controls').style.display = 'block';
  document.getElementById('solid-controls').style.display = 'none';
  document.getElementById('opacity-control').style.display = 'block';
  
  // Randomize gradient colors
  document.getElementById('bg-color-1').value = randomColor();
  document.getElementById('bg-color-2').value = randomColor();
  document.getElementById('bg-color-3').value = randomColor();
  
  // Random direction
  const directions = ['vertical', 'horizontal', 'radial'];
  document.getElementById('bg-direction').value = directions[Math.floor(Math.random() * directions.length)];
  
  // Opacity pattern: 1, 1, <1, 1, 1, <1, ...
  let opacity;
  if (backgroundRandomizeClickCount % 3 === 0) {
    // Every third click: random opacity less than 1.0 (between 0.3 and 0.9)
    opacity = (Math.random() * 0.6 + 0.3).toFixed(2);
  } else {
    // First and second clicks: full opacity
    opacity = '1.00';
  }
  
  document.getElementById('bg-opacity').value = opacity;
  updateValueDisplay('bg-opacity-value', opacity, 2);
  
  applyBackground();
  updateStatus('🎲 Background randomized!');
};

// Set background image
function setBackgroundImage(imageName) {
  const bgImageElement = document.getElementById('background-image');
  if (!bgImageElement) return;
  
  if (imageName && imageName !== '') {
    bgImageElement.style.backgroundImage = `url('assets/${imageName}')`;
    updateStatus(`🖼️ Background image set to ${imageName}`);
  } else {
    bgImageElement.style.backgroundImage = 'none';
    updateStatus('Background image removed');
  }
}

// Randomize background image
window.randomizeBackgroundImage = function() {
  const randomImage = BACKGROUND_IMAGES[Math.floor(Math.random() * BACKGROUND_IMAGES.length)];
  
  // Set the select dropdown value
  const bgImageSelect = document.getElementById('bg-image');
  if (bgImageSelect) {
    bgImageSelect.value = randomImage;
  }
  
  setBackgroundImage(randomImage);
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
  
  // Reset background image
  const bgImageSelect = document.getElementById('bg-image');
  if (bgImageSelect) {
    bgImageSelect.value = '';
  }
  setBackgroundImage('');
  
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
      } else if (type === 'transparent') {
        gradientControls.style.display = 'none';
        solidControls.style.display = 'none';
        opacityControl.style.display = 'none';
        
        // Auto-select a random background image if none is selected
        const bgImageSelect = document.getElementById('bg-image');
        if (bgImageSelect && (!bgImageSelect.value || bgImageSelect.value === '')) {
          window.randomizeBackgroundImage();
        }
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
  
  // Background image selector
  const bgImageSelect = document.getElementById('bg-image');
  if (bgImageSelect) {
    bgImageSelect.addEventListener('change', (e) => {
      setBackgroundImage(e.target.value);
    });
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


// Test thinking mode function
window.testThinking = function() {
  if (window.kwami) {
    window.kwami.body.startThinking();
    updateStatus('🤔 Started thinking mode (10 seconds)');
  }
};

// Test listening mode function
window.testListening = function() {
  if (window.kwami && window.kwami.body.blob) {
    if (window.kwami.body.blob.isListening) {
      window.kwami.body.blob.stopListening();
      updateStatus('🔇 Stopped listening mode');
    } else {
      window.kwami.body.blob.startListening();
      updateStatus('👂 Started listening mode');
    }
  } else {
    showError('Kwami not initialized yet!');
  }
};

// ============================================================================
// Audio Effects Configuration
// ============================================================================

// Store audio effect parameters globally
window.audioEffects = {
  bassSpike: 0.3,
  midSpike: 0.4,
  highSpike: 0.2,
  midTime: 0.5,
  highTime: 0.8,
  ultraTime: 0.3,
  enabled: true
};

// Initialize audio effect controls
function initializeAudioEffects() {
  // Bass → Spikes
  const audioBassSpike = document.getElementById('audio-bass-spike');
  if (audioBassSpike) {
    audioBassSpike.addEventListener('input', (e) => {
      window.audioEffects.bassSpike = parseFloat(e.target.value);
      updateValueDisplay('audio-bass-spike-value', e.target.value, 2);
    });
  }
  
  // Mid → Spikes
  const audioMidSpike = document.getElementById('audio-mid-spike');
  if (audioMidSpike) {
    audioMidSpike.addEventListener('input', (e) => {
      window.audioEffects.midSpike = parseFloat(e.target.value);
      updateValueDisplay('audio-mid-spike-value', e.target.value, 2);
    });
  }
  
  // High → Spikes
  const audioHighSpike = document.getElementById('audio-high-spike');
  if (audioHighSpike) {
    audioHighSpike.addEventListener('input', (e) => {
      window.audioEffects.highSpike = parseFloat(e.target.value);
      updateValueDisplay('audio-high-spike-value', e.target.value, 2);
    });
  }
  
  // Mid → Time
  const audioMidTime = document.getElementById('audio-mid-time');
  if (audioMidTime) {
    audioMidTime.addEventListener('input', (e) => {
      window.audioEffects.midTime = parseFloat(e.target.value);
      updateValueDisplay('audio-mid-time-value', e.target.value, 1);
    });
  }
  
  // High → Time
  const audioHighTime = document.getElementById('audio-high-time');
  if (audioHighTime) {
    audioHighTime.addEventListener('input', (e) => {
      window.audioEffects.highTime = parseFloat(e.target.value);
      updateValueDisplay('audio-high-time-value', e.target.value, 1);
    });
  }
  
  // Ultra → Time
  const audioUltraTime = document.getElementById('audio-ultra-time');
  if (audioUltraTime) {
    audioUltraTime.addEventListener('input', (e) => {
      window.audioEffects.ultraTime = parseFloat(e.target.value);
      updateValueDisplay('audio-ultra-time-value', e.target.value, 1);
    });
  }
  
  // FFT Size selector
  const fftSizeSelect = document.getElementById('fft-size');
  if (fftSizeSelect) {
    fftSizeSelect.addEventListener('change', (e) => {
      const fftSize = parseInt(e.target.value);
      if (window.kwami && window.kwami.body.audio) {
        const analyser = window.kwami.body.audio.getAnalyser();
        if (analyser) {
          analyser.fftSize = fftSize;
        }
      }
    });
  }
  
  // Smoothing slider
  const smoothingSlider = document.getElementById('smoothing');
  if (smoothingSlider) {
    smoothingSlider.addEventListener('input', (e) => {
      const smoothing = parseFloat(e.target.value);
      updateValueDisplay('smoothing-value', smoothing, 2);
      if (window.kwami && window.kwami.body.audio) {
        const analyser = window.kwami.body.audio.getAnalyser();
        if (analyser) {
          analyser.smoothingTimeConstant = smoothing;
        }
      }
    });
  }
  
  // Audio Reactive toggle
  const audioReactiveToggle = document.getElementById('audio-reactive');
  if (audioReactiveToggle) {
    audioReactiveToggle.addEventListener('change', (e) => {
      window.audioEffects.enabled = e.target.checked;
      updateStatus(e.target.checked ? '🎵 Audio reactivity enabled' : '🔇 Audio reactivity disabled');
    });
  }
}

// Initialize audio effects when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeAudioEffects);
} else {
  initializeAudioEffects();
}

// Monitor state changes, camera position, and listening/thinking modes
setInterval(() => {
  if (window.kwami) {
    // Update state with listening/thinking indicators
    const state = window.kwami.getState();
    const isListening = window.kwami.body.isListening();
    const isThinking = window.kwami.body.isThinking();
    
    if (isThinking) {
      updateStateIndicator('thinking');
      // Show thinking status
      const stateText = document.getElementById('state-text');
      if (stateText && !stateText.textContent.includes('🤔')) {
        stateText.textContent = '🤔 THINKING';
      }
    } else if (isListening) {
      updateStateIndicator('listening');
      // Show listening status
      const stateText = document.getElementById('state-text');
      if (stateText && !stateText.textContent.includes('🎤')) {
        stateText.textContent = '🎤 LISTENING';
      }
    } else {
      updateStateIndicator(state);
    }
    
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

// ============================================================================
// Audio Player
// ============================================================================

let audioPlayerElement = null;
let isAudioPlaying = false;

// Initialize audio player
function initializeAudioPlayer() {
  const uploadBtn = document.getElementById('upload-audio-btn');
  const audioFileInput = document.getElementById('audio-file');
  const playPauseBtn = document.getElementById('play-pause-btn');
  const volumeSlider = document.getElementById('volume-slider');
  
  // Upload button click
  uploadBtn.addEventListener('click', () => {
    audioFileInput.click();
  });
  
  // File selection
  audioFileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      loadAudioFile(file);
    }
  });
  
  // Play/Pause button
  playPauseBtn.addEventListener('click', () => {
    if (!audioPlayerElement) return;
    
    if (isAudioPlaying) {
      pauseAudio();
    } else {
      playAudio();
    }
  });
  
  // Volume control
  volumeSlider.addEventListener('input', (e) => {
    const volume = e.target.value / 100;
    if (window.kwami && window.kwami.body.audio) {
      window.kwami.body.audio.setVolume(volume);
    }
    
    // Update volume icon
    const volumeIcon = document.getElementById('volume-icon');
    if (volume === 0) {
      volumeIcon.textContent = '🔇';
    } else if (volume < 0.5) {
      volumeIcon.textContent = '🔉';
    } else {
      volumeIcon.textContent = '🔊';
    }
  });
}

// Load audio file
async function loadAudioFile(file) {
  try {
    const arrayBuffer = await file.arrayBuffer();
    
    if (window.kwami && window.kwami.body.audio) {
      // Load audio into Kwami's audio system
      await window.kwami.body.audio.loadAudio(arrayBuffer);
      
      // Get the audio element from Kwami
      audioPlayerElement = window.kwami.body.audio.getAudioElement();
      
      // Update UI
      document.getElementById('audio-name').textContent = file.name;
      document.getElementById('play-pause-btn').disabled = false;
      
      // Add time update listener
      audioPlayerElement.addEventListener('timeupdate', updateAudioTime);
      audioPlayerElement.addEventListener('ended', onAudioEnded);
      
      // Update total duration
      audioPlayerElement.addEventListener('loadedmetadata', () => {
        updateAudioTime();
      });
      
      updateStatus(`✅ Loaded: ${file.name}`);
    } else {
      showError('Kwami not initialized. Please initialize first.');
    }
  } catch (error) {
    showError(`Failed to load audio: ${error.message}`);
    console.error('Audio load error:', error);
  }
}

// Play audio
function playAudio() {
  if (!audioPlayerElement || !window.kwami) return;
  
  window.kwami.body.audio.play();
  isAudioPlaying = true;
  document.getElementById('play-pause-btn').textContent = '⏸️';
  updateStatus('🎵 Playing audio');
}

// Pause audio
function pauseAudio() {
  if (!audioPlayerElement || !window.kwami) return;
  
  window.kwami.body.audio.pause();
  isAudioPlaying = false;
  document.getElementById('play-pause-btn').textContent = '▶️';
  updateStatus('⏸️ Audio paused');
}

// Update audio time display
function updateAudioTime() {
  if (!audioPlayerElement) return;
  
  const current = audioPlayerElement.currentTime;
  const duration = audioPlayerElement.duration || 0;
  
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  document.getElementById('audio-time').textContent = 
    `${formatTime(current)} / ${formatTime(duration)}`;
}

// Handle audio end
function onAudioEnded() {
  isAudioPlaying = false;
  document.getElementById('play-pause-btn').textContent = '▶️';
  updateStatus('✅ Audio finished');
}

// Initialize audio player when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeAudioPlayer);
} else {
  initializeAudioPlayer();
}
