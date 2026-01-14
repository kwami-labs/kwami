import { showError, updateStatus } from '../ui/messages.js';

function getInput(id: string) {
  return document.getElementById(id) as
    | HTMLInputElement
    | HTMLTextAreaElement
    | HTMLSelectElement
    | null;
}

function getInputValue(id: string) {
  return (getInput(id)?.value ?? '').trim();
}

function setInputValue(id: string, value: string) {
  const el = getInput(id);
  if (el) el.value = value;
}

function getCheckbox(id: string) {
  return document.getElementById(id) as HTMLInputElement | null;
}

function getCheckboxChecked(id: string) {
  return Boolean(getCheckbox(id)?.checked);
}

function setDisabled(id: string, disabled: boolean) {
  const el = document.getElementById(id) as HTMLButtonElement | HTMLInputElement | null;
  if (el) el.disabled = disabled;
}

function setText(id: string, text: string) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

function showElement(id: string, display: string = 'block') {
  const el = document.getElementById(id) as HTMLElement | null;
  if (el) el.style.display = display;
}

function formatValue(value: unknown, decimals = 1) {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n)) return '';
  return n.toFixed(decimals);
}

function updateValueDisplay(id: string, value: unknown, decimals = 1) {
  setText(id, formatValue(value, decimals));
}

// Conversation toggle state sync
function updateConversationButtonState(isActive: boolean) {
  const startBtn = document.getElementById('start-conversation-btn') as HTMLButtonElement | null;
  const stopBtn = document.getElementById('stop-conversation-btn') as HTMLButtonElement | null;

  if (!startBtn || !stopBtn) return;

  if (isActive) {
    startBtn.style.display = 'none';
    stopBtn.style.display = 'block';
    stopBtn.disabled = false;
  } else {
    startBtn.style.display = 'block';
    startBtn.disabled = false;
    stopBtn.style.display = 'none';
  }
}

// Global mind configuration storage
window.mindConfig = {
  voiceSettings: {
    stability: 0.5,
    similarity_boost: 0.75,
    style: 0.0,
    use_speaker_boost: true,
  },
  pronunciationDict: {},
  outputFormat: 'mp3_44100_128',
  optimizeLatency: false,
};

// Initialize Mind
window.initializeMind = async function initializeMind() {
  const apiKey = getInputValue('api-key');
  const agentId = getInputValue('agent-id');
  let voiceId = getInputValue('voice-id');

  if (voiceId === 'custom') {
    voiceId = getInputValue('custom-voice-id');
    if (!voiceId) {
      showError('Please enter a custom voice ID');
      return;
    }
  }

  if (!apiKey) {
    showError('Please enter your ElevenLabs API Key');
    return;
  }

  if (!agentId) {
    showError('Please enter your ElevenLabs Agent ID for conversations');
    return;
  }

  try {
    updateStatus('🔄 Initializing Mind with WebSocket support...');

    if (!window.kwami?.mind) {
      showError('Kwami mind not available');
      return;
    }

    window.kwami.mind.setVoiceId(voiceId);
    window.kwami.mind.config.apiKey = apiKey;
    window.kwami.mind.config.conversational = {
      agentId,
      firstMessage: 'Hello! How can I help you today?',
    };

    const model = getInputValue('voice-model');
    window.kwami.mind.setModel(model);

    window.applyVoiceSettings?.();

    await window.kwami.mind.initialize();

    setDisabled('speak-btn', false);
    setDisabled('preview-btn', false);
    setDisabled('test-mic-btn', false);
    setDisabled('start-conversation-btn', false);

    const initBtn = document.getElementById('init-btn') as HTMLButtonElement | null;
    if (initBtn) {
      initBtn.textContent = '✅ Mind Ready';
      initBtn.disabled = true;
    }

    const canvasContainer = document.getElementById('canvas-container');
    const canvas = document.getElementById('kwami-canvas');
    canvasContainer?.classList.add('conversation-ready');
    canvas?.classList.add('conversation-ready');

    updateStatus('✅ Mind initialized! Ready to speak. Double-click Kwami to start conversation.');
  } catch (error: any) {
    showError('Failed to initialize Mind: ' + (error?.message ?? String(error)));
  }
};

// Apply Voice Settings
window.applyVoiceSettings = function applyVoiceSettings() {
  if (!window.kwami?.mind) return;

  const stability = Number(getInputValue('voice-stability'));
  const similarity_boost = Number(getInputValue('voice-similarity'));
  const style = Number(getInputValue('voice-style'));
  const use_speaker_boost = getCheckboxChecked('voice-speaker-boost');

  const settings = {
    stability,
    similarity_boost,
    style,
    use_speaker_boost,
  };

  window.mindConfig.voiceSettings = settings;
  window.kwami.mind.setVoiceSettings(settings);

  updateStatus('✅ Voice settings applied!');
};

