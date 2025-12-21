// @ts-nocheck
import { Kwami } from 'kwami';

import { initializeGitHubStarButton } from './features/github-stars.js';
import { initializeExportImport } from './features/export-import.js';
import { initializeKeyboardShortcuts } from './features/keyboard-shortcuts.js';
import { initializeMindControls } from './features/mind-ui.js';
import { setBlobMediaType } from './features/blob-media.js';
import { initializeCameraControls } from './features/camera-controls.js';
import {
  initializeBackgroundControls,
  setBackgroundImage,
  setMediaType,
} from './features/background.js';

import { initializeAudioPlayer } from './ui/audio-player.js';
import { initializeColorPicker } from './ui/color-picker.js';
import { showError, updateError, updateStatus } from './ui/messages.js';
import { initializeSidebars, setSidebarRenderHook } from './ui/sidebar-manager.js';
import { initializeThemeToggle } from './ui/theme-manager.js';

window.kwami = null;

// Hook sidebar renders to re-bind section-specific DOM listeners when templates swap.
setSidebarRenderHook((_side, section) => {
  if (!(window as any).kwami) {
    return;
  }

  if (section === 'body') {
    initializeBodyControls();
    initializeBackgroundControls();
    initializeCameraControls();
  } else if (section === 'soul') {
    initializeSoulControls();
  } else if (section === 'mind') {
    initializeMindControls();
  }
});

// Initialize modular UI systems (do not require Kwami instance)
initializeSidebars();
initializeGitHubStarButton();
initializeThemeToggle();
initializeColorPicker();
initializeKeyboardShortcuts();
initializeExportImport();

// Initialize Soul controls with current values
function initializeSoulControls() {
  if (!window.kwami || !window.kwami.soul) return;
  
  const nameInput = document.getElementById('soul-name');
  const personalityInput = document.getElementById('soul-personality');
  const systemPromptInput = document.getElementById('soul-system-prompt');
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
  if (nameDisplay && window.kwami.soul.config.name) {
    nameDisplay.textContent = window.kwami.soul.config.name;
  }
}

// Soul configuration function
// Auto-update Soul configuration as user types (debounced)
let soulUpdateTimeout;
window.autoUpdateSoul = function() {
  clearTimeout(soulUpdateTimeout);
  soulUpdateTimeout = setTimeout(() => {
    if (!window.kwami || !window.kwami.soul) return;
    
    const name = document.getElementById('soul-name')?.value || 'Kwami';
    const personality = document.getElementById('soul-personality')?.value || '';
    const systemPrompt = document.getElementById('soul-system-prompt')?.value || '';
    
    window.kwami.soul.updateConfig({
      name,
      personality,
      systemPrompt
    });
    
    // Update display
    const nameDisplay = document.getElementById('personality-name');
    if (nameDisplay) nameDisplay.textContent = name;
  }, 300);
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
  skinSubtype: 'poles',
  opacity: 1,
};

const SKIN_COLLECTION_NAME = 'Tricolor';

const SKIN_SUBTYPE_LABELS = {
  poles: 'Poles',
  donut: 'Donut',
  vintage: 'Vintage',
};

const SKIN_RANDOMIZATION_TEMPLATE = [
  // Keep a similar weighting as before: donut-heavy, then poles, then vintage.
  'donut',
  'donut',
  'donut',
  'donut',
  'donut',
  'poles',
  'poles',
  'poles',
  'poles',
  'vintage',
];

let skinRandomizationQueue = [];

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function refillSkinRandomizationQueue() {
  skinRandomizationQueue = shuffleArray([...SKIN_RANDOMIZATION_TEMPLATE]);
}

function getCanonicalSkinSubtype(rawSkin) {
  if (!rawSkin) {
    return 'poles';
  }

  const key = String(rawSkin).toLowerCase();
  if (key in SKIN_SUBTYPE_LABELS) {
    return key;
  }

  return 'poles';
}

function getSkinDisplayName(rawSkinSubtype) {
  const canonical = getCanonicalSkinSubtype(rawSkinSubtype);
  const variantLabel = SKIN_SUBTYPE_LABELS[canonical] || canonical;
  return `${SKIN_COLLECTION_NAME} - ${variantLabel}`;
}

function applySkinToBlob(rawSkinSubtype) {
  const subtype = getCanonicalSkinSubtype(rawSkinSubtype);
  const blob = window.kwami?.body?.blob;
  if (!blob) {
    return null;
  }

  blob.setSkin({ skin: 'tricolor', subtype });

  const skinSelect = document.getElementById('skin-type');
  if (skinSelect) {
    skinSelect.value = subtype;
  }

  return subtype;
}

function getNextRandomizedSkinSubtype() {
  if (skinRandomizationQueue.length === 0) {
    refillSkinRandomizationQueue();
  }

  return skinRandomizationQueue.shift() || 'poles';
}

refillSkinRandomizationQueue();

// Background image options (used for initial random selection)
const BACKGROUND_IMAGES = [
  '/img/bg/alaska.jpeg',
  '/img/bg/binary-reality.jpg',
  '/img/bg/black-candle.jpg',
  '/img/bg/black-hole.jpg',
  '/img/bg/black-sea.jpg',
  '/img/bg/black-windows.jpg',
  '/img/bg/black.jpg',
  '/img/bg/colors.jpeg',
  '/img/bg/galaxy.jpg',
  '/img/bg/galaxy2.jpg',
  '/img/bg/galaxy3.jpg',
  '/img/bg/galaxy4.jpg',
  '/img/bg/gargantua.jpg',
  '/img/bg/interstellar.png',
  '/img/bg/islan.jpg',
  '/img/bg/lake.jpg',
  '/img/bg/mountain.jpeg',
  '/img/bg/paisaje.jpg',
  '/img/bg/pik.jpg',
  '/img/bg/planet.jpg',
  '/img/bg/planet2.jpg',
  '/img/bg/planet3.jpg',
  '/img/bg/sahara.jpeg',
  '/img/bg/skinet.png',
  '/img/bg/skynet.png',
  '/img/bg/universe.jpg',
  '/img/bg/white-tree.jpg',
];

// Default camera position
const DEFAULT_CAMERA_POSITION = {
  x: -0.9,
  y: 7.3,
  z: -1.8,
};

// NOTE: This is palette (blob) randomization, not background.
// Kept here for now; should eventually move to a body-focused feature module.
window.randomizePaletteColors = function randomizePaletteColors() {
  const randomColor = () => '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
  const colors = [randomColor(), randomColor(), randomColor()];

  const colorX = document.getElementById('color-x');
  const colorY = document.getElementById('color-y');
  const colorZ = document.getElementById('color-z');

  if (colorX) {
    colorX.value = colors[0];
    colorX.dispatchEvent(new Event('input', { bubbles: true }));
  }
  if (colorY) {
    colorY.value = colors[1];
    colorY.dispatchEvent(new Event('input', { bubbles: true }));
  }
  if (colorZ) {
    colorZ.value = colors[2];
    colorZ.dispatchEvent(new Event('input', { bubbles: true }));
  }

  updateStatus('🎨 Palette colors randomized!');
};

