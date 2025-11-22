# Mind Component

The Mind handles AI capabilities through a provider architecture that supports multiple AI vendors for Text-to-Speech, Speech-to-Text, and conversational AI.

## Overview

The Mind is responsible for:

- **Text-to-Speech (TTS)** - Converting text to natural voice
- **Speech-to-Text (STT)** - Converting voice to text (coming soon)
- **Conversational AI** - Full voice conversations (beta)
- **Agent Management** - Create and manage AI agents (v1.4.1+)
- **Tools API** - Custom tool calling with webhooks (v1.4.1+)
- **Knowledge Base** - RAG with document management (v1.4.1+)
- **Workflows** - Multi-agent orchestration (v1.4.1+)
- **Provider Management** - Hot-swappable AI backends
- **Voice Configuration** - Fine-tuning voice characteristics

## Provider Architecture

Kwami uses a provider pattern to support multiple AI vendors:

```
KwamiMind
├── Provider Factory
├── ElevenLabs Provider (fully implemented)
├── OpenAI Provider (experimental)
└── Future Providers (Vapi, Retell, Bland, etc.)
```

### Available Providers

| Provider       | Status          | TTS | STT | Conversation | Agents | Tools | Knowledge Base |
| -------------- | --------------- | --- | --- | ------------ | ------ | ----- | -------------- |
| **ElevenLabs** | ✅ Complete     | ✅  | ❌  | 🟡 Beta      | ✅     | ✅    | ✅             |
| **OpenAI**     | 🟡 Experimental | ✅  | ❌  | ❌ WIP       | ❌     | ❌    | ❌             |
| **Vapi**       | 📅 Planned      | -   | -   | -            | -      | -     | -              |
| **Retell**     | 📅 Planned      | -   | -   | -            | -      | -     | -              |
| **Bland**      | 📅 Planned      | -   | -   | -            | -      | -     | -              |

## Basic Usage

### Initialization

```typescript
import { KwamiMind } from "kwami";

// Get audio instance from body
const audio = kwami.body.audio;

// Create Mind instance
const mind = new KwamiMind(audio, {
  provider: "elevenlabs",
  apiKey: "your-elevenlabs-api-key",
  voiceId: "your-voice-id",
});

// Initialize
await mind.initialize();
```

### Text-to-Speech

```typescript
// Simple TTS
await mind.speak("Hello, I am Kwami!");

// With personality context
const systemPrompt = kwami.soul.getSystemPrompt();
await mind.speak("I'm here to help!", { context: systemPrompt });
```

## ElevenLabs Provider

The ElevenLabs provider is fully implemented with comprehensive features.

### Configuration

```typescript
const mind = new KwamiMind(audio, {
  provider: "elevenlabs",
  apiKey: "your-api-key",

  // Voice settings
  voiceId: "your-voice-id",
  modelId: "eleven_turbo_v2_5", // TTS model

  // Voice fine-tuning (0-1)
  stability: 0.5,
  similarityBoost: 0.75,
  style: 0.0,
  useSpeakerBoost: true,

  // Output format
  outputFormat: "mp3_44100_128",

  // Latency optimization
  optimizeStreamingLatency: 3, // 0-4

  // Pronunciation dictionary
  pronunciationDictionary: {
    Kwami: "KWAH-mee",
    API: "ay-pee-eye",
  },
});
```

### Voice Models

ElevenLabs offers multiple TTS models:

| Model                    | Speed       | Quality   | Latency | Best For               |
| ------------------------ | ----------- | --------- | ------- | ---------------------- |
| `eleven_turbo_v2_5`      | ⚡️ Fastest | Good      | ~300ms  | Real-time conversation |
| `eleven_turbo_v2`        | Fast        | Good      | ~400ms  | Interactive apps       |
| `eleven_multilingual_v2` | Medium      | Excellent | ~600ms  | 29 languages           |
| `eleven_monolingual_v1`  | Medium      | Very Good | ~500ms  | English only           |

### Voice Fine-Tuning

Control voice characteristics:

```typescript
// Stability (0-1)
// Low: More expressive, variable
// High: More consistent, stable
mind.setStability(0.5);

// Similarity Boost (0-1)
// Low: More creative interpretation
// High: Closer to original voice
mind.setSimilarityBoost(0.75);

// Style Exaggeration (0-1)
// Low: Neutral delivery
// High: Amplified style (if voice supports it)
mind.setStyle(0.3);

// Speaker Boost
// Enhances voice clarity and presence
mind.setUseSpeakerBoost(true);
```

