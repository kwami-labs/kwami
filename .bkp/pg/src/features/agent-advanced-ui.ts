// @ts-nocheck
import { showError, updateStatus } from '../ui/messages.js';

// ============================================================================
// ADVANCED AGENT UI FEATURES
// Tools, Knowledge Base, and Voice Management
// ============================================================================

// Initialize Advanced UI
export function initializeAdvancedAgentUI() {
  if (window.agentManager && window.agentManager.initialized) {
    refreshToolsList();
    refreshKnowledgeBasesList();
    loadVoicesIntoSelect();
  }
}

// ==================== VOICE MANAGEMENT ====================

// Load available voices from API into select dropdowns
window.loadVoicesIntoSelect = async function() {
  if (!window.kwami?.mind) return;

  try {
    const voices = await window.kwami.mind.getAvailableVoices();
    const voiceSelects = ['agent-voice-id', 'voice-id']; // IDs of voice select elements

    voiceSelects.forEach(selectId => {
      const select = document.getElementById(selectId);
      if (!select) return;

      const currentValue = select.value;
      select.innerHTML = ''; // Clear existing

      // Add default/custom option if needed
      if (selectId === 'voice-id') {
        const customOpt = document.createElement('option');
        customOpt.value = 'custom';
        customOpt.textContent = 'Custom Voice ID';
        select.appendChild(customOpt);
      }

      // Group voices by category
      const categories = {};
      voices.forEach(voice => {
        const category = voice.category || 'Other';
        if (!categories[category]) categories[category] = [];
        categories[category].push(voice);
      });

      Object.keys(categories).sort().forEach(category => {
        const group = document.createElement('optgroup');
        group.label = category.charAt(0).toUpperCase() + category.slice(1);
        
        categories[category].sort((a, b) => a.name.localeCompare(b.name)).forEach(voice => {
          const option = document.createElement('option');
          option.value = voice.voice_id;
          option.textContent = `${voice.name} (${voice.labels?.accent || ''} ${voice.labels?.gender || ''})`;
          group.appendChild(option);
        });
        
        select.appendChild(group);
      });

      // Restore selection if possible
      if (currentValue) {
        select.value = currentValue;
      }
    });

    console.log(`Loaded ${voices.length} voices into selectors`);
  } catch (error) {
    console.error('Failed to load voices:', error);
  }
};

// ==================== TOOLS MANAGEMENT ====================

window.refreshToolsList = async function() {
  try {
    if (!window.kwami?.mind?.getToolsAPI) return;
    
    const api = window.kwami.mind.getToolsAPI();
    if (!api) return;

    updateStatus('🔄 Loading tools...');
    const response = await api.listTools({ page_size: 100 });
    const tools = response.tools || [];
    
    const listContainer = document.getElementById('tools-list');
    const emptyMessage = document.getElementById('tools-list-empty');
    
    if (!listContainer) return;

    if (tools.length === 0) {
      listContainer.innerHTML = '';
      if (emptyMessage) emptyMessage.style.display = 'block';
      return;
    }

    if (emptyMessage) emptyMessage.style.display = 'none';

    listContainer.innerHTML = tools.map(tool => `
      <div class="tool-card">
        <div class="tool-header">
          <span class="tool-name">${tool.name}</span>
          <div class="tool-actions">
            <button onclick="deleteTool('${tool.tool_id}')" class="delete-btn" title="Delete Tool">🗑️</button>
          </div>
        </div>
        <div class="tool-desc">${tool.description || 'No description'}</div>
        <div class="tool-meta">ID: ${tool.tool_id}</div>
      </div>
    `).join('');

    // Update tool selectors in agent creation/edit forms
    updateToolSelectors(tools);

  } catch (error) {
    console.error('Failed to load tools:', error);
    showError('Failed to load tools: ' + error.message);
  }
};

function updateToolSelectors(tools) {
  const selectors = document.querySelectorAll('.tool-multiselect');
  selectors.forEach(container => {
    container.innerHTML = tools.map(tool => `
      <label class="checkbox-item">
        <input type="checkbox" value="${tool.tool_id}" data-name="${tool.name}">
        <span>${tool.name}</span>
      </label>
    `).join('');
  });
}

window.createNewTool = async function() {
  const name = document.getElementById('new-tool-name').value.trim();
  const description = document.getElementById('new-tool-desc').value.trim();
  const apiSchema = document.getElementById('new-tool-schema').value.trim();

  if (!name || !description) {
    showError('Name and description are required');
    return;
  }

  try {
    updateStatus('Creating tool...');
    const api = window.kwami.mind.getToolsAPI();
    
    // Basic tool creation - for full schema support we'd need more complex UI or JSON input
    // Here we assume client-side tools or simple webhook for now, or just placeholder
    // For now, let's just create a simple "client" tool placeholder if no schema provided
    
    let request;
    if (apiSchema) {
       // Try parsing JSON schema
       try {
         const schema = JSON.parse(apiSchema);
         request = { name, description, ...schema };
       } catch (e) {
         showError('Invalid JSON schema');
         return;
       }
    } else {
      // Create a dummy client tool definition (requires schema usually)
      // ElevenLabs API requires specific structure. 
      // Let's default to a simple GET request tool for demo if no schema
      request = {
        name,
        description,
        type: 'client', // or 'webhook'
        // Simplified for demo
      };
    }

    // ACTUALLY, usually creating a tool requires a valid schema. 
    // Let's prompt for JSON input mostly.
    
    await api.createTool(request);
    
    document.getElementById('new-tool-name').value = '';
    document.getElementById('new-tool-desc').value = '';
    document.getElementById('new-tool-schema').value = '';
    
    updateStatus('✅ Tool created!');
    refreshToolsList();
  } catch (error) {
    showError('Failed to create tool: ' + error.message);
  }
};

