// ============================================================================
// AGENT MANAGEMENT FUNCTIONS
// Complete integration of ElevenLabs Agents API into Kwami Playground
// ============================================================================

// Global state for agent management
window.agentManager = {
  initialized: false,
  agents: [],
  selectedAgent: null,
  apiKey: null
};

// Initialize Agent Manager
window.initializeAgentManager = async function() {
  const apiKey = document.getElementById('api-key-agent').value.trim();
  
  if (!apiKey) {
    showError('Please enter your ElevenLabs API Key');
    return;
  }
  
  try {
    updateStatus('🔄 Initializing Agent Manager...');
    
    // Set API key on Kwami Mind
    window.kwami.mind.config.apiKey = apiKey;
    window.agentManager.apiKey = apiKey;
    
    // Initialize Mind
    await window.kwami.mind.initialize();
    
    // Mark as initialized
    window.agentManager.initialized = true;
    
    // Show status
    document.getElementById('agent-manager-status').style.display = 'block';
    document.getElementById('init-agent-manager-btn').disabled = true;
    document.getElementById('init-agent-manager-btn').textContent = '✅ Initialized';
    
    // Show agent creation and management sections
    document.getElementById('agent-creation-section').style.display = 'block';
    document.getElementById('agents-list-section').style.display = 'block';
    document.getElementById('agent-actions-section').style.display = 'block';
    document.getElementById('agent-testing-section').style.display = 'block';
    document.getElementById('cost-calculator-section').style.display = 'block';
    document.getElementById('agent-link-section').style.display = 'block';
    
    // Load existing agents
    await refreshAgentsList();
    
    // Setup slider listeners for agent creation
    setupAgentSliderListeners();
    
    updateStatus('✅ Agent Manager ready! Create or select an agent to begin.');
  } catch (error) {
    showError('Failed to initialize Agent Manager: ' + error.message);
    console.error(error);
  }
};

// Setup slider value display listeners
function setupAgentSliderListeners() {
  // Temperature slider
  const tempSlider = document.getElementById('agent-temperature');
  if (tempSlider) {
    tempSlider.addEventListener('input', (e) => {
      document.getElementById('agent-temperature-value').textContent = parseFloat(e.target.value).toFixed(1);
    });
  }
  
  // Stability slider
  const stabilitySlider = document.getElementById('agent-stability');
  if (stabilitySlider) {
    stabilitySlider.addEventListener('input', (e) => {
      document.getElementById('agent-stability-value').textContent = parseFloat(e.target.value).toFixed(2);
    });
  }
  
  // Similarity slider
  const similaritySlider = document.getElementById('agent-similarity');
  if (similaritySlider) {
    similaritySlider.addEventListener('input', (e) => {
      document.getElementById('agent-similarity-value').textContent = parseFloat(e.target.value).toFixed(2);
    });
  }
}