### Output Formats

Available audio formats:

```typescript
// MP3 formats
"mp3_22050_32"; // 22.05 kHz, 32 kbps
"mp3_44100_32"; // 44.1 kHz, 32 kbps
"mp3_44100_64"; // 44.1 kHz, 64 kbps
"mp3_44100_96"; // 44.1 kHz, 96 kbps
"mp3_44100_128"; // 44.1 kHz, 128 kbps (recommended)
"mp3_44100_192"; // 44.1 kHz, 192 kbps

// PCM formats (lower latency)
"pcm_16000"; // 16 kHz PCM
"pcm_22050"; // 22.05 kHz PCM
"pcm_24000"; // 24 kHz PCM
"pcm_44100"; // 44.1 kHz PCM
```

### Pronunciation Dictionary

Define custom pronunciations:

```typescript
mind.addPronunciation("Kwami", "KWAH-mee");
mind.addPronunciation("SQLite", "ess-kew-lite");

// Supports IPA phonemes
mind.addPronunciation("café", "kæˈfeɪ");

// Remove pronunciation
mind.removePronunciation("Kwami");

// Get all pronunciations
const dict = mind.getPronunciationDictionary();
```

### Latency Optimization

```typescript
// Optimize streaming latency (0-4)
// 0: Highest quality, highest latency
// 4: Lowest latency, acceptable quality trade-off
mind.setOptimizeStreamingLatency(3);

// Recommended settings:
// - Real-time conversation: 3-4
// - Narration/podcast: 0-1
// - Interactive app: 2-3
```

## OpenAI Provider (Experimental)

Basic TTS support with OpenAI's API.

### Configuration

```typescript
const mind = new KwamiMind(audio, {
  provider: "openai",
  apiKey: "your-openai-api-key",

  // Voice selection
  voice: "alloy", // 'alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'

  // TTS model
  model: "tts-1-hd", // or 'tts-1'

  // Speed (0.25 - 4.0)
  speed: 1.0,

  // Output format
  responseFormat: "mp3", // 'mp3', 'opus', 'aac', 'flac'
});
```

### Available Voices

| Voice     | Description         | Use Case                 |
| --------- | ------------------- | ------------------------ |
| `alloy`   | Neutral, balanced   | General purpose          |
| `echo`    | Male, clear         | Professional content     |
| `fable`   | British, expressive | Storytelling             |
| `onyx`    | Deep, authoritative | News, formal             |
| `nova`    | Friendly, warm      | Customer service         |
| `shimmer` | Soft, gentle        | Meditation, calm content |

### TTS Models

- **`tts-1`** - Fast, optimized for real-time
- **`tts-1-hd`** - Higher quality, slightly slower

### Limitations

⚠️ **Current OpenAI Provider Status:**

- ✅ Basic TTS working
- ❌ Realtime API not yet integrated
- ❌ Conversational AI pending
- ❌ Speech-to-Text pending

## Conversational AI (Beta)

Full voice conversations with WebSocket streaming.

### Starting a Conversation

```typescript
// Start conversation
await mind.startConversation({
  onUserSpeaking: () => {
    console.log("User is speaking");
    kwami.setState("listening");
  },

  onAISpeaking: () => {
    console.log("AI is responding");
    kwami.setState("speaking");
  },

  onUserTranscript: (text) => {
    console.log("User said:", text);
  },

  onAIResponse: (text) => {
    console.log("AI said:", text);
  },

  onError: (error) => {
    console.error("Conversation error:", error);
  },

  onEnd: () => {
    console.log("Conversation ended");
    kwami.setState("idle");
  },
});

// Stop conversation
mind.stopConversation();
```

### Conversation Configuration

```typescript
await mind.startConversation({
  // Agent configuration
  agentId: "your-agent-id", // Pre-configured agent

  // Or inline first message
  firstMessage: "Hello! How can I help you today?",

  // System prompt (from Soul)
  systemPrompt: kwami.soul.getSystemPrompt(),

  // Callbacks
  onUserSpeaking: () => {},
  onAISpeaking: () => {},
  onUserTranscript: (text) => {},
  onAIResponse: (text) => {},
  onError: (error) => {},
  onEnd: () => {},
});
```

## Agent Management (v1.4.1+)

Create and manage conversational AI agents with the new fluent API (ElevenLabs only).

