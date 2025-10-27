import { Kwami } from '../index.ts';

window.kwami = null;
let currentSkin = 'tricolor';

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
  updateStatus('🎲 Blob randomized!');
};

// Change Skin
window.changeSkin = function() {
  currentSkin = currentSkin === 'tricolor' ? 'zebra' : 'tricolor';
  window.kwami.body.setSkin(currentSkin);
  updateStatus(`👕 Changed to ${currentSkin} skin`);
};

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
