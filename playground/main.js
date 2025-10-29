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
      } else if (sidebarState.left === 'mind') {
        initializeMindControls();
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
      } else if (sidebarState.right === 'mind') {
        initializeMindControls();
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
  skin: 'tricolor',
  opacity: 1,
};

// Default background settings
const DEFAULT_BACKGROUND = {
  type: 'gradient',
  colors: ['#667eea', '#764ba2', '#f093fb'],
  direction: 'vertical',
  opacity: 1.0
};

const BACKGROUND_IMAGES = [
  'alaska.jpeg',
  'binary-reality.jpg',
  'black-candle.jpg',
  'black-hole.jpg',
  'black-sea.jpg',
  'black-windows.jpg',
  'black.jpg',
  'colors.jpeg',
  'galaxy.jpg',
  'galaxy2.jpg',
  'galaxy3.jpg',
  'galaxy4.jpg',
  'gargantua.jpg',
  'interstellar.png',
  'islan.jpg',
  'lake.jpg',
  'mountain.jpeg',
  'paisaje.jpg',
  'pik.jpg',
  'planet.jpg',
  'planet2.jpg',
  'planet3.jpg',
  'sahara.jpeg',
  'skinet.png',
  'skynet.png',
  'universe.jpg',
  'white-tree.jpg'
];

// Counter for background randomization clicks
let backgroundRandomizeClickCount = 0;

// Blob image transparency mode
let blobImageTransparencyEnabled = false;
let currentBackgroundImage = '';

// Default camera position
const DEFAULT_CAMERA_POSITION = {
  x: -0.9,
  y: 7.3,
  z: -1.8
};

