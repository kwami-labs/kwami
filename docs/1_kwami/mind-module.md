# Kwami Mind - Conversational AI Provider System

## Overview

The **Kwami Mind** is the cognitive layer that enables conversational AI capabilities through a flexible, provider-agnostic architecture. It orchestrates different AI providers (ElevenLabs, OpenAI, Anthropic, Google) to power natural voice conversations with Kwami.

## Architecture

### Core Components

```
kwami/src/core/mind/
├── Mind.ts                     # Main orchestrator class
└── providers/
    ├── types.ts                # Provider interface definitions
    ├── factory.ts              # Provider factory pattern
    ├── elevenlabs/
    │   └── ElevenLabsProvider.ts
    └── openai/
        └── OpenAIProvider.ts
```

### Mind.ts - The Orchestrator

The `KwamiMind` class is the main interface that:
- Manages provider lifecycle
- Routes method calls to active provider
- Handles pronunciation dictionaries
- Provides unified API regardless of provider

```typescript
import { KwamiMind } from './core/mind/Mind';

const mind = new KwamiMind(audio, {
  provider: 'elevenlabs',
  apiKey: 'your-api-key',
});

await mind.initialize();
```

### Provider Interface

All providers must implement the `MindProvider` interface:

```typescript
interface MindProvider {
  // Lifecycle
  initialize(): Promise<void>;
  isReady(): boolean;
  dispose(): void;
  updateConfig(config: MindConfig): void;

  // Agent Management
  createAgent(config: CreateAgentRequest): Promise<AgentResponse>;
  getAgent(agentId: string): Promise<AgentResponse>;
  listAgents(options?: ListAgentsOptions): Promise<ListAgentsResponse>;
  updateAgent(agentId: string, config: UpdateAgentRequest): Promise<AgentResponse>;
  deleteAgent(agentId: string): Promise<void>;
  duplicateAgent(agentId: string, options?: DuplicateAgentRequest): Promise<AgentResponse>;

  // Conversations
  startConversation(systemPrompt?: string, callbacks?: MindConversationCallbacks): Promise<void>;
  stopConversation(): Promise<void>;
  isConversationActive(): boolean;
  sendConversationMessage(text: string): void;

  // Testing & Analytics
  simulateConversation(agentId: string, request: SimulateConversationRequest): Promise<SimulateConversationResponse>;
  calculateLLMUsage(agentId: string, request?: LLMUsageRequest): Promise<LLMUsageResponse>;
  getAgentLink(agentId: string): Promise<AgentLinkResponse>;

  // Audio
  speak(text: string, options?: MindProviderSpeakOptions): Promise<void>;
  listen(): Promise<MediaStream>;
  stopListening(): void;
  getAvailableVoices(): Promise<any[]>;
  generateSpeechBlob(text: string): Promise<Blob>;
  testMicrophone(): Promise<boolean>;

  // Conversation History
  listConversations(options?: ListConversationsOptions): Promise<ListConversationsResponse>;
  getConversation(conversationId: string): Promise<ConversationResponse>;
  deleteConversation(conversationId: string): Promise<void>;
  getConversationAudio(conversationId: string): Promise<Blob>;
}
```

## Providers

### 1. ElevenLabs Provider (✅ Fully Implemented)

