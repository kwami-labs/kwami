# ElevenLabs Conversational AI Agents - Examples

This directory contains comprehensive examples for working with the ElevenLabs Conversational AI Agents API through Kwami Mind.

## Table of Contents

- [Basic Agent Creation](#basic-agent-creation)
- [Advanced Configuration](#advanced-configuration)
- [Tools Integration](#tools-integration)
- [Knowledge Base Integration](#knowledge-base-integration)
- [Workflow Management](#workflow-management)
- [Agent Management](#agent-management)
- [Conversation Management](#conversation-management)

---

## Basic Agent Creation

### Simple Agent

```typescript
import { Kwami, AgentConfigBuilder } from 'kwami';

const kwami = new Kwami(canvas, {
  mind: {
    provider: 'elevenlabs',
    apiKey: 'YOUR_API_KEY',
  },
});

await kwami.mind.initialize();

// Create a basic agent using the builder
const agentConfig = new AgentConfigBuilder()
  .withName('My First Agent')
  .withVoice('pNInz6obpgDQGcFmaJgB') // Adam voice
  .withPrompt('You are a helpful and friendly AI assistant.')
  .withFirstMessage('Hello! How can I help you today?')
  .withLanguage('en')
  .withLLM('gpt-4o-mini')
  .build();

const agent = await kwami.mind.createAgent(agentConfig);
console.log('Agent created:', agent.agent_id);

// Start a conversation with the agent
kwami.mind.setAgentId(agent.agent_id);
await kwami.mind.startConversation();
```

### Using Quick Helper

```typescript
import { createBasicAgentConfig } from 'kwami';

const config = createBasicAgentConfig(
  'pNInz6obpgDQGcFmaJgB', // Voice ID
  'You are a helpful assistant',
  {
    name: 'Quick Agent',
    firstMessage: 'Hi there!',
    language: 'en',
    llm: 'gpt-4o-mini',
  }
);

const agent = await kwami.mind.createAgent(config);
```

---

## Advanced Configuration

### Full Configuration with TTS, ASR, and Turn Settings

```typescript
import { AgentConfigBuilder } from 'kwami';

const config = new AgentConfigBuilder()
  .withName('Advanced Agent')
  
  // System prompt and LLM
  .withPrompt('You are an expert customer service agent...')
  .withLLM('gpt-4o')
  .withTemperature(0.7)
  .withMaxTokens(1000)
  
  // Voice and TTS configuration
  .withVoice('pNInz6obpgDQGcFmaJgB', {
    model_id: 'eleven_turbo_v2_5',
    stability: 0.5,
    similarity_boost: 0.75,
    speed: 1.0,
    optimize_streaming_latency: '3',
    agent_output_audio_format: 'pcm_16000',
  })
  
  // ASR (Speech Recognition) configuration
  .withASR({
    quality: 'high',
    provider: 'elevenlabs',
    user_input_audio_format: 'pcm_16000',
    keywords: ['support', 'help', 'assistance'],
  })
  
  // Turn management
  .withTurnConfig({
    turn_timeout: 10,
    initial_wait_time: 0.5,
    silence_end_call_timeout: 30,
    turn_eagerness: 'normal',
    soft_timeout_config: {
      timeout_seconds: 5,
      message: 'Are you still there?',
    },
  })
  
  // Conversation settings
  .withMaxDuration(1800) // 30 minutes
  .withClientEvents([
    'user_transcript',
    'agent_response',
    'turn_start',
    'turn_end',
  ])
  
  .build();

const agent = await kwami.mind.createAgent(config);
```

---

## Tools Integration

### Creating a Tool

```typescript
import { createSimpleTool, createToolParameter } from 'kwami';

const toolsAPI = kwami.mind.getToolsAPI();

// Create a weather tool
const weatherTool = await toolsAPI.createTool({
  name: 'get_weather',
  description: 'Get current weather for a location',
  url: 'https://your-api.com/weather',
  method: 'POST',
  parameters: [
    createToolParameter('location', 'string', 'City name or ZIP code', {
      required: true,
    }),
    createToolParameter('units', 'string', 'Temperature units', {
      enum: ['celsius', 'fahrenheit'],
    }),
  ],
});

console.log('Weather tool created:', weatherTool.tool_id);
```

### Using Tools in an Agent

```typescript
const config = new AgentConfigBuilder()
  .withName('Weather Assistant')
  .withVoice('pNInz6obpgDQGcFmaJgB')
  .withPrompt('You are a weather assistant. Use the weather tool to help users.')
  .withTools([
    {
      name: 'get_weather',
      description: 'Get current weather for a location',
      url: 'https://your-api.com/weather',
      parameters: [
        {
          name: 'location',
          type: 'string',
          description: 'City name',
          required: true,
        },
      ],
    },
  ])
  .build();

const agent = await kwami.mind.createAgent(config);
```

### Managing Tools

```typescript
const toolsAPI = kwami.mind.getToolsAPI();

// List all tools
const tools = await toolsAPI.listTools();
console.log('Available tools:', tools.tools);

// Get a specific tool
const tool = await toolsAPI.getTool('tool_123');

// Update a tool
const updated = await toolsAPI.updateTool('tool_123', {
  description: 'Updated description',
  parameters: [
    /* new parameters */
  ],
});

// Check which agents use this tool
const dependents = await toolsAPI.getDependentAgents('tool_123');
console.log('Agents using this tool:', dependents.agent_ids);

// Delete a tool
await toolsAPI.deleteTool('tool_123');
```

---

## Knowledge Base Integration

### Creating a Knowledge Base

```typescript
const kbAPI = kwami.mind.getKnowledgeBaseAPI();

// Create knowledge base
const kb = await kbAPI.createKnowledgeBase({
  name: 'Product Documentation',
  description: 'All product manuals and guides',
});

console.log('Knowledge base created:', kb.knowledge_base_id);
```

### Adding Documents

```typescript
// From URL
const doc1 = await kbAPI.createDocumentFromURL(kb.knowledge_base_id, {
  url: 'https://docs.example.com/guide.pdf',
  name: 'User Guide',
});

// From text
const doc2 = await kbAPI.createDocumentFromText(kb.knowledge_base_id, {
  text: 'Product features: ...',
  name: 'Features Overview',
  metadata: { version: '1.0', category: 'features' },
});

// From file upload
const fileInput = document.querySelector('input[type="file"]');
const file = fileInput.files[0];
const doc3 = await kbAPI.createDocumentFromFile(kb.knowledge_base_id, {
  file,
  name: 'Manual.pdf',
});
```

### Using Knowledge Base with Agent

```typescript
const config = new AgentConfigBuilder()
  .withName('Support Agent')
  .withVoice('pNInz6obpgDQGcFmaJgB')
  .withPrompt('You are a support agent. Use the knowledge base to answer questions.')
  .withKnowledgeBase([
    {
      knowledge_base_id: kb.knowledge_base_id,
      type: 'document',
    },
  ])
  .build();

const agent = await kwami.mind.createAgent(config);
```

### RAG Index Management

```typescript
// Compute RAG index for semantic search
const indexStatus = await kbAPI.computeRAGIndex(kb.knowledge_base_id);
console.log('Indexing status:', indexStatus.status);

// Check index status
const status = await kbAPI.getRAGIndex(kb.knowledge_base_id);
console.log('Index ready:', status.status === 'ready');

// Get overview of all indexes
const overview = await kbAPI.getRAGIndexOverview();
overview.forEach((kb) => {
  console.log(`KB ${kb.knowledge_base_id}: ${kb.total_chunks} chunks`);
});
```

### Managing Documents

```typescript
// List documents
const docs = await kbAPI.listDocuments(kb.knowledge_base_id);

// Get document content
const content = await kbAPI.getDocumentContent(
  kb.knowledge_base_id,
  'doc_123'
);

// Get specific chunk
const chunk = await kbAPI.getDocumentChunk(
  kb.knowledge_base_id,
  'doc_123',
  'chunk_456'
);

// Delete document
await kbAPI.deleteDocument(kb.knowledge_base_id, 'doc_123');
```

---

## Workflow Management

### Creating a Multi-Agent Workflow

```typescript
import type { AgentWorkflow } from 'kwami';

const workflow: AgentWorkflow = {
  nodes: {
    start: {
      id: 'start',
      type: 'start',
      position: { x: 0, y: 0 },
    },
    main_agent: {
      id: 'main_agent',
      type: 'override_agent',
      position: { x: 100, y: 0 },
      label: 'Main Assistant',
      additional_prompt: 'You are the main assistant...',
    },
    specialist: {
      id: 'specialist',
      type: 'standalone_agent',
      position: { x: 200, y: 0 },
      agent_id: 'agent_specialist_123',
      transfer_message: 'Transferring you to a specialist...',
    },
    end: {
      id: 'end',
      type: 'end',
      position: { x: 300, y: 0 },
    },
  },
  edges: {
    edge1: {
      source: 'start',
      target: 'main_agent',
    },
    edge2: {
      source: 'main_agent',
      target: 'specialist',
      condition: 'needs_specialist',
    },
    edge3: {
      source: 'specialist',
      target: 'end',
    },
  },
};

const config = new AgentConfigBuilder()
  .withName('Support System')
  .withVoice('pNInz6obpgDQGcFmaJgB')
  .withWorkflow(workflow)
  .build();

const agent = await kwami.mind.createAgent(config);
```

---

## Agent Management

### Listing Agents

```typescript
// List all agents
const agents = await kwami.mind.listAgents();
agents.agents.forEach((agent) => {
  console.log(`${agent.name} (${agent.agent_id})`);
});

// Paginated listing
const page1 = await kwami.mind.listAgents({ page_size: 10 });
if (page1.has_more) {
  const page2 = await kwami.mind.listAgents({
    page_size: 10,
    page_token: page1.next_page_token,
  });
}
```

### Updating an Agent

```typescript
await kwami.mind.updateAgent('agent_123', {
  conversation_config: {
    agent: {
      prompt: {
        prompt: 'Updated system prompt...',
      },
      first_message: 'New greeting!',
    },
    tts: {
      voice_id: 'new_voice_id',
      stability: 0.6,
    },
  },
});
```

### Duplicating an Agent

```typescript
const duplicate = await kwami.mind.duplicateAgent('agent_123', {
  new_name: 'Copy of Agent',
});

console.log('Duplicate created:', duplicate.agent_id);
```

### Deleting an Agent

```typescript
await kwami.mind.deleteAgent('agent_123');
console.log('Agent deleted');
```

---

## Conversation Management

### Starting and Managing Conversations

```typescript
// Start conversation with callbacks
await kwami.mind.startConversation('You are helpful', {
  onUserTranscript: (text) => {
    console.log('User said:', text);
  },
  onAgentResponse: (text) => {
    console.log('Agent responded:', text);
  },
  onTurnStart: () => {
    console.log('Agent is speaking...');
  },
  onTurnEnd: () => {
    console.log('Agent finished speaking');
  },
  onError: (error) => {
    console.error('Error:', error);
  },
});

// Send text message during conversation
kwami.mind.sendConversationMessage('What is the weather?');

// Stop conversation
await kwami.mind.stopConversation();
```

### Listing Conversations

```typescript
// List all conversations for an agent
const conversations = await kwami.mind.listConversations({
  agent_id: 'agent_123',
  status: 'done',
  sort_by: 'created_at',
  sort_order: 'desc',
});

conversations.conversations.forEach((conv) => {
  console.log(`Conversation ${conv.conversation_id}:`);
  console.log(`  Duration: ${conv.metadata.call_duration_secs}s`);
  console.log(`  Tokens: ${conv.metadata.total_tokens}`);
});
```

### Getting Conversation Details

```typescript
const conversation = await kwami.mind.getConversation('conv_123');

// View transcript
conversation.transcript.forEach((entry) => {
  console.log(`[${entry.role}] ${entry.message}`);
});

// Download audio
const audioBlob = await kwami.mind.getConversationAudio('conv_123');
const audioUrl = URL.createObjectURL(audioBlob);
// Play or download audio
```

### Conversation Feedback

```typescript
await kwami.mind.sendConversationFeedback('conv_123', {
  feedback: 'like',
  comment: 'Very helpful!',
  tags: ['helpful', 'fast'],
});
```

---

## Validation

### Validating Agent Configuration

```typescript
import { validateAgentConfig, formatValidationErrors } from 'kwami';

const config = new AgentConfigBuilder()
  .withVoice('voice_id')
  .withTemperature(1.5) // Invalid! Should be 0-1
  .build();

const result = validateAgentConfig(config);

if (!result.valid) {
  console.error('Validation errors:');
  console.error(formatValidationErrors(result.errors));
} else {
  // Create agent
  await kwami.mind.createAgent(config);
}
```

---

## Platform Settings

### Widget Configuration

```typescript
const config = new AgentConfigBuilder()
  .withName('Website Assistant')
  .withVoice('voice_id')
  .withPlatformSettings({
    widget: {
      color: '#0066ff',
      position: 'bottom-right',
      avatar_url: 'https://example.com/avatar.png',
    },
  })
  .build();
```

### Telephony Integration

```typescript
const config = new AgentConfigBuilder()
  .withName('Phone Agent')
  .withVoice('voice_id')
  .withPlatformSettings({
    telephony: {
      provider: 'twilio',
      number: '+1234567890',
    },
  })
  .build();
```

---

## Secrets Management

### Adding API Keys for Tools

```typescript
const config = new AgentConfigBuilder()
  .withName('API Agent')
  .withVoice('voice_id')
  .withSecret('WEATHER_API_KEY', 'your-api-key')
  .withSecret('DATABASE_PASSWORD', 'your-password')
  .withTools([
    {
      name: 'weather',
      description: 'Get weather',
      url: 'https://api.weather.com',
      // Tool can access WEATHER_API_KEY securely
    },
  ])
  .build();
```

---

## Complete Example: Customer Support Agent

```typescript
import { Kwami, AgentConfigBuilder } from 'kwami';

async function createSupportAgent() {
  const kwami = new Kwami(canvas, {
    mind: {
      provider: 'elevenlabs',
      apiKey: process.env.ELEVENLABS_API_KEY,
    },
  });

  await kwami.mind.initialize();

  // Create knowledge base with documentation
  const kbAPI = kwami.mind.getKnowledgeBaseAPI();
  const kb = await kbAPI.createKnowledgeBase({
    name: 'Product Docs',
    description: 'Support documentation',
  });

  await kbAPI.createDocumentFromURL(kb.knowledge_base_id, {
    url: 'https://docs.example.com/faq.pdf',
  });

  await kbAPI.computeRAGIndex(kb.knowledge_base_id);

  // Create tools
  const toolsAPI = kwami.mind.getToolsAPI();
  const ticketTool = await toolsAPI.createTool({
    name: 'create_ticket',
    description: 'Create support ticket',
    url: 'https://api.example.com/tickets',
    parameters: [
      {
        name: 'issue',
        type: 'string',
        description: 'Issue description',
        required: true,
      },
      {
        name: 'priority',
        type: 'string',
        description: 'Ticket priority',
        enum: ['low', 'medium', 'high'],
      },
    ],
  });

  // Create agent with everything
  const agent = await kwami.mind.createAgent(
    new AgentConfigBuilder()
      .withName('Support Agent')
      .withVoice('pNInz6obpgDQGcFmaJgB')
      .withLLM('gpt-4o')
      .withPrompt(`You are a helpful customer support agent.
        Use the knowledge base to answer questions.
        Create tickets for issues that need escalation.`)
      .withFirstMessage('Hello! How can I assist you today?')
      .withLanguage('en')
      .withKnowledgeBase([
        { knowledge_base_id: kb.knowledge_base_id },
      ])
      .withTools([
        {
          name: 'create_ticket',
          description: 'Create support ticket',
          url: 'https://api.example.com/tickets',
          parameters: [
            {
              name: 'issue',
              type: 'string',
              description: 'Issue description',
              required: true,
            },
          ],
        },
      ])
      .withTurnConfig({
        turn_timeout: 15,
        soft_timeout_config: {
          timeout_seconds: 10,
          message: 'Are you still there? Let me know if you need help.',
        },
      })
      .withMaxDuration(3600) // 1 hour
      .build()
  );

  console.log('Support agent ready:', agent.agent_id);

  // Start conversation
  kwami.mind.setAgentId(agent.agent_id);
  await kwami.mind.startConversation();
}

createSupportAgent();
```

---

## Error Handling

```typescript
try {
  const agent = await kwami.mind.createAgent(config);
} catch (error) {
  if (error.message.includes('validation')) {
    console.error('Configuration error:', error);
  } else if (error.message.includes('API key')) {
    console.error('Authentication error:', error);
  } else {
    console.error('Unknown error:', error);
  }
}
```

---

For more information, see the [ElevenLabs API Documentation](https://elevenlabs.io/docs/api-reference/agents).

