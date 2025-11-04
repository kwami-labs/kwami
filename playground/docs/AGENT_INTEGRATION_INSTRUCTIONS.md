# Agent Management Integration Instructions

## Overview
This guide explains how to integrate the new ElevenLabs Agents Management API into the Kwami Playground Mind menu, making agent creation and management the primary workflow.

## Files Created

1. **agent-management-section.html** - Complete HTML UI for agent management
2. **agent-management-functions.js** - JavaScript functions for all agent operations
3. **AGENT_INTEGRATION_INSTRUCTIONS.md** - This file

## Integration Steps

### Step 1: Update index.html

Insert the agent management section at the **BEGINNING** of the Mind template (line ~89, right after the subtitle).

**Location**: Find this line in `index.html`:
```html
<h1>🤖 Mind</h1>
<p class="subtitle">AI Agent Configuration</p>
```

**Insert**: The entire content of `agent-management-section.html` RIGHT AFTER the subtitle.

**Remove/Replace**: You can optionally remove or move the old "Authentication" section (lines 92-108) since the new section has its own authentication.

### Step 2: Load JavaScript Functions

Add the agent management functions script to `index.html` before the closing `</body>` tag:

```html
<!-- Add before </body> -->
<script src="agent-management-functions.js"></script>
<script src="main.js"></script>
</body>
```

**Important**: Load `agent-management-functions.js` BEFORE `main.js` so functions are available.

### Step 3: Update main.js (Optional Enhancements)

You can enhance the existing `stopConversation()` function to reset agent conversation UI:

```javascript
// In stopConversation() function, add:
document.getElementById('start-agent-conversation-btn').style.display = 'block';
document.getElementById('stop-agent-conversation-btn').style.display = 'none';
```

## Features Included

### ✨ Agent Creation
- Full configuration form (prompt, LLM model, voice, temperature, etc.)
- Immediate feedback on creation
- Auto-selection of newly created agents

### 📋 Agent Management
- List all agents with visual cards
- Select agent to make it active
- Duplicate agents for A/B testing
- Delete agents with confirmation
- Refresh agents list

### 🎯 Active Agent Operations
- Start conversations with selected agent
- Test agent with simulated messages
- Calculate cost estimates
- Get shareable links
- Copy links to clipboard

### 🧪 Testing & Validation
- Simulate conversations before going live
- See token usage and latency
- Test different prompts and configurations

### 💰 Cost Management
- Estimate token usage per conversation
- Calculate costs before deployment
- Compare different LLM models

## Usage Workflow

### For Users (Recommended Flow)

1. **Initialize**: Enter API key → Click "Initialize Agent Manager"
2. **Create Agent**: Fill form with personality, voice, LLM settings → Click "Create Agent"
3. **Test Agent**: Enter test message → Click "Test Agent" to validate responses
4. **Calculate Costs**: Estimate usage → Click "Calculate Cost"
5. **Deploy**: Click "Start Conversation" to go live with Kwami blob
6. **Share**: Get shareable link to let others use your agent

### Visual Hierarchy

The new UI prioritizes agent management:
1. **API Authentication** (always visible)
2. **Create New Agent** (primary action)
3. **My Agents List** (select/manage)
4. **Active Agent** (conversation controls)
5. **Test Agent** (validation)
6. **Cost Calculator** (budgeting)
7. **Share Agent** (distribution)

## Styling

The agent card styles are included inline in `agent-management-section.html`. They provide:
- Card-based layout for agents
- Hover effects
- Selection highlighting (green border)
- Action buttons (duplicate, delete)
- Responsive design

## State Management

The integration includes:
- `window.agentManager` global state
- LocalStorage persistence for selected agent
- Auto-loading of last selected agent on page refresh

## API Methods Used

All methods from `KwamiMind` class:
- `createAgent(config)`
- `listAgents(options)`
- `duplicateAgent(agentId, options)`
- `deleteAgent(agentId)`
- `getAgentLink(agentId)`
- `simulateConversation(agentId, request)`
- `calculateLLMUsage(agentId, request)`
- `startConversation()` (existing method, now uses selected agent)

## Testing Checklist

After integration, test:
- [ ] Initialize Agent Manager with API key
- [ ] Create a new agent with custom prompt
- [ ] See agent appear in "My Agents" list
- [ ] Select agent to make it active
- [ ] Test agent with sample message
- [ ] Calculate cost estimate
- [ ] Start conversation with agent
- [ ] Duplicate an agent
- [ ] Delete an agent
- [ ] Get shareable link
- [ ] Refresh page and verify selected agent persists

## Troubleshooting

### Agent creation fails
- Verify API key is valid
- Check that prompt is not empty
- Ensure voice ID is correct

### Agents list is empty
- Click "Refresh List" button
- Verify API key has correct permissions
- Check browser console for errors

### Conversation won't start
- Ensure an agent is selected (green border)
- Check microphone permissions
- Verify agent ID is valid

## Benefits of This Approach

1. **User-Friendly**: No need to manually get agent IDs from ElevenLabs dashboard
2. **Integrated**: Everything in one place - create, test, deploy
3. **Visual**: Card-based UI shows all agents at a glance
4. **Safe**: Test before going live, calculate costs before deployment
5. **Persistent**: Last selected agent remembered across sessions
6. **Complete**: Full CRUD operations + testing + cost estimation

## Next Steps

After integration:
1. Test thoroughly with different agent configurations
2. Add more LLM models to the dropdown as needed
3. Consider adding agent editing functionality (update existing agents)
4. Add bulk operations (delete multiple, export/import agents)
5. Add agent performance analytics

## Support

For issues or questions:
- Check browser console for errors
- Verify API key permissions
- Review AGENTS_API.md documentation
- Check ElevenLabs dashboard for agent status
