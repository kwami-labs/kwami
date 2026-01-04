/**
 * Eleven Labs Agent Platform Integration
 * Comprehensive API client for all agent platform features
 */

import { showError, updateStatus } from './ui/messages.js';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface ElevenLabsConfig {
  apiKey: string;
  baseURL: string;
}

interface Agent {
  agent_id: string;
  name: string;
  description?: string;
  conversation_config: any;
  platform_settings?: any;
  tags?: string[];
  created_at?: string;
}

interface KnowledgeBase {
  id: string;
  name: string;
  description?: string;
  created_at?: string;
}

interface Tool {
  type: string;
  name: string;
  description: string;
  [key: string]: any;
}

// ============================================================================
// GLOBAL STATE
// ============================================================================

const elevenLabsState = {
  apiKey: '',
  baseURL: 'https://api.elevenlabs.io/v1',
  selectedAgent: null as Agent | null,
  agents: [] as Agent[],
  knowledgeBases: [] as KnowledgeBase[],
  tools: [] as Tool[],
  isInitialized: false,
};

// ============================================================================
// API REQUEST HELPER
// ============================================================================

async function makeAPIRequest(
  endpoint: string,
  options: RequestInit = {}
): Promise<any> {
  if (!elevenLabsState.apiKey) {
    throw new Error('API key not set. Please initialize first.');
  }

  const url = `${elevenLabsState.baseURL}${endpoint}`;
  const headers = {
    'xi-api-key': elevenLabsState.apiKey,
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API Error (${response.status}): ${errorText}`);
  }

  // Handle empty responses
  const text = await response.text();
  return text ? JSON.parse(text) : {};
}

// ============================================================================
// 1. API INITIALIZATION
// ============================================================================

export async function initializeElevenLabsAPI(): Promise<void> {
  const apiKeyInput = document.getElementById('elevenlabs-api-key') as HTMLInputElement;
  const apiKey = apiKeyInput?.value?.trim();

  if (!apiKey) {
    showError('Please enter your Eleven Labs API key');
    return;
  }

  try {
    updateStatus('🔄 Connecting to Eleven Labs...');

    elevenLabsState.apiKey = apiKey;
    elevenLabsState.isInitialized = true;

    // Test the API key by fetching user info or voices
    await makeAPIRequest('/voices');

    // Configure Kwami Mind with the API key
    if ((window as any).kwami?.mind) {
      (window as any).kwami.mind.config.apiKey = apiKey;
      (window as any).kwami.mind.config.provider = 'elevenlabs';
      await (window as any).kwami.mind.initialize();
      updateStatus('🔄 Initializing Kwami Mind...');
    }

    // Enable all sections
    const sections = document.querySelectorAll('.disabled-section');
    sections.forEach((section) => {
      section.classList.remove('disabled-section');
    });

    const statusEl = document.getElementById('api-status');
    if (statusEl) {
      statusEl.style.display = 'block';
    }

    const initBtn = document.getElementById('init-api-btn') as HTMLButtonElement;
    if (initBtn) {
      initBtn.textContent = '✅ Connected';
      initBtn.disabled = true;
    }

    updateStatus('✅ Successfully connected to Eleven Labs!');

    // Auto-load agents and other resources
    await refreshAgentsList();
  } catch (error: any) {
    showError(`Failed to connect: ${error.message}`);
    elevenLabsState.isInitialized = false;
  }
}

// ============================================================================
// 2. AGENT MANAGEMENT
// ============================================================================

export async function createAgent(): Promise<void> {
  if (!elevenLabsState.isInitialized) {
    showError('Please initialize API connection first');
    return;
  }

  const nameInput = document.getElementById('agent-name') as HTMLInputElement;
  const descInput = document.getElementById('agent-description') as HTMLTextAreaElement;

  const name = nameInput?.value?.trim();
  if (!name) {
    showError('Please enter an agent name');
    return;
  }

  try {
    updateStatus('🔄 Creating agent...');

    // Gather all configuration
    const config = gatherAgentConfiguration();

    const agentData = {
      name,
      description: descInput?.value?.trim() || undefined,
      conversation_config: config.conversation_config,
      platform_settings: config.platform_settings,
    };

    const agent = await makeAPIRequest('/convai/agents/create', {
      method: 'POST',
      body: JSON.stringify(agentData),
    });

    elevenLabsState.agents.push(agent);
    
    updateStatus(`✅ Agent "${name}" created successfully!`);
    
    // Clear form
    if (nameInput) nameInput.value = '';
    if (descInput) descInput.value = '';
    
    // Refresh list
    await refreshAgentsList();
    
    // Select the new agent
    selectAgent(agent.agent_id);
  } catch (error: any) {
    showError(`Failed to create agent: ${error.message}`);
  }
}

function gatherAgentConfiguration(): any {
  // Gather prompt configuration
  const firstMessage = (document.getElementById('agent-first-message') as HTMLInputElement)?.value || 'Hello! How can I help you today?';
  const language = (document.getElementById('agent-language') as HTMLSelectElement)?.value || 'en';
  const systemPrompt = (document.getElementById('agent-system-prompt') as HTMLTextAreaElement)?.value || 'You are a helpful AI assistant.';
  const llmModel = (document.getElementById('agent-llm-model') as HTMLSelectElement)?.value || 'gpt-4o-mini';
  const temperature = parseFloat((document.getElementById('agent-temperature') as HTMLInputElement)?.value || '0.7');
  const maxTokens = parseInt((document.getElementById('agent-max-tokens') as HTMLInputElement)?.value || '1000', 10);

  // Gather voice configuration
  const voiceId = (document.getElementById('agent-voice-id') as HTMLSelectElement)?.value;
  const customVoiceId = (document.getElementById('custom-voice-id') as HTMLInputElement)?.value;
  const finalVoiceId = voiceId === 'custom' ? customVoiceId : voiceId;
  
  const ttsModel = (document.getElementById('agent-tts-model') as HTMLSelectElement)?.value || 'eleven_turbo_v2_5';
  const stability = parseFloat((document.getElementById('voice-stability') as HTMLInputElement)?.value || '0.5');
  const similarityBoost = parseFloat((document.getElementById('voice-similarity') as HTMLInputElement)?.value || '0.75');
  const style = parseFloat((document.getElementById('voice-style') as HTMLInputElement)?.value || '0');
  const useSpeakerBoost = (document.getElementById('voice-speaker-boost') as HTMLInputElement)?.checked || true;

  // TODO: Gather knowledge bases and tools (implement when needed)

  return {
    conversation_config: {
      agent: {
        first_message: firstMessage,
        language,
        prompt: {
          prompt: systemPrompt,
          llm: llmModel,
          temperature,
          max_tokens: maxTokens,
        },
      },
      tts: {
        voice_id: finalVoiceId,
        model_id: ttsModel,
        stability,
        similarity_boost: similarityBoost,
        style,
        use_speaker_boost: useSpeakerBoost,
      },
    },
    platform_settings: {},
  };
}

export async function refreshAgentsList(): Promise<void> {
  if (!elevenLabsState.isInitialized) return;

  try {
    updateStatus('🔄 Loading agents...');

    const response = await makeAPIRequest('/convai/agents');
    elevenLabsState.agents = response.agents || response || [];

    renderAgentsList();
    updateStatus(`✅ Loaded ${elevenLabsState.agents.length} agents`);
  } catch (error: any) {
    showError(`Failed to load agents: ${error.message}`);
  }
}

function renderAgentsList(): void {
  const listEl = document.getElementById('agents-list');
  if (!listEl) return;

  if (elevenLabsState.agents.length === 0) {
    listEl.innerHTML = '<small style="color: #888;">No agents yet. Create one above!</small>';
    return;
  }

  listEl.innerHTML = elevenLabsState.agents
    .map(
      (agent) => `
      <div class="agent-card ${elevenLabsState.selectedAgent?.agent_id === agent.agent_id ? 'selected' : ''}" onclick="selectAgent('${agent.agent_id}')">
        <div class="agent-card-header">
          <div class="agent-name">${agent.name}</div>
        </div>
        ${agent.description ? `<div class="agent-desc">${agent.description}</div>` : ''}
        <div class="agent-meta">${agent.agent_id}</div>
      </div>
    `
    )
    .join('');
}

export function selectAgent(agentId: string): void {
  const agent = elevenLabsState.agents.find((a) => a.agent_id === agentId);
  if (!agent) return;

  elevenLabsState.selectedAgent = agent;
  renderAgentsList();

  // Configure Kwami Mind with this agent
  if ((window as any).kwami?.mind) {
    (window as any).kwami.mind.config.conversational = {
      agentId: agent.agent_id,
      firstMessage: agent.conversation_config?.agent?.first_message || 'Hello! How can I help you today?',
    };
  }

  // Update selected agent card
  const selectedCard = document.getElementById('selected-agent-card');
  const nameEl = document.getElementById('selected-agent-name');
  const idEl = document.getElementById('selected-agent-id');
  const startBtn = document.getElementById('start-conversation-btn') as HTMLButtonElement;

  if (selectedCard) selectedCard.style.display = 'block';
  if (nameEl) nameEl.textContent = agent.name;
  if (idEl) idEl.textContent = agent.agent_id;
  if (startBtn) startBtn.disabled = false;

  updateStatus(`✅ Selected agent: ${agent.name}`);
}

export async function editSelectedAgent(): Promise<void> {
  if (!elevenLabsState.selectedAgent) {
    showError('No agent selected');
    return;
  }

  // TODO: Implement edit functionality - populate form with agent details
  showError('Edit functionality coming soon!');
}

export async function duplicateSelectedAgent(): Promise<void> {
  if (!elevenLabsState.selectedAgent) {
    showError('No agent selected');
    return;
  }

  try {
    updateStatus('🔄 Duplicating agent...');

    const response = await makeAPIRequest(`/convai/agents/${elevenLabsState.selectedAgent.agent_id}/duplicate`, {
      method: 'POST',
    });

    await refreshAgentsList();
    updateStatus(`✅ Agent duplicated successfully!`);
  } catch (error: any) {
    showError(`Failed to duplicate agent: ${error.message}`);
  }
}

export async function deleteSelectedAgent(): Promise<void> {
  if (!elevenLabsState.selectedAgent) {
    showError('No agent selected');
    return;
  }

  if (!confirm(`Are you sure you want to delete "${elevenLabsState.selectedAgent.name}"?`)) {
    return;
  }

  try {
    updateStatus('🔄 Deleting agent...');

    await makeAPIRequest(`/convai/agents/${elevenLabsState.selectedAgent.agent_id}`, {
      method: 'DELETE',
    });

    elevenLabsState.selectedAgent = null;
    await refreshAgentsList();
    
    const selectedCard = document.getElementById('selected-agent-card');
    if (selectedCard) selectedCard.style.display = 'none';

    updateStatus(`✅ Agent deleted successfully`);
  } catch (error: any) {
    showError(`Failed to delete agent: ${error.message}`);
  }
}

// ============================================================================
// 3. VOICE CONFIGURATION
// ============================================================================

export async function loadMyVoices(): Promise<void> {
  if (!elevenLabsState.isInitialized) {
    showError('Please initialize API connection first');
    return;
  }

  try {
    updateStatus('🔄 Loading your voices...');

    const response = await makeAPIRequest('/voices');
    const voices = response.voices || [];

    const voiceSelect = document.getElementById('agent-voice-id') as HTMLSelectElement;
    if (!voiceSelect) return;

    // Clear existing options except default ones
    const defaultOptions = Array.from(voiceSelect.options).slice(0, 8); // Keep first 8 default voices
    voiceSelect.innerHTML = '';
    defaultOptions.forEach((opt) => voiceSelect.add(opt));

    // Add custom voices
    if (voices.length > 0) {
      const separator = new Option('--- My Custom Voices ---', '', true, false);
      separator.disabled = true;
      voiceSelect.add(separator);

      voices.forEach((voice: any) => {
        const option = new Option(`${voice.name} (Custom)`, voice.voice_id);
        voiceSelect.add(option);
      });
    }

    updateStatus(`✅ Loaded ${voices.length} custom voices`);
  } catch (error: any) {
    showError(`Failed to load voices: ${error.message}`);
  }
}

export async function previewVoice(): Promise<void> {
  if (!elevenLabsState.isInitialized) {
    showError('Please initialize API connection first');
    return;
  }

  const voiceId = (document.getElementById('agent-voice-id') as HTMLSelectElement)?.value;
  const customVoiceId = (document.getElementById('custom-voice-id') as HTMLInputElement)?.value;
  const finalVoiceId = voiceId === 'custom' ? customVoiceId : voiceId;

  if (!finalVoiceId) {
    showError('Please select a voice');
    return;
  }

  try {
    updateStatus('🔊 Generating voice preview...');

    const previewText = 'Hello! This is a preview of my voice. How do I sound?';
    const response = await makeAPIRequest(`/text-to-speech/${finalVoiceId}`, {
      method: 'POST',
      body: JSON.stringify({ text: previewText }),
    });

    // Play the audio
    const audioBlob = await response.blob();
    const audioURL = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioURL);
    audio.play();

    updateStatus('✅ Playing voice preview');
  } catch (error: any) {
    showError(`Failed to preview voice: ${error.message}`);
  }
}

export function applyVoicePreset(preset: string): void {
  const presets: Record<string, any> = {
    natural: { stability: 0.5, similarity_boost: 0.75, style: 0.0, use_speaker_boost: true },
    expressive: { stability: 0.3, similarity_boost: 0.8, style: 0.4, use_speaker_boost: true },
    stable: { stability: 0.8, similarity_boost: 0.7, style: 0.0, use_speaker_boost: true },
  };

  const settings = presets[preset];
  if (!settings) return;

  const stabilityInput = document.getElementById('voice-stability') as HTMLInputElement;
  const similarityInput = document.getElementById('voice-similarity') as HTMLInputElement;
  const styleInput = document.getElementById('voice-style') as HTMLInputElement;
  const boostCheckbox = document.getElementById('voice-speaker-boost') as HTMLInputElement;

  if (stabilityInput) {
    stabilityInput.value = String(settings.stability);
    updateValueDisplay('voice-stability-value', settings.stability, 2);
  }
  if (similarityInput) {
    similarityInput.value = String(settings.similarity_boost);
    updateValueDisplay('voice-similarity-value', settings.similarity_boost, 2);
  }
  if (styleInput) {
    styleInput.value = String(settings.style);
    updateValueDisplay('voice-style-value', settings.style, 2);
  }
  if (boostCheckbox) {
    boostCheckbox.checked = settings.use_speaker_boost;
  }

  updateStatus(`✅ Applied ${preset} voice preset`);
}

// ============================================================================
// 4. KNOWLEDGE BASE MANAGEMENT
// ============================================================================

export async function refreshKBList(): Promise<void> {
  if (!elevenLabsState.isInitialized) return;

  try {
    updateStatus('🔄 Loading knowledge bases...');

    // TODO: Implement actual API call when endpoint is known
    const response = await makeAPIRequest('/convai/knowledge-base');
    elevenLabsState.knowledgeBases = response.knowledge_bases || [];

    renderKBList();
    updateStatus(`✅ Loaded ${elevenLabsState.knowledgeBases.length} knowledge bases`);
  } catch (error: any) {
    // If endpoint doesn't exist yet, just show empty
    elevenLabsState.knowledgeBases = [];
    renderKBList();
  }
}

function renderKBList(): void {
  const listEl = document.getElementById('kb-list');
  if (!listEl) return;

  if (elevenLabsState.knowledgeBases.length === 0) {
    listEl.innerHTML = '<small style="color: #888;">No knowledge bases yet</small>';
    return;
  }

  listEl.innerHTML = elevenLabsState.knowledgeBases
    .map(
      (kb) => `
      <div class="kb-card">
        <div class="kb-header">
          <div class="kb-name">${kb.name}</div>
          <button onclick="deleteKB('${kb.id}')" class="delete-btn">🗑️</button>
        </div>
        ${kb.description ? `<div class="kb-desc">${kb.description}</div>` : ''}
        <div class="kb-meta">${kb.id}</div>
      </div>
    `
    )
    .join('');
}

export async function uploadKBFile(): Promise<void> {
  const fileInput = document.getElementById('kb-file-input') as HTMLInputElement;
  const nameInput = document.getElementById('kb-name') as HTMLInputElement;

  if (!fileInput?.files?.length) {
    showError('Please select a file');
    return;
  }

  const file = fileInput.files[0];
  const name = nameInput?.value?.trim() || file.name;

  try {
    updateStatus('📤 Uploading knowledge base file...');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', name);

    const response = await makeAPIRequest('/convai/knowledge-base/file', {
      method: 'POST',
      headers: {
        'xi-api-key': elevenLabsState.apiKey,
        // Don't set Content-Type, let browser set it with boundary for FormData
      } as any,
      body: formData,
    });

    elevenLabsState.knowledgeBases.push(response);
    renderKBList();

    if (nameInput) nameInput.value = '';
    fileInput.value = '';

    updateStatus(`✅ Knowledge base "${name}" created successfully!`);
  } catch (error: any) {
    showError(`Failed to upload file: ${error.message}`);
  }
}

export async function createKBFromText(): Promise<void> {
  const textInput = document.getElementById('kb-text-input') as HTMLTextAreaElement;
  const nameInput = document.getElementById('kb-name') as HTMLInputElement;

  const text = textInput?.value?.trim();
  const name = nameInput?.value?.trim();

  if (!text) {
    showError('Please enter some text');
    return;
  }
  if (!name) {
    showError('Please enter a name for the knowledge base');
    return;
  }

  try {
    updateStatus('✨ Creating knowledge base from text...');

    const response = await makeAPIRequest('/convai/knowledge-base/text', {
      method: 'POST',
      body: JSON.stringify({ name, text }),
    });

    elevenLabsState.knowledgeBases.push(response);
    renderKBList();

    if (nameInput) nameInput.value = '';
    if (textInput) textInput.value = '';

    updateStatus(`✅ Knowledge base "${name}" created successfully!`);
  } catch (error: any) {
    showError(`Failed to create knowledge base: ${error.message}`);
  }
}

export async function createKBFromURL(): Promise<void> {
  const urlInput = document.getElementById('kb-url-input') as HTMLInputElement;
  const nameInput = document.getElementById('kb-name') as HTMLInputElement;

  const url = urlInput?.value?.trim();
  const name = nameInput?.value?.trim();

  if (!url) {
    showError('Please enter a URL');
    return;
  }
  if (!name) {
    showError('Please enter a name for the knowledge base');
    return;
  }

  try {
    updateStatus('🌐 Creating knowledge base from URL...');

    const response = await makeAPIRequest('/convai/knowledge-base/url', {
      method: 'POST',
      body: JSON.stringify({ name, url }),
    });

    elevenLabsState.knowledgeBases.push(response);
    renderKBList();

    if (nameInput) nameInput.value = '';
    if (urlInput) urlInput.value = '';

    updateStatus(`✅ Knowledge base "${name}" created successfully!`);
  } catch (error: any) {
    showError(`Failed to create knowledge base: ${error.message}`);
  }
}

// ============================================================================
// 5. TOOLS & WEBHOOKS
// ============================================================================

export async function refreshToolsList(): Promise<void> {
  // Tools are typically stored per-agent, not globally
  // This would need to be implemented based on how tools are stored
  updateStatus('Tools management coming soon!');
}

export async function createWebhookTool(): Promise<void> {
  const nameInput = document.getElementById('tool-name') as HTMLInputElement;
  const descInput = document.getElementById('tool-description') as HTMLTextAreaElement;
  const urlInput = document.getElementById('tool-webhook-url') as HTMLInputElement;
  const methodSelect = document.getElementById('tool-http-method') as HTMLSelectElement;
  const headersInput = document.getElementById('tool-headers') as HTMLTextAreaElement;
  const schemaInput = document.getElementById('tool-api-schema') as HTMLTextAreaElement;
  const timeoutInput = document.getElementById('tool-timeout') as HTMLInputElement;

  const name = nameInput?.value?.trim();
  const description = descInput?.value?.trim();
  const url = urlInput?.value?.trim();

  if (!name || !description || !url) {
    showError('Please fill in all required fields');
    return;
  }

  try {
    const headers = headersInput?.value?.trim() ? JSON.parse(headersInput.value) : {};
    const apiSchema = schemaInput?.value?.trim() ? JSON.parse(schemaInput.value) : {};

    const tool: Tool = {
      type: 'webhook',
      name,
      description,
      url,
      method: methodSelect?.value || 'POST',
      headers,
      api_schema: apiSchema,
      response_timeout_secs: parseInt(timeoutInput?.value || '10', 10),
      disable_interruptions: (document.getElementById('tool-disable-interruptions') as HTMLInputElement)?.checked || false,
    };

    // Tools are typically attached to agents, not created separately
    // For now, just store locally
    elevenLabsState.tools.push(tool);

    // Clear form
    if (nameInput) nameInput.value = '';
    if (descInput) descInput.value = '';
    if (urlInput) urlInput.value = '';
    if (headersInput) headersInput.value = '';
    if (schemaInput) schemaInput.value = '';

    updateStatus(`✅ Tool "${name}" created successfully!`);
  } catch (error: any) {
    showError(`Failed to create tool: ${error.message}`);
  }
}

// ============================================================================
// 6. CONVERSATION MANAGEMENT
// ============================================================================

export async function startConversationWithSelectedAgent(): Promise<void> {
  if (!elevenLabsState.selectedAgent) {
    showError('Please select an agent first');
    return;
  }

  if (!(window as any).kwami?.mind) {
    showError('Kwami Mind not initialized');
    return;
  }

  try {
    updateStatus('🎙️ Connecting to agent...');

    // Use Kwami's built-in conversation method
    const callbacks = {
      onAgentResponse: (text: string) => {
        const transcript = document.getElementById('conversation-transcript');
        if (transcript) {
          const entry = document.createElement('div');
          entry.style.cssText = 'margin: 5px 0; padding: 5px; background: rgba(102, 126, 234, 0.1); border-radius: 4px;';
          entry.innerHTML = `<strong>🤖 Agent:</strong> ${text}`;
          transcript.appendChild(entry);
          transcript.scrollTop = transcript.scrollHeight;
        }
      },
      onUserTranscript: (text: string) => {
        const transcript = document.getElementById('conversation-transcript');
        if (transcript) {
          const entry = document.createElement('div');
          entry.style.cssText = 'margin: 5px 0; padding: 5px; background: rgba(255, 255, 255, 0.05); border-radius: 4px;';
          entry.innerHTML = `<strong>👤 You:</strong> ${text}`;
          transcript.appendChild(entry);
          transcript.scrollTop = transcript.scrollHeight;
        }
      },
      onError: (error: any) => {
        showError(`Conversation error: ${error?.message || String(error)}`);
        stopConversationSession();
      },
    };

    // Start conversation using Kwami's Mind
    await (window as any).kwami.mind.startConversation(undefined, callbacks);

    const statusText = document.getElementById('conversation-status-text');
    if (statusText) statusText.textContent = 'Connected';

    const startBtn = document.getElementById('start-conversation-btn');
    const stopBtn = document.getElementById('stop-conversation-btn');
    if (startBtn) startBtn.style.display = 'none';
    if (stopBtn) {
      stopBtn.style.display = 'block';
      (stopBtn as HTMLButtonElement).disabled = false;
    }

    const transcriptContainer = document.getElementById('conversation-transcript-container');
    if (transcriptContainer) transcriptContainer.style.display = 'block';

    updateStatus('✅ Conversation started! Speak naturally...');
  } catch (error: any) {
    showError(`Failed to start conversation: ${error.message}`);
  }
}

export async function stopConversationSession(): Promise<void> {
  try {
    updateStatus('⏹️ Stopping conversation...');

    // Stop conversation using Kwami's Mind
    if ((window as any).kwami?.mind) {
      await (window as any).kwami.mind.stopConversation();
    }

    const statusText = document.getElementById('conversation-status-text');
    if (statusText) statusText.textContent = 'Not connected';

    const startBtn = document.getElementById('start-conversation-btn');
    const stopBtn = document.getElementById('stop-conversation-btn');
    if (stopBtn) stopBtn.style.display = 'none';
    if (startBtn) {
      startBtn.style.display = 'block';
      (startBtn as HTMLButtonElement).disabled = false;
    }

    updateStatus('✅ Conversation stopped');
  } catch (error: any) {
    showError(`Failed to stop conversation: ${error.message}`);
  }
}

export async function simulateAgentConversation(): Promise<void> {
  if (!elevenLabsState.selectedAgent) {
    showError('Please select an agent first');
    return;
  }

  const messageInput = document.getElementById('test-message-input') as HTMLTextAreaElement;
  const message = messageInput?.value?.trim();

  if (!message) {
    showError('Please enter a test message');
    return;
  }

  try {
    updateStatus('🧪 Simulating conversation...');

    const response = await makeAPIRequest(`/convai/agents/${elevenLabsState.selectedAgent.agent_id}/simulate`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    });

    const container = document.getElementById('test-response-container');
    const textEl = document.getElementById('test-response-text');

    if (container) container.style.display = 'block';
    if (textEl) textEl.textContent = response.response || 'No response';

    updateStatus('✅ Simulation complete');
  } catch (error: any) {
    showError(`Simulation failed: ${error.message}`);
  }
}

// ============================================================================
// 7. ANALYTICS & MONITORING
// ============================================================================

export async function fetchAPIUsage(): Promise<void> {
  if (!elevenLabsState.isInitialized) return;

  try {
    updateStatus('🔄 Fetching usage data...');

    const response = await makeAPIRequest('/user/subscription');

    const container = document.getElementById('usage-stats-container');
    const charactersEl = document.getElementById('usage-characters');
    const remainingEl = document.getElementById('usage-remaining');
    const limitEl = document.getElementById('usage-limit');

    if (container) container.style.display = 'block';
    if (charactersEl) charactersEl.textContent = response.character_count?.toLocaleString() || '-';
    if (remainingEl) remainingEl.textContent = response.character_limit - response.character_count || '-';
    if (limitEl) limitEl.textContent = response.character_limit?.toLocaleString() || '-';

    updateStatus('✅ Usage data loaded');
  } catch (error: any) {
    showError(`Failed to fetch usage: ${error.message}`);
  }
}

export async function calculateLLMCost(): Promise<void> {
  const promptInput = document.getElementById('cost-calc-prompt') as HTMLTextAreaElement;
  const prompt = promptInput?.value?.trim();

  if (!prompt) {
    showError('Please enter a sample prompt');
    return;
  }

  try {
    // Rough estimation: 1 token ≈ 4 characters
    const estimatedTokens = Math.ceil(prompt.length / 4);

    const container = document.getElementById('cost-calc-result');
    const tokensEl = document.getElementById('cost-calc-tokens');

    if (container) container.style.display = 'block';
    if (tokensEl) tokensEl.textContent = estimatedTokens.toLocaleString();

    updateStatus('✅ Token estimation complete');
  } catch (error: any) {
    showError(`Calculation failed: ${error.message}`);
  }
}

// ============================================================================
// 8. CONFIGURATION MANAGEMENT
// ============================================================================

export function exportAgentConfig(): void {
  if (!elevenLabsState.selectedAgent) {
    showError('Please select an agent first');
    return;
  }

  const config = {
    agent: elevenLabsState.selectedAgent,
    exportedAt: new Date().toISOString(),
    version: '1.0',
  };

  const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `agent-${elevenLabsState.selectedAgent.name.replace(/\s+/g, '-')}-config.json`;
  link.click();
  URL.revokeObjectURL(url);

  updateStatus('💾 Configuration exported');
}

export async function importAgentConfig(event: Event): Promise<void> {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];

  if (!file) return;

  try {
    const text = await file.text();
    const config = JSON.parse(text);

    // TODO: Populate form with imported config
    updateStatus('📂 Configuration imported (implementation pending)');
  } catch (error: any) {
    showError(`Failed to import configuration: ${error.message}`);
  }
}

// ============================================================================
// 9. UTILITY FUNCTIONS
// ============================================================================

export function updateValueDisplay(elementId: string, value: any, decimals: number = 1): void {
  const el = document.getElementById(elementId);
  if (!el) return;

  const num = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(num)) return;

  el.textContent = num.toFixed(decimals);
}

export function toggleAccordion(header: HTMLElement): void {
  const content = header.nextElementSibling as HTMLElement;
  if (!content) return;

  const isOpen = content.style.display !== 'none';
  content.style.display = isOpen ? 'none' : 'block';

  // Optional: Update header icon
  const span = header.querySelector('span');
  if (span) {
    const text = span.textContent || '';
    if (isOpen) {
      span.textContent = text.replace('▼', '▶').replace('➖', '➕');
    } else {
      span.textContent = text.replace('▶', '▼').replace('➕', '➖');
    }
  }
}

export function switchKBUploadTab(tab: string): void {
  // Hide all tabs
  const tabs = document.querySelectorAll('.kb-upload-tab');
  tabs.forEach((t) => ((t as HTMLElement).style.display = 'none'));

  // Show selected tab
  const selectedTab = document.getElementById(`kb-upload-${tab}`);
  if (selectedTab) selectedTab.style.display = 'block';

  // Update tab buttons
  const buttons = document.querySelectorAll('.media-tab');
  buttons.forEach((btn) => btn.classList.remove('active'));
  const activeBtn = Array.from(buttons).find((btn) => (btn as HTMLElement).onclick?.toString().includes(tab));
  if (activeBtn) activeBtn.classList.add('active');
}

// ============================================================================
// INITIALIZATION - EXPOSE FUNCTIONS GLOBALLY
// ============================================================================

// Make functions available globally for onclick handlers
declare global {
  interface Window {
    initializeElevenLabsAPI: typeof initializeElevenLabsAPI;
    createAgent: typeof createAgent;
    refreshAgentsList: typeof refreshAgentsList;
    selectAgent: typeof selectAgent;
    editSelectedAgent: typeof editSelectedAgent;
    duplicateSelectedAgent: typeof duplicateSelectedAgent;
    deleteSelectedAgent: typeof deleteSelectedAgent;
    loadMyVoices: typeof loadMyVoices;
    previewVoice: typeof previewVoice;
    applyVoicePreset: typeof applyVoicePreset;
    refreshKBList: typeof refreshKBList;
    uploadKBFile: typeof uploadKBFile;
    createKBFromText: typeof createKBFromText;
    createKBFromURL: typeof createKBFromURL;
    refreshToolsList: typeof refreshToolsList;
    createWebhookTool: typeof createWebhookTool;
    startConversationWithSelectedAgent: typeof startConversationWithSelectedAgent;
    stopConversationSession: typeof stopConversationSession;
    simulateAgentConversation: typeof simulateAgentConversation;
    fetchAPIUsage: typeof fetchAPIUsage;
    calculateLLMCost: typeof calculateLLMCost;
    exportAgentConfig: typeof exportAgentConfig;
    importAgentConfig: typeof importAgentConfig;
    toggleAccordion: typeof toggleAccordion;
    switchKBUploadTab: typeof switchKBUploadTab;
    updateValueDisplay: typeof updateValueDisplay;
  }
}

// Expose functions globally
if (typeof window !== 'undefined') {
  window.initializeElevenLabsAPI = initializeElevenLabsAPI;
  window.createAgent = createAgent;
  window.refreshAgentsList = refreshAgentsList;
  window.selectAgent = selectAgent;
  window.editSelectedAgent = editSelectedAgent;
  window.duplicateSelectedAgent = duplicateSelectedAgent;
  window.deleteSelectedAgent = deleteSelectedAgent;
  window.loadMyVoices = loadMyVoices;
  window.previewVoice = previewVoice;
  window.applyVoicePreset = applyVoicePreset;
  window.refreshKBList = refreshKBList;
  window.uploadKBFile = uploadKBFile;
  window.createKBFromText = createKBFromText;
  window.createKBFromURL = createKBFromURL;
  window.refreshToolsList = refreshToolsList;
  window.createWebhookTool = createWebhookTool;
  window.startConversationWithSelectedAgent = startConversationWithSelectedAgent;
  window.stopConversationSession = stopConversationSession;
  window.simulateAgentConversation = simulateAgentConversation;
  window.fetchAPIUsage = fetchAPIUsage;
  window.calculateLLMCost = calculateLLMCost;
  window.exportAgentConfig = exportAgentConfig;
  window.importAgentConfig = importAgentConfig;
  window.toggleAccordion = toggleAccordion;
  window.switchKBUploadTab = switchKBUploadTab;
  window.updateValueDisplay = updateValueDisplay;
}