The ElevenLabs provider integrates with the [ElevenLabs Conversational AI API](https://elevenlabs.io/docs/conversational-ai).

**Features:**
- ✅ WebSocket-based real-time conversations
- ✅ Agent CRUD operations
- ✅ Voice configuration (stability, similarity, style)
- ✅ Streaming audio playback
- ✅ Cost calculation
- ✅ Conversation simulation
- ✅ Agent sharing links
- ✅ Conversation history

**Usage:**
```typescript
const mind = new KwamiMind(audio, {
  provider: 'elevenlabs',
  apiKey: 'sk-...',
  conversational: {
    agentId: 'your-agent-id'
  }
});

await mind.initialize();

// Create an agent
const agent = await mind.createAgent({
  name: "Friendly Assistant",
  prompt: {
    prompt: "You are a friendly AI assistant"
  },
  first_message: "Hello! How can I help you today?",
  llm: {
    model: "gpt-4",
    temperature: 0.7,
    max_tokens: 500
  },
  tts: {
    voice_id: "pNInz6obpgDQGcFmaJgB",
    model: "eleven_turbo_v2"
  }
});

// Start conversation
await mind.setAgentId(agent.agent_id);
await mind.startConversation(undefined, {
  onAgentResponse: (text) => console.log('Agent:', text),
  onUserTranscript: (text) => console.log('User:', text),
  onError: (error) => console.error('Error:', error)
});
```

**WebSocket Protocol:**
The ElevenLabs provider uses a WebSocket connection for real-time bi-directional audio:
- **Client → Server**: PCM16 audio chunks (16kHz)
- **Server → Client**: PCM16 audio responses + JSON events

**Events:**
```typescript
{
  type: 'conversation_initiation_metadata' // Connection established
  type: 'user_transcript'                   // User speech recognized
  type: 'agent_response'                    // Agent text response
  type: 'turn_start'                        // Agent starts speaking
  type: 'turn_end'                          // Agent finishes speaking
  type: 'ping'                              // Keep-alive
  type: 'error'                             // Error occurred
  type: 'conversation_end'                  // Conversation terminated
}
```

### 2. OpenAI Provider (🚧 Coming Soon)

Will integrate with OpenAI's Realtime API for GPT-4 powered conversations.

**Planned Features:**
- WebRTC-based conversations
- Function calling support
- Custom instructions
- Multiple voice options
- Streaming responses

### 3. Anthropic Provider (🚧 Coming Soon)

Will integrate with Claude API for natural conversations.

**Planned Features:**
- Claude 3 models (Opus, Sonnet, Haiku)
- Long context conversations
- Constitutional AI principles
- Streaming responses

### 4. Google Provider (🚧 Coming Soon)

Will integrate with Google's Gemini API.

**Planned Features:**
- Multimodal conversations
- Vision capabilities
- Google TTS integration
- Long context support

## Usage Examples

### Basic Setup

```typescript
import { KwamiMind } from './core/mind/Mind';
import { KwamiAudio } from './core/body/Audio';

// 1. Create audio instance
const audio = new KwamiAudio();

// 2. Create mind with ElevenLabs
const mind = new KwamiMind(audio, {
  provider: 'elevenlabs',
  apiKey: process.env.ELEVENLABS_API_KEY
});

// 3. Initialize
await mind.initialize();
```

### Create and Manage Agents

```typescript
// Create agent
const agent = await mind.createAgent({
  name: "Customer Support Bot",
  prompt: {
    prompt: "You are a helpful customer support agent. Be polite and professional."
  },
  first_message: "Hello! Welcome to our support. How can I assist you today?",
  llm: {
    model: "gpt-4",
    temperature: 0.7,
    max_tokens: 500
  },
  tts: {
    voice_id: "pNInz6obpgDQGcFmaJgB",
    model: "eleven_turbo_v2",
    stability: 0.5,
    similarity_boost: 0.75
  }
});

console.log('Agent ID:', agent.agent_id);

// List all agents
const agents = await mind.listAgents();
console.log(`Found ${agents.agents.length} agents`);

// Update agent
await mind.updateAgent(agent.agent_id, {
  name: "Updated Support Bot",
  prompt: {
    prompt: "You are an expert technical support agent."
  }
});

// Delete agent
await mind.deleteAgent(agent.agent_id);
```

### Start Conversations

```typescript
// Set active agent
mind.setAgentId('your-agent-id');

// Start conversation with callbacks
await mind.startConversation(undefined, {
  onAgentResponse: (text) => {
    console.log('🤖 Agent:', text);
    // Update UI, trigger animations, etc.
  },
  
  onUserTranscript: (text) => {
    console.log('👤 User:', text);
    // Show user's speech in UI
  },
  
  onTurnStart: () => {
    console.log('🎙️ Agent is speaking...');
    // Update Kwami state to 'speaking'
  },
  
  onTurnEnd: () => {
    console.log('👂 Agent is listening...');
    // Update Kwami state to 'listening'
  },
  
  onError: (error) => {
    console.error('❌ Error:', error);
    // Handle errors gracefully
  }
});

// Send text message (instead of voice)
mind.sendConversationMessage("What are your business hours?");

// Stop conversation
await mind.stopConversation();
```

### Test Agents

```typescript
// Simulate conversation without voice
const response = await mind.simulateConversation(agent.agent_id, {
  messages: [
    { role: "user", text: "Hello, how are you?" }
  ]
});

console.log('Agent response:', response.messages[0].text);
```

### Calculate Costs

```typescript
// Estimate costs before running conversations
const usage = await mind.calculateLLMUsage(agent.agent_id, {
  conversations: 100,
  average_turns: 5
});

console.log(`Estimated cost: $${usage.estimated_cost}`);
console.log(`Total tokens: ${usage.total_tokens}`);
```

### Get Shareable Links

```typescript
// Generate public link for agent
const link = await mind.getAgentLink(agent.agent_id);

console.log('Share this link:', link.url);
console.log('Link status:', link.status); // 'active' or 'inactive'
```

### Conversation History

```typescript
// List conversations
const conversations = await mind.listConversations({
  agent_id: 'your-agent-id',
  page_size: 10,
  sort_by: 'created_at',
  sort_order: 'desc'
});

// Get specific conversation
const conversation = await mind.getConversation('conversation-id');
console.log('Transcript:', conversation.transcript);

// Download conversation audio
const audioBlob = await mind.getConversationAudio('conversation-id');
const url = URL.createObjectURL(audioBlob);
// Play or download audio
```

## Configuration

### MindConfig Interface

```typescript
interface MindConfig {
  provider?: MindProviderType;           // 'elevenlabs' | 'openai' | 'anthropic' | 'google'
  apiKey?: string;                       // Provider API key
  
  voice?: {
    voiceId?: string;                    // Voice ID for TTS
    model?: string;                      // TTS model
    settings?: VoiceSettings;            // Voice parameters
  };
  
  conversational?: {
    agentId?: string;                    // Active agent ID
    firstMessage?: string;               // Agent's greeting
    maxDuration?: number;                // Max conversation seconds
    allowInterruption?: boolean;         // Can user interrupt?
  };
  
  advancedTTS?: {
    outputFormat?: TTSOutputFormat;      // Audio format
    optimizeStreamingLatency?: boolean;  // Low latency mode
    nextTextTimeout?: number;            // Chunk timeout (ms)
  };
  
  stt?: {
    model?: STTModel;                    // Speech-to-text model
    automaticPunctuation?: boolean;      // Auto punctuation
    speakerDiarization?: boolean;        // Speaker identification
  };
  
  pronunciation?: {
    dictionary?: Map<string, string>;    // Custom pronunciations
    usePhonemes?: boolean;               // Use IPA phonemes
  };
  
  language?: string;                     // ISO language code
}
```

## Provider Factory

The factory pattern ensures clean provider instantiation:

```typescript
import { createMindProvider } from './providers/factory';

const provider = createMindProvider(
  'elevenlabs',              // Provider type
  { audio },                 // Dependencies
  { apiKey: 'sk-...' }      // Config
);

await provider.initialize();
```

## Adding New Providers

To add a new provider:

1. **Create provider class** in `kwami/kwami/src/core/mind/providers/yourprovider/YourProvider.ts`

```typescript
import type { MindProvider, MindProviderDependencies } from '../types';
import type { MindConfig } from '../../../types';

export class YourProvider implements MindProvider {
  readonly type = 'yourprovider';
  
  constructor(dependencies: MindProviderDependencies, config: MindConfig) {
    // Initialize provider
  }
  
  async initialize(): Promise<void> {
    // Setup API client, authenticate, etc.
  }
  
  // Implement all MindProvider methods...
}
```

2. **Add to factory** in `providers/factory.ts`

```typescript
import { YourProvider } from './yourprovider/YourProvider';

export function createMindProvider(
  type: MindProviderType | undefined,
  dependencies: MindProviderDependencies,
  config: MindConfig
): MindProvider {
  switch (type ?? 'elevenlabs') {
    case 'elevenlabs':
      return new ElevenLabsProvider(dependencies, config);
    case 'yourprovider':
      return new YourProvider(dependencies, config);
    default:
      throw new Error(`Provider "${type}" not implemented`);
  }
}
```

3. **Add type** in `src/types.ts`

```typescript
export type MindProviderType = 'elevenlabs' | 'openai' | 'anthropic' | 'yourprovider';
```

4. **Update UI** in `playground/index.html`

```html
<button class="provider-tab" data-provider="yourprovider" onclick="switchProvider('yourprovider')">
  <span class="provider-icon">🎯</span>
  <span class="provider-name">YourProvider</span>
</button>

<div id="provider-yourprovider" class="provider-content">
  <!-- Your provider UI -->
</div>
```

## Best Practices

### 1. Error Handling

Always wrap provider calls in try-catch:

```typescript
try {
  await mind.startConversation(undefined, callbacks);
} catch (error) {
  console.error('Failed to start conversation:', error);
  showError('Unable to connect. Please check your API key and agent ID.');
}
```

### 2. Lifecycle Management

Properly dispose of resources:

```typescript
// When done with Mind
mind.dispose();

// This will:
// - Stop any active conversations
// - Close WebSocket connections
// - Release audio streams
// - Clear internal state
```

### 3. State Management

Check states before operations:

```typescript
if (!mind.isReady()) {
  console.warn('Mind not initialized');
  return;
}

if (mind.isConversationActive()) {
  console.warn('Conversation already active');
  return;
}
```

### 4. Callbacks

Use callbacks for real-time updates:

```typescript
await mind.startConversation(systemPrompt, {
  onAgentResponse: (text) => {
    // Update Kwami's dialogue bubble
    showDialogue(text);
  },
  
  onUserTranscript: (text) => {
    // Show user's speech
    showUserInput(text);
  },
  
  onTurnStart: () => {
    // Animate Kwami speaking
    kwami.setState('speaking');
  },
  
  onTurnEnd: () => {
    // Animate Kwami listening
    kwami.setState('listening');
  },
  
  onError: (error) => {
    // Handle gracefully
    showError(error.message);
    kwami.setState('idle');
  }
});
```

### 5. Configuration Updates

Update config dynamically:

```typescript
// Update voice settings
mind.setVoiceSettings({
  stability: 0.6,
  similarity_boost: 0.8
});

// Change voice
mind.setVoiceId('new-voice-id');

// Update agent
mind.setAgentId('new-agent-id');

// Switch provider
mind.setProvider('openai');
```

## Integration with Kwami

The Mind integrates seamlessly with Kwami's body (visual) and soul (personality):

```typescript
import { Kwami } from './core/Kwami';

const kwami = new Kwami({
  mind: {
    provider: 'elevenlabs',
    apiKey: 'sk-...',
  },
  soul: {
    name: 'Kaya',
    personality: 'friendly',
  },
  body: {
    // Visual config
  }
});

await kwami.initialize();

// Mind can access Soul for system prompts
const systemPrompt = kwami.soul.getSystemPrompt();
await kwami.mind.startConversation(systemPrompt);

// Mind can update Body state
kwami.mind.startConversation(undefined, {
  onTurnStart: () => kwami.body.setState('speaking'),
  onTurnEnd: () => kwami.body.setState('listening'),
});
```

## Troubleshooting

### "Mind not initialized"
```typescript
await mind.initialize();
```

### "Invalid API key"
```typescript
mind.updateConfig({ apiKey: 'correct-key' });
await mind.initialize();
```

### "Agent not found"
```typescript
const agents = await mind.listAgents();
console.log('Available agents:', agents.agents.map(a => a.agent_id));
```

### "WebSocket connection failed"
- Check agent ID is correct
- Verify API key has conversation permissions
- Check internet connection
- Ensure agent is not deleted

### "No audio output"
- Verify `KwamiAudio` is initialized
- Check browser audio permissions
- Test with `mind.testMicrophone()`

## Performance Tips

1. **Reuse Mind instance** - Don't create multiple Mind instances
2. **Stop conversations** - Always call `stopConversation()` when done
3. **Dispose properly** - Call `dispose()` when cleaning up
4. **Cache agent list** - Don't fetch agents on every render
5. **Use streaming** - Enable `optimizeStreamingLatency` for real-time feel

## Future Enhancements

- [ ] Multi-agent conversations
- [ ] Custom knowledge bases
- [ ] Function calling / tool use
- [ ] Voice cloning integration
- [ ] Emotion detection
- [ ] Real-time translation
- [ ] Conversation memory
- [ ] Agent analytics dashboard

## References

- [ElevenLabs Conversational AI Docs](https://elevenlabs.io/docs/conversational-ai)
- [ElevenLabs JS SDK](https://github.com/elevenlabs/elevenlabs-js)
- [OpenAI Realtime API](https://platform.openai.com/docs/api-reference/realtime)
- [Anthropic Claude API](https://docs.anthropic.com/)
- [Google Gemini API](https://ai.google.dev/)

---

Built with ❤️ for Kwami - The conversational AI companion that comes alive! 🎙️✨