### AgentConfigBuilder - Fluent API

The new `AgentConfigBuilder` provides a type-safe, fluent interface for creating agents:

```typescript
import { AgentConfigBuilder } from "kwami";

const config = new AgentConfigBuilder()
  .withName("Support Agent")
  .withVoice("pNInz6obpgDQGcFmaJgB", {
    model_id: "eleven_turbo_v2_5",
    stability: 0.5,
    similarity_boost: 0.75,
    optimize_streaming_latency: "3",
  })
  .withPrompt("You are a helpful support agent")
  .withLLM("gpt-4o")
  .withTemperature(0.7)
  .withMaxTokens(1000)
  .withFirstMessage("Hello! How can I help you today?")
  .withLanguage("en")
  .withMaxDuration(1800) // 30 minutes
  .build();

const agent = await mind.createAgent(config);
console.log("Agent ID:", agent.agent_id);
```

### Quick Agent Creation

For simple agents, use the helper function:

```typescript
import { createBasicAgentConfig } from "kwami";

const config = createBasicAgentConfig(
  "pNInz6obpgDQGcFmaJgB", // Voice ID
  "You are a helpful assistant",
  {
    name: "Quick Agent",
    firstMessage: "Hi there!",
    language: "en",
    llm: "gpt-4o-mini",
  }
);

const agent = await mind.createAgent(config);
```

### Agent Configuration Options

The builder supports extensive configuration:

```typescript
const config = new AgentConfigBuilder()
  // Basic settings
  .withName("Advanced Agent")
  .withTags(["support", "production"])

  // Voice & TTS
  .withVoice("voice_id", {
    model_id: "eleven_turbo_v2_5",
    stability: 0.5,
    speed: 1.0,
    similarity_boost: 0.75,
  })

  // LLM Configuration
  .withLLM("gpt-4o")
  .withPrompt("You are an expert assistant")
  .withTemperature(0.7)
  .withMaxTokens(1000)

  // ASR (Speech Recognition)
  .withASR({
    quality: "high",
    provider: "elevenlabs",
    keywords: ["support", "help"],
  })

  // Turn Management
  .withTurnConfig({
    turn_timeout: 10,
    turn_eagerness: "normal",
    soft_timeout_config: {
      timeout_seconds: 5,
      message: "Are you still there?",
    },
  })

  // Conversation Settings
  .withFirstMessage("Hello!")
  .withLanguage("en")
  .withMaxDuration(1800)
  .withTextOnly(false)
  .withClientEvents(["user_transcript", "agent_response"])

  .build();
```

### Managing Agents

```typescript
// Get agent
const agent = await mind.getAgent("agent-id");

// List agents with pagination
const agents = await mind.listAgents({
  page_size: 10,
  page_token: "token",
});

// Update agent
await mind.updateAgent("agent-id", {
  conversation_config: {
    agent: {
      first_message: "Updated greeting!",
    },
  },
});

// Delete agent
await mind.deleteAgent("agent-id");

// Duplicate agent
const newAgent = await mind.duplicateAgent("agent-id", {
  new_name: "Copy of Agent",
});

// Get agent link (for sharing)
const link = await mind.getAgentLink("agent-id");
console.log("Share link:", link.link_url);
```

### Agent Validation

Validate configuration before creating an agent:

```typescript
import { validateAgentConfig, formatValidationErrors } from "kwami";

const config = new AgentConfigBuilder()
  .withVoice("voice_id")
  .withTemperature(1.5) // Invalid! Should be 0-1
  .build();

const result = validateAgentConfig(config);

if (!result.valid) {
  console.error("Validation errors:");
  console.error(formatValidationErrors(result.errors));
} else {
  const agent = await mind.createAgent(config);
}
```

## Tools API (v1.4.1+)

Create custom tools that agents can call during conversations.

### Creating Tools

```typescript
const toolsAPI = mind.getToolsAPI();

// Create a tool with webhook
const tool = await toolsAPI.createTool({
  name: "get_weather",
  description: "Get current weather for a location",
  url: "https://your-api.com/weather",
  method: "POST",
  parameters: [
    {
      name: "location",
      type: "string",
      description: "City name or ZIP code",
      required: true,
    },
    {
      name: "units",
      type: "string",
      description: "Temperature units",
      enum: ["celsius", "fahrenheit"],
    },
  ],
});

console.log("Tool created:", tool.tool_id);
```