// Create New Agent
window.createNewAgent = async function() {
  if (!window.agentManager.initialized) {
    showError('Please initialize Agent Manager first');
    return;
  }
  
  // Get form values
  const name = document.getElementById('agent-name').value.trim() || 'My AI Agent';
  const prompt = document.getElementById('agent-prompt').value.trim();
  const firstMessage = document.getElementById('agent-first-message').value.trim();
  const llmModel = document.getElementById('agent-llm-model').value;
  const temperature = parseFloat(document.getElementById('agent-temperature').value);
  const maxTokens = parseInt(document.getElementById('agent-max-tokens').value);
  const voiceId = document.getElementById('agent-voice-id').value;
  const ttsModel = document.getElementById('agent-tts-model').value;
  const stability = parseFloat(document.getElementById('agent-stability').value);
  const similarityBoost = parseFloat(document.getElementById('agent-similarity').value);
  
  if (!prompt) {
    showError('Please enter a system prompt for your agent');
    return;
  }
  
  try {
    updateStatus('🔄 Creating agent...');
    document.getElementById('create-agent-btn').disabled = true;
    
    const agentConfig = {
      conversation_config: {
        agent: {
          prompt: {
            prompt: prompt,
            llm: llmModel,
            temperature: temperature,
            max_tokens: maxTokens
          },
          first_message: firstMessage || 'Hello! How can I help you today?',
          language: 'en'
        },
        tts: {
          model_id: ttsModel,
          voice_id: voiceId,
          stability: stability,
          similarity_boost: similarityBoost,
          agent_output_audio_format: 'pcm_16000'
        },
        asr: {
          quality: 'high',
          provider: 'elevenlabs',
          user_input_audio_format: 'pcm_16000'
        }
      }
    };
    
    // Create agent using Mind API
    const agent = await window.kwami.mind.createAgent(agentConfig);
    
    // Show success
    const statusDiv = document.getElementById('agent-creation-status');
    statusDiv.style.display = 'block';
    statusDiv.style.color = '#4CAF50';
    statusDiv.textContent = `✅ Agent created successfully! ID: ${agent.agent_id}`;
    
    // Clear form
    document.getElementById('agent-name').value = '';
    document.getElementById('agent-prompt').value = '';
    
    // Refresh agents list
    await refreshAgentsList();
    
    // Auto-select the new agent
    selectAgentById(agent.agent_id);
    
    updateStatus(`✅ Agent "${name}" created successfully!`);
    
    // Re-enable button after delay
    setTimeout(() => {
      document.getElementById('create-agent-btn').disabled = false;
      statusDiv.style.display = 'none';
    }, 3000);
    
  } catch (error) {
    showError('Failed to create agent: ' + error.message);
    document.getElementById('create-agent-btn').disabled = false;
    console.error(error);
  }
};

// Refresh Agents List
window.refreshAgentsList = async function() {
  if (!window.agentManager.initialized) {
    return;
  }
  
  try {
    updateStatus('🔄 Loading agents...');
    
    // Fetch agents from API
    const result = await window.kwami.mind.listAgents({ page_size: 50 });
    
    window.agentManager.agents = result.agents || [];
    
    // Display agents
    displayAgentsList();
    
    updateStatus(`✅ Loaded ${window.agentManager.agents.length} agent(s)`);
    
  } catch (error) {
    showError('Failed to load agents: ' + error.message);
    console.error(error);
  }
};

// Display Agents List
function displayAgentsList() {
  const agentsList = document.getElementById('agents-list');
  const emptyMessage = document.getElementById('agents-list-empty');
  
  if (window.agentManager.agents.length === 0) {
    agentsList.innerHTML = '';
    emptyMessage.style.display = 'block';
    return;
  }
  
  emptyMessage.style.display = 'none';
  
  agentsList.innerHTML = window.agentManager.agents.map(agent => {
    const isSelected = window.agentManager.selectedAgent?.agent_id === agent.agent_id;
    const createdDate = agent.created_at ? new Date(agent.created_at).toLocaleDateString() : 'Unknown';
    
    return `
      <div class="agent-card ${isSelected ? 'selected' : ''}" data-agent-id="${agent.agent_id}" onclick="selectAgent('${agent.agent_id}')">
        <div class="agent-card-header">
          <div class="agent-card-name">${agent.name || 'Unnamed Agent'}</div>
          <div class="agent-card-actions">
            <button onclick="event.stopPropagation(); duplicateAgentById('${agent.agent_id}')" title="Duplicate">📋</button>
            <button onclick="event.stopPropagation(); deleteAgentById('${agent.agent_id}')" title="Delete" style="color: #ff6b6b;">🗑️</button>
          </div>
        </div>
        <div class="agent-card-id">${agent.agent_id}</div>
        <div class="agent-card-info">
          ${agent.conversation_config?.agent?.prompt?.prompt?.substring(0, 60) || 'No prompt'}...
        </div>
        <div class="agent-card-created">Created: ${createdDate}</div>
      </div>
    `;
  }).join('');
}