window.deleteTool = async function(toolId) {
  if (!confirm('Delete this tool?')) return;
  try {
    const api = window.kwami.mind.getToolsAPI();
    await api.deleteTool(toolId);
    updateStatus('✅ Tool deleted');
    refreshToolsList();
  } catch (error) {
    showError('Failed to delete tool: ' + error.message);
  }
};

// ==================== KNOWLEDGE BASE MANAGEMENT ====================

window.refreshKnowledgeBasesList = async function() {
  try {
    if (!window.kwami?.mind?.getKnowledgeBaseAPI) return;
    
    const api = window.kwami.mind.getKnowledgeBaseAPI();
    if (!api) return;

    updateStatus('🔄 Loading knowledge bases...');
    const response = await api.listKnowledgeBases({ page_size: 100 });
    const kbs = response.knowledge_bases || [];
    
    const listContainer = document.getElementById('kb-list');
    const emptyMessage = document.getElementById('kb-list-empty');
    
    if (!listContainer) return;

    if (kbs.length === 0) {
      listContainer.innerHTML = '';
      if (emptyMessage) emptyMessage.style.display = 'block';
      return;
    }

    if (emptyMessage) emptyMessage.style.display = 'none';

    listContainer.innerHTML = kbs.map(kb => `
      <div class="kb-card">
        <div class="kb-header">
          <span class="kb-name">${kb.name}</span>
          <div class="kb-actions">
            <button onclick="deleteKnowledgeBase('${kb.knowledge_base_id}')" class="delete-btn" title="Delete">🗑️</button>
          </div>
        </div>
        <div class="kb-desc">${kb.description || 'No description'}</div>
        <div class="kb-meta">ID: ${kb.knowledge_base_id} | Docs: ${kb.document_count || 0}</div>
        <div class="kb-upload-zone">
           <button class="small-btn" onclick="triggerKbUpload('${kb.knowledge_base_id}')">📄 Add Document</button>
        </div>
      </div>
    `).join('');

    updateKbSelectors(kbs);

  } catch (error) {
    console.error('Failed to load knowledge bases:', error);
    showError('Failed to load KB: ' + error.message);
  }
};

function updateKbSelectors(kbs) {
  const selectors = document.querySelectorAll('.kb-multiselect');
  selectors.forEach(container => {
    container.innerHTML = kbs.map(kb => `
      <label class="checkbox-item">
        <input type="checkbox" value="${kb.knowledge_base_id}" data-name="${kb.name}">
        <span>${kb.name}</span>
      </label>
    `).join('');
  });
}

window.createNewKnowledgeBase = async function() {
  const name = document.getElementById('new-kb-name').value.trim();
  const description = document.getElementById('new-kb-desc').value.trim();

  if (!name) {
    showError('Name is required');
    return;
  }

  try {
    const api = window.kwami.mind.getKnowledgeBaseAPI();
    await api.createKnowledgeBase({ name, description });
    
    document.getElementById('new-kb-name').value = '';
    document.getElementById('new-kb-desc').value = '';
    
    updateStatus('✅ Knowledge Base created!');
    refreshKnowledgeBasesList();
  } catch (error) {
    showError('Failed to create KB: ' + error.message);
  }
};

window.deleteKnowledgeBase = async function(kbId) {
  if (!confirm('Delete this Knowledge Base?')) return;
  try {
    const api = window.kwami.mind.getKnowledgeBaseAPI();
    await api.deleteKnowledgeBase(kbId);
    updateStatus('✅ Knowledge Base deleted');
    refreshKnowledgeBasesList();
  } catch (error) {
    showError('Failed to delete KB: ' + error.message);
  }
};

window.triggerKbUpload = function(kbId) {
  // Create hidden file input
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.txt,.pdf,.md,.docx,.html'; // Supported formats
  
  input.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    try {
      updateStatus(`Uploading ${file.name}...`);
      const api = window.kwami.mind.getKnowledgeBaseAPI();
      await api.createDocumentFromFile(kbId, { file });
      updateStatus(`✅ ${file.name} uploaded!`);
      // Optionally refresh to show doc count update
      setTimeout(refreshKnowledgeBasesList, 1000);
    } catch (error) {
      showError('Upload failed: ' + error.message);
    }
  };
  
  input.click();
};
