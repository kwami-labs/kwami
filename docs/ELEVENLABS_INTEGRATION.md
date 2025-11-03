# ElevenLabs Voice Agent Integration

## 🎉 Integration Complete

The Kwami library now has full **Body, Mind, and Soul** integration with ElevenLabs voice synthesis!

## 📦 What's Been Implemented

### 1. **KwamiMind** (`src/core/Mind.ts`)
The Mind manages all AI capabilities using ElevenLabs:

- ✅ **Text-to-Speech (TTS)**: Convert text to natural-sounding speech
- ✅ **Voice Configuration**: Full control over voice selection, stability, similarity, and style
- ✅ **Model Selection**: Support for different ElevenLabs models (eleven_multilingual_v2, eleven_turbo_v2, etc.)
- ✅ **Audio Integration**: Seamless connection to KwamiAudio for blob animation
- ✅ **Voice Agent Preparation**: Structure ready for conversational AI integration
- ✅ **Microphone Access**: Listen functionality for future speech-to-text

**Key Methods:**
- `initialize()` - Prepare the ElevenLabs client
- `speak(text, systemPrompt?)` - Generate and play speech (blob animates automatically!)
- `listen()` - Start microphone capture
- `startConversation(systemPrompt)` - Prepare for voice agent conversation
- `getAvailableVoices()` - List all available ElevenLabs voices
- `setVoiceSettings()`, `setVoiceId()`, `setModel()` - Configure voice parameters

### 2. **KwamiSoul** (`src/core/Soul.ts`)
The Soul manages personality and behavioral characteristics:

- ✅ **Personality System**: Define how Kwami behaves and communicates
- ✅ **Template Loading**: Load personalities from JSON files
- ✅ **Dynamic Configuration**: Change traits, tone, and style on the fly
- ✅ **System Prompt Generation**: Automatically format personality for AI

**Key Methods:**
- `loadPersonality(path)` - Load from JSON template
- `setPersonality(config)` - Set personality directly
- `getSystemPrompt()` - Get formatted prompt for AI
- `addTrait()`, `removeTrait()` - Modify personality traits
- `setEmotionalTone()`, `setConversationStyle()` - Adjust communication style

### 3. **Personality Templates**
Pre-built personality configurations in `assets/personalities/`:

- ✅ **Kaya (friendly.json)**: Warm, empathetic companion
- ✅ **Nexus (professional.json)**: Knowledgeable, efficient assistant
- ✅ **Spark (playful.json)**: Energetic, creative companion

### 4. **Enhanced KwamiAudio** (`src/core/Audio.ts`)
Extended audio system for real-time streaming:

- ✅ **MediaStream Support**: Connect live audio streams to frequency analyzer
- ✅ **Real-time Visualization**: Blob animates to any audio source
- ✅ **Backward Compatibility**: Existing audio file playback still works

**New Methods:**
- `connectMediaStream(stream)` - Connect live audio for visualization
- `disconnectMediaStream()` - Stop stream visualization
- `isStreamConnected()` - Check stream status

### 5. **Integrated Kwami Class** (`src/core/Kwami.ts`)
Complete orchestration of Body, Mind, and Soul:

- ✅ **State-Based Animation**: Different visual behaviors for idle, listening, thinking, speaking
- ✅ **Automatic Audio-Visual Sync**: Blob animates when Kwami speaks
- ✅ **Unified API**: Simple methods for complex interactions