// ============================================================================
// Background Functions (defined early for initialization)
// ============================================================================

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

  currentBackgroundImage = imageName || '';

  if (window.kwami && window.kwami.body && typeof window.kwami.body.setBlobBackgroundImage === 'function') {
    const imagePath = currentBackgroundImage ? `assets/${currentBackgroundImage}` : null;
    window.kwami.body.setBlobBackgroundImage(imagePath);
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

// Initialize sidebars first
initializeSidebars();

// Initialize Mind controls since Mind is on the left by default
setTimeout(() => {
  if (sidebarState.left === 'mind') {
    initializeMindControls();
  }
}, 100);

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

// ============================================================================
// Mind Functions (ElevenLabs AI Agent Configuration)
// ============================================================================

// Global mind configuration storage
window.mindConfig = {
  voiceSettings: {
    stability: 0.5,
    similarity_boost: 0.75,
    style: 0.0,
    use_speaker_boost: true
  },
  pronunciationDict: {},
  outputFormat: 'mp3_44100_128',
  optimizeLatency: false
};

// Initialize Mind
window.initializeMind = async function() {
  const apiKey = document.getElementById('api-key').value.trim();
  let voiceId = document.getElementById('voice-id').value.trim();
  
  // Check if custom voice ID is selected
  if (voiceId === 'custom') {
    voiceId = document.getElementById('custom-voice-id').value.trim();
    if (!voiceId) {
      showError('Please enter a custom voice ID');
      return;
    }
  }

  if (!apiKey) {
    showError('Please enter your ElevenLabs API Key');
    return;
  }

  try {
    updateStatus('🔄 Initializing Mind...');
    
    // Update Mind configuration
    window.kwami.mind.setVoiceId(voiceId);
    window.kwami.mind.config.apiKey = apiKey;
    
    // Apply model
    const model = document.getElementById('voice-model').value;
    window.kwami.mind.setModel(model);
    
    // Apply initial voice settings
    applyVoiceSettings();
    
    await window.kwami.mind.initialize();
    
    // Enable all Mind buttons
    document.getElementById('speak-btn').disabled = false;
    document.getElementById('preview-btn').disabled = false;
    document.getElementById('test-mic-btn').disabled = false;
    document.getElementById('start-conversation-btn').disabled = false;
    document.getElementById('init-btn').textContent = '✅ Mind Ready';
    document.getElementById('init-btn').disabled = true;
    
    updateStatus('✅ Mind initialized! Ready to speak.');
  } catch (error) {
    showError('Failed to initialize Mind: ' + error.message);
  }
};

// Apply Voice Settings
window.applyVoiceSettings = function() {
  if (!window.kwami || !window.kwami.mind) return;
  
  const settings = {
    stability: parseFloat(document.getElementById('voice-stability').value),
    similarity_boost: parseFloat(document.getElementById('voice-similarity').value),
    style: parseFloat(document.getElementById('voice-style').value),
    use_speaker_boost: document.getElementById('voice-speaker-boost').checked
  };
  
  window.mindConfig.voiceSettings = settings;
  window.kwami.mind.setVoiceSettings(settings);
  
  updateStatus('✅ Voice settings applied!');
};

// Load Available Voices from ElevenLabs
window.loadAvailableVoices = async function() {
  if (!window.kwami || !window.kwami.mind || !window.kwami.mind.isReady()) {
    showError('Please initialize Mind first');
    return;
  }
  
  try {
    updateStatus('🔄 Loading available voices...');
    
    const voices = await window.kwami.mind.getAvailableVoices();
    
    const voicesList = document.getElementById('user-voices');
    voicesList.innerHTML = '';
    
    voices.forEach(voice => {
      const option = document.createElement('option');
      option.value = voice.voice_id;
      option.textContent = `${voice.name} (${voice.category || 'Custom'})`;
      voicesList.appendChild(option);
    });
    
    document.getElementById('available-voices-list').style.display = 'block';
    updateStatus(`✅ Loaded ${voices.length} voices!`);
  } catch (error) {
    showError('Failed to load voices: ' + error.message);
  }
};

// Select User Voice
window.selectUserVoice = function() {
  const voicesList = document.getElementById('user-voices');
  const selectedVoiceId = voicesList.value;
  
  if (!selectedVoiceId) {
    showError('Please select a voice');
    return;
  }
  
  // Update the voice ID in the main dropdown
  const voiceSelect = document.getElementById('voice-id');
  voiceSelect.value = 'custom';
  document.getElementById('custom-voice-id').value = selectedVoiceId;
  document.getElementById('custom-voice-container').style.display = 'block';
  
  // Apply the new voice
  if (window.kwami && window.kwami.mind) {
    window.kwami.mind.setVoiceId(selectedVoiceId);
  }
  
  const selectedText = voicesList.options[voicesList.selectedIndex].text;
  updateStatus(`✅ Voice changed to: ${selectedText}`);
};

// Apply Voice Preset
window.applyVoicePreset = function(preset) {
  const presets = {
    natural: {
      stability: 0.5,
      similarity_boost: 0.75,
      style: 0.0,
      use_speaker_boost: true
    },
    expressive: {
      stability: 0.3,
      similarity_boost: 0.8,
      style: 0.4,
      use_speaker_boost: true
    },
    stable: {
      stability: 0.8,
      similarity_boost: 0.7,
      style: 0.0,
      use_speaker_boost: true
    },
    clear: {
      stability: 0.7,
      similarity_boost: 0.9,
      style: 0.0,
      use_speaker_boost: true
    }
  };
  
  const settings = presets[preset];
  if (!settings) return;
  
  // Update UI
  document.getElementById('voice-stability').value = settings.stability;
  document.getElementById('voice-similarity').value = settings.similarity_boost;
  document.getElementById('voice-style').value = settings.style;
  document.getElementById('voice-speaker-boost').checked = settings.use_speaker_boost;
  
  updateValueDisplay('voice-stability-value', settings.stability, 2);
  updateValueDisplay('voice-similarity-value', settings.similarity_boost, 2);
  updateValueDisplay('voice-style-value', settings.style, 2);
  
  // Apply settings
  applyVoiceSettings();
  
  const presetNames = {
    natural: 'Natural',
    expressive: 'Expressive',
    stable: 'Stable',
    clear: 'Clear & Crisp'
  };
  
  updateStatus(`✅ Applied ${presetNames[preset]} preset!`);
};

// Preview Voice
window.previewVoice = async function() {
  const previewText = "Hello! This is a preview of my voice. How do I sound?";
  
  try {
    updateStatus('🎤 Generating preview...');
    document.getElementById('preview-btn').disabled = true;
    
    await window.kwami.speak(previewText);
    
    updateStatus('✅ Preview complete!');
    document.getElementById('preview-btn').disabled = false;
  } catch (error) {
    showError('Failed to preview voice: ' + error.message);
    document.getElementById('preview-btn').disabled = false;
  }
};

// Start Conversation
window.startConversation = async function() {
  if (!window.kwami || !window.kwami.mind || !window.kwami.mind.isReady()) {
    showError('Please initialize Mind first');
    return;
  }
  
  const agentId = document.getElementById('agent-id').value.trim();
  if (!agentId) {
    showError('Please enter an Agent ID for conversational AI');
    return;
  }
  
  const firstMessage = document.getElementById('conversation-first-message').value.trim();
  const maxDuration = parseInt(document.getElementById('conversation-max-duration').value) || 300;
  const allowInterruption = document.getElementById('conversation-interruption').checked;
  
  try {
    updateStatus('🔄 Starting conversation...');
    document.getElementById('start-conversation-btn').disabled = true;
    
    // Update conversation config
    window.kwami.mind.config.conversational = {
      agentId: agentId,
      firstMessage: firstMessage || 'Hello! How can I help you today?',
      maxDuration: maxDuration,
      allowInterruption: allowInterruption
    };
    
    // Create transcript display area if it doesn't exist
    let transcriptArea = document.getElementById('conversation-transcript');
    if (!transcriptArea) {
      const conversationSection = document.querySelector('.section:has(#agent-id)');
      if (conversationSection) {
        transcriptArea = document.createElement('div');
        transcriptArea.id = 'conversation-transcript';
        transcriptArea.style.cssText = 'margin-top: 15px; padding: 10px; background: #f5f5f5; border-radius: 8px; max-height: 200px; overflow-y: auto; font-size: 12px; display: none;';
        transcriptArea.innerHTML = '<div style="color: #888; margin-bottom: 5px;">📝 Conversation Transcript:</div>';
        conversationSection.appendChild(transcriptArea);
      }
    }
    
    // Define conversation callbacks
    const callbacks = {
      onAgentResponse: (text) => {
        console.log('Agent:', text);
        if (transcriptArea) {
          const entry = document.createElement('div');
          entry.style.cssText = 'margin: 5px 0; padding: 5px; background: #e3e8ff; border-radius: 4px;';
          entry.innerHTML = `<strong>🤖 Agent:</strong> ${text}`;
          transcriptArea.appendChild(entry);
          transcriptArea.scrollTop = transcriptArea.scrollHeight;
          transcriptArea.style.display = 'block';
        }
      },
      onUserTranscript: (text) => {
        console.log('User:', text);
        if (transcriptArea) {
          const entry = document.createElement('div');
          entry.style.cssText = 'margin: 5px 0; padding: 5px; background: #fff; border-radius: 4px;';
          entry.innerHTML = `<strong>👤 You:</strong> ${text}`;
          transcriptArea.appendChild(entry);
          transcriptArea.scrollTop = transcriptArea.scrollHeight;
          transcriptArea.style.display = 'block';
        }
      },
      onTurnStart: () => {
        updateStatus('🎙️ Agent is speaking...');
      },
      onTurnEnd: () => {
        updateStatus('👂 Listening for your response...');
      },
      onError: (error) => {
        showError('Conversation error: ' + error.message);
        stopConversation();
      }
    };
    
    // Start conversation with callbacks
    await window.kwami.startConversation(callbacks);
    
    document.getElementById('start-conversation-btn').style.display = 'none';
    document.getElementById('stop-conversation-btn').style.display = 'block';
    document.getElementById('stop-conversation-btn').disabled = false;
    
    updateStatus('✅ Conversation started! Listening...');
  } catch (error) {
    showError('Failed to start conversation: ' + error.message);
    document.getElementById('start-conversation-btn').disabled = false;
  }
};

// Stop Conversation
window.stopConversation = async function() {
  if (!window.kwami || !window.kwami.mind) return;
  
  try {
    updateStatus('🔄 Stopping conversation...');
    
    await window.kwami.mind.stopConversation();
    
    document.getElementById('start-conversation-btn').style.display = 'block';
    document.getElementById('start-conversation-btn').disabled = false;
    document.getElementById('stop-conversation-btn').style.display = 'none';
    
    updateStatus('✅ Conversation stopped.');
  } catch (error) {
    showError('Failed to stop conversation: ' + error.message);
  }
};

// Test Microphone
window.testMicrophone = async function() {
  if (!window.kwami || !window.kwami.mind) {
    showError('Please initialize Mind first');
    return;
  }
  
  try {
    updateStatus('🎤 Testing microphone...');
    
    const stream = await window.kwami.mind.listen();
    
    document.getElementById('mic-status').style.display = 'block';
    document.getElementById('mic-status-text').textContent = 'Active';
    document.getElementById('mic-status-text').style.color = '#4CAF50';
    
    updateStatus('✅ Microphone is working!');
    
    // Stop listening after 3 seconds
    setTimeout(() => {
      window.kwami.mind.stopListening();
      document.getElementById('mic-status-text').textContent = 'Test complete';
      document.getElementById('mic-status-text').style.color = '#888';
    }, 3000);
  } catch (error) {
    document.getElementById('mic-status').style.display = 'block';
    document.getElementById('mic-status-text').textContent = 'Failed';
    document.getElementById('mic-status-text').style.color = '#f44336';
    showError('Microphone test failed: ' + error.message);
  }
};

// Apply Pronunciation Rules
window.applyPronunciation = function() {
  const dictText = document.getElementById('pronunciation-dict').value.trim();
  
  if (!dictText) {
    updateStatus('ℹ️ No pronunciation rules to apply');
    return;
  }
  
  const lines = dictText.split('\n');
  const dict = {};
  
  lines.forEach(line => {
    const [word, pronunciation] = line.split(':').map(s => s.trim());
    if (word && pronunciation) {
      dict[word] = pronunciation;
    }
  });
  
  window.mindConfig.pronunciationDict = dict;
  
  updateStatus(`✅ Applied ${Object.keys(dict).length} pronunciation rules!`);
};

// Check API Usage
window.checkUsage = async function() {
  if (!window.kwami || !window.kwami.mind || !window.kwami.mind.isReady()) {
    showError('Please initialize Mind first');
    return;
  }
  
  try {
    updateStatus('🔄 Checking API usage...');
    
    // Note: This would require additional ElevenLabs API endpoint
    // For now, show placeholder
    document.getElementById('usage-info').style.display = 'block';
    document.getElementById('usage-characters').textContent = 'N/A';
    document.getElementById('usage-limit').textContent = 'N/A';
    document.getElementById('usage-remaining').textContent = 'N/A';
    
    updateStatus('ℹ️ Usage API endpoint requires additional implementation');
  } catch (error) {
    showError('Failed to check usage: ' + error.message);
  }
};

// Export Mind Configuration
window.exportMindConfig = function() {
  const config = {
    voiceId: document.getElementById('voice-id').value,
    model: document.getElementById('voice-model').value,
    language: document.getElementById('voice-language').value,
    voiceSettings: {
      stability: parseFloat(document.getElementById('voice-stability').value),
      similarity_boost: parseFloat(document.getElementById('voice-similarity').value),
      style: parseFloat(document.getElementById('voice-style').value),
      use_speaker_boost: document.getElementById('voice-speaker-boost').checked
    },
    advancedSettings: {
      outputFormat: document.getElementById('tts-output-format').value,
      optimizeLatency: document.getElementById('tts-optimize-latency').checked,
      nextTextTimeout: parseInt(document.getElementById('tts-next-text').value)
    },
    conversational: {
      agentId: document.getElementById('agent-id').value,
      firstMessage: document.getElementById('conversation-first-message').value,
      maxDuration: parseInt(document.getElementById('conversation-max-duration').value),
      allowInterruption: document.getElementById('conversation-interruption').checked
    },
    stt: {
      model: document.getElementById('stt-model').value,
      punctuation: document.getElementById('stt-punctuation').checked,
      diarization: document.getElementById('stt-diarization').checked
    },
    pronunciation: {
      dictionary: document.getElementById('pronunciation-dict').value,
      usePhonemes: document.getElementById('use-phonemes').checked
    }
  };
  
  const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `kwami-mind-config-${Date.now()}.json`;
  link.click();
  
  setTimeout(() => URL.revokeObjectURL(link.href), 100);
  
  updateStatus('💾 Mind configuration exported!');
};

// Import Mind Configuration
window.importMindConfig = function() {
  const fileInput = document.getElementById('mind-config-import');
  fileInput.click();
};

// Initialize Mind controls event listeners
function initializeMindControls() {
  // Voice ID dropdown change handler
  const voiceIdSelect = document.getElementById('voice-id');
  if (voiceIdSelect) {
    voiceIdSelect.addEventListener('change', (e) => {
      const customContainer = document.getElementById('custom-voice-container');
      if (e.target.value === 'custom') {
        customContainer.style.display = 'block';
      } else {
        customContainer.style.display = 'none';
        if (window.kwami && window.kwami.mind) {
          window.kwami.mind.setVoiceId(e.target.value);
        }
      }
    });
  }
  
  // Voice stability slider
  const voiceStability = document.getElementById('voice-stability');
  if (voiceStability) {
    voiceStability.addEventListener('input', (e) => {
      updateValueDisplay('voice-stability-value', e.target.value, 2);
    });
  }
  
  // Voice similarity slider
  const voiceSimilarity = document.getElementById('voice-similarity');
  if (voiceSimilarity) {
    voiceSimilarity.addEventListener('input', (e) => {
      updateValueDisplay('voice-similarity-value', e.target.value, 2);
    });
  }
  
  // Voice style slider
  const voiceStyle = document.getElementById('voice-style');
  if (voiceStyle) {
    voiceStyle.addEventListener('input', (e) => {
      updateValueDisplay('voice-style-value', e.target.value, 2);
    });
  }
  
  // TTS next text timeout slider
  const ttsNextText = document.getElementById('tts-next-text');
  if (ttsNextText) {
    ttsNextText.addEventListener('input', (e) => {
      updateValueDisplay('tts-next-text-value', e.target.value, 0);
    });
  }
  
  // Model change handler
  const voiceModel = document.getElementById('voice-model');
  if (voiceModel) {
    voiceModel.addEventListener('change', (e) => {
      if (window.kwami && window.kwami.mind) {
        window.kwami.mind.setModel(e.target.value);
        updateStatus(`Model changed to: ${e.target.options[e.target.selectedIndex].text}`);
      }
    });
  }
  
  // Config import file handler
  const configImport = document.getElementById('mind-config-import');
  if (configImport) {
    configImport.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      try {
        const text = await file.text();
        const config = JSON.parse(text);
        
        // Apply imported configuration
        if (config.voiceId) document.getElementById('voice-id').value = config.voiceId;
        if (config.model) document.getElementById('voice-model').value = config.model;
        if (config.language) document.getElementById('voice-language').value = config.language;
        
        if (config.voiceSettings) {
          document.getElementById('voice-stability').value = config.voiceSettings.stability;
          document.getElementById('voice-similarity').value = config.voiceSettings.similarity_boost;
          document.getElementById('voice-style').value = config.voiceSettings.style;
          document.getElementById('voice-speaker-boost').checked = config.voiceSettings.use_speaker_boost;
          
          updateValueDisplay('voice-stability-value', config.voiceSettings.stability, 2);
          updateValueDisplay('voice-similarity-value', config.voiceSettings.similarity_boost, 2);
          updateValueDisplay('voice-style-value', config.voiceSettings.style, 2);
        }
        
        if (config.advancedSettings) {
          document.getElementById('tts-output-format').value = config.advancedSettings.outputFormat;
          document.getElementById('tts-optimize-latency').checked = config.advancedSettings.optimizeLatency;
          document.getElementById('tts-next-text').value = config.advancedSettings.nextTextTimeout;
          updateValueDisplay('tts-next-text-value', config.advancedSettings.nextTextTimeout, 0);
        }
        
        if (config.conversational) {
          document.getElementById('agent-id').value = config.conversational.agentId || '';
          document.getElementById('conversation-first-message').value = config.conversational.firstMessage || '';
          document.getElementById('conversation-max-duration').value = config.conversational.maxDuration || 300;
          document.getElementById('conversation-interruption').checked = config.conversational.allowInterruption || false;
        }
        
        if (config.stt) {
          document.getElementById('stt-model').value = config.stt.model || 'base';
          document.getElementById('stt-punctuation').checked = config.stt.punctuation !== false;
          document.getElementById('stt-diarization').checked = config.stt.diarization || false;
        }
        
        if (config.pronunciation) {
          document.getElementById('pronunciation-dict').value = config.pronunciation.dictionary || '';
          document.getElementById('use-phonemes').checked = config.pronunciation.usePhonemes || false;
        }
        
        updateStatus('✅ Mind configuration imported!');
      } catch (error) {
        showError('Failed to import configuration: ' + error.message);
      }
    });
  }
}

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
  blob.setOpacity(DEFAULT_VALUES.opacity);
  
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
    skinSelect.value = skin;
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

  const opacitySlider = document.getElementById('blob-opacity');
  if (opacitySlider) {
    opacitySlider.addEventListener('input', (e) => {
      const value = parseFloat(e.target.value);
      blob.setOpacity(value);
      updateValueDisplay('blob-opacity-value', value, 2);
    });
  }
  
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
      updateAllControlsFromBlob();
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
  
  // Auto-clear status messages after 5 seconds
  if (message) {
    setTimeout(() => {
      if (status.textContent === message) {
        status.textContent = '';
      }
    }, 5000);
  }
}