// Select Agent
window.selectAgent = function(agentId) {
  const agent = window.agentManager.agents.find(a => a.agent_id === agentId);
  if (!agent) return;
  
  window.agentManager.selectedAgent = agent;
  
  // Update selected agent display
  document.getElementById('selected-agent-name').textContent = agent.name || 'Unnamed Agent';
  document.getElementById('selected-agent-id').textContent = `ID: ${agent.agent_id}`;
  
  // Enable action buttons
  document.getElementById('start-agent-conversation-btn').disabled = false;
  document.getElementById('test-agent-btn').disabled = false;
  document.getElementById('calculate-cost-btn').disabled = false;
  document.getElementById('get-link-btn').disabled = false;
  
  // Update UI to show selection
  displayAgentsList();
  
  // Save to localStorage
  localStorage.setItem('selectedAgentId', agentId);
  
  updateStatus(`✅ Agent selected: ${agent.name || agent.agent_id}`);
};

// Helper function to select by ID
function selectAgentById(agentId) {
  selectAgent(agentId);
}

// Duplicate Agent
window.duplicateAgentById = async function(agentId) {
  if (!confirm('Duplicate this agent?')) return;
  
  try {
    updateStatus('🔄 Duplicating agent...');
    
    const duplicate = await window.kwami.mind.duplicateAgent(agentId, {
      new_name: 'Copy of Agent'
    });
    
    updateStatus(`✅ Agent duplicated! New ID: ${duplicate.agent_id}`);
    
    // Refresh list
    await refreshAgentsList();
    
  } catch (error) {
    showError('Failed to duplicate agent: ' + error.message);
    console.error(error);
  }
};

// Delete Agent
window.deleteAgentById = async function(agentId) {
  if (!confirm('⚠️ Are you sure you want to delete this agent? This cannot be undone.')) return;
  
  try {
    updateStatus('🔄 Deleting agent...');
    
    await window.kwami.mind.deleteAgent(agentId);
    
    // If this was the selected agent, deselect it
    if (window.agentManager.selectedAgent?.agent_id === agentId) {
      window.agentManager.selectedAgent = null;
      document.getElementById('start-agent-conversation-btn').disabled = true;
      document.getElementById('test-agent-btn').disabled = true;
      document.getElementById('calculate-cost-btn').disabled = true;
      document.getElementById('get-link-btn').disabled = true;
    }
    
    updateStatus('✅ Agent deleted successfully');
    
    // Refresh list
    await refreshAgentsList();
    
  } catch (error) {
    showError('Failed to delete agent: ' + error.message);
    console.error(error);
  }
};

// Start Conversation with Agent
window.startConversationWithAgent = async function() {
  if (!window.agentManager.selectedAgent) {
    showError('Please select an agent first');
    return;
  }
  
  try {
    // Set the agent ID on Mind config
    window.kwami.mind.config.conversational = {
      agentId: window.agentManager.selectedAgent.agent_id
    };
    
    // Use existing conversation callbacks
    await window.kwami.mind.startConversation(undefined, window.conversationCallbacks);
    
    // Update UI
    document.getElementById('start-agent-conversation-btn').style.display = 'none';
    document.getElementById('stop-agent-conversation-btn').style.display = 'block';
    document.getElementById('stop-agent-conversation-btn').disabled = false;
    
    updateStatus('🎙️ Conversation started! Speak to your agent...');
    
  } catch (error) {
    showError('Failed to start conversation: ' + error.message);
    console.error(error);
  }
};