// Load Available Voices from ElevenLabs
window.loadAvailableVoices = async function loadAvailableVoices() {
  if (!window.kwami?.mind || !window.kwami.mind.isReady()) {
    showError('Please initialize Mind first');
    return;
  }

  try {
    updateStatus('🔄 Loading available voices...');

    const voices = await window.kwami.mind.getAvailableVoices();

    const voicesList = document.getElementById('user-voices') as HTMLSelectElement | null;
    if (!voicesList) return;
    voicesList.innerHTML = '';

    voices.forEach((voice: any) => {
      const option = document.createElement('option');
      option.value = voice.voice_id;
      option.textContent = `${voice.name} (${voice.category || 'Custom'})`;
      voicesList.appendChild(option);
    });

    showElement('available-voices-list', 'block');
    updateStatus(`✅ Loaded ${voices.length} voices!`);
  } catch (error: any) {
    showError('Failed to load voices: ' + (error?.message ?? String(error)));
  }
};

// Select User Voice
window.selectUserVoice = function selectUserVoice() {
  const voicesList = document.getElementById('user-voices') as HTMLSelectElement | null;
  const selectedVoiceId = voicesList?.value ?? '';

  if (!selectedVoiceId) {
    showError('Please select a voice');
    return;
  }

  setInputValue('voice-id', 'custom');
  setInputValue('custom-voice-id', selectedVoiceId);

  const customContainer = document.getElementById('custom-voice-container') as HTMLElement | null;
  if (customContainer) customContainer.style.display = 'block';

  if (window.kwami?.mind) {
    window.kwami.mind.setVoiceId(selectedVoiceId);
  }

  const selectedText = voicesList?.options?.[voicesList.selectedIndex]?.text ?? selectedVoiceId;
  updateStatus(`✅ Voice changed to: ${selectedText}`);
};

// Apply Voice Preset
window.applyVoicePreset = function applyVoicePreset(preset: string) {
  const presets: Record<string, any> = {
    natural: { stability: 0.5, similarity_boost: 0.75, style: 0.0, use_speaker_boost: true },
    expressive: { stability: 0.3, similarity_boost: 0.8, style: 0.4, use_speaker_boost: true },
    stable: { stability: 0.8, similarity_boost: 0.7, style: 0.0, use_speaker_boost: true },
    clear: { stability: 0.7, similarity_boost: 0.9, style: 0.0, use_speaker_boost: true },
  };

  const settings = presets[preset];
  if (!settings) return;

  setInputValue('voice-stability', String(settings.stability));
  setInputValue('voice-similarity', String(settings.similarity_boost));
  setInputValue('voice-style', String(settings.style));

  const boost = getCheckbox('voice-speaker-boost');
  if (boost) boost.checked = Boolean(settings.use_speaker_boost);

  updateValueDisplay('voice-stability-value', settings.stability, 2);
  updateValueDisplay('voice-similarity-value', settings.similarity_boost, 2);
  updateValueDisplay('voice-style-value', settings.style, 2);

  window.applyVoiceSettings?.();

  const presetNames: Record<string, string> = {
    natural: 'Natural',
    expressive: 'Expressive',
    stable: 'Stable',
    clear: 'Clear & Crisp',
  };

  updateStatus(`✅ Applied ${presetNames[preset] ?? preset} preset!`);
};

// Alternative implementation using library method
window.applyVoicePresetV2 = function applyVoicePresetV2(preset: string) {
  if (!window.kwami?.mind) return;

  const allowed = ['natural', 'expressive', 'stable', 'clear'] as const;
  if (!allowed.includes(preset as any)) {
    showError(`Unknown voice preset: ${preset}`);
    return;
  }

  window.kwami.mind.applyVoicePreset(preset as (typeof allowed)[number]);
  updateStatus(`✅ Applied ${preset} voice preset`);
};

// Preview Voice
window.previewVoice = async function previewVoice() {
  const previewText = 'Hello! This is a preview of my voice. How do I sound?';

  try {
    updateStatus('🎤 Generating preview...');
    setDisabled('preview-btn', true);

    await window.kwami?.speak(previewText);

    updateStatus('✅ Preview complete!');
    setDisabled('preview-btn', false);
  } catch (error: any) {
    showError('Failed to preview voice: ' + (error?.message ?? String(error)));
    setDisabled('preview-btn', false);
  }
};