// Initialize Kwami
const canvas = document.getElementById('kwami-canvas');

try {
  window.kwami = new Kwami(canvas, {
    body: {
      initialSkin: { skin: 'tricolor', subtype: 'poles' },
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
  
  window.kwami.body.setBackgroundTransparent();
  window.kwami.body.clearBackgroundMedia?.();
  
  // Set initial scale after initialization
  window.kwami.body.blob.setScale(DEFAULT_VALUES.scale);

  // Update version display dynamically
  const versionDisplay = document.getElementById('version-display');
  if (versionDisplay) {
    versionDisplay.textContent = `v${Kwami.getVersion()}`;
  }

  // Re-render sidebars now that Kwami exists so section-specific listeners bind correctly.
  initializeSidebars();

  initializeAudioPlayer();

  // Skill definitions - declared here before initializeSkills() call to avoid temporal dead zone issues
  window.skillDefinitions = {
    'minimize-top-right': {
      name: 'Minimize to Top Right',
      description: 'Minimizes Kwami and moves it to the top-right corner',
      actions: 2,
      autoReverse: false
    },
    'rainbow-transition': {
      name: 'Rainbow Transition',
      description: 'Cycles through rainbow colors with smooth transitions',
      actions: 7,
      autoReverse: false
    },
    'energetic-mode': {
      name: 'Energetic Mode',
      description: 'High-energy mode with faster movements and vibrant colors',
      actions: 5,
      autoReverse: true
    },
    'calm-meditation': {
      name: 'Calm Meditation',
      description: 'Calming mode with slow movements and soothing colors',
      actions: 6,
      autoReverse: false
    },
    'focus-session': {
      name: 'Focus Session',
      description: 'Pomodoro-style focus mode with greeting and minimization',
      actions: 5,
      autoReverse: false
    },
    'party-mode': {
      name: 'Party Mode',
      description: 'Celebration mode with rapid color changes and energetic movement',
      actions: 10,
      autoReverse: false
    }
  };

  // Create conversation callbacks for blob interaction
  const conversationCallbacks = {
    onAgentResponse: (text) => {
      // Don't update status for connection messages
      if (!text.includes('🎙️ Connected') && !text.includes('🎙️ Conversation started')) {
        updateStatus('🤖 Agent is speaking...');
      }
      const transcriptDiv = document.getElementById('conversation-transcript');
      if (transcriptDiv) {
        const entry = document.createElement('div');
        entry.style.cssText = 'margin: 5px 0; padding: 5px; background: #e3e8ff; border-radius: 4px;';
        entry.innerHTML = `<strong>🤖 Agent:</strong> ${text}`;
        transcriptDiv.appendChild(entry);
        transcriptDiv.scrollTop = transcriptDiv.scrollHeight;
        transcriptDiv.style.display = 'block';
      }
    },
    onUserTranscript: (text) => {
      const transcriptDiv = document.getElementById('conversation-transcript');
      if (transcriptDiv) {
        const entry = document.createElement('div');
        entry.style.cssText = 'margin: 5px 0; padding: 5px; background: #fff; border-radius: 4px;';
        entry.innerHTML = `<strong>👤 You:</strong> ${text}`;
        transcriptDiv.appendChild(entry);
        transcriptDiv.scrollTop = transcriptDiv.scrollHeight;
        transcriptDiv.style.display = 'block';
      }
    },
    onTurnStart: () => {
      updateStatus('🎙️ Agent is speaking...');
      // Ensure blob is in speaking state for proper animation
      if (window.kwami) {
        window.kwami.setState('speaking');
      }
    },
    onTurnEnd: () => {
      updateStatus('👂 Listening for your response...');
      // Return to listening state
      if (window.kwami) {
        window.kwami.setState('listening');
      }
    },
    onError: (error) => {
      showError('Conversation error: ' + error.message);
      window.stopConversation?.();
    }
  };
  
  // Store callbacks globally for reuse
  window.conversationCallbacks = conversationCallbacks;
  
  // Enable click interaction by default (includes double-click for conversations)
  window.kwami.enableBlobInteraction(conversationCallbacks);

  // Initialize skills system
  initializeSkills();

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
  
  // Set random background image (this will make the scene transparent)
  const randomImage = BACKGROUND_IMAGES[Math.floor(Math.random() * BACKGROUND_IMAGES.length)];
  const imageSelect = document.getElementById('bg-media-image');
  if (imageSelect) {
    imageSelect.value = randomImage;
  }
  setMediaType('image', { silent: true });
  setBackgroundImage(randomImage, { silent: true });
  
  // Also randomize gradient colors in UI (but don't apply yet since image is showing)
  const randomColor = () => '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
  document.getElementById('bg-color-1').value = randomColor();
  document.getElementById('bg-color-2').value = randomColor();
  document.getElementById('bg-color-3').value = randomColor();
  
  // Update all UI controls to reflect random blob state
  updateAllControlsFromBlob();

  updateStatus('✅ Kwami initialized with random appearance!');
  updateStateIndicator(window.kwami.getState());
} catch (error) {
  showError('Failed to initialize Kwami: ' + error.message);
}


// Load Personality
window.loadPersonality = async function(type) {
  try {
    updateStatus(`🔄 Loading ${type} personality...`);
    
    // Use the library's preset method instead of loading JSON files
    window.kwami.soul.loadPresetPersonality(type);
    
    const config = window.kwami.soul.getConfig();
    
    // Update all Soul UI fields
    updateSoulUIFromConfig(config);
    
    // Update emotional trait sliders from loaded personality
    updateEmotionalTraitSliders();
    
    updateStatus(`✅ Loaded ${config.name} personality!`);
  } catch (error) {
    showError('Failed to load personality: ' + error.message);
  }
};

// Update emotional trait value display and auto-apply
window.updateEmotionalTrait = function(trait, value) {
  const valueDisplay = document.getElementById(`${trait}-value`);
  if (valueDisplay) {
    valueDisplay.textContent = value;
  }
  
  // Auto-apply the trait change
  if (window.kwami && window.kwami.soul) {
    window.kwami.soul.setEmotionalTrait(trait, parseInt(value));
  }
};

// Note: Emotional traits are now auto-applied as sliders change
// This function is kept for backward compatibility but may not be needed
window.applyEmotionalTraits = function() {
  if (!window.kwami || !window.kwami.soul) {
    showError('Soul not initialized');
    return;
  }

  try {
    const emotionalTraits = {
      happiness: parseInt(document.getElementById('happiness-slider')?.value || 0),
      energy: parseInt(document.getElementById('energy-slider')?.value || 0),
      confidence: parseInt(document.getElementById('confidence-slider')?.value || 0),
      calmness: parseInt(document.getElementById('calmness-slider')?.value || 0),
      optimism: parseInt(document.getElementById('optimism-slider')?.value || 0),
      socialness: parseInt(document.getElementById('socialness-slider')?.value || 0),
      creativity: parseInt(document.getElementById('creativity-slider')?.value || 0),
      patience: parseInt(document.getElementById('patience-slider')?.value || 0),
      empathy: parseInt(document.getElementById('empathy-slider')?.value || 0),
      curiosity: parseInt(document.getElementById('curiosity-slider')?.value || 0)
    };

    window.kwami.soul.setEmotionalTraits(emotionalTraits);
    updateStatus('✅ Emotional traits applied!');
  } catch (error) {
    showError('Failed to apply emotional traits: ' + error.message);
  }
};

// Reset all emotional traits to neutral (0)
window.resetEmotionalTraits = function() {
  const traits = ['happiness', 'energy', 'confidence', 'calmness', 'optimism', 
                  'socialness', 'creativity', 'patience', 'empathy', 'curiosity'];
  
  traits.forEach(trait => {
    const slider = document.getElementById(`${trait}-slider`);
    const valueDisplay = document.getElementById(`${trait}-value`);
    
    if (slider) slider.value = 0;
    if (valueDisplay) valueDisplay.textContent = '0';
  });

  if (window.kwami && window.kwami.soul) {
    window.kwami.soul.setEmotionalTraits({
      happiness: 0,
      energy: 0,
      confidence: 0,
      calmness: 0,
      optimism: 0,
      socialness: 0,
      creativity: 0,
      patience: 0,
      empathy: 0,
      curiosity: 0
    });
  }

  updateStatus('🔄 Emotional traits reset to neutral');
};

// Update sliders to match current Soul emotional traits
function updateEmotionalTraitSliders() {
  if (!window.kwami || !window.kwami.soul) return;

  const traits = window.kwami.soul.getEmotionalTraits();
  if (!traits) return;

  const traitNames = ['happiness', 'energy', 'confidence', 'calmness', 'optimism', 
                      'socialness', 'creativity', 'patience', 'empathy', 'curiosity'];
  
  traitNames.forEach(traitName => {
    const value = traits[traitName] || 0;
    const slider = document.getElementById(`${traitName}-slider`);
    const valueDisplay = document.getElementById(`${traitName}-value`);
    
    if (slider) slider.value = value;
    if (valueDisplay) valueDisplay.textContent = value;
  });
}

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
  if (window.kwami && window.kwami.body) {
    window.kwami.body.exportAsGLB();
    updateStatus('💾 Downloading GLB file...');
  } else {
    showError('Kwami not initialized yet!');
  }
};

// Randomize Blob
window.randomizeBlob = function() {
  if (window.kwami && window.kwami.body) {
    window.kwami.body.randomizeBlob();
    const appliedSkinSubtype = applySkinToBlob(getNextRandomizedSkinSubtype());
    updateAllControlsFromBlob();
    const skinLabel = appliedSkinSubtype
      ? getSkinDisplayName(appliedSkinSubtype)
      : getSkinDisplayName('poles');
    updateStatus(`🎲 Blob randomized! 🎨 Skin: ${skinLabel}`);
  }
};

// Reset to Defaults
window.resetToDefaults = function() {
  if (window.kwami && window.kwami.body) {
    // Reset blob to defaults
    window.kwami.body.resetBlobToDefaults();
  
  // Reset camera position
    window.kwami.body.resetCameraPosition();
    
    // Update camera UI
    const pos = window.kwami.body.getCameraPosition();
    document.getElementById('camera-x').value = pos.x;
    document.getElementById('camera-y').value = pos.y;
    document.getElementById('camera-z').value = pos.z;
    updateValueDisplay('camera-x-value', pos.x, 1);
    updateValueDisplay('camera-y-value', pos.y, 1);
    updateValueDisplay('camera-z-value', pos.z, 1);
  
  // Update UI
  updateAllControlsFromBlob();
  updateStatus('🔄 Reset to defaults!');
  }
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
  const amplitude = blob.getAmplitude();
  const time = blob.getTime();
  const rotation = blob.getRotation();
  const colors = blob.getColors();
  const scale = blob.getScale();
  const wireframe = blob.getWireframe();
  const skinSelection = blob.getCurrentSkin();
  const skinSubtype = skinSelection?.subtype || 'poles';
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
  
  // Update amplitude
  ['x', 'y', 'z'].forEach(axis => {
    const slider = document.getElementById(`amplitude-${axis}`);
    const display = document.getElementById(`amplitude-${axis}-value`);
    if (slider && display) {
      slider.value = amplitude[axis];
      display.textContent = formatValue(amplitude[axis], 1);
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

  const opacitySlider = document.getElementById('blob-opacity');
  if (opacitySlider) {
    const opacityDisplay = document.getElementById('blob-opacity-value');
    const opacity = blob.getOpacity();
    opacitySlider.value = opacity.toString();
    if (opacityDisplay) {
      opacityDisplay.textContent = formatValue(opacity, 2);
    }
  }

  const camera = window.kwami.body.getCamera();
  const cameraXSlider = document.getElementById('camera-x');
  if (cameraXSlider) {
    cameraXSlider.value = camera.position.x.toString();
    updateValueDisplay('camera-x-value', camera.position.x, 1);
  }
  const cameraYSlider = document.getElementById('camera-y');
  if (cameraYSlider) {
    cameraYSlider.value = camera.position.y.toString();
    updateValueDisplay('camera-y-value', camera.position.y, 1);
  }
  const cameraZSlider = document.getElementById('camera-z');
  if (cameraZSlider) {
    cameraZSlider.value = camera.position.z.toString();
    updateValueDisplay('camera-z-value', camera.position.z, 1);
  }
  
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
  const lightIntensitySlider = document.getElementById('light-intensity');
  if (lightIntensitySlider) {
    lightIntensitySlider.value = blob.lightIntensity.toString();
    updateValueDisplay('light-intensity-value', blob.lightIntensity, 1);
  }
  
  // Update wireframe
  const wireframeCheckbox = document.getElementById('wireframe');
  if (wireframeCheckbox) {
    wireframeCheckbox.checked = wireframe;
  }
  
  // Update skin
  const skinSelect = document.getElementById('skin-type');
  if (skinSelect) {
    skinSelect.value = skinSubtype;
  }

  const touchStrengthSlider = document.getElementById('touch-strength');
  if (touchStrengthSlider) {
    touchStrengthSlider.value = blob.touchStrength.toString();
    updateValueDisplay('touch-strength-value', blob.touchStrength, 1);
  }

  const touchDurationSlider = document.getElementById('touch-duration');
  if (touchDurationSlider) {
    const durationSeconds = blob.touchDuration;
    touchDurationSlider.value = durationSeconds.toString();
    updateValueDisplay('touch-duration-value', durationSeconds, 0);
  }

  const maxTouchesSlider = document.getElementById('max-touches');
  if (maxTouchesSlider) {
    maxTouchesSlider.value = blob.maxTouchPoints.toString();
    updateValueDisplay('max-touches-value', blob.maxTouchPoints, 0);
  }

  const audioConfig = blob.audioEffects;
  window.audioEffects = {
    ...window.audioEffects,
    bassSpike: audioConfig.bassSpike,
    midSpike: audioConfig.midSpike,
    highSpike: audioConfig.highSpike,
    midTime: audioConfig.midTime,
    highTime: audioConfig.highTime,
    ultraTime: audioConfig.ultraTime,
    enabled: audioConfig.enabled,
    timeEnabled: audioConfig.timeEnabled,
    reactivity: audioConfig.reactivity ?? 1.9,
    sensitivity: audioConfig.sensitivity ?? 0.075,
    breathing: audioConfig.breathing ?? 0.035,
  };
  const bassSlider = document.getElementById('audio-bass-spike');
  if (bassSlider) {
    bassSlider.value = audioConfig.bassSpike.toString();
    updateValueDisplay('audio-bass-spike-value', audioConfig.bassSpike, 2);
  }
  const midSlider = document.getElementById('audio-mid-spike');
  if (midSlider) {
    midSlider.value = audioConfig.midSpike.toString();
    updateValueDisplay('audio-mid-spike-value', audioConfig.midSpike, 2);
  }
  const highSlider = document.getElementById('audio-high-spike');
  if (highSlider) {
    highSlider.value = audioConfig.highSpike.toString();
    updateValueDisplay('audio-high-spike-value', audioConfig.highSpike, 2);
  }
  const reactivitySlider = document.getElementById('audio-reactivity');
  if (reactivitySlider) {
    const reactivityValue = audioConfig.reactivity ?? window.audioEffects.reactivity;
    reactivitySlider.value = reactivityValue.toString();
    updateValueDisplay('audio-reactivity-value', reactivityValue, 2);
  }
  const sensitivitySlider = document.getElementById('audio-sensitivity');
  if (sensitivitySlider) {
    const sensitivityValue = audioConfig.sensitivity ?? window.audioEffects.sensitivity;
    sensitivitySlider.value = sensitivityValue.toString();
    updateValueDisplay('audio-sensitivity-value', sensitivityValue, 2);
  }
  const breathingSlider = document.getElementById('audio-breathing');
  if (breathingSlider) {
    const breathingValue = audioConfig.breathing ?? window.audioEffects.breathing;
    breathingSlider.value = breathingValue.toString();
    updateValueDisplay('audio-breathing-value', breathingValue, 2);
  }
  const midTimeSlider = document.getElementById('audio-mid-time');
  if (midTimeSlider) {
    midTimeSlider.value = audioConfig.midTime.toString();
    updateValueDisplay('audio-mid-time-value', audioConfig.midTime, 1);
  }
  const highTimeSlider = document.getElementById('audio-high-time');
  if (highTimeSlider) {
    highTimeSlider.value = audioConfig.highTime.toString();
    updateValueDisplay('audio-high-time-value', audioConfig.highTime, 1);
  }
  const ultraTimeSlider = document.getElementById('audio-ultra-time');
  if (ultraTimeSlider) {
    ultraTimeSlider.value = audioConfig.ultraTime.toString();
    updateValueDisplay('audio-ultra-time-value', audioConfig.ultraTime, 1);
  }
  const audioReactiveToggle = document.getElementById('audio-reactive');
  if (audioReactiveToggle) {
    audioReactiveToggle.checked = audioConfig.enabled;
  }
  const audioTimeToggle = document.getElementById('audio-time-enabled');
  if (audioTimeToggle) {
    audioTimeToggle.checked = audioConfig.timeEnabled;
  }
}

// Store original blob parameters for restoring after effects
let originalBlobParams = null;
let isRelaxed = false;

// Store original blob parameters
function saveOriginalBlobParams() {
  const blob = window.kwami?.body?.blob;
  if (!blob) return;

  originalBlobParams = {
    spikeX: blob.spikeX,
    spikeY: blob.spikeY,
    spikeZ: blob.spikeZ,
    amplitudeX: blob.amplitudeX,
    amplitudeY: blob.amplitudeY,
    amplitudeZ: blob.amplitudeZ,
    timeX: blob.timeX,
    timeY: blob.timeY,
    timeZ: blob.timeZ,
    scale: blob.getScale(),
  };
}

// Restore original blob parameters
function restoreOriginalBlobParams() {
  const blob = window.kwami?.body?.blob;
  if (!blob || !originalBlobParams) return;

  blob.setSpikes(originalBlobParams.spikeX, originalBlobParams.spikeY, originalBlobParams.spikeZ);
  blob.setAmplitudes(originalBlobParams.amplitudeX, originalBlobParams.amplitudeY, originalBlobParams.amplitudeZ);
  blob.setTime(originalBlobParams.timeX, originalBlobParams.timeY, originalBlobParams.timeZ);
  blob.setScale(originalBlobParams.scale);

  // Update UI sliders
  updateValueDisplay('spike-x-value', originalBlobParams.spikeX, 1);
  updateValueDisplay('spike-y-value', originalBlobParams.spikeY, 1);
  updateValueDisplay('spike-z-value', originalBlobParams.spikeZ, 1);
  updateValueDisplay('amplitude-x-value', originalBlobParams.amplitudeX, 1);
  updateValueDisplay('amplitude-y-value', originalBlobParams.amplitudeY, 1);
  updateValueDisplay('amplitude-z-value', originalBlobParams.amplitudeZ, 1);
  updateValueDisplay('time-x-value', originalBlobParams.timeX, 1);
  updateValueDisplay('time-y-value', originalBlobParams.timeY, 1);
  updateValueDisplay('time-z-value', originalBlobParams.timeZ, 1);
  updateValueDisplay('scale-value', originalBlobParams.scale, 1);

  document.getElementById('spike-x').value = originalBlobParams.spikeX;
  document.getElementById('spike-y').value = originalBlobParams.spikeY;
  document.getElementById('spike-z').value = originalBlobParams.spikeZ;
  document.getElementById('amplitude-x').value = originalBlobParams.amplitudeX;
  document.getElementById('amplitude-y').value = originalBlobParams.amplitudeY;
  document.getElementById('amplitude-z').value = originalBlobParams.amplitudeZ;
  document.getElementById('time-x').value = originalBlobParams.timeX;
  document.getElementById('time-y').value = originalBlobParams.timeY;
  document.getElementById('time-z').value = originalBlobParams.timeZ;
  document.getElementById('scale').value = originalBlobParams.scale;
}

// Relax action: Make blob more rounded, less spiky, slower animation
async function relaxBlob() {
  const blob = window.kwami?.body?.blob;
  if (!blob) return;

  if (isRelaxed) {
    // Restore original parameters
    restoreOriginalBlobParams();
    isRelaxed = false;
    updateStatus('😌 Blob returned to normal state');
  } else {
    // Save current parameters if not already saved
    if (!originalBlobParams) {
      saveOriginalBlobParams();
    }

    // Apply relax effect: more rounded (lower spikes), slower animation
    const relaxParams = {
      spikeX: 0.05,
      spikeY: 0.05,
      spikeZ: 0.05,
      amplitudeX: 0.3,
      amplitudeY: 0.3,
      amplitudeZ: 0.3,
      timeX: 1.0,
      timeY: 1.0,
      timeZ: 1.0,
    };

    blob.setSpikes(relaxParams.spikeX, relaxParams.spikeY, relaxParams.spikeZ);
    blob.setAmplitudes(relaxParams.amplitudeX, relaxParams.amplitudeY, relaxParams.amplitudeZ);
    blob.setTime(relaxParams.timeX, relaxParams.timeY, relaxParams.timeZ);

    // Update UI sliders
    updateValueDisplay('spike-x-value', relaxParams.spikeX, 1);
    updateValueDisplay('spike-y-value', relaxParams.spikeY, 1);
    updateValueDisplay('spike-z-value', relaxParams.spikeZ, 1);
    updateValueDisplay('amplitude-x-value', relaxParams.amplitudeX, 1);
    updateValueDisplay('amplitude-y-value', relaxParams.amplitudeY, 1);
    updateValueDisplay('amplitude-z-value', relaxParams.amplitudeZ, 1);
    updateValueDisplay('time-x-value', relaxParams.timeX, 1);
    updateValueDisplay('time-y-value', relaxParams.timeY, 1);
    updateValueDisplay('time-z-value', relaxParams.timeZ, 1);

    document.getElementById('spike-x').value = relaxParams.spikeX;
    document.getElementById('spike-y').value = relaxParams.spikeY;
    document.getElementById('spike-z').value = relaxParams.spikeZ;
    document.getElementById('amplitude-x').value = relaxParams.amplitudeX;
    document.getElementById('amplitude-y').value = relaxParams.amplitudeY;
    document.getElementById('amplitude-z').value = relaxParams.amplitudeZ;
    document.getElementById('time-x').value = relaxParams.timeX;
    document.getElementById('time-y').value = relaxParams.timeY;
    document.getElementById('time-z').value = relaxParams.timeZ;

    isRelaxed = true;
    updateStatus('🧘 Blob is now in relaxed state - Double-click again to restore');
  }
}

// Update blob interaction with custom double-click action
function updateBlobInteractionWithCustomAction() {
  const customActionSelect = document.getElementById('custom-double-click-action');
  if (!customActionSelect) return;

  const action = customActionSelect.value;

  // Create custom callback based on selected action
  window.kwami.enableBlobInteraction(async () => {
    switch (action) {
      case 'listen':
        if (window.kwami.body.isListening()) {
          window.kwami.body.stopListening();
          window.kwami.setState('idle');
          updateStatus('👂 Stopped listening');
        } else {
          await window.kwami.body.startListening();
          updateStatus('👂 Listening mode activated');
        }
        break;
      
      case 'speak':
        if (window.kwami.getState() === 'speaking') {
          window.kwami.setState('idle');
          updateStatus('🔇 Stopped speaking');
        } else {
          window.kwami.setState('speaking');
          updateStatus('🗣️ Speaking mode activated');
        }
        break;
      
      case 'relax':
        await relaxBlob();
        break;
      
      default:
        updateStatus('⚠️ Unknown action');
    }
  });
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
  
  // Amplitude sliders
  ['x', 'y', 'z'].forEach(axis => {
    const slider = document.getElementById(`amplitude-${axis}`);
    if (slider) {
      slider.addEventListener('input', (e) => {
        const value = parseFloat(e.target.value);
        const amplitude = blob.getAmplitude();
        amplitude[axis] = value;
        blob.setAmplitude(amplitude.x, amplitude.y, amplitude.z);
        updateValueDisplay(`amplitude-${axis}-value`, value, 1);
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

  // Note: blob-opacity slider is handled in initializeBackgroundControls()
  
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
        window.kwami.enableBlobInteraction(window.conversationCallbacks);
        updateStatus('👆 Click interaction enabled - Click the blob! Double-click to start/stop conversation');
      } else {
        window.kwami.disableBlobInteraction();
        updateStatus('🚫 Click interaction disabled');
      }
    });
  }

  // Double-click conversation disable checkbox
  const disableDoubleClickCheckbox = document.getElementById('disable-double-click-conversation');
  const customActionSelector = document.getElementById('custom-action-selector-container');
  const customActionSelect = document.getElementById('custom-double-click-action');
  
  if (disableDoubleClickCheckbox && customActionSelector) {
    disableDoubleClickCheckbox.addEventListener('change', (e) => {
      if (e.target.checked) {
        customActionSelector.style.display = 'block';
        // Re-enable blob interaction with custom action
        updateBlobInteractionWithCustomAction();
        updateStatus('🎯 Double-click conversation disabled - Custom action mode enabled');
      } else {
        customActionSelector.style.display = 'none';
        
        // Restore any active effects before switching back
        if (isRelaxed) {
          restoreOriginalBlobParams();
          isRelaxed = false;
        }
        if (window.kwami.body.isListening()) {
          window.kwami.body.stopListening();
        }
        window.kwami.setState('idle');
        
        // Re-enable normal conversation interaction
        window.kwami.enableBlobInteraction(window.conversationCallbacks);
        updateStatus('💬 Double-click conversation re-enabled');
      }
    });
  }

  // Custom action selector
  if (customActionSelect) {
    customActionSelect.addEventListener('change', () => {
      updateBlobInteractionWithCustomAction();
      const actionName = customActionSelect.options[customActionSelect.selectedIndex].text;
      updateStatus(`🎯 Double-click action set to: ${actionName}`);
    });
  }
  
  // Skin type selector
  const skinSelect = document.getElementById('skin-type');
  if (skinSelect) {
    skinSelect.addEventListener('change', (e) => {
      const appliedSkinSubtype = applySkinToBlob(e.target.value);
      updateAllControlsFromBlob();
      const skinLabel = appliedSkinSubtype
        ? getSkinDisplayName(appliedSkinSubtype)
        : getSkinDisplayName('poles');
      updateStatus(`👕 Changed to ${skinLabel} skin`);
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

  // Blob Media Tabs (independent from background)
  const blobMediaTabs = document.querySelectorAll('#blob-media-tabs .media-tab');
  blobMediaTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      setBlobMediaType(tab.dataset.media);
    });
  });

  // Initialize blob media to none
  setBlobMediaType('none');
}

// Helper functions (exposed globally for agent management)
window.updateStatus = function updateStatus(message) {
  const status = document.getElementById('status');
  status.textContent = message;
  
  // Auto-clear status messages after 5 seconds
  if (message) {
    setTimeout(() => {
      if (status.textContent === message) {
        status.textContent = '';
      }
    }, 5000);
  }
}

window.showError = function showError(message) {
  const error = document.getElementById('error');
  error.textContent = message;
  
  // Auto-clear error messages after 8 seconds
  if (message) {
    setTimeout(() => {
      if (error.textContent === message) {
        error.textContent = '';
      }
    }, 8000);
  }
}

function updateStateIndicator(state) {
  const indicator = document.getElementById('state-indicator');
  const stateText = document.getElementById('state-text');
  
  // Only update if elements exist (they're commented out in HTML currently)
  if (indicator && stateText) {
    indicator.className = 'state-indicator state-' + state;
    stateText.textContent = state.toUpperCase();
  }
}

// Legacy background block removed


// Initialize agent management slider listeners
if (typeof setupAgentSliderListeners === 'function') {
  setupAgentSliderListeners();
}

// Initialize emotional trait sliders when Kwami is ready
setTimeout(() => {
  if (window.kwami && window.kwami.soul) {
    updateEmotionalTraitSliders();
    loadSavedPersonalitiesIntoSelector();
  }
}, 500);

// LocalStorage key for saved personalities
const STORAGE_KEY = 'kwami_saved_personalities';

// Load personality from selector
window.loadPersonalityFromSelector = function() {
  const selector = document.getElementById('personality-selector');
  if (!selector) return;
  
  const value = selector.value;
  if (!value) return;
  
  // Check if it's a built-in template
  const builtInTemplates = [
    // Core templates
    'friendly', 'playful', 'professional',
    // Creative & Inspiring
    'mentor', 'adventurer', 'coach', 'artistic', 'storyteller',
    // Analytical & Thoughtful
    'scientist', 'detective', 'witty', 'mysterious',
    // Calm & Supportive
    'zen', 'empathic',
    // Bold & Unconventional
    'rebel',
    // Challenging personalities
    'grumpy', 'cynical', 'sarcastic', 'melancholic', 'angry'
  ];
  
  if (builtInTemplates.includes(value)) {
    window.loadPersonality(value);
    return;
  }
  
  // Load from localStorage
  loadSavedPersonality(value);
};

// Save current personality configuration
window.savePersonalityConfig = function() {
  if (!window.kwami || !window.kwami.soul) {
    showError('Soul not initialized');
    return;
  }
  
  const nameInput = document.getElementById('save-config-name');
  const name = nameInput?.value.trim();
  
  if (!name) {
    showError('Please enter a name for this personality');
    return;
  }
  
  try {
    // Get current configuration
    const config = window.kwami.soul.createSnapshot();
    
    // Get existing saved personalities
    const saved = getSavedPersonalities();
    
    // Add or update this personality
    saved[name] = config;
    
    // Save to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
    
    // Update selector
    loadSavedPersonalitiesIntoSelector();
    
    // Clear input
    if (nameInput) nameInput.value = '';
    
    updateStatus(`💾 Saved personality: ${name}`);
  } catch (error) {
    showError('Failed to save personality: ' + error.message);
  }
};

// Load a saved personality from localStorage
function loadSavedPersonality(name) {
  try {
    const saved = getSavedPersonalities();
    const config = saved[name];
    
    if (!config) {
      showError(`Personality "${name}" not found`);
      return;
    }
    
    // Load the configuration
    if (window.kwami && window.kwami.soul) {
      window.kwami.soul.setPersonality(config);
      
      // Update UI
      updateSoulUIFromConfig(config);
      updateEmotionalTraitSliders();
      
      updateStatus(`✅ Loaded saved personality: ${name}`);
    }
  } catch (error) {
    showError('Failed to load personality: ' + error.message);
  }
}

// Delete selected saved personality
window.deleteSavedPersonality = function() {
  const selector = document.getElementById('personality-selector');
  if (!selector) return;
  
  const value = selector.value;
  if (!value || ['friendly', 'professional', 'playful'].includes(value)) {
    showError('Please select a saved personality to delete');
    return;
  }
  
  if (!confirm(`Delete personality "${value}"?`)) {
    return;
  }
  
  try {
    const saved = getSavedPersonalities();
    delete saved[value];
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
    
    // Reset selector
    selector.value = '';
    
    // Reload saved personalities in selector
    loadSavedPersonalitiesIntoSelector();
    
    updateStatus(`🗑️ Deleted personality: ${value}`);
  } catch (error) {
    showError('Failed to delete personality: ' + error.message);
  }
};

// Get all saved personalities from localStorage
function getSavedPersonalities() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch (error) {
    console.error('Error reading saved personalities:', error);
    return {};
  }
}

// Load saved personalities into the selector dropdown
function loadSavedPersonalitiesIntoSelector() {
  const group = document.getElementById('saved-personalities-group');
  if (!group) return;
  
  // Clear existing options
  group.innerHTML = '';
  
  const saved = getSavedPersonalities();
  const names = Object.keys(saved);
  
  if (names.length === 0) {
    const option = document.createElement('option');
    option.value = '';
    option.textContent = '(No saved personalities)';
    option.disabled = true;
    group.appendChild(option);
    return;
  }
  
  // Add saved personalities
  names.sort().forEach(name => {
    const option = document.createElement('option');
    option.value = name;
    option.textContent = `💾 ${name}`;
    group.appendChild(option);
  });
}

// Update Soul UI fields from configuration
function updateSoulUIFromConfig(config) {
  const nameInput = document.getElementById('soul-name');
  const personalityInput = document.getElementById('soul-personality');
  const systemPromptInput = document.getElementById('soul-system-prompt');
  const nameDisplay = document.getElementById('personality-name');
  
  if (nameInput) nameInput.value = config.name || 'Kwami';
  if (personalityInput) personalityInput.value = config.personality || '';
  if (systemPromptInput) systemPromptInput.value = config.systemPrompt || '';
  if (nameDisplay) nameDisplay.textContent = config.name || 'Kwami';
}

// ========================================
// Skills System Functions
// ========================================

// Note: skillDefinitions is declared earlier in the file (around line 2341) as window.skillDefinitions
// to avoid temporal dead zone issues

let skillsExecutedCount = 0;

// Initialize skills when Kwami is loaded
async function initializeSkills() {
  if (!kwami || !kwami.skills) {
    console.error('Kwami skills not available');
    return;
  }

  try {
    // Register all predefined skills inline (avoiding external file dependencies)
    const skillTemplates = {
      'minimize-top-right': {
        id: 'minimize-top-right',
        name: 'Minimize to Top Right',
        description: 'Minimizes Kwami and moves it to the top-right corner of the screen',
        version: '1.5.12',
        author: 'Kwami Team',
        tags: ['position', 'scale', 'ui'],
        trigger: 'manual',
        autoReverse: false,
        actions: [
          { type: 'body.scale', preset: 'mini', duration: 800, easing: 'ease-in-out' },
          { type: 'body.position', preset: 'top-right', duration: 800, easing: 'ease-in-out' }
        ]
      },
      'rainbow-transition': {
        id: 'rainbow-transition',
        name: 'Rainbow Color Transition',
        description: 'Cycles through rainbow colors with smooth transitions',
        version: '1.5.12',
        author: 'Kwami Team',
        tags: ['colors', 'animation', 'visual'],
        trigger: 'manual',
        actions: [
          {
            type: 'sequence',
            actions: [
              { type: 'body.colors', primary: '#ff0000', secondary: '#ff7700', accent: '#ffff00', duration: 1000 },
              { type: 'wait', duration: 500 },
              { type: 'body.colors', primary: '#00ff00', secondary: '#00ff77', accent: '#00ffff', duration: 1000 },
              { type: 'wait', duration: 500 },
              { type: 'body.colors', primary: '#0000ff', secondary: '#7700ff', accent: '#ff00ff', duration: 1000 }
            ]
          }
        ]
      },
      'energetic-mode': {
        id: 'energetic-mode',
        name: 'Energetic Mode',
        description: 'Makes Kwami more energetic with faster movements and vibrant colors',
        version: '1.5.12',
        author: 'Kwami Team',
        tags: ['mood', 'animation', 'personality'],
        trigger: 'manual',
        autoReverse: true,
        reverseDelay: 5000,
        actions: [
          {
            type: 'sequence',
            parallel: true,
            actions: [
              { type: 'body.colors', primary: '#ff6b35', secondary: '#f7931e', accent: '#fdc300', duration: 500 },
              { type: 'body.spikes', x: 0.8, y: 0.8, z: 0.8 },
              { type: 'body.time', x: 3.0, y: 3.0, z: 3.0 },
              { type: 'soul.trait', trait: 'energy', value: 80 },
              { type: 'soul.trait', trait: 'happiness', value: 70 }
            ]
          }
        ]
      },
      'calm-meditation': {
        id: 'calm-meditation',
        name: 'Calm Meditation Mode',
        description: 'Creates a calm, meditative atmosphere with slow movements and soothing colors',
        version: '1.5.12',
        author: 'Kwami Team',
        tags: ['mood', 'meditation', 'calm'],
        trigger: 'manual',
        actions: [
          {
            type: 'sequence',
            parallel: true,
            actions: [
              { type: 'body.colors', primary: '#3a86ff', secondary: '#8338ec', accent: '#b8b8ff', duration: 2000 },
              { type: 'body.spikes', x: 0.1, y: 0.1, z: 0.1 },
              { type: 'body.time', x: 0.3, y: 0.3, z: 0.3 },
              { type: 'body.rotation', x: 0.001, y: 0.002, z: 0.001 },
              { type: 'soul.trait', trait: 'calmness', value: 90 },
              { type: 'soul.trait', trait: 'patience', value: 85 }
            ]
          }
        ]
      },
      'focus-session': {
        id: 'focus-session',
        name: 'Focus Session',
        description: 'Pomodoro-style focus mode with greeting and minimization',
        version: '1.5.12',
        author: 'Kwami Team',
        tags: ['productivity', 'focus', 'pomodoro'],
        trigger: 'manual',
        actions: [
          {
            type: 'sequence',
            actions: [
              { type: 'mind.speak', text: "Starting your focus session. I'll minimize myself to the corner so you can concentrate. Good luck!" },
              { type: 'wait', duration: 2000 },
              {
                type: 'sequence',
                parallel: true,
                actions: [
                  { type: 'body.scale', preset: 'mini', duration: 1000, easing: 'ease-in-out' },
                  { type: 'body.position', preset: 'top-right', duration: 1000, easing: 'ease-in-out' },
                  { type: 'body.colors', primary: '#667eea', secondary: '#764ba2', accent: '#f093fb', duration: 1000 }
                ]
              }
            ]
          }
        ]
      },
      'party-mode': {
        id: 'party-mode',
        name: 'Party Mode',
        description: 'Celebration mode with rapid color changes and energetic movement',
        version: '1.5.12',
        author: 'Kwami Team',
        tags: ['celebration', 'animation', 'fun'],
        trigger: 'manual',
        loop: false,
        actions: [
          {
            type: 'sequence',
            parallel: true,
            actions: [
              { type: 'body.scale', preset: 'large', duration: 500, easing: 'bounce' },
              { type: 'body.spikes', x: 1.5, y: 1.5, z: 1.5 },
              { type: 'body.time', x: 5.0, y: 5.0, z: 5.0 },
              { type: 'body.rotation', x: 0.005, y: 0.008, z: 0.003 }
            ]
          },
          {
            type: 'sequence',
            actions: [
              { type: 'body.colors', primary: '#ff006e', secondary: '#8338ec', accent: '#ffbe0b', duration: 300 },
              { type: 'body.colors', primary: '#3a86ff', secondary: '#ff006e', accent: '#06ffa5', duration: 300 },
              { type: 'body.colors', primary: '#ffbe0b', secondary: '#fb5607', accent: '#ff006e', duration: 300 },
              { type: 'body.colors', primary: '#06ffa5', secondary: '#3a86ff', accent: '#8338ec', duration: 300 }
            ]
          }
        ]
      }
    };

    // Register all skills
    const skillIds = Object.keys(window.skillDefinitions);
    for (const skillId of skillIds) {
      try {
        if (skillTemplates[skillId]) {
          kwami.skills.registerSkill(skillTemplates[skillId]);
          console.log(`[Skills] Registered skill: ${skillId}`);
        } else {
          console.warn(`[Skills] No template found for skill: ${skillId}`);
        }
      } catch (error) {
        console.warn(`[Skills] Failed to register skill ${skillId}:`, error);
      }
    }

    // Update stats
    updateSkillStats();
  } catch (error) {
    console.error('[Skills] Failed to initialize skills:', error);
  }
}

// Handle skill selection change
window.addEventListener('DOMContentLoaded', () => {
  const skillSelector = document.getElementById('skill-selector');
  if (skillSelector) {
    skillSelector.addEventListener('change', function() {
      const selectedSkill = this.value;
      const executeBtn = document.getElementById('execute-skill-btn');
      const descriptionDiv = document.getElementById('skill-description');
      
      if (selectedSkill && window.skillDefinitions[selectedSkill]) {
        // Show description
        const skill = window.skillDefinitions[selectedSkill];
        document.getElementById('skill-description-name').textContent = skill.name;
        document.getElementById('skill-description-text').textContent = skill.description;
        document.getElementById('skill-description-actions').textContent = skill.actions;
        document.getElementById('skill-description-reverse').textContent = skill.autoReverse ? 'Yes' : 'No';
        descriptionDiv.style.display = 'block';
        
        // Enable execute button
        if (executeBtn) executeBtn.disabled = false;
      } else {
        descriptionDiv.style.display = 'none';
        if (executeBtn) executeBtn.disabled = true;
      }
    });
  }
});

// Execute selected skill
window.executeSelectedSkill = async function() {
  const skillSelector = document.getElementById('skill-selector');
  const selectedSkill = skillSelector?.value;
  
  if (!selectedSkill) {
    updateStatus('⚠️ Please select a skill first');
    return;
  }

  if (!kwami || !kwami.skills) {
    updateError('Kwami skills not available. Please refresh the page.');
    return;
  }

  try {
    updateStatus(`⏳ Executing skill: ${window.skillDefinitions[selectedSkill]?.name || selectedSkill}...`);
    
    const startTime = Date.now();
    const result = await kwami.skills.executeSkill(selectedSkill);
    const duration = Date.now() - startTime;
    
    if (result.success) {
      // Show success message
      const statusDiv = document.getElementById('skill-execution-status');
      const messageSpan = document.getElementById('skill-execution-message');
      const durationSpan = document.getElementById('skill-execution-duration');
      
      if (statusDiv && messageSpan && durationSpan) {
        messageSpan.textContent = `✅ Skill executed successfully`;
        durationSpan.textContent = `${duration}ms`;
        statusDiv.style.display = 'block';
        
        // Hide after 5 seconds
        setTimeout(() => {
          statusDiv.style.display = 'none';
        }, 5000);
      }
      
      updateStatus(`✅ Skill completed: ${window.skillDefinitions[selectedSkill]?.name || selectedSkill}`);
      
      // Update stats
      skillsExecutedCount++;
      updateSkillStats();
    } else {
      updateError(`❌ Skill execution failed: ${result.error || 'Unknown error'}`);
    }
  } catch (error) {
    console.error('[Skills] Execution error:', error);
    updateError(`❌ Failed to execute skill: ${error.message}`);
  }
};

// Quick skill actions
window.quickSkillMinimize = async function() {
  if (!kwami) return;
  
  const skill = {
    id: 'quick-minimize',
    name: 'Quick Minimize',
    description: 'Quick minimize action',
    version: '1.5.12',
    actions: [
      {
        type: 'body.scale',
        preset: 'mini',
        duration: 600,
        easing: 'ease-in-out'
      },
      {
        type: 'body.position',
        preset: 'bottom-right',
        duration: 600,
        easing: 'ease-in-out'
      }
    ]
  };
  
  kwami.skills.registerSkill(skill);
  await kwami.skills.executeSkill('quick-minimize');
  skillsExecutedCount++;
  updateSkillStats();
  updateStatus('✅ Kwami minimized');
};

window.quickSkillCenter = async function() {
  if (!kwami) return;
  
  const skill = {
    id: 'quick-center',
    name: 'Quick Center',
    description: 'Center Kwami',
    version: '1.5.12',
    actions: [
      {
        type: 'body.scale',
        preset: 'normal',
        duration: 600,
        easing: 'ease-in-out'
      },
      {
        type: 'body.position',
        preset: 'center',
        duration: 600,
        easing: 'ease-in-out'
      }
    ]
  };
  
  kwami.skills.registerSkill(skill);
  await kwami.skills.executeSkill('quick-center');
  skillsExecutedCount++;
  updateSkillStats();
  updateStatus('✅ Kwami centered');
};

window.quickSkillEnergize = async function() {
  if (!kwami) return;
  
  const skill = {
    id: 'quick-energize',
    name: 'Quick Energize',
    description: 'Energize Kwami',
    version: '1.5.12',
    actions: [
      {
        type: 'sequence',
        parallel: true,
        actions: [
          {
            type: 'body.colors',
            primary: '#ff6b35',
            secondary: '#f7931e',
            accent: '#fdc300',
            duration: 500
          },
          {
            type: 'body.spikes',
            x: 0.8,
            y: 0.8,
            z: 0.8
          },
          {
            type: 'body.time',
            x: 3.0,
            y: 3.0,
            z: 3.0
          }
        ]
      }
    ]
  };
  
  kwami.skills.registerSkill(skill);
  await kwami.skills.executeSkill('quick-energize');
  skillsExecutedCount++;
  updateSkillStats();
  updateStatus('⚡ Kwami energized');
};

window.quickSkillCalm = async function() {
  if (!kwami) return;
  
  const skill = {
    id: 'quick-calm',
    name: 'Quick Calm',
    description: 'Calm Kwami',
    version: '1.5.12',
    actions: [
      {
        type: 'sequence',
        parallel: true,
        actions: [
          {
            type: 'body.colors',
            primary: '#3a86ff',
            secondary: '#8338ec',
            accent: '#b8b8ff',
            duration: 1000
          },
          {
            type: 'body.spikes',
            x: 0.1,
            y: 0.1,
            z: 0.1
          },
          {
            type: 'body.time',
            x: 0.3,
            y: 0.3,
            z: 0.3
          }
        ]
      }
    ]
  };
  
  kwami.skills.registerSkill(skill);
  await kwami.skills.executeSkill('quick-calm');
  skillsExecutedCount++;
  updateSkillStats();
  updateStatus('🧘 Kwami calmed');
};

window.quickSkillParty = async function() {
  if (!kwami) return;
  
  try {
    await kwami.skills.executeSkill('party-mode');
    skillsExecutedCount++;
    updateSkillStats();
    updateStatus('🎉 Party mode activated!');
  } catch (error) {
    updateError('Failed to activate party mode');
  }
};

window.quickSkillReset = async function() {
  if (!kwami) return;
  
  const skill = {
    id: 'quick-reset',
    name: 'Quick Reset',
    description: 'Reset to defaults',
    version: '1.5.12',
    actions: [
      {
        type: 'sequence',
        parallel: true,
        actions: [
          {
            type: 'body.scale',
            preset: 'normal',
            duration: 800,
            easing: 'ease-in-out'
          },
          {
            type: 'body.position',
            preset: 'center',
            duration: 800,
            easing: 'ease-in-out'
          },
          {
            type: 'body.spikes',
            x: 0.2,
            y: 0.2,
            z: 0.2
          },
          {
            type: 'body.time',
            x: 1.0,
            y: 1.0,
            z: 1.0
          },
          {
            type: 'body.rotation',
            x: 0,
            y: 0,
            z: 0
          }
        ]
      }
    ]
  };
  
  kwami.skills.registerSkill(skill);
  await kwami.skills.executeSkill('quick-reset');
  skillsExecutedCount++;
  updateSkillStats();
  updateStatus('🔄 Kwami reset to defaults');
};

// Load custom skill from URL
window.loadCustomSkill = async function() {
  const urlInput = document.getElementById('custom-skill-url');
  const url = urlInput?.value.trim();
  
  if (!url) {
    updateStatus('⚠️ Please enter a skill URL');
    return;
  }

  if (!kwami || !kwami.skills) {
    updateError('Kwami skills not available');
    return;
  }

  try {
    updateStatus('⏳ Loading skill from URL...');
    await kwami.skills.loadSkillFromUrl(url);
    updateStatus('✅ Custom skill loaded successfully');
    updateSkillStats();
    
    // Clear input
    if (urlInput) urlInput.value = '';
  } catch (error) {
    console.error('[Skills] Failed to load custom skill:', error);
    updateError(`❌ Failed to load skill: ${error.message}`);
  }
};

// Load skill from file
window.loadSkillFromFile = async function(event) {
  const file = event.target.files[0];
  if (!file) return;

  if (!kwami || !kwami.skills) {
    updateError('Kwami skills not available');
    return;
  }

  try {
    updateStatus('⏳ Loading skill from file...');
    
    const reader = new FileReader();
    reader.onload = async function(e) {
      try {
        const content = e.target.result;
        kwami.skills.loadSkillFromString(content, 'json');
        updateStatus(`✅ Loaded skill from ${file.name}`);
        updateSkillStats();
      } catch (error) {
        console.error('[Skills] Failed to parse skill file:', error);
        updateError(`❌ Invalid skill file: ${error.message}`);
      }
    };
    
    reader.readAsText(file);
  } catch (error) {
    console.error('[Skills] Failed to load skill file:', error);
    updateError(`❌ Failed to load file: ${error.message}`);
  }
};

// Update skill statistics
function updateSkillStats() {
  const totalEl = document.getElementById('skills-total');
  const executedEl = document.getElementById('skills-executed');
  
  if (kwami && kwami.skills) {
    const stats = kwami.skills.getStats();
    if (totalEl) totalEl.textContent = stats.totalSkills;
  }
  
  if (executedEl) executedEl.textContent = skillsExecutedCount;
}