**Enhanced Methods:**
- `speak(text)` - Kwami speaks using ElevenLabs (with Soul's personality)
- `listen()` - Start listening with microphone
- `startConversation()` - Begin voice agent session
- `stopConversation()` - End voice agent session
- `setState()` - Change visual state (affects blob animation)

## 🚀 Usage Examples

### Basic Speech Synthesis

```typescript
import { Kwami } from '@kwami/core';

const canvas = document.querySelector('canvas') as HTMLCanvasElement;

const kwami = new Kwami(canvas, {
  mind: {
    apiKey: process.env.ELEVEN_LABS_KEY,
    voice: {
      voiceId: 'pNInz6obpgDQGcFmaJgB', // Adam voice
      model: 'eleven_multilingual_v2',
      settings: {
        stability: 0.5,
        similarity_boost: 0.75,
        style: 0.0,
        use_speaker_boost: true
      }
    }
  },
  soul: {
    name: 'Kaya',
    personality: 'friendly and helpful',
    traits: ['empathetic', 'curious']
  }
});

// Make Kwami speak - the blob will animate to the speech!
await kwami.speak('Hello! I am Kwami, your AI companion!');
```

### Load Personality Template

```typescript
const kwami = new Kwami(canvas, {
  mind: {
    apiKey: process.env.ELEVEN_LABS_KEY
  }
});

// Load a pre-built personality
await kwami.soul.loadPersonality('/assets/personalities/friendly.json');

// Now speak with that personality
await kwami.speak('Hi there! How can I help you today?');
```

### Change Voice and Personality Dynamically

```typescript
// Change voice
kwami.mind.setVoiceId('EXAVITQu4vr4xnSDxMaL'); // Bella voice
kwami.mind.setVoiceSettings({
  stability: 0.7,
  similarity_boost: 0.8
});

// Change personality
kwami.soul.setEmotionalTone('enthusiastic');
kwami.soul.addTrait('playful');

// Speak with new configuration
await kwami.speak('Wow! I feel different now!');
```

### List Available Voices

```typescript
await kwami.mind.initialize();
const voices = await kwami.mind.getAvailableVoices();

voices.forEach(voice => {
  console.log(`${voice.name} - ${voice.voice_id}`);
});
```

### State-Based Interactions

```typescript
// Visual feedback changes based on state
kwami.setState('listening');  // More reactive blob animation
await kwami.listen();         // Start listening to microphone

kwami.setState('thinking');   // Slower, contemplative movement

kwami.setState('speaking');   // Active, dynamic movement
await kwami.speak('Here is my response!');

// Automatically returns to 'idle' when speech ends
```

## ⚙️ Configuration

### Environment Variables

Create a `.env` file based on `.env.sample`:

```bash
# ElevenLabs API Key
# Get your API key from: https://elevenlabs.io/app/settings/api-keys
ELEVEN_LABS_KEY=your_api_key_here
```

### MindConfig Options

```typescript
interface MindConfig {
  apiKey?: string;           // ElevenLabs API key
  agentId?: string;          // Agent ID for conversational AI
  voice?: {
    voiceId?: string;        // Voice ID from ElevenLabs
    model?: string;          // Model: 'eleven_multilingual_v2', 'eleven_turbo_v2'
    settings?: {
      stability?: number;             // 0-1: Voice consistency
      similarity_boost?: number;      // 0-1: Voice clarity
      style?: number;                 // 0-1: Expressiveness
      use_speaker_boost?: boolean;    // Enhance voice quality
    };
  };
  language?: string;         // Language code: 'en', 'es', 'fr', etc.
}
```

### SoulConfig Options

```typescript
interface SoulConfig {
  name?: string;                      // Kwami's name
  personality?: string;               // Overall personality description
  systemPrompt?: string;              // Base AI instructions
  traits?: string[];                  // Personality traits
  language?: string;                  // Preferred language
  conversationStyle?: string;         // Communication style
  responseLength?: 'short' | 'medium' | 'long';
  emotionalTone?: 'neutral' | 'warm' | 'enthusiastic' | 'calm';
}
```

## 🎨 How It Works

### Audio-Visual Synchronization

1. **Mind generates speech** using ElevenLabs TTS
2. **Audio is loaded** into KwamiAudio system
3. **Web Audio API** analyzes frequency data in real-time
4. **Blob animation** reacts to audio frequencies automatically
5. **State management** adjusts animation characteristics

```
Text → ElevenLabs → Audio Blob → KwamiAudio → Frequency Analyzer → Blob Animation
         ↓
    Soul's Personality
```

### State Machine

```
┌─────────┐
│  IDLE   │ ← Default state, calm movement
└────┬────┘
     │
     ├─→ LISTENING → More responsive, reactive
     │
     ├─→ THINKING → Slower, contemplative
     │
     └─→ SPEAKING → Active, dynamic (animates to speech)
```

## 📝 TypeScript Support

All new classes and interfaces are fully typed:

```typescript
import type {
  Kwami,
  KwamiMind,
  KwamiSoul,
  MindConfig,
  SoulConfig,
  VoiceSettings,
  KwamiState
} from '@kwami/core';
```

## 🔧 Technical Details

### Dependencies Installed
- `@elevenlabs/elevenlabs-js`: ^2.20.1

### Files Created/Modified
- ✅ `src/core/Mind.ts` - New Mind class
- ✅ `src/core/Soul.ts` - New Soul class
- ✅ `src/core/Kwami.ts` - Enhanced with Mind and Soul integration
- ✅ `src/core/Audio.ts` - Added MediaStream support
- ✅ `src/types/index.ts` - Expanded MindConfig and SoulConfig
- ✅ `assets/personalities/` - Personality template directory
- ✅ `.env.sample` - Environment configuration template
- ✅ `index.ts` - Updated exports

## 🤖 Agent Management API

The KwamiMind class now includes comprehensive agent management capabilities, allowing you to programmatically create, configure, and manage ElevenLabs conversational AI agents.

### When to Use Agent Management

**Use Agent Management API when you need to:**
- Create multiple AI personalities with different configurations
- Pre-configure agents with specific prompts, voices, and behaviors
- Test and iterate on agent configurations before deployment
- Share agents via public links
- Calculate costs and token usage before going live
- Manage agent lifecycle programmatically

**Use Direct TTS/Conversations when you need:**
- Simple text-to-speech without conversation capabilities
- Maximum control over every interaction
- Custom conversation flows without pre-configured agents

### Quick Start: Creating an Agent

```typescript
import { KwamiMind } from '@kwami/core';

const mind = new KwamiMind(audio, {
  apiKey: process.env.ELEVEN_LABS_API_KEY
});

await mind.initialize();

// Create a new conversational agent
const agent = await mind.createAgent({
  conversation_config: {
    agent: {
      prompt: {
        prompt: "You are Kaya, a warm and empathetic AI companion.",
        llm: "gpt-4",
        temperature: 0.7
      },
      first_message: "Hello! I'm Kaya. How can I help you today?",
      language: "en"
    },
    tts: {
      model_id: "eleven_turbo_v2",
      voice_id: "pNInz6obpgDQGcFmaJgB",
      stability: 0.5,
      similarity_boost: 0.75
    }
  }
});

console.log('Agent created:', agent.agent_id);

// Test the agent
const test = await mind.simulateConversation(agent.agent_id, {
  conversation_history: [
    { role: 'user', message: 'Tell me about yourself' }
  ]
});

console.log('Agent response:', test.agent_response);

// Use agent in real conversations
mind.setAgentId(agent.agent_id);
await mind.startConversation();
```

### Available Agent Methods

All agent management methods are available directly on the `KwamiMind` class:

- **`createAgent(config)`** - Create new agent with full configuration
- **`getAgent(agentId)`** - Retrieve agent details
- **`listAgents(options?)`** - List all agents with pagination
- **`updateAgent(agentId, config)`** - Update agent configuration
- **`deleteAgent(agentId)`** - Permanently delete an agent
- **`duplicateAgent(agentId, options?)`** - Clone an existing agent
- **`getAgentLink(agentId)`** - Get shareable public link
- **`simulateConversation(agentId, request)`** - Test agent (non-streaming)
- **`simulateConversationStream(agentId, request, onChunk)`** - Test with streaming
- **`calculateLLMUsage(agentId, request?)`** - Estimate token usage and costs

### Complete Documentation

For comprehensive API reference, code examples, and best practices, see:
**[📖 Agents API Documentation](./AGENTS_API.md)**

The documentation includes:
- Complete method signatures and parameters
- Real-world code examples
- Common workflows and patterns
- Error handling strategies
- Best practices for production use
- Troubleshooting guide

## 🎯 Next Steps

### Voice Agent Conversational AI (TODO)
The foundation is in place, but full conversational AI requires:
- WebSocket connection to ElevenLabs Conversational AI API
- Real-time bidirectional audio streaming
- Speech-to-text integration
- Response handling and audio output routing

### Additional Features to Consider
- 🔜 More personality templates
- 🔜 Voice cloning support
- 🔜 Emotion detection
- 🔜 Multi-language conversation support
- 🔜 Custom animation states
- 🔜 React/Vue/Svelte wrapper components

## 🐛 Known Issues

### Build Warnings
Some TypeScript warnings exist for:
- Missing GLSL shader module declarations (existing issue)
- Missing audio asset files (not required for core functionality)
- OrbitControls import (existing issue)

These do not affect the core Mind + Soul + Body integration and can be resolved separately.

## 📚 Resources

- [ElevenLabs Documentation](https://elevenlabs.io/docs)
- [ElevenLabs API Reference](https://elevenlabs.io/docs/api-reference)
- [Get ElevenLabs API Key](https://elevenlabs.io/app/settings/api-keys)
- [Voice Library](https://elevenlabs.io/voice-library)

## 🎉 Summary

The Kwami library is now a complete **AI companion system** with:
- ✅ **Body**: Audio-reactive 3D blob visualization
- ✅ **Mind**: ElevenLabs-powered voice synthesis
- ✅ **Soul**: Customizable personality system

The blob **automatically animates when Kwami speaks**, creating a seamless audio-visual experience!
