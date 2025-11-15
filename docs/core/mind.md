# Mind Component

The Mind handles AI capabilities through a provider architecture that supports multiple AI vendors for Text-to-Speech, Speech-to-Text, and conversational AI.

## Overview

The Mind is responsible for:

- **Text-to-Speech (TTS)** - Converting text to natural voice
- **Speech-to-Text (STT)** - Converting voice to text (coming soon)
- **Conversational AI** - Full voice conversations (beta)
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

| Provider       | Status          | TTS | STT | Conversation | Agents |
| -------------- | --------------- | --- | --- | ------------ | ------ |
| **ElevenLabs** | ✅ Complete     | ✅  | ❌  | 🟡 Beta      | ✅     |
| **OpenAI**     | 🟡 Experimental | ✅  | ❌  | ❌ WIP       | ❌     |
| **Vapi**       | 📅 Planned      | -   | -   | -            | -      |
| **Retell**     | 📅 Planned      | -   | -   | -            | -      |
| **Bland**      | 📅 Planned      | -   | -   | -            | -      |

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

## Agent Management

Create and manage conversational AI agents (ElevenLabs only).

### Creating an Agent

```typescript
const agent = await mind.createAgent({
  name: "My Agent",
  firstMessage: "Hello! How can I assist you?",
  language: "en",

  // Conversation config
  conversation_config: {
    tts: {
      model_id: "eleven_turbo_v2_5",
      voice_id: "your-voice-id",
      optimize_streaming_latency: 3,
    },
  },

  // Prompt
  prompt: {
    prompt: kwami.soul.getSystemPrompt(),
    llm: "gpt-4",
    temperature: 0.7,
    max_tokens: 500,
  },
});

console.log("Agent ID:", agent.agent_id);
```

### Managing Agents

```typescript
// Get agent
const agent = await mind.getAgent("agent-id");

// List agents
const agents = await mind.listAgents();

// Update agent
await mind.updateAgent("agent-id", {
  name: "Updated Name",
});

// Delete agent
await mind.deleteAgent("agent-id");

// Duplicate agent
const newAgent = await mind.duplicateAgent("agent-id");
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

See [Mind Architecture](../architecture/mind-architecture.md#voicerealtime-providers-landscape) for details.

## See Also

- **[Provider Integration Guide](../guides/providers.md)** - Adding custom providers
- **[Soul Component](./soul.md)** - Personality integration
- **[API Reference](../api/mind.md)** - Complete API docs

---

The Mind component enables rich voice AI interactions with flexible provider support.