function showError(message) {
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
  
  indicator.className = 'state-indicator state-' + state;
  stateText.textContent = state.toUpperCase();
}

// Background control functions (using Canvas API)
function applyBackground() {
  const type = document.getElementById('bg-type').value;
  const opacity = parseFloat(document.getElementById('bg-opacity').value);

  if (blobImageTransparencyEnabled && type !== 'transparent') {
    if (type === 'solid') {
      const color = document.getElementById('bg-solid-color').value;
      window.kwami.body.setBlobImageTransparencyMode(true, [color], 'solid', 'vertical', opacity);
    } else if (type === 'gradient') {
      const color1 = document.getElementById('bg-color-1').value;
      const color2 = document.getElementById('bg-color-2').value;
      const color3 = document.getElementById('bg-color-3').value;
      const direction = document.getElementById('bg-direction').value;
      window.kwami.body.setBlobImageTransparencyMode(
        true,
        [color1, color2, color3],
        'gradient',
        direction,
        opacity,
      );
    }
  } else {
    window.kwami.body.setBlobImageTransparencyMode(false);

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
}

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
      if (window.kwami?.body?.isBlobImageTransparencyMode?.()) {
        window.kwami.body.refreshBlobImageTransparencyMode();
      }
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
      if (window.kwami?.body?.isBlobImageTransparencyMode?.()) {
        window.kwami.body.refreshBlobImageTransparencyMode();
      }
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
      if (window.kwami?.body?.isBlobImageTransparencyMode?.()) {
        window.kwami.body.refreshBlobImageTransparencyMode();
      }
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
  bassSpike: 0.45,
  midSpike: 0.35,
  highSpike: 0.30,
  midTime: 0.2,
  highTime: 0.3,
  ultraTime: 0.15,
  enabled: true,
  timeEnabled: false  // Disabled by default to prevent chaotic movement
};