### Using Tools with Agents

```typescript
const config = new AgentConfigBuilder()
  .withName("Weather Assistant")
  .withVoice("voice_id")
  .withPrompt("You are a weather assistant. Use tools to help users.")
  .withTools([
    {
      name: "get_weather",
      description: "Get current weather",
      url: "https://your-api.com/weather",
      parameters: [
        {
          name: "location",
          type: "string",
          description: "Location to check",
          required: true,
        },
      ],
    },
    {
      name: "get_forecast",
      description: "Get weather forecast",
      url: "https://your-api.com/forecast",
      parameters: [
        {
          name: "location",
          type: "string",
          description: "Location",
          required: true,
        },
        {
          name: "days",
          type: "number",
          description: "Number of days",
        },
      ],
    },
  ])
  .build();

const agent = await mind.createAgent(config);
```

### Managing Tools

```typescript
const toolsAPI = mind.getToolsAPI();

// List all tools
const tools = await toolsAPI.listTools();
console.log("Available tools:", tools.tools);

// Get specific tool
const tool = await toolsAPI.getTool("tool_123");

// Update tool
await toolsAPI.updateTool("tool_123", {
  description: "Updated description",
  parameters: [
    /* updated parameters */
  ],
});

// Check which agents use this tool
const dependents = await toolsAPI.getDependentAgents("tool_123");
console.log("Used by agents:", dependents.agent_ids);

// Delete tool
await toolsAPI.deleteTool("tool_123");
```

### Tool Helper Functions

```typescript
import { createSimpleTool, createToolParameter } from "kwami";

// Quick tool creation
const tool = createSimpleTool(
  "send_email",
  "Send an email",
  "https://api.example.com/email",
  [
    createToolParameter("to", "string", "Recipient email", { required: true }),
    createToolParameter("subject", "string", "Email subject"),
    createToolParameter("body", "string", "Email content"),
  ]
);

await toolsAPI.createTool(tool);
```

## Knowledge Base API (v1.4.1+)

Manage knowledge bases for RAG (Retrieval Augmented Generation) with agents.

### Creating Knowledge Bases

```typescript
const kbAPI = mind.getKnowledgeBaseAPI();

// Create knowledge base
const kb = await kbAPI.createKnowledgeBase({
  name: "Product Documentation",
  description: "All product manuals and guides",
});

console.log("Knowledge base created:", kb.knowledge_base_id);
```

### Adding Documents

```typescript
// From URL (PDF, web page, etc.)
const doc1 = await kbAPI.createDocumentFromURL(kb.knowledge_base_id, {
  url: "https://docs.example.com/manual.pdf",
  name: "User Manual",
});

// From text
const doc2 = await kbAPI.createDocumentFromText(kb.knowledge_base_id, {
  text: "Product features include...",
  name: "Features Overview",
  metadata: { version: "1.0", category: "features" },
});

// From file upload
const fileInput = document.querySelector('input[type="file"]');
const file = fileInput.files[0];
const doc3 = await kbAPI.createDocumentFromFile(kb.knowledge_base_id, {
  file,
  name: "Technical Specs.pdf",
  metadata: { department: "engineering" },
});
```

### RAG Index Management

```typescript
// Compute RAG index for semantic search
const indexStatus = await kbAPI.computeRAGIndex(kb.knowledge_base_id);
console.log("Indexing status:", indexStatus.status);

// Check index status
const status = await kbAPI.getRAGIndex(kb.knowledge_base_id);
if (status.status === "ready") {
  console.log("Index ready with", status.indexed_chunks, "chunks");
}

// Get overview of all indexes
const overview = await kbAPI.getRAGIndexOverview();
overview.forEach((kb) => {
  console.log(`KB ${kb.knowledge_base_id}:`);
  console.log(`  Documents: ${kb.total_documents}`);
  console.log(`  Chunks: ${kb.total_chunks}`);
  console.log(`  Status: ${kb.status}`);
});
```

### Using Knowledge Base with Agents

```typescript
const config = new AgentConfigBuilder()
  .withName("Support Agent")
  .withVoice("voice_id")
  .withPrompt("You are a support agent. Use the knowledge base to answer questions.")
  .withKnowledgeBase([
    {
      knowledge_base_id: kb.knowledge_base_id,
      type: "document",
    },
  ])
  .build();

const agent = await mind.createAgent(config);
```

### Managing Documents

