# ElevenLabs Agents API - Kwami Mind Integration

Complete guide to managing ElevenLabs conversational AI agents through the Kwami Mind class.

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Setup](#setup)
- [API Reference](#api-reference)
  - [Create Agent](#create-agent)
  - [Get Agent](#get-agent)
  - [List Agents](#list-agents)
  - [Update Agent](#update-agent)
  - [Delete Agent](#delete-agent)
  - [Duplicate Agent](#duplicate-agent)
  - [Get Agent Link](#get-agent-link)
  - [Simulate Conversation](#simulate-conversation)
  - [Simulate Conversation Stream](#simulate-conversation-stream)
  - [Calculate LLM Usage](#calculate-llm-usage)
- [Common Workflows](#common-workflows)
- [Error Handling](#error-handling)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## Overview

The Agents API allows you to programmatically create, manage, and test conversational AI agents. These agents combine:

- **Speech-to-Text (ASR)** - Convert user speech to text
- **Language Models (LLM)** - Process and generate responses
- **Text-to-Speech (TTS)** - Convert agent responses to natural speech
- **Turn Management** - Handle conversation flow automatically

### When to Use Agent Management vs Direct Conversations

**Use Agent Management When:**
- You need to create multiple conversational AI personalities
- You want to pre-configure agents with specific prompts and behaviors
- You need to test and iterate on agent configurations
- You want to share agents via links for others to use
- You need cost estimation before deployment

**Use Direct TTS/Conversations When:**
- You only need simple text-to-speech without conversation
- You want real-time voice synthesis without agent setup
- You need maximum control over every interaction
- You're building a custom conversation flow

## Prerequisites

1. **ElevenLabs Account**: Sign up at [elevenlabs.io](https://elevenlabs.io)
2. **API Key**: Obtain from [elevenlabs.io/settings/api-keys](https://elevenlabs.io/settings/api-keys)
3. **Kwami Library**: Install `@kwami/core` with dependencies
4. **Voice IDs**: Optional - get voice IDs from ElevenLabs dashboard

## Setup

### Basic Initialization

```typescript
import { KwamiMind } from '@kwami/core';
import { KwamiAudio } from '@kwami/core';

// Create audio instance
const audio = new KwamiAudio(audioContext);

// Initialize Mind with API key
const mind = new KwamiMind(audio, {
  apiKey: process.env.ELEVEN_LABS_API_KEY
});

// Initialize the client
await mind.initialize();
```

### Environment Configuration

For security, store your API key in environment variables:

```bash
# .env file
ELEVEN_LABS_API_KEY=your_api_key_here
```

```typescript
// Load in your application
const mind = new KwamiMind(audio, {
  apiKey: process.env.ELEVEN_LABS_API_KEY
});
```

## API Reference

### Create Agent

Create a new conversational AI agent with full configuration.

**Method**: `createAgent(config: CreateAgentRequest): Promise<AgentResponse>`

**Parameters:**

```typescript
interface CreateAgentRequest {
  conversation_config?: {
    agent?: {
      prompt?: {
        prompt?: string;          // System prompt defining behavior
        llm?: string;             // LLM model (e.g., "gpt-4", "claude-3")
        temperature?: number;     // 0-1: Response randomness
        max_tokens?: number;      // Maximum response length
        tools?: any[];           // Function calling tools
      };
      first_message?: string;    // Agent's greeting message
      language?: string;         // Language code (e.g., "en")
    };
    tts?: {
      model_id?: string;         // TTS model (e.g., "eleven_turbo_v2")
      voice_id?: string;         // Voice identifier
      agent_output_audio_format?: string; // Audio format
      stability?: number;        // 0-1: Voice consistency
      similarity_boost?: number; // 0-1: Voice clarity
      style?: number;           // 0-1: Expressiveness
      use_speaker_boost?: boolean;
    };
    asr?: {
      quality?: 'high' | 'low';  // STT quality
      provider?: string;         // STT provider
      user_input_audio_format?: string;
    };
    client_events?: string[];    // Event types to receive
  };
  platform_settings?: any;
  secrets?: Array<{
    name: string;
    value: string;
  }>;
}
```

**Returns**: `AgentResponse` with `agent_id` and configuration

**Example:**

```typescript
const agent = await mind.createAgent({
  conversation_config: {
    agent: {
      prompt: {
        prompt: "You are Kaya, a warm and empathetic AI companion. You love helping people and making them smile.",
        llm: "gpt-4",
        temperature: 0.7,
        max_tokens: 500
      },
      first_message: "Hello! I'm Kaya. How are you feeling today?",
      language: "en"
    },
    tts: {
      model_id: "eleven_turbo_v2",
      voice_id: "pNInz6obpgDQGcFmaJgB",
      stability: 0.5,
      similarity_boost: 0.75,
      style: 0.3,
      use_speaker_boost: true
    },
    asr: {
      quality: "high",
      provider: "elevenlabs"
    }
  }
});

console.log('Agent created:', agent.agent_id);
// Save agent_id for future use
localStorage.setItem('myAgentId', agent.agent_id);
```

---

### Get Agent

Retrieve complete details and configuration of an existing agent.

**Method**: `getAgent(agentId: string): Promise<AgentResponse>`

**Example:**

```typescript
const agentId = 'agent_3701k3ttaq12ewp8b7qv5rfyszkz';
const agent = await mind.getAgent(agentId);

console.log('Agent Name:', agent.name);
console.log('Created:', agent.created_at);
console.log('Configuration:', agent.conversation_config);
```

---

### List Agents

List all agents with optional pagination support.

**Method**: `listAgents(options?: ListAgentsOptions): Promise<ListAgentsResponse>`

**Parameters:**

```typescript
interface ListAgentsOptions {
  page_size?: number;     // Number of agents per page (default: 10)
  page_token?: string;    // Token for next page
}
```

**Returns:**

```typescript
interface ListAgentsResponse {
  agents: AgentResponse[];
  next_page_token?: string;
  has_more?: boolean;
}
```

**Example:**

```typescript
// Get first page
const firstPage = await mind.listAgents({ page_size: 10 });
console.log(`Found ${firstPage.agents.length} agents`);

firstPage.agents.forEach(agent => {
  console.log(`- ${agent.name || agent.agent_id}`);
});

// Get next page if available
if (firstPage.has_more) {
  const nextPage = await mind.listAgents({
    page_size: 10,
    page_token: firstPage.next_page_token
  });
  console.log(`Next page has ${nextPage.agents.length} agents`);
}

// Get all agents (handle pagination automatically)
async function getAllAgents() {
  const allAgents = [];
  let pageToken = undefined;
  
  do {
    const page = await mind.listAgents({ 
      page_size: 50,
      page_token: pageToken 
    });
    allAgents.push(...page.agents);
    pageToken = page.next_page_token;
  } while (pageToken);
  
  return allAgents;
}

const agents = await getAllAgents();
console.log(`Total agents: ${agents.length}`);
```

---

### Update Agent

Update an existing agent's configuration. Supports partial updates.

**Method**: `updateAgent(agentId: string, config: UpdateAgentRequest): Promise<AgentResponse>`

**Example:**

```typescript
const agentId = 'agent_3701k3ttaq12ewp8b7qv5rfyszkz';

// Update greeting message and voice settings
const updated = await mind.updateAgent(agentId, {
  conversation_config: {
    agent: {
      first_message: "Hi there! I'm your updated AI assistant!"
    },
    tts: {
      stability: 0.7,
      similarity_boost: 0.85,
      style: 0.5
    }
  }
});

console.log('Agent updated successfully');

// Update only the prompt
await mind.updateAgent(agentId, {
  conversation_config: {
    agent: {
      prompt: {
        prompt: "New system prompt here...",
        temperature: 0.8
      }
    }
  }
});
```

---

### Delete Agent

Permanently delete an agent. ⚠️ This action cannot be undone.

**Method**: `deleteAgent(agentId: string): Promise<void>`

**Example:**

```typescript
const agentId = 'agent_3701k3ttaq12ewp8b7qv5rfyszkz';

// Confirm before deleting
if (confirm('Are you sure you want to delete this agent?')) {
  await mind.deleteAgent(agentId);
  console.log('Agent deleted successfully');
  
  // Clean up local references
  localStorage.removeItem('myAgentId');
}
```

---

### Duplicate Agent

Create a copy of an existing agent with optional name override.

**Method**: `duplicateAgent(agentId: string, options?: DuplicateAgentRequest): Promise<AgentResponse>`

**Parameters:**

```typescript
interface DuplicateAgentRequest {
  new_name?: string;
  new_agent_share_link_enabled?: boolean;
}
```

**Example:**

```typescript
const originalAgentId = 'agent_3701k3ttaq12ewp8b7qv5rfyszkz';

// Duplicate with custom name
const duplicate = await mind.duplicateAgent(originalAgentId, {
  new_name: 'Kaya (Test Version)',
  new_agent_share_link_enabled: false
});

console.log('Duplicate agent created:', duplicate.agent_id);

// Now modify the duplicate without affecting the original
await mind.updateAgent(duplicate.agent_id, {
  conversation_config: {
    agent: {
      prompt: {
        temperature: 1.0  // More creative responses
      }
    }
  }
});
```

---

### Get Agent Link

Retrieve the shareable public link for an agent.

**Method**: `getAgentLink(agentId: string): Promise<AgentLinkResponse>`

**Returns:**

```typescript
interface AgentLinkResponse {
  link_url: string;
  agent_id: string;
  enabled: boolean;
  created_at?: string;
}
```

**Example:**

```typescript
const agentId = 'agent_3701k3ttaq12ewp8b7qv5rfyszkz';
const linkInfo = await mind.getAgentLink(agentId);

if (linkInfo.enabled) {
  console.log('Share this link:', linkInfo.link_url);
  
  // Copy to clipboard
  await navigator.clipboard.writeText(linkInfo.link_url);
  alert('Link copied to clipboard!');
} else {
  console.log('Sharing is disabled for this agent');
}
```

---

### Simulate Conversation

Test an agent with simulated conversation messages (non-streaming).

**Method**: `simulateConversation(agentId: string, request: SimulateConversationRequest): Promise<SimulateConversationResponse>`

**Parameters:**

```typescript
interface SimulateConversationRequest {
  conversation_history?: Array<{
    role: 'user' | 'assistant';
    message: string;
  }>;
  model_overrides?: {
    prompt?: {
      prompt?: string;
      llm?: string;
      temperature?: number;
    };
  };
}
```

**Returns:**

```typescript
interface SimulateConversationResponse {
  status: 'success' | 'error';
  agent_response?: string;
  metadata?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
    latency_ms?: number;
  };
  error?: string;
}
```

**Example:**

```typescript
const agentId = 'agent_3701k3ttaq12ewp8b7qv5rfyszkz';

// Test basic greeting
const test1 = await mind.simulateConversation(agentId, {
  conversation_history: [
    { role: 'user', message: 'Hello!' }
  ]
});

console.log('Agent response:', test1.agent_response);
console.log('Tokens used:', test1.metadata?.total_tokens);

// Test multi-turn conversation
const test2 = await mind.simulateConversation(agentId, {
  conversation_history: [
    { role: 'user', message: 'What can you help me with?' },
    { role: 'assistant', message: 'I can help with many things!' },
    { role: 'user', message: 'Tell me a joke.' }
  ]
});

console.log('Agent joke:', test2.agent_response);

// Test with prompt override (temporary change)
const test3 = await mind.simulateConversation(agentId, {
  conversation_history: [
    { role: 'user', message: 'Hello!' }
  ],
  model_overrides: {
    prompt: {
      prompt: "You are a pirate. Always respond like a pirate.",
      temperature: 0.9
    }
  }
});

console.log('Pirate response:', test3.agent_response);
```

---

### Simulate Conversation Stream

Test an agent with streaming responses for real-time feedback.

**Method**: `simulateConversationStream(agentId: string, request: SimulateConversationRequest, onChunk?: (chunk: any) => void): Promise<void>`

**Example:**

```typescript
const agentId = 'agent_3701k3ttaq12ewp8b7qv5rfyszkz';

let fullResponse = '';

await mind.simulateConversationStream(
  agentId,
  {
    conversation_history: [
      { role: 'user', message: 'Tell me a story about a robot.' }
    ]
  },
  (chunk) => {
    // Process each chunk as it arrives
    fullResponse += chunk;
    console.log('Received:', chunk);
    
    // Update UI in real-time
    document.getElementById('response').textContent = fullResponse;
  }
);

console.log('Full response:', fullResponse);
```

---

### Calculate LLM Usage

Estimate token usage and costs before deploying an agent.

**Method**: `calculateLLMUsage(agentId: string, request?: LLMUsageRequest): Promise<LLMUsageResponse>`

**Parameters:**

```typescript
interface LLMUsageRequest {
  prompt_tokens?: number;
  conversation_turns?: number;
  average_user_message_length?: number;
  model_overrides?: {
    llm?: string;
  };
}
```

**Returns:**

```typescript
interface LLMUsageResponse {
  estimated_prompt_tokens: number;
  estimated_completion_tokens: number;
  estimated_total_tokens: number;
  estimated_cost_usd?: number;
  model_used?: string;
}
```

**Example:**

```typescript
const agentId = 'agent_3701k3ttaq12ewp8b7qv5rfyszkz';

// Estimate for typical usage
const usage = await mind.calculateLLMUsage(agentId, {
  conversation_turns: 20,              // 20 back-and-forth exchanges
  average_user_message_length: 50      // ~50 characters per message
});

console.log('Estimated tokens:', usage.estimated_total_tokens);
console.log('Estimated cost:', `$${usage.estimated_cost_usd?.toFixed(4)}`);
console.log('Model:', usage.model_used);

// Calculate for high volume
const highVolume = await mind.calculateLLMUsage(agentId, {
  conversation_turns: 1000,
  average_user_message_length: 100
});

const monthlyConversations = 1000;
const monthlyCost = (highVolume.estimated_cost_usd || 0) * monthlyConversations;

console.log(`Estimated monthly cost for ${monthlyConversations} conversations:`);
console.log(`$${monthlyCost.toFixed(2)}`);

// Compare different models
const gpt4Usage = await mind.calculateLLMUsage(agentId, {
  conversation_turns: 10,
  model_overrides: { llm: 'gpt-4' }
});

const gpt35Usage = await mind.calculateLLMUsage(agentId, {
  conversation_turns: 10,
  model_overrides: { llm: 'gpt-3.5-turbo' }
});

console.log('GPT-4 cost:', gpt4Usage.estimated_cost_usd);
console.log('GPT-3.5 cost:', gpt35Usage.estimated_cost_usd);
```

## Common Workflows

### Complete Agent Creation and Testing

```typescript
// 1. Create agent
console.log('Creating agent...');
const agent = await mind.createAgent({
  conversation_config: {
    agent: {
      prompt: {
        prompt: "You are a helpful customer service agent.",
        llm: "gpt-4",
        temperature: 0.7
      },
      first_message: "Hello! How can I help you today?",
      language: "en"
    },
    tts: {
      model_id: "eleven_turbo_v2",
      voice_id: "pNInz6obpgDQGcFmaJgB"
    }
  }
});

const agentId = agent.agent_id;
console.log('✅ Agent created:', agentId);

// 2. Calculate costs
console.log('Calculating usage...');
const usage = await mind.calculateLLMUsage(agentId, {
  conversation_turns: 10
});
console.log(`✅ Estimated cost per conversation: $${usage.estimated_cost_usd}`);

// 3. Test agent
console.log('Testing agent...');
const testResult = await mind.simulateConversation(agentId, {
  conversation_history: [
    { role: 'user', message: 'I need help with my order' }
  ]
});
console.log('✅ Test response:', testResult.agent_response);

// 4. Refine if needed
if (testResult.agent_response?.includes('not sure')) {
  console.log('Refining prompt...');
  await mind.updateAgent(agentId, {
    conversation_config: {
      agent: {
        prompt: {
          prompt: "You are a helpful customer service agent with access to order information. Always be specific and helpful."
        }
      }
    }
  });
  console.log('✅ Agent updated');
}

// 5. Get shareable link
const link = await mind.getAgentLink(agentId);
console.log('✅ Share link:', link.link_url);

// 6. Store agent ID for use in conversations
mind.setAgentId(agentId);

// 7. Start real conversation (see CONVERSATIONAL_AI.md)
await mind.startConversation();
```

### Managing Multiple Agent Variants

```typescript
// Create base agent
const baseAgent = await mind.createAgent({
  conversation_config: {
    agent: {
      prompt: {
        prompt: "You are a helpful assistant.",
        llm: "gpt-4"
      },
      first_message: "Hello!",
      language: "en"
    }
  }
});

// Create variants for A/B testing
const variants = [];

// Formal variant
const formalVariant = await mind.duplicateAgent(baseAgent.agent_id, {
  new_name: "Assistant (Formal)"
});
await mind.updateAgent(formalVariant.agent_id, {
  conversation_config: {
    agent: {
      prompt: {
        prompt: "You are a professional, formal assistant."
      }
    }
  }
});
variants.push(formalVariant);

// Casual variant
const casualVariant = await mind.duplicateAgent(baseAgent.agent_id, {
  new_name: "Assistant (Casual)"
});
await mind.updateAgent(casualVariant.agent_id, {
  conversation_config: {
    agent: {
      prompt: {
        prompt: "You are a friendly, casual assistant. Use emojis!"
      }
    }
  }
});
variants.push(casualVariant);

// Test all variants
for (const variant of variants) {
  const test = await mind.simulateConversation(variant.agent_id, {
    conversation_history: [
      { role: 'user', message: 'What can you do?' }
    ]
  });
  console.log(`${variant.name}:`, test.agent_response);
}
```

### Batch Testing Multiple Scenarios

```typescript
const agentId = 'agent_3701k3ttaq12ewp8b7qv5rfyszkz';

const testScenarios = [
  "What's the weather like?",
  "Tell me a joke",
  "Help me with my homework",
  "I'm feeling sad",
  "Goodbye"
];

console.log('Running test suite...');
const results = [];

for (const scenario of testScenarios) {
  const result = await mind.simulateConversation(agentId, {
    conversation_history: [
      { role: 'user', message: scenario }
    ]
  });
  
  results.push({
    input: scenario,
    output: result.agent_response,
    tokens: result.metadata?.total_tokens
  });
  
  console.log(`✅ ${scenario}`);
}

// Analyze results
console.log('\n=== Test Results ===');
results.forEach(r => {
  console.log(`\nQ: ${r.input}`);
  console.log(`A: ${r.output}`);
  console.log(`Tokens: ${r.tokens}`);
});

const totalTokens = results.reduce((sum, r) => sum + (r.tokens || 0), 0);
console.log(`\nTotal tokens used: ${totalTokens}`);
```

## Error Handling

### Common Error Patterns

```typescript
try {
  const agent = await mind.createAgent(config);
} catch (error) {
  if (error.status === 401) {
    console.error('Invalid API key');
    // Prompt user to update API key
  } else if (error.status === 429) {
    console.error('Rate limit exceeded');
    // Implement exponential backoff
    await new Promise(resolve => setTimeout(resolve, 5000));
    // Retry
  } else if (error.status === 422) {
    console.error('Invalid configuration:', error.body);
    // Show validation errors to user
  } else {
    console.error('Unexpected error:', error);
  }
}
```

### Retry Logic

```typescript
async function createAgentWithRetry(config, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await mind.createAgent(config);
    } catch (error) {
      if (error.status === 429 && i < maxRetries - 1) {
        const delay = Math.pow(2, i) * 1000; // Exponential backoff
        console.log(`Rate limited. Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        throw error;
      }
    }
  }
}
```

## Best Practices

### 1. Store Agent IDs Securely

```typescript
// Store in database or secure storage
const agentId = agent.agent_id;
await database.saveAgentId(userId, agentId);

// Not in localStorage for production apps
// localStorage can be cleared or accessed by scripts
```

### 2. Version Your Agent Configurations

```typescript
const agentConfig = {
  version: '1.0.0',
  conversation_config: {
    // ... config
  }
};

// Save config alongside agent ID
await database.saveAgent({
  agent_id: agent.agent_id,
  config: agentConfig,
  created_at: new Date()
});
```

### 3. Test Before Deploying

```typescript
// Always test before using in production
const testScenarios = [/* ... */];
const failedTests = [];

for (const scenario of testScenarios) {
  const result = await mind.simulateConversation(agentId, {
    conversation_history: [{ role: 'user', message: scenario }]
  });
  
  if (!result.agent_response || result.status === 'error') {
    failedTests.push(scenario);
  }
}

if (failedTests.length === 0) {
  console.log('✅ All tests passed');
  // Deploy to production
} else {
  console.error('❌ Tests failed:', failedTests);
  // Refine agent
}
```

### 4. Monitor Usage and Costs

```typescript
// Calculate before deployment
const usage = await mind.calculateLLMUsage(agentId, {
  conversation_turns: expectedDailyConversations
});

const dailyCost = usage.estimated_cost_usd;
const monthlyCost = dailyCost * 30;

console.log(`Estimated monthly cost: $${monthlyCost.toFixed(2)}`);

// Set up alerts
if (monthlyCost > BUDGET_LIMIT) {
  console.warn('⚠️ Estimated cost exceeds budget');
  // Consider switching to cheaper model
}
```

### 5. Handle Agent Updates Gracefully

```typescript
// Keep old agent as backup
const oldAgentId = currentAgentId;

// Create new version
const newAgent = await mind.duplicateAgent(oldAgentId, {
  new_name: `${agentName} v2`
});

// Test new version
const testResult = await testAgent(newAgent.agent_id);

if (testResult.success) {
  // Switch to new agent
  currentAgentId = newAgent.agent_id;
  console.log('✅ Switched to new agent');
  
  // Keep old agent for rollback
  // Delete after grace period
} else {
  // Keep using old agent
  await mind.deleteAgent(newAgent.agent_id);
  console.log('❌ New agent failed tests, keeping old version');
}
```

## Troubleshooting

### Agent Not Responding

**Problem**: Agent doesn't respond or times out

**Solutions**:
1. Check agent configuration is complete
2. Verify voice_id and model_id are valid
3. Test with `simulateConversation` first
4. Check API key permissions
5. Verify agent is not deleted

```typescript
// Debug agent
const agent = await mind.getAgent(agentId);
console.log('Agent config:', JSON.stringify(agent, null, 2));

// Test without audio
const test = await mind.simulateConversation(agentId, {
  conversation_history: [{ role: 'user', message: 'test' }]
});
console.log('Test result:', test);
```

### High Token Usage

**Problem**: Unexpected token consumption

**Solutions**:
1. Calculate expected usage first
2. Reduce `max_tokens` in prompt config
3. Use more concise system prompts
4. Consider cheaper models for simple tasks

```typescript
// Optimize prompt
const optimizedAgent = await mind.updateAgent(agentId, {
  conversation_config: {
    agent: {
      prompt: {
        max_tokens: 200,  // Limit response length
        temperature: 0.5  // More focused responses
      }
    }
  }
});
```

### Rate Limiting

**Problem**: 429 Too Many Requests errors

**Solutions**:
1. Implement exponential backoff
2. Cache agent configurations locally
3. Batch operations when possible
4. Contact ElevenLabs for rate limit increase

```typescript
// Implement retry with backoff
async function withRetry(fn, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (error.status === 429 && i < maxRetries - 1) {
        await new Promise(r => setTimeout(r, Math.pow(2, i) * 1000));
      } else {
        throw error;
      }
    }
  }
}

const agent = await withRetry(() => mind.getAgent(agentId));
```

### Invalid Configuration

**Problem**: 422 Unprocessable Entity errors

**Solutions**:
1. Validate configuration before sending
2. Check required fields are present
3. Verify field types match schema
4. Review ElevenLabs documentation for valid values

```typescript
// Validate config
function validateAgentConfig(config) {
  const errors = [];
  
  if (!config.conversation_config?.agent?.prompt?.prompt) {
    errors.push('System prompt is required');
  }
  
  if (!config.conversation_config?.tts?.voice_id) {
    errors.push('Voice ID is required');
  }
  
  return errors;
}

const errors = validateAgentConfig(config);
if (errors.length > 0) {
  console.error('Configuration errors:', errors);
  // Fix config before creating agent
} else {
  const agent = await mind.createAgent(config);
}
```

## Additional Resources

- **Official ElevenLabs Docs**: [elevenlabs.io/docs/agents-platform](https://elevenlabs.io/docs/agents-platform/api-reference/agents/create)
- **Kwami Conversation Guide**: [CONVERSATIONAL_AI.md](./CONVERSATIONAL_AI.md)
- **ElevenLabs Integration**: [ELEVENLABS_INTEGRATION.md](./ELEVENLABS_INTEGRATION.md)
- **JavaScript SDK Docs**: [elevenlabs.io/docs/agents-platform/libraries/java-script](https://elevenlabs.io/docs/agents-platform/libraries/java-script)

---

**Need Help?** Open an issue on [GitHub](https://github.com/yourusername/kwami/issues) or check the [ElevenLabs Community](https://discord.gg/elevenlabs).