// Toggle Conversation (used by both button and double-click)
window.toggleConversation = async function toggleConversation() {
  if (!window.kwami) return;

  if (window.kwami.isConversationActive()) {
    await window.stopConversation?.();
  } else {
    await window.startConversation?.();
  }
};

// Start Conversation
window.startConversation = async function startConversation() {
  if (!window.kwami?.mind || !window.kwami.mind.isReady()) {
    showError('Please initialize Mind first');
    return;
  }

  const agentId = getInputValue('agent-id');
  if (!agentId) {
    showError('Please enter an Agent ID for conversational AI');
    return;
  }

  const firstMessage = getInputValue('conversation-first-message');
  const maxDurationRaw = getInputValue('conversation-max-duration');
  const maxDuration = Number.parseInt(maxDurationRaw || '300', 10) || 300;
  const allowInterruption = getCheckboxChecked('conversation-interruption');

  try {
    updateStatus('🔄 Starting WebSocket conversation...');
    updateConversationButtonState(false);

    window.kwami.mind.config.conversational = {
      agentId,
      firstMessage: firstMessage || 'Hello! How can I help you today?',
      maxDuration,
      allowInterruption,
    };

    let transcriptArea = document.getElementById('conversation-transcript') as HTMLElement | null;
    if (!transcriptArea) {
      const conversationSection = document.querySelector('.section:has(#agent-id)') as HTMLElement | null;
      if (conversationSection) {
        transcriptArea = document.createElement('div');
        transcriptArea.id = 'conversation-transcript';
        transcriptArea.style.cssText =
          'margin-top: 15px; padding: 10px; background: #f5f5f5; border-radius: 8px; max-height: 200px; overflow-y: auto; font-size: 12px; display: none;';
        transcriptArea.innerHTML = '<div style="color: #888; margin-bottom: 5px;">📝 Conversation Transcript:</div>';
        conversationSection.appendChild(transcriptArea);
      }
    }

    const callbacks: any =
      (window as any).conversationCallbacks || {
        onAgentResponse: (text: string) => {
          console.log('Agent:', text);

          const statusMessage = document.getElementById('conversation-status-message') as HTMLElement | null;
          if (statusMessage) {
            statusMessage.innerHTML = text.replace(/\n/g, '<br>');
          }

          if (transcriptArea) {
            const entry = document.createElement('div');
            entry.style.cssText = 'margin: 5px 0; padding: 5px; background: #e3e8ff; border-radius: 4px;';
            entry.innerHTML = `<strong>🤖 Agent:</strong> ${text}`;
            transcriptArea.appendChild(entry);
            transcriptArea.scrollTop = transcriptArea.scrollHeight;
            transcriptArea.style.display = 'block';
          }
        },
        onUserTranscript: (text: string) => {
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
        onError: (error: any) => {
          showError('Conversation error: ' + (error?.message ?? String(error)));
          window.stopConversation?.();
        },
      };

    if (transcriptArea) {
      callbacks.transcriptArea = transcriptArea;
    }

    await window.kwami.startConversation(callbacks);

    updateConversationButtonState(true);

    const statusContainer = document.getElementById('conversation-status-container') as HTMLElement | null;
    const statusMessage = document.getElementById('conversation-status-message') as HTMLElement | null;
    if (statusContainer && statusMessage) {
      statusContainer.style.display = 'block';
      statusMessage.innerHTML = '🎙️ Conversation active - Speak naturally, your voice is being captured!';
    }

    updateStatus('✅ Conversation started! Speak to interact with the agent. (Double-click Kwami to stop)');
  } catch (error: any) {
    showError('Failed to start conversation: ' + (error?.message ?? String(error)));
    updateConversationButtonState(false);
  }
};

// Stop Conversation
window.stopConversation = async function stopConversation() {
  if (!window.kwami) return;

  try {
    updateStatus('🔄 Stopping conversation...');
    await window.kwami.stopConversation();

    const statusContainer = document.getElementById('conversation-status-container') as HTMLElement | null;
    if (statusContainer) {
      statusContainer.style.display = 'none';
    }

    updateConversationButtonState(false);
    updateStatus('✅ Conversation stopped. (Double-click Kwami to start again)');
  } catch (error: any) {
    showError('Failed to stop conversation: ' + (error?.message ?? String(error)));
  }
};

// Test Microphone
window.testMicrophone = async function testMicrophone() {
  if (!window.kwami?.mind) {
    showError('Please initialize Mind first');
    return;
  }

  try {
    updateStatus('🎤 Testing microphone...');

    await window.kwami.mind.listen();

    showElement('mic-status', 'block');
    setText('mic-status-text', 'Active');

    const micStatusText = document.getElementById('mic-status-text') as HTMLElement | null;
    if (micStatusText) micStatusText.style.color = '#4CAF50';

    updateStatus('✅ Microphone is working!');

    setTimeout(() => {
      window.kwami?.mind?.stopListening();
      setText('mic-status-text', 'Test complete');
      const el = document.getElementById('mic-status-text') as HTMLElement | null;
      if (el) el.style.color = '#888';
    }, 3000);
  } catch (error: any) {
    showElement('mic-status', 'block');
    setText('mic-status-text', 'Failed');
    const el = document.getElementById('mic-status-text') as HTMLElement | null;
    if (el) el.style.color = '#f44336';
    showError('Microphone test failed: ' + (error?.message ?? String(error)));
  }
};

// Apply Pronunciation Rules
window.applyPronunciation = function applyPronunciation() {
  const dictText = getInputValue('pronunciation-dict');

  if (!dictText) {
    updateStatus('ℹ️ No pronunciation rules to apply');
    return;
  }

  const lines = dictText.split('\n');
  const dict: Record<string, string> = {};

  lines.forEach((line) => {
    const [word, pronunciation] = line.split(':').map((s) => s.trim());
    if (word && pronunciation) {
      dict[word] = pronunciation;
    }
  });

  window.mindConfig.pronunciationDict = dict;
  updateStatus(`✅ Applied ${Object.keys(dict).length} pronunciation rules!`);
};

// Check API Usage
window.checkUsage = async function checkUsage() {
  if (!window.kwami?.mind || !window.kwami.mind.isReady()) {
    showError('Please initialize Mind first');
    return;
  }

  try {
    updateStatus('🔄 Checking API usage...');

    showElement('usage-info', 'block');
    setText('usage-characters', 'N/A');
    setText('usage-limit', 'N/A');
    setText('usage-remaining', 'N/A');

    updateStatus('ℹ️ Usage API endpoint requires additional implementation');
  } catch (error: any) {
    showError('Failed to check usage: ' + (error?.message ?? String(error)));
  }
};

// Export Mind Configuration
window.exportMindConfig = function exportMindConfig() {
  const config = {
    voiceId: getInputValue('voice-id'),
    model: getInputValue('voice-model'),
    language: getInputValue('voice-language'),
    voiceSettings: {
      stability: Number(getInputValue('voice-stability')),
      similarity_boost: Number(getInputValue('voice-similarity')),
      style: Number(getInputValue('voice-style')),
      use_speaker_boost: getCheckboxChecked('voice-speaker-boost'),
    },
    advancedSettings: {
      outputFormat: getInputValue('tts-output-format'),
      optimizeLatency: getCheckboxChecked('tts-optimize-latency'),
      nextTextTimeout: Number.parseInt(getInputValue('tts-next-text') || '0', 10),
    },
    conversational: {
      agentId: getInputValue('agent-id'),
      firstMessage: getInputValue('conversation-first-message'),
      maxDuration: Number.parseInt(getInputValue('conversation-max-duration') || '300', 10),
      allowInterruption: getCheckboxChecked('conversation-interruption'),
    },
    stt: {
      model: getInputValue('stt-model'),
      punctuation: getCheckboxChecked('stt-punctuation'),
      diarization: getCheckboxChecked('stt-diarization'),
    },
    pronunciation: {
      dictionary: getInputValue('pronunciation-dict'),
      usePhonemes: getCheckboxChecked('use-phonemes'),
    },
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
window.importMindConfig = function importMindConfig() {
  const fileInput = document.getElementById('mind-config-import') as HTMLInputElement | null;
  fileInput?.click();
};

// Initialize Mind controls event listeners
export function initializeMindControls() {
  const voiceIdSelect = document.getElementById('voice-id') as HTMLSelectElement | null;
  if (voiceIdSelect) {
    voiceIdSelect.addEventListener('change', (e) => {
      const target = e.target as HTMLSelectElement | null;
      const customContainer = document.getElementById('custom-voice-container') as HTMLElement | null;

      if (target?.value === 'custom') {
        if (customContainer) customContainer.style.display = 'block';
      } else {
        if (customContainer) customContainer.style.display = 'none';
        if (window.kwami?.mind && target?.value) {
          window.kwami.mind.setVoiceId(target.value);
        }
      }
    });
  }

  const voiceStability = document.getElementById('voice-stability') as HTMLInputElement | null;
  if (voiceStability) {
    voiceStability.addEventListener('input', (e) => {
      const target = e.target as HTMLInputElement | null;
      updateValueDisplay('voice-stability-value', target?.value, 2);
    });
  }

  const voiceSimilarity = document.getElementById('voice-similarity') as HTMLInputElement | null;
  if (voiceSimilarity) {
    voiceSimilarity.addEventListener('input', (e) => {
      const target = e.target as HTMLInputElement | null;
      updateValueDisplay('voice-similarity-value', target?.value, 2);
    });
  }

  const voiceStyle = document.getElementById('voice-style') as HTMLInputElement | null;
  if (voiceStyle) {
    voiceStyle.addEventListener('input', (e) => {
      const target = e.target as HTMLInputElement | null;
      updateValueDisplay('voice-style-value', target?.value, 2);
    });
  }

  const ttsNextText = document.getElementById('tts-next-text') as HTMLInputElement | null;
  if (ttsNextText) {
    ttsNextText.addEventListener('input', (e) => {
      const target = e.target as HTMLInputElement | null;
      updateValueDisplay('tts-next-text-value', target?.value, 0);
    });
  }

  const voiceModel = document.getElementById('voice-model') as HTMLSelectElement | null;
  if (voiceModel) {
    voiceModel.addEventListener('change', (e) => {
      const target = e.target as HTMLSelectElement | null;
      if (window.kwami?.mind && target?.value) {
        window.kwami.mind.setModel(target.value);
        const label = target.options[target.selectedIndex]?.text ?? target.value;
        updateStatus(`Model changed to: ${label}`);
      }
    });
  }

  const configImport = document.getElementById('mind-config-import') as HTMLInputElement | null;
  if (configImport) {
    configImport.addEventListener('change', async (e) => {
      const target = e.target as HTMLInputElement | null;
      const file = target?.files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        const config = JSON.parse(text);

        if (config.voiceId) setInputValue('voice-id', config.voiceId);
        if (config.model) setInputValue('voice-model', config.model);
        if (config.language) setInputValue('voice-language', config.language);

        if (config.voiceSettings) {
          setInputValue('voice-stability', String(config.voiceSettings.stability));
          setInputValue('voice-similarity', String(config.voiceSettings.similarity_boost));
          setInputValue('voice-style', String(config.voiceSettings.style));
          const boost = getCheckbox('voice-speaker-boost');
          if (boost) boost.checked = Boolean(config.voiceSettings.use_speaker_boost);

          updateValueDisplay('voice-stability-value', config.voiceSettings.stability, 2);
          updateValueDisplay('voice-similarity-value', config.voiceSettings.similarity_boost, 2);
          updateValueDisplay('voice-style-value', config.voiceSettings.style, 2);
        }

        if (config.advancedSettings) {
          setInputValue('tts-output-format', config.advancedSettings.outputFormat);
          const opt = getCheckbox('tts-optimize-latency');
          if (opt) opt.checked = Boolean(config.advancedSettings.optimizeLatency);
          setInputValue('tts-next-text', String(config.advancedSettings.nextTextTimeout));
          updateValueDisplay('tts-next-text-value', config.advancedSettings.nextTextTimeout, 0);
        }

        if (config.conversational) {
          setInputValue('agent-id', config.conversational.agentId || '');
          setInputValue('conversation-first-message', config.conversational.firstMessage || '');
          setInputValue('conversation-max-duration', String(config.conversational.maxDuration || 300));
          const allow = getCheckbox('conversation-interruption');
          if (allow) allow.checked = Boolean(config.conversational.allowInterruption);
        }

        if (config.stt) {
          setInputValue('stt-model', config.stt.model || 'base');
          const punct = getCheckbox('stt-punctuation');
          if (punct) punct.checked = config.stt.punctuation !== false;
          const diar = getCheckbox('stt-diarization');
          if (diar) diar.checked = Boolean(config.stt.diarization);
        }

        if (config.pronunciation) {
          setInputValue('pronunciation-dict', config.pronunciation.dictionary || '');
          const phon = getCheckbox('use-phonemes');
          if (phon) phon.checked = Boolean(config.pronunciation.usePhonemes);
        }

        updateStatus('✅ Mind configuration imported!');
      } catch (error: any) {
        showError('Failed to import configuration: ' + (error?.message ?? String(error)));
      } finally {
        // allow re-importing same file
        target.value = '';
      }
    });
  }
}