```typescript
// List documents
const docs = await kbAPI.listDocuments(kb.knowledge_base_id, {
  page_size: 20,
});

// Get document content
const content = await kbAPI.getDocumentContent(kb.knowledge_base_id, "doc_123");
console.log("Content:", content.content);

// Get specific chunk
const chunk = await kbAPI.getDocumentChunk(kb.knowledge_base_id, "doc_123", "chunk_456");

// Delete document
await kbAPI.deleteDocument(kb.knowledge_base_id, "doc_123");

// Delete entire knowledge base
await kbAPI.deleteKnowledgeBase(kb.knowledge_base_id);
```

### Knowledge Base Utilities

```typescript
// Get storage usage
const size = await kbAPI.getKnowledgeBaseSize(kb.knowledge_base_id);
console.log("KB size:", size.size_bytes, "bytes");

// Check which agents use this KB
const dependents = await kbAPI.getDependentAgents(kb.knowledge_base_id);
console.log("Used by agents:", dependents.agent_ids);
```

## Workflows (v1.4.1+)

Create multi-agent workflows with conditional routing.

### Creating a Workflow

```typescript
import type { AgentWorkflow } from "kwami";

const workflow: AgentWorkflow = {
  nodes: {
    start: {
      id: "start",
      type: "start",
      position: { x: 0, y: 0 },
    },
    main_agent: {
      id: "main_agent",
      type: "override_agent",
      position: { x: 100, y: 0 },
      label: "Main Assistant",
      additional_prompt: "You are the main assistant. Transfer to specialist if needed.",
    },
    specialist: {
      id: "specialist",
      type: "standalone_agent",
      position: { x: 200, y: 0 },
      agent_id: "agent_specialist_123",
      transfer_message: "Transferring you to a specialist...",
      enable_transferred_agent_first_message: true,
    },
    end: {
      id: "end",
      type: "end",
      position: { x: 300, y: 0 },
    },
  },
  edges: {
    edge1: {
      source: "start",
      target: "main_agent",
    },
    edge2: {
      source: "main_agent",
      target: "specialist",
      condition: "needs_specialist",
    },
    edge3: {
      source: "specialist",
      target: "end",
    },
  },
};

const config = new AgentConfigBuilder()
  .withName("Support System")
  .withVoice("voice_id")
  .withWorkflow(workflow)
  .build();

const agent = await mind.createAgent(config);
```

### Workflow Node Types

- **Start Node**: Entry point for the workflow
- **End Node**: Exit point for the workflow
- **Override Agent Node**: Inline agent with custom configuration
- **Standalone Agent Node**: Reference to existing agent
- **Tool Node**: Execute tool calls
- **Phone Number Node**: Telephony integration

### Workflow with Tools

```typescript
const workflow: AgentWorkflow = {
  nodes: {
    start: { id: "start", type: "start", position: { x: 0, y: 0 } },
    agent: {
      id: "agent",
      type: "override_agent",
      position: { x: 100, y: 0 },
      additional_prompt: "Use tools to help users",
    },
    tools: {
      id: "tools",
      type: "tool",
      position: { x: 200, y: 0 },
      tools: [{ tool_id: "tool_123" }, { tool_id: "tool_456" }],
    },
    end: { id: "end", type: "end", position: { x: 300, y: 0 } },
  },
  edges: {
    e1: { source: "start", target: "agent" },
    e2: { source: "agent", target: "tools" },
    e3: { source: "tools", target: "end" },
  },
};
```

## Provider Switching

Switch between providers at runtime:

```typescript
// Use ElevenLabs
await mind.setProvider("elevenlabs");

// Use OpenAI
await mind.setProvider("openai");

// Provider is automatically initialized
```

## State Management

Track Mind state:

```typescript
// Get current state
const state = mind.getState();
// Returns: 'idle' | 'speaking' | 'listening' | 'thinking'

// State updates affect body animations
mind.on("stateChange", (state) => {
  kwami.setState(state);
});
```

## Error Handling

```typescript
try {
  await mind.speak("Hello!");
} catch (error) {
  if (error.message.includes("API key")) {
    console.error("Invalid API key");
  } else if (error.message.includes("rate limit")) {
    console.error("Rate limit exceeded");
  } else {
    console.error("TTS error:", error);
  }
}
```

## Advanced Features

### Streaming Audio

For low-latency playback:

```typescript
// Stream audio as it's generated
await mind.speak("Long text...", {
  streaming: true,
  onChunk: (audioChunk) => {
    // Process audio chunk
  },
});
```