// Initialize audio effect controls
function initializeAudioEffects() {
  // Bass → Spikes
  const audioBassSpike = document.getElementById('audio-bass-spike');
  if (audioBassSpike) {
    audioBassSpike.value = window.audioEffects.bassSpike.toString();
    updateValueDisplay('audio-bass-spike-value', audioBassSpike.value, 2);
    audioBassSpike.addEventListener('input', (e) => {
      window.audioEffects.bassSpike = parseFloat(e.target.value);
      updateValueDisplay('audio-bass-spike-value', e.target.value, 2);
      if (window.kwami && window.kwami.body.blob) {
        window.kwami.body.blob.audioEffects.bassSpike = window.audioEffects.bassSpike;
      }
    });
  }
  
  // Mid → Spikes
  const audioMidSpike = document.getElementById('audio-mid-spike');
  if (audioMidSpike) {
    audioMidSpike.value = window.audioEffects.midSpike.toString();
    updateValueDisplay('audio-mid-spike-value', audioMidSpike.value, 2);
    audioMidSpike.addEventListener('input', (e) => {
      window.audioEffects.midSpike = parseFloat(e.target.value);
      updateValueDisplay('audio-mid-spike-value', e.target.value, 2);
      if (window.kwami && window.kwami.body.blob) {
        window.kwami.body.blob.audioEffects.midSpike = window.audioEffects.midSpike;
      }
    });
  }
  
  // High → Spikes
  const audioHighSpike = document.getElementById('audio-high-spike');
  if (audioHighSpike) {
    audioHighSpike.value = window.audioEffects.highSpike.toString();
    updateValueDisplay('audio-high-spike-value', audioHighSpike.value, 2);
    audioHighSpike.addEventListener('input', (e) => {
      window.audioEffects.highSpike = parseFloat(e.target.value);
      updateValueDisplay('audio-high-spike-value', e.target.value, 2);
      if (window.kwami && window.kwami.body.blob) {
        window.kwami.body.blob.audioEffects.highSpike = window.audioEffects.highSpike;
      }
    });
  }
  
  // Mid → Time
  const audioMidTime = document.getElementById('audio-mid-time');
  if (audioMidTime) {
    audioMidTime.value = window.audioEffects.midTime.toString();
    updateValueDisplay('audio-mid-time-value', audioMidTime.value, 1);
    audioMidTime.addEventListener('input', (e) => {
      window.audioEffects.midTime = parseFloat(e.target.value);
      updateValueDisplay('audio-mid-time-value', e.target.value, 1);
      if (window.kwami && window.kwami.body.blob) {
        window.kwami.body.blob.audioEffects.midTime = window.audioEffects.midTime;
      }
    });
  }
  
  // High → Time
  const audioHighTime = document.getElementById('audio-high-time');
  if (audioHighTime) {
    audioHighTime.value = window.audioEffects.highTime.toString();
    updateValueDisplay('audio-high-time-value', audioHighTime.value, 1);
    audioHighTime.addEventListener('input', (e) => {
      window.audioEffects.highTime = parseFloat(e.target.value);
      updateValueDisplay('audio-high-time-value', e.target.value, 1);
      if (window.kwami && window.kwami.body.blob) {
        window.kwami.body.blob.audioEffects.highTime = window.audioEffects.highTime;
      }
    });
  }
  
  // Ultra → Time
  const audioUltraTime = document.getElementById('audio-ultra-time');
  if (audioUltraTime) {
    audioUltraTime.value = window.audioEffects.ultraTime.toString();
    updateValueDisplay('audio-ultra-time-value', audioUltraTime.value, 1);
    audioUltraTime.addEventListener('input', (e) => {
      window.audioEffects.ultraTime = parseFloat(e.target.value);
      updateValueDisplay('audio-ultra-time-value', e.target.value, 1);
      if (window.kwami && window.kwami.body.blob) {
        window.kwami.body.blob.audioEffects.ultraTime = window.audioEffects.ultraTime;
      }
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
    audioReactiveToggle.checked = window.audioEffects.enabled;
    audioReactiveToggle.addEventListener('change', (e) => {
      window.audioEffects.enabled = e.target.checked;
      if (window.kwami && window.kwami.body.blob) {
        window.kwami.body.blob.audioEffects.enabled = window.audioEffects.enabled;
      }
      updateStatus(e.target.checked ? '🎵 Audio reactivity enabled' : '🔇 Audio reactivity disabled');
    });
  }
  
  // Time Modulation toggle
  const audioTimeToggle = document.getElementById('audio-time-enabled');
  if (audioTimeToggle) {
    audioTimeToggle.checked = window.audioEffects.timeEnabled;
    audioTimeToggle.addEventListener('change', (e) => {
      window.audioEffects.timeEnabled = e.target.checked;
      if (window.kwami && window.kwami.body.blob) {
        window.kwami.body.blob.audioEffects.timeEnabled = window.audioEffects.timeEnabled;
      }
      updateStatus(e.target.checked ? '⏱️ Time modulation enabled' : '⏱️ Time modulation disabled');
    });
  }
}

// Initialize audio effects when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeAudioEffects);
} else {
  initializeAudioEffects();
}

// ============================================================================
// GitHub Star Count
// ============================================================================

async function fetchGitHubStars() {
  try {
    const response = await fetch('https://api.github.com/repos/alexcolls/kwami');
    const data = await response.json();
    const starCount = data.stargazers_count || 0;
    
    const starCountElement = document.getElementById('star-count');
    if (starCountElement) {
      starCountElement.textContent = starCount.toLocaleString();
    }
  } catch (error) {
    console.error('Failed to fetch GitHub stars:', error);
    const starCountElement = document.getElementById('star-count');
    if (starCountElement) {
      starCountElement.textContent = '★';
    }
  }
}

// Fetch star count when page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', fetchGitHubStars);
} else {
  fetchGitHubStars();
}

// ============================================================================
// Menu Toggle
// ============================================================================

let menusVisible = true;

window.toggleMenus = function() {
  const leftSidebar = document.getElementById('left-sidebar');
  const rightSidebar = document.getElementById('right-sidebar');
  const toggleIcon = document.getElementById('menu-toggle-icon');
  
  menusVisible = !menusVisible;
  
  if (menusVisible) {
    leftSidebar.classList.remove('hidden');
    rightSidebar.classList.remove('hidden');
    toggleIcon.textContent = '◀◀';
    updateStatus('📂 Sidebars shown');
  } else {
    leftSidebar.classList.add('hidden');
    rightSidebar.classList.add('hidden');
    toggleIcon.textContent = '▶▶';
    updateStatus('📁 Sidebars hidden');
  }
};

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