// Test Agent
window.testAgent = async function() {
  if (!window.agentManager.selectedAgent) {
    showError('Please select an agent first');
    return;
  }
  
  const testMessage = document.getElementById('test-message').value.trim();
  
  if (!testMessage) {
    showError('Please enter a test message');
    return;
  }
  
  try {
    updateStatus('🧪 Testing agent...');
    document.getElementById('test-agent-btn').disabled = true;
    
    const result = await window.kwami.mind.simulateConversation(
      window.agentManager.selectedAgent.agent_id,
      {
        conversation_history: [
          { role: 'user', message: testMessage }
        ]
      }
    );
    
    // Display results
    const resultsDiv = document.getElementById('test-results');
    resultsDiv.style.display = 'block';
    
    document.getElementById('test-agent-response').textContent = result.agent_response || 'No response';
    
    const metadata = result.metadata || {};
    document.getElementById('test-agent-metadata').innerHTML = `
      Tokens: ${metadata.total_tokens || '-'} 
      (Prompt: ${metadata.prompt_tokens || '-'}, Completion: ${metadata.completion_tokens || '-'})<br>
      Latency: ${metadata.latency_ms || '-'}ms
    `;
    
    updateStatus('✅ Test completed successfully!');
    document.getElementById('test-agent-btn').disabled = false;
    
  } catch (error) {
    showError('Failed to test agent: ' + error.message);
    document.getElementById('test-agent-btn').disabled = false;
    console.error(error);
  }
};

// Calculate Agent Cost
window.calculateAgentCost = async function() {
  if (!window.agentManager.selectedAgent) {
    showError('Please select an agent first');
    return;
  }
  
  const turns = parseInt(document.getElementById('cost-calc-turns').value) || 10;
  const messageLength = parseInt(document.getElementById('cost-calc-length').value) || 50;
  
  try {
    updateStatus('💰 Calculating costs...');
    document.getElementById('calculate-cost-btn').disabled = true;
    
    const result = await window.kwami.mind.calculateLLMUsage(
      window.agentManager.selectedAgent.agent_id,
      {
        conversation_turns: turns,
        average_user_message_length: messageLength
      }
    );
    
    // Display results
    const resultsDiv = document.getElementById('cost-results');
    resultsDiv.style.display = 'block';
    
    document.getElementById('cost-prompt-tokens').textContent = result.estimated_prompt_tokens || '-';
    document.getElementById('cost-completion-tokens').textContent = result.estimated_completion_tokens || '-';
    document.getElementById('cost-total-tokens').textContent = result.estimated_total_tokens || '-';
    document.getElementById('cost-per-conversation').textContent = 
      result.estimated_cost_usd ? `$${result.estimated_cost_usd.toFixed(4)}` : '$-';
    document.getElementById('cost-model').textContent = result.model_used || '-';
    
    updateStatus('✅ Cost calculation completed!');
    document.getElementById('calculate-cost-btn').disabled = false;
    
  } catch (error) {
    showError('Failed to calculate costs: ' + error.message);
    document.getElementById('calculate-cost-btn').disabled = false;
    console.error(error);
  }
};

// Get Agent Share Link
window.getAgentShareLink = async function() {
  if (!window.agentManager.selectedAgent) {
    showError('Please select an agent first');
    return;
  }
  
  try {
    updateStatus('🔗 Getting shareable link...');
    document.getElementById('get-link-btn').disabled = true;
    
    const linkInfo = await window.kwami.mind.getAgentLink(window.agentManager.selectedAgent.agent_id);
    
    // Display link
    const resultsDiv = document.getElementById('agent-link-result');
    resultsDiv.style.display = 'block';
    
    document.getElementById('agent-link-url').value = linkInfo.link_url || 'No link available';
    document.getElementById('agent-link-status').textContent = linkInfo.enabled ? 'Enabled ✅' : 'Disabled ❌';
    
    updateStatus('✅ Link retrieved!');
    document.getElementById('get-link-btn').disabled = false;
    
  } catch (error) {
    showError('Failed to get link: ' + error.message);
    document.getElementById('get-link-btn').disabled = false;
    console.error(error);
  }
};

// Copy Agent Link to Clipboard
window.copyAgentLink = function() {
  const linkInput = document.getElementById('agent-link-url');
  linkInput.select();
  document.execCommand('copy');
  
  updateStatus('📋 Link copied to clipboard!');
};

// Auto-load selected agent from localStorage on page load
window.addEventListener('load', () => {
  const savedAgentId = localStorage.getItem('selectedAgentId');
  if (savedAgentId && window.agentManager.initialized) {
    setTimeout(() => {
      selectAgentById(savedAgentId);
    }, 1000);
  }
});