### Voice Presets

Quick voice configuration presets:

```typescript
// Natural (balanced)
mind.applyVoicePreset("natural");

// Expressive (more variation)
mind.applyVoicePreset("expressive");

// Stable (consistent)
mind.applyVoicePreset("stable");

// Clear (optimized clarity)
mind.applyVoicePreset("clear");
```

Preset values:

| Preset     | Stability | Similarity | Style | Speaker Boost |
| ---------- | --------- | ---------- | ----- | ------------- |
| Natural    | 0.5       | 0.75       | 0.0   | true          |
| Expressive | 0.3       | 0.6        | 0.4   | true          |
| Stable     | 0.7       | 0.8        | 0.0   | true          |
| Clear      | 0.6       | 0.85       | 0.0   | true          |

### Configuration Import/Export

```typescript
// Export configuration
const config = mind.exportConfig();

// Import configuration
mind.importConfig(config);

// Save to localStorage
localStorage.setItem("mindConfig", JSON.stringify(config));
```

## Integration with Soul

Combine Mind with Soul for personality-aware AI:

```typescript
// Load personality
kwami.soul.loadPresetPersonality("friendly");

// Get system prompt
const systemPrompt = kwami.soul.getSystemPrompt();

// Use in conversation
await mind.startConversation({
  systemPrompt,
  onAIResponse: (text) => {
    console.log("Friendly AI said:", text);
  },
});
```

## Usage Tracking

Monitor API usage (ElevenLabs):

```typescript
// Get usage statistics
const usage = await mind.getUsage();

console.log("Characters used:", usage.character_count);
console.log("Characters limit:", usage.character_limit);
console.log("Reset date:", usage.next_character_reset_date);
```

## Cleanup

```typescript
// Dispose when done
mind.dispose();

// Cleans up:
// - WebSocket connections
// - Audio streams
// - Event listeners
// - Provider resources
```

## Provider Comparison

### ElevenLabs vs OpenAI

| Feature           | ElevenLabs      | OpenAI                |
| ----------------- | --------------- | --------------------- |
| Voice Library     | 5,000+ voices   | 6 voices              |
| Languages         | 29+ languages   | English focus         |
| Voice Cloning     | ✅ Yes          | ❌ No                 |
| Fine-tuning       | ✅ Extensive    | 🟡 Limited            |
| Latency (TTS)     | ~300ms (turbo)  | ~500ms                |
| Conversational AI | ✅ Full support | 🟡 Realtime API (WIP) |
| Pricing           | Per character   | Per character         |
| Custom Models     | ✅ Yes          | ❌ No                 |
| Emotional Range   | ✅ Excellent    | 🟡 Good               |

### When to Use Each

**Use ElevenLabs when:**

- You need ultra-realistic voices
- Voice cloning is required
- Multilingual support is important
- Conversational AI is needed
- Fine control over voice characteristics

**Use OpenAI when:**

- You prefer OpenAI's ecosystem
- Simple TTS is sufficient
- You're using other OpenAI services
- Budget constraints (check pricing)

## Future Providers

### Coming Soon

- **Vapi** - Full-stack phone/web agents
- **Retell AI** - Call center automation
- **Bland AI** - Phone-first agents
- **Synthflow** - No-code + API hybrid
- **Deepgram** - Ultra-low latency STT
- **Cartesia** - Sonic models (40-100ms)
- **PlayHT** - 800+ voices, multilingual

See [Mind Architecture](../architecture/mind-arch.md#voice-provider-landscape) for details.

## Complete Examples

For comprehensive examples covering all features, see:

- **[Mind Examples](../mind-examples.md)** - Complete usage examples
  - Basic and advanced agent creation
  - Tools API with webhooks
  - Knowledge Base with RAG
  - Multi-agent workflows
  - Complete customer support agent example
- **[Test Suite](../mind-examples.md)** - Automated API testing examples

## See Also

- **[Mind Architecture](../architecture/mind-arch.md)** - Provider architecture deep dive
- **[Provider Integration Guide](../guides/providers.md)** - Adding custom providers
- **[Soul Component](./soul.md)** - Personality integration
- **[API Reference](../api/mind.md)** - Complete API docs

---

**Version 1.5.6+** - The Mind component now provides complete agent management, tools, knowledge base, and workflow capabilities alongside flexible provider support for voice AI interactions.
