# Kwami Mind Architecture

> **Provider-based voice intelligence for multi-vendor AI voice systems**

## Table of Contents

- [Overview](#overview)
- [Architecture Principles](#architecture-principles)
- [Directory Structure](#directory-structure)
- [Core Components](#core-components)
- [Runtime Flow](#runtime-flow)
- [Provider Interface](#provider-interface)
- [Adding a New Provider](#adding-a-new-provider)
- [Configuration Management](#configuration-management)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)
- [Voice Provider Landscape](#voice-provider-landscape)

---

## Overview

Kwami's Mind layer orchestrates AI voice capabilities through a **provider-based architecture**. Each provider encapsulates all vendor-specific logic (API clients, transport protocols, feature implementations), while `Mind.ts` remains provider-agnostic and focused on orchestration.

### Current Status (v1.4.1)

| Provider   | Status      | Capabilities                                                                          |
| ---------- | ----------- | ------------------------------------------------------------------------------------- |
| ElevenLabs | ✅ Complete | TTS, ConvAI WebSocket, Agents API, Tools API, Knowledge Base API, Workflows, RAG     |
| OpenAI     | 🚧 WIP      | TTS via `/v1/audio/speech` (Realtime API pending)                                     |
| Vapi       | 📋 Planned  | Full-stack phone/web agents                                                           |
| Retell AI  | 📋 Planned  | Call center automation                                                                |
| Deepgram   | 📋 Planned  | Ultra-low latency STT + agent framework                                               |
| Cartesia   | 📋 Planned  | Low-latency streaming TTS                                                             |
| PlayHT     | 📋 Planned  | Multilingual conversational AI                                                        |

---

## Architecture Principles

### 1. **Separation of Concerns**

- **Mind.ts**: Provider-agnostic orchestration, configuration, preprocessing (pronunciations, system prompts)
- **Providers**: Vendor-specific implementations, SDK clients, WebSocket/WebRTC handling, cleanup

### 2. **Contract-Based Design**

All providers implement the `MindProvider` interface, ensuring consistent behavior regardless of vendor.

### 3. **Runtime Flexibility**

Switch providers dynamically via `mind.setProvider('openai')` without restarting the application.

### 4. **Zero-Overhead Abstraction**

Provider methods are simple pass-through delegates—no complex middleware or unnecessary layers.

### 5. **Fail-Safe Design**

Unimplemented features log informative errors rather than crashing, allowing graceful degradation.

---

## Directory Structure (v1.4.1)

```
kwami/src/core/mind/
├─ Mind.ts                      # Main orchestrator class
├─ AgentConfigBuilder.ts        # Fluent API for agent configuration
├─ validation.ts                # Configuration validation utilities
├─ index.ts                     # Module exports
├─ README.md                    # Implementation guide
├─ apis/
│  ├─ ToolsAPI.ts              # Tools management (create, update, delete tools)
│  └─ KnowledgeBaseAPI.ts      # Knowledge Base & RAG (documents, indexing)
├─ providers/
│  ├─ factory.ts               # Provider instantiation & registry
│  ├─ types.ts                 # Shared interfaces & contracts
│  ├─ elevenlabs/
│  │  └─ ElevenLabsProvider.ts # ElevenLabs implementation
│  └─ openai/
│     └─ OpenAIProvider.ts     # OpenAI implementation
└─ examples/
   ├─ README.md                # Comprehensive usage examples
   └─ test-agent-apis.ts       # Complete API test suite
```

### File Responsibilities

| File                       | Purpose                                                                           |
| -------------------------- | --------------------------------------------------------------------------------- |
| `Mind.ts`                  | Public API, config management, pronunciation dictionary, delegation               |
| `AgentConfigBuilder.ts`    | Fluent builder for creating agent configurations with validation                  |
| `validation.ts`            | Validation functions for agent configs, TTS, ASR, turn settings, tools, workflows |
| `apis/ToolsAPI.ts`         | Tools management: CRUD operations, webhooks, parameter schemas                    |
| `apis/KnowledgeBaseAPI.ts` | Knowledge Base: documents, RAG indexing, semantic search                          |
| `providers/types.ts`       | `MindProvider` interface, callback types, shared contracts                        |
| `providers/factory.ts`     | Maps `MindProviderType` string to concrete provider instances                     |
| `providers/*/Provider.ts`  | Full vendor implementation: API clients, WebSocket/WebRTC, agent APIs             |
| `examples/README.md`       | Complete usage examples for all features                                          |
| `examples/test-agent-apis.ts` | Automated test suite for all API endpoints                                     |

---

## Core Components

### 1. KwamiMind (Mind.ts)

The main orchestrator class that consumers interact with.

**Key responsibilities:**

- Store `MindConfig` and pronunciation dictionary
- Instantiate and manage the active provider
- Preprocess text (apply pronunciations)
- Delegate all voice operations to the provider
- Handle provider switching at runtime

**Example usage:**

```typescript
import { KwamiMind } from "./core/mind/Mind";
import { KwamiAudio } from "./core/body/Audio";

const audio = new KwamiAudio();
const mind = new KwamiMind(audio, {
  provider: "elevenlabs",
  apiKey: "YOUR_API_KEY",
  voice: {
    voiceId: "rachel",
    model: "eleven_turbo_v2_5",
  },
});

await mind.initialize();
await mind.speak("Hello, world!");
```

### 2. MindProvider Interface (providers/types.ts)

The contract that all providers must implement. It defines ~30 methods covering:

- **TTS**: `speak()`, `generateSpeechBlob()`, `getAvailableVoices()`
- **STT**: `listen()`, `stopListening()`, `testMicrophone()`
- **Conversations**: `startConversation()`, `stopConversation()`, `sendConversationMessage()`
- **Agents**: `createAgent()`, `updateAgent()`, `deleteAgent()`, `listAgents()`, `duplicateAgent()`
- **Analytics**: `simulateConversation()`, `calculateLLMUsage()`, `listConversations()`
- **Lifecycle**: `initialize()`, `dispose()`, `updateConfig()`

### 3. AgentConfigBuilder (v1.4.1)

Fluent API for building agent configurations with built-in validation:

```typescript
const config = new AgentConfigBuilder()
  .withName("Support Agent")
  .withVoice("voice_id")
  .withLLM("gpt-4o")
  .withPrompt("You are helpful")
  .withTools([{ name: "tool", url: "https://api.example.com" }])
  .withKnowledgeBase([{ knowledge_base_id: "kb_123" }])
  .build(); // Validates before returning
```

### 4. Tools API (v1.4.1)

Dedicated API for managing tools that agents can call:

```typescript
const toolsAPI = mind.getToolsAPI();

// Create tool with webhook
const tool = await toolsAPI.createTool({
  name: "get_weather",
  description: "Get weather",
  url: "https://api.weather.com",
  parameters: [{ name: "location", type: "string", required: true }],
});

// CRUD operations
await toolsAPI.getTool(toolId);
await toolsAPI.listTools();
await toolsAPI.updateTool(toolId, { description: "Updated" });
await toolsAPI.deleteTool(toolId);
await toolsAPI.getDependentAgents(toolId);
```

### 5. Knowledge Base API (v1.4.1)

API for RAG (Retrieval Augmented Generation) with document management:

```typescript
const kbAPI = mind.getKnowledgeBaseAPI();

// Create KB and add documents
const kb = await kbAPI.createKnowledgeBase({ name: "Docs" });
await kbAPI.createDocumentFromURL(kb.knowledge_base_id, {
  url: "https://docs.example.com/manual.pdf",
});
await kbAPI.createDocumentFromText(kb.knowledge_base_id, {
  text: "Product info...",
});

// RAG indexing for semantic search
await kbAPI.computeRAGIndex(kb.knowledge_base_id);
const status = await kbAPI.getRAGIndex(kb.knowledge_base_id);
```

### 6. Validation System (v1.4.1)

Comprehensive validation for all configuration aspects:

```typescript
import { validateAgentConfig, formatValidationErrors } from "kwami";

const result = validateAgentConfig(config);
if (!result.valid) {
  console.error(formatValidationErrors(result.errors));
}
```

**Core interface structure:**

```typescript
export interface MindProvider {
  readonly type: MindProviderType;

  // Lifecycle
  initialize(): Promise<void>;
  isReady(): boolean;
  dispose(): void;
  updateConfig(config: MindConfig): void;

  // TTS
  speak(text: string, options?: MindProviderSpeakOptions): Promise<void>;
  generateSpeechBlob(text: string): Promise<Blob>;
  getAvailableVoices(): Promise<any[]>;

  // Conversations
  startConversation(
    systemPrompt?: string,
    callbacks?: MindConversationCallbacks
  ): Promise<void>;
  stopConversation(): Promise<void>;
  isConversationActive(): boolean;

  // ... ~20 more methods for agents, analytics, etc.
}
```

### 7. Provider Factory (providers/factory.ts)

Translates `MindProviderType` strings into concrete provider instances.

```typescript
export function createMindProvider(
  type: MindProviderType | undefined,
  dependencies: MindProviderDependencies,
  config: MindConfig
): MindProvider {
  switch (type ?? "elevenlabs") {
    case "elevenlabs":
      return new ElevenLabsProvider(dependencies, config);
    case "openai":
      return new OpenAIProvider(dependencies, config);
    default:
      throw new Error(`Mind provider "${type}" is not implemented yet.`);
  }
}
```

---

## Runtime Flow

```
┌──────────────────────────────────────────────────────────┐
│                     Application Layer                    │
│            (React, Vue, vanilla JS, etc.)                │
└────────────────────┬─────────────────────────────────────┘
                     │
                     │ new KwamiMind(audio, config)
                     ▼
┌──────────────────────────────────────────────────────────┐
│                      KwamiMind                           │
│  ┌────────────────────────────────────────────────────┐  │
│  │ • Pronunciation Dictionary                         │  │
│  │ • MindConfig (voice, STT, conversational, etc.)    │  │
│  │ • Public API (speak, startConversation, etc.)      │  │
│  └────────────────────┬───────────────────────────────┘  │
│                       │                                  │
│                       │ delegates to                     │
│                       ▼                                  │
│  ┌────────────────────────────────────────────────────┐  │
│  │            Active MindProvider                     │  │
│  │  (ElevenLabsProvider, OpenAIProvider, etc.)        │  │
│  └────────────────────┬───────────────────────────────┘  │
└───────────────────────┼──────────────────────────────────┘
                        │
                        │ vendor SDK calls
                        ▼
      ┌─────────────────────────────────────────┐
      │   External Voice Service APIs           │
      │  (ElevenLabs, OpenAI, Vapi, etc.)       │
      └─────────────────────────────────────────┘
```

### Step-by-Step Flow

1. **Construction**: `new KwamiMind(audio, config)`

   - Parses `config.provider` (defaults to `'elevenlabs'`)
   - Calls `createMindProvider()` to instantiate the provider
   - Stores references to `audio`, `config`, and `provider`

2. **Initialization**: `await mind.initialize()`

   - Delegates to `provider.initialize()`
   - Provider sets up API clients, validates credentials, loads voices

3. **Operation**: `await mind.speak('Hello')`

   - Mind applies pronunciations: `applyPronunciations(text)`
   - Delegates to `provider.speak(processedText, options)`
   - Provider handles vendor-specific API calls, streaming, playback

4. **Configuration Updates**: `mind.setVoiceId('rachel')`

   - Updates `mind.config`
   - Calls `provider.updateConfig(config)` to sync changes

5. **Provider Switching**: `mind.setProvider('openai')`

   - Calls `provider.dispose()` on old provider
   - Instantiates new provider via `createMindProvider()`
   - New provider inherits current `config`

6. **Cleanup**: `mind.dispose()`
   - Calls `provider.dispose()`
   - Stops listening, clears dictionaries

---

## Provider Interface

### Required Methods

Every `MindProvider` implementation must handle these core capabilities:

#### Lifecycle Management

```typescript
initialize(): Promise<void>
isReady(): boolean
dispose(): void
updateConfig(config: MindConfig): void
```

#### Text-to-Speech

```typescript
speak(text: string, options?: MindProviderSpeakOptions): Promise<void>
generateSpeechBlob(text: string): Promise<Blob>
getAvailableVoices(): Promise<any[]>
previewVoice(text?: string): Promise<void>
```

#### Speech-to-Text & Microphone

```typescript
listen(): Promise<MediaStream>
stopListening(): void
testMicrophone(): Promise<boolean>
```

#### Conversational AI

```typescript
startConversation(systemPrompt?: string, callbacks?: MindConversationCallbacks): Promise<void>
stopConversation(): Promise<void>
isConversationActive(): boolean
sendConversationMessage(text: string): void
```

#### Agent Management

```typescript
createAgent(config: CreateAgentRequest): Promise<AgentResponse>
getAgent(agentId: string): Promise<AgentResponse>
listAgents(options?: ListAgentsOptions): Promise<ListAgentsResponse>
updateAgent(agentId: string, config: UpdateAgentRequest): Promise<AgentResponse>
deleteAgent(agentId: string): Promise<void>
duplicateAgent(agentId: string, options?: DuplicateAgentRequest): Promise<AgentResponse>
getAgentLink(agentId: string): Promise<AgentLinkResponse>
```

#### Analytics & Conversation History

```typescript
listConversations(options?: ListConversationsOptions): Promise<ListConversationsResponse>
getConversation(conversationId: string): Promise<ConversationResponse>
deleteConversation(conversationId: string): Promise<void>
getConversationAudio(conversationId: string): Promise<Blob>
sendConversationFeedback(conversationId: string, feedback: ConversationFeedbackRequest): Promise<void>
simulateConversation(agentId: string, request: SimulateConversationRequest): Promise<SimulateConversationResponse>
calculateLLMUsage(agentId: string, request?: LLMUsageRequest): Promise<LLMUsageResponse>
```

### Callbacks & Events

Providers should invoke these callbacks during conversations:

```typescript
export interface MindConversationCallbacks {
  onAgentResponse?: (text: string) => void;
  onUserTranscript?: (text: string) => void;
  onError?: (error: Error) => void;
  onTurnStart?: () => void;
  onTurnEnd?: () => void;
}
```

---

## Adding a New Provider

### Step-by-Step Guide

#### 1. Create Provider Directory

```bash
mkdir -p kwami/src/core/mind/providers/vapi
touch kwami/src/core/mind/providers/vapi/VapiProvider.ts
```

#### 2. Implement MindProvider Interface

```typescript
import type {
  MindProvider,
  MindProviderDependencies,
  MindConversationCallbacks,
} from "../types";
import type { MindConfig } from "../../../types";

export class VapiProvider implements MindProvider {
  readonly type = "vapi" as const;

  private audio: KwamiAudio;
  private config: MindConfig;
  private vapiClient?: VapiSDK;

  constructor(deps: MindProviderDependencies, config: MindConfig) {
    this.audio = deps.audio;
    this.config = config;
  }

  async initialize(): Promise<void> {
    // Initialize Vapi SDK client
    this.vapiClient = new VapiSDK(this.config.apiKey);
  }

  isReady(): boolean {
    return !!this.vapiClient;
  }

  async speak(text: string, options?: MindProviderSpeakOptions): Promise<void> {
    // Implement TTS via Vapi
  }

  // ... implement remaining 25+ methods

  dispose(): void {
    // Clean up WebSockets, stop streams, etc.
    this.vapiClient?.disconnect();
  }

  updateConfig(config: MindConfig): void {
    this.config = config;
    // Update SDK client settings if needed
  }
}
```

#### 3. Register in Factory

```typescript
// providers/factory.ts
import { VapiProvider } from "./vapi/VapiProvider";

export function createMindProvider(
  type: MindProviderType | undefined,
  dependencies: MindProviderDependencies,
  config: MindConfig
): MindProvider {
  switch (type ?? "elevenlabs") {
    case "elevenlabs":
      return new ElevenLabsProvider(dependencies, config);
    case "openai":
      return new OpenAIProvider(dependencies, config);
    case "vapi":
      return new VapiProvider(dependencies, config);
    default:
      throw new Error(`Mind provider "${type}" is not implemented yet.`);
  }
}
```

#### 4. Update Type Definitions

```typescript
// types/index.ts
export type MindProviderType =
  | "elevenlabs"
  | "openai"
  | "vapi"
  | "retell"
  | "bland"
  | "deepgram";
```

#### 5. Test Provider Switching

```typescript
const mind = new KwamiMind(audio, { provider: "elevenlabs" });
await mind.initialize();
await mind.speak("Testing ElevenLabs");

// Switch at runtime
mind.setProvider("vapi");
await mind.speak("Now testing Vapi");
```

### Provider Implementation Checklist

- [ ] Implement all `MindProvider` interface methods
- [ ] Handle `initialize()` and `dispose()` properly (no memory leaks)
- [ ] Support `updateConfig()` for runtime config changes
- [ ] Log informative errors for unimplemented features
- [ ] Map `MindConfig` fields to vendor-specific options
- [ ] Handle WebSocket/WebRTC lifecycle correctly
- [ ] Invoke callbacks (`onAgentResponse`, `onUserTranscript`, etc.)
- [ ] Write unit tests for critical paths
- [ ] Document provider-specific config requirements
- [ ] Add to factory and type definitions

---

## Configuration Management

### MindConfig Structure

```typescript
interface MindConfig {
  provider?: MindProviderType;
  apiKey?: string;
  language?: string;

  voice?: {
    voiceId?: string;
    model?: string;
    settings?: VoiceSettings;
  };

  advancedTTS?: {
    outputFormat?: TTSOutputFormat;
    optimizeStreamingLatency?: boolean;
    nextTextTimeout?: number;
  };

  conversational?: {
    agentId?: string;
    firstMessage?: string;
    customLLMPrompt?: string;
  };

  stt?: {
    model?: STTModel;
    automaticPunctuation?: boolean;
    speakerDiarization?: boolean;
  };

  pronunciation?: {
    dictionary?: Record<string, string> | Map<string, string>;
  };
}
```

### Runtime Configuration Updates

```typescript
// Update voice settings
mind.setVoiceSettings({
  stability: 0.5,
  similarity_boost: 0.75,
});

// Apply preset
mind.applyVoicePreset("expressive"); // 'natural', 'expressive', 'stable', 'clear'

// Update full config
mind.updateConfig({
  voice: { voiceId: "rachel" },
  conversational: { agentId: "agent_123" },
});

// Export/import config
const savedConfig = mind.exportConfig();
localStorage.setItem("mindConfig", JSON.stringify(savedConfig));

const restoredConfig = JSON.parse(localStorage.getItem("mindConfig"));
mind.importConfig(restoredConfig);
```

### Pronunciation Dictionary

```typescript
// Add custom pronunciations
mind.addPronunciation("Kwami", "Kwah-mee");
mind.addPronunciation("API", "A.P.I.");

// Pronunciations are automatically applied before TTS
await mind.speak("Kwami API is ready"); // "Kwah-mee A.P.I. is ready"

// Manage pronunciations
mind.removePronunciation("API");
const all = mind.getAllPronunciations(); // { kwami: 'Kwah-mee' }
mind.clearPronunciations();
```

---

## Best Practices

### 1. Provider Isolation

✅ **DO**: Keep all vendor-specific code inside provider implementations  
❌ **DON'T**: Add vendor-specific logic to `Mind.ts`

### 2. Graceful Degradation

✅ **DO**: Log informative errors for unimplemented features  
❌ **DON'T**: Throw errors that crash the app

```typescript
async createAgent(config: CreateAgentRequest): Promise<AgentResponse> {
  console.error(`[${this.type}] Agent creation not yet implemented`);
  throw new Error('Agent creation not supported by this provider');
}
```

### 3. Resource Cleanup

✅ **DO**: Clean up WebSockets, streams, and event listeners in `dispose()`  
❌ **DON'T**: Leave connections open or memory leaks

```typescript
dispose(): void {
  this.websocket?.close();
  this.audioStream?.getTracks().forEach(track => track.stop());
  this.eventEmitter?.removeAllListeners();
}
```

### 4. Config Validation

✅ **DO**: Validate required config fields in `initialize()`  
❌ **DON'T**: Fail silently on missing credentials

```typescript
async initialize(): Promise<void> {
  if (!this.config.apiKey) {
    throw new Error('API key required for VapiProvider');
  }
  // ...
}
```

### 5. Callback Invocation

✅ **DO**: Invoke callbacks consistently across providers  
❌ **DON'T**: Skip callbacks or add provider-specific events

```typescript
private handleAgentMessage(text: string) {
  this.callbacks?.onAgentResponse?.(text);
}
```

### 6. Testing Provider Switching

Always test that providers can be switched at runtime without memory leaks:

```typescript
// Test suite
it("should switch providers without memory leaks", async () => {
  const mind = new KwamiMind(audio, { provider: "elevenlabs" });
  await mind.initialize();

  mind.setProvider("openai");
  await mind.initialize();

  mind.dispose();
  // Verify no WebSockets or streams are still open
});
```

---

## Troubleshooting

### Common Issues

#### Provider Not Found

```
Error: Mind provider "vapi" is not implemented yet.
```

**Solution**: Add the provider to `factory.ts` and implement `MindProvider` interface.

#### API Key Missing

```
Error: API key required for ElevenLabsProvider
```

**Solution**: Provide `apiKey` in `MindConfig`:

```typescript
const mind = new KwamiMind(audio, {
  provider: "elevenlabs",
  apiKey: "YOUR_API_KEY",
});
```

#### WebSocket Connection Failed

```
Error: Failed to connect to ElevenLabs ConvAI WebSocket
```

**Solutions**:

1. Check network connectivity
2. Verify API key permissions
3. Check browser console for CORS issues
4. Ensure WebSocket URL is correct

#### Conversation Not Starting

```
Error: Microphone permission denied
```

**Solutions**:

1. Grant microphone permissions in browser
2. Use HTTPS (required for microphone access)
3. Check `navigator.mediaDevices.getUserMedia` support

#### Provider Not Disposing Properly

**Symptoms**: Memory leaks, multiple WebSocket connections

**Solution**: Ensure `dispose()` is called and all resources are cleaned up:

```typescript
dispose(): void {
  // Close connections
  this.websocket?.close();

  // Stop media streams
  this.audioStream?.getTracks().forEach(track => track.stop());

  // Remove event listeners
  this.eventEmitter?.removeAllListeners();

  // Clear references
  this.websocket = undefined;
  this.audioStream = undefined;
}
```

### Debug Mode

Enable debug logging for providers:

```typescript
const mind = new KwamiMind(audio, {
  provider: "elevenlabs",
  debug: true, // Provider-specific logging
});
```

---

## Voice Provider Landscape

The table below summarizes popular realtime voice providers to help evaluate integration priorities. Latency and pricing are approximate, environment-dependent figures for early planning only—always verify current prices, SLAs, and feature availability.

### Comprehensive Provider Comparison

| Provider                     | Key Strengths                                                                                        | Latency & Realism                       | API Maturity & Features                                                               | Best For                                                   | Pricing Model (approx.)               | Kwami Status |
| ---------------------------- | ---------------------------------------------------------------------------------------------------- | --------------------------------------- | ------------------------------------------------------------------------------------- | ---------------------------------------------------------- | ------------------------------------- | ------------ |
| ElevenLabs Conversational AI | Largest voice library (5,000+), multilingual auto‑detection, RAG/tool calling, telephony integration | Sub‑500ms end‑to‑end, highly expressive | Full WebSocket API, SDKs (Python/JS/Swift), knowledge base upload, custom LLM support | Ultra‑realistic branded voices, creative/enterprise agents | Per‑minute + subscription tiers       | ✅ Complete  |
| OpenAI Realtime API          | Integrated speech‑to‑speech (no separate STT/TTS), strong emotional understanding, function calling  | ~200–400ms, very natural turn‑taking    | Simple WebSocket API, built‑in voice activity detection                               | Fast prototyping, emotional nuance                         | ~$100/1M input tokens (~$0.06/min in) | 🚧 WIP       |
| Retell AI                    | Full‑stack phone/web agents, interruption handling, tool calling, monitoring dashboard               | Sub‑500ms, human‑like                   | Robust API + SDKs, easy telephony (Twilio‑like)                                       | Call center automation, sales/support bots                 | Per‑minute (~$0.20–0.40/min)          | 📋 Planned   |
| Vapi                         | Bring‑your‑own‑model (OpenAI + any TTS/STT), fast deployment, analytics                              | <500ms (depends on models)              | Developer‑first API, supports 20+ TTS providers                                       | Custom stacks, rapid iteration                             | Per‑minute + base fee                 | 📋 Planned   |
| Bland AI                     | Phone‑first agents, natural interruptions, personality customization                                 | Sub‑second                              | Simple API for inbound/outbound calls                                                 | Outbound sales/cold calling                                | Per‑minute (~$0.15–0.30/min)          | 📋 Planned   |
| Synthflow                    | No‑code + API hybrid, integrates ElevenLabs/OpenAI voices, drag‑and‑drop flows                       | ~500ms                                  | API + visual builder, telephony built‑in                                              | Non‑developers building production agents                  | Per‑minute + plans                    | 📋 Planned   |
| Deepgram Voice Agent         | Ultra‑low latency STT + agent framework, strong in noisy environments                                | <300ms STT                              | API‑focused, pairs well with any LLM/TTS                                              | High‑accuracy transcription in real‑world audio            | Usage‑based                           | 📋 Planned   |
| Cartesia                     | Sonic models optimized for speed/expressiveness, real‑time streaming                                 | 40–100ms model latency                  | Clean API, great for custom low‑latency agents                                        | Ultra‑fast interactive experiences                         | Token/minute                          | 📋 Planned   |
| PlayHT Conversational        | 800+ voices, strong multilingual, low‑latency streaming mode                                         | Sub‑500ms                               | API + agent builder, good emotional range                                             | Multilingual customer support                              | Per‑character + plans                 | 📋 Planned   |

### Specialized & Enterprise Options

| Provider                   | Key Differentiators                                                                              | Ideal Use Cases                                              |
| -------------------------- | ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------ |
| **Telnyx**                 | Full infrastructure control (own media servers), carrier-grade reliability, WebRTC + SIP support | Regulated industries, enterprise deployments, telecom stacks |
| **Resemble AI**            | Speech-to-speech real-time conversion, on-premises deployment options, voice cloning             | Compliance-heavy use cases, private cloud, gaming/media      |
| **Hume AI**                | Leading emotional/prosodic intelligence, voice tone detection/adaptation, empathic AI models     | Mental health, customer service, emotional support bots      |
| **AssemblyAI**             | Advanced STT with sentiment analysis, entity detection, topic modeling, PII redaction            | Transcription services, compliance, content moderation       |
| **Azure Speech**           | Enterprise-grade infrastructure, multi-region deployment, neural voices, custom voice fonts      | Microsoft stack integration, global deployments              |
| **Google Cloud TTS/STT**   | WaveNet voices, multilingual (100+ languages), strong text normalization                         | Google Cloud ecosystem, international markets                |
| **AWS Polly + Transcribe** | AWS integration, neural voices, real-time streaming, SSML support                                | AWS infrastructure, serverless architectures                 |

### Integration Priority Matrix

When deciding which providers to implement next, consider:

```
           High User Demand
                 ↑
    Vapi    Retell     OpenAI
      ◆       ◆          ◆

    Deepgram  Bland
      ◆         ◆
Low             |              High
Complexity ←----+---→ Complexity
      ◆         |        ◆
   PlayHT    Hume   Cartesia
      ◆         ◆        ◆
                 ↓
           Low User Demand
```

**Recommended implementation order:**

1. ✅ **ElevenLabs** (Complete) - Best voice quality, comprehensive features
2. 🚧 **OpenAI** (In Progress) - High demand, simple API, emotional intelligence
3. 📋 **Vapi** (Next) - Developer favorite, flexible architecture, BYO models
4. 📋 **Retell AI** - Enterprise ready, telephony focus, monitoring tools
5. 📋 **Deepgram** - Ultra-low latency, strong STT capabilities
6. 📋 **Cartesia** - Speed-focused use cases
7. 📋 **Others** - Based on user requests and market trends

### Provider Selection Guide

Choose a provider based on your requirements:

| Use Case                         | Recommended Provider(s)             | Why                                                   |
| -------------------------------- | ----------------------------------- | ----------------------------------------------------- |
| **Ultra-realistic voices**       | ElevenLabs, PlayHT                  | Largest voice libraries, highest quality synthesis    |
| **Lowest latency**               | Cartesia, OpenAI Realtime, Deepgram | Sub-200ms response times, optimized streaming         |
| **Phone/call center automation** | Retell AI, Bland AI, Vapi           | Built-in telephony, interruption handling, monitoring |
| **Custom voice stacks**          | Vapi                                | Bring your own STT/TTS/LLM, mix and match             |
| **Emotional intelligence**       | OpenAI Realtime, Hume AI            | Tone detection, empathic responses                    |
| **Enterprise/compliance**        | Telnyx, Resemble AI, Azure Speech   | On-prem options, carrier-grade reliability            |
| **Multilingual support**         | ElevenLabs, PlayHT, Google Cloud    | 100+ languages, auto-detection                        |
| **No-code + API hybrid**         | Synthflow                           | Visual builder + API, non-developer friendly          |
| **Budget-conscious prototyping** | OpenAI Realtime, Vapi               | Pay-per-use, no subscription minimums                 |

### Future-Proofing Considerations

As the voice AI landscape evolves rapidly, prioritize providers that offer:

✅ **WebSocket/WebRTC support** - Real-time bidirectional communication  
✅ **Function/tool calling** - Integrate with external systems  
✅ **Custom LLM support** - Flexibility to swap AI models  
✅ **Analytics & monitoring** - Production-ready observability  
✅ **Enterprise SLAs** - Uptime guarantees, support contracts  
✅ **Transparent pricing** - Predictable costs at scale

### Contributing Provider Integrations

Interested in adding a provider? See the [Adding a New Provider](#adding-a-new-provider) section above, or open an issue/PR on GitHub to discuss implementation priorities.

---

## v1.4.1 Features Deep Dive

### AgentConfigBuilder Design

The fluent API builder follows these principles:

1. **Type Safety**: All methods are fully typed with TypeScript
2. **Validation on Build**: Configuration is validated before returning
3. **Immutability**: Each method returns `this` for chaining
4. **Fail-Fast**: Invalid configurations throw descriptive errors immediately

**Implementation highlights:**

```typescript
class AgentConfigBuilder {
  private config: CreateAgentRequestFull;

  withVoice(voiceId: string, settings?: Partial<TTSConversationalConfig>): this {
    if (!this.config.conversation_config!.tts) {
      this.config.conversation_config!.tts = { voice_id: voiceId };
    }
    if (settings) {
      this.config.conversation_config!.tts = {
        ...this.config.conversation_config!.tts,
        ...settings,
      };
    }
    return this;
  }

  build(): CreateAgentRequestFull {
    this.validate(); // Throws if invalid
    return this.config;
  }
}
```

### Tools API Architecture

**Design principles:**

1. **RESTful API Wrapper**: Clean abstraction over ElevenLabs Tools API
2. **Parameter Validation**: Rich parameter type system with validation
3. **Webhook Support**: Full HTTP method and header customization
4. **Dependency Tracking**: Find which agents use which tools

**Key features:**

- Parameter types: `string`, `number`, `boolean`, `object`, `array`
- Nested parameters for complex schemas
- Required/optional flags
- Enum validation for restricted values
- Helper functions for quick tool creation

### Knowledge Base API Architecture

**Design principles:**

1. **Multi-Source Documents**: URL, text, file upload support
2. **RAG Integration**: Automatic chunking and vector embeddings
3. **Metadata Support**: Custom metadata for filtering and organization
4. **Async Indexing**: Non-blocking index computation

**RAG workflow:**

```
1. Create KB → 2. Add Documents → 3. Compute RAG Index → 4. Use in Agent
   ↓               ↓                  ↓                     ↓
   KB ID          Doc IDs            Indexed Chunks        Agent with KB
```

**Index status flow:**

```
initiating → indexing → ready
                ↓
             failed (with error)
```

### Validation System Design

**Multi-level validation:**

1. **Type-level**: TypeScript ensures correct types at compile time
2. **Range validation**: Numeric values (stability 0-1, speed 0.25-4.0)
3. **Required fields**: Voice ID, tool names, parameter types
4. **Reference validation**: Workflow nodes/edges, tool IDs, KB IDs
5. **Format validation**: URLs, enum values, array lengths

**Validation results:**

```typescript
interface ValidationResult {
  valid: boolean;
  errors: ValidationError[]; // Field, message, code
}
```

### ElevenLabs Provider Extensions

**New capabilities in v1.4.1:**

1. **Tools API Instance**: `provider.tools` automatically initialized
2. **Knowledge Base API Instance**: `provider.knowledgeBase` automatically initialized
3. **Automatic API Key Propagation**: APIs inherit from Mind config
4. **Lifecycle Management**: APIs disposed with provider

**Integration pattern:**

```typescript
class ElevenLabsProvider implements MindProvider {
  public tools: ToolsAPI | null = null;
  public knowledgeBase: KnowledgeBaseAPI | null = null;

  async initialize(): Promise<void> {
    if (this.config.apiKey) {
      this.tools = new ToolsAPI(this.config.apiKey);
      this.knowledgeBase = new KnowledgeBaseAPI(this.config.apiKey);
    }
  }
}
```

### Type System Overview

**New types in v1.4.1:**

- `src/types/elevenlabs-agents.ts`: 500+ lines of complete API types
- ASR, TTS, Turn, Conversation, VAD, LLM configurations
- Workflow nodes (6 types) and edges
- Tools with parameter schemas
- Knowledge Base with document types
- Platform settings for widget/telephony
- Secrets management

**Type coverage:**

```
CreateAgentRequestFull     → Complete agent configuration
AgentWorkflow             → Multi-agent orchestration
ToolConfig                → Tool definitions with parameters
KnowledgeBaseLocator      → KB references
ValidationResult          → Validation errors
```

### Testing Strategy

The `test-agent-apis.ts` suite covers:

1. **Agent Lifecycle**: Create, read, update, delete, duplicate
2. **Tools CRUD**: All tool management operations
3. **Knowledge Base**: KB creation, document upload, RAG indexing
4. **Validation**: Config validation with error formatting
5. **Cleanup**: Resource disposal after tests

**Test execution:**

```typescript
await runTests(); // Returns { passed, failed, skipped, total, success }
```

### Performance Considerations

**API call optimization:**

1. **Batch Operations**: List operations with pagination
2. **Lazy Loading**: RAG indexes computed on demand
3. **Caching**: Tool and KB metadata cached locally
4. **Parallel Requests**: Multiple documents uploaded concurrently

**Memory management:**

1. **Proper Disposal**: All APIs clean up on provider dispose
2. **Reference Cleanup**: No circular references
3. **Stream Management**: File uploads use streaming
4. **Chunk Processing**: Large documents processed in chunks

## Additional Resources

- **ElevenLabs Documentation**: [elevenlabs.io/docs](https://elevenlabs.io/docs)
- **ElevenLabs Agents API**: [elevenlabs.io/docs/api-reference/agents](https://elevenlabs.io/docs/api-reference/agents)
- **OpenAI Realtime API**: [platform.openai.com/docs/guides/realtime](https://platform.openai.com/docs/guides/realtime)
- **Provider SDK Examples**: See `kwami/src/core/mind/providers/*/` for reference implementations
- **Complete Examples**: See `kwami/src/core/mind/examples/README.md` for comprehensive usage
- **Test Suite**: See `kwami/src/core/mind/examples/test-agent-apis.ts` for API testing

---

**Last Updated**: November 2025 (v1.4.1)  
**Document Version**: 3.0  
**Maintainers**: Kwami Core Team
