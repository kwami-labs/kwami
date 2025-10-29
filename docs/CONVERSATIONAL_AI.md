# 🎙️ Kwami Conversational AI

## ⚠️ Important Notice

**ElevenLabs Conversational AI is currently in beta** and requires:

1. Access to the ElevenLabs Conversational AI beta program
2. A valid Agent ID from your ElevenLabs dashboard
3. The conversational AI add-on in your ElevenLabs subscription plan

**Current Status**: The implementation provides a demo mode that simulates the conversation flow using standard TTS and placeholder STT. Full WebSocket-based conversations will be available once you have beta access.

## Overview

Kwami is designed to support **natural voice conversations** using ElevenLabs' WebSocket-based Conversational AI. Once available, this feature will enable real-time, bidirectional voice interactions with automatic voice activity detection (VAD), eliminating the need for manual pause detection or push-to-talk buttons.

## Key Features

- **🎤 Real-time Voice Conversations**: Natural, flowing conversations without button pressing
- **🔊 Automatic Voice Activity Detection**: Built-in VAD detects when you stop speaking
- **🔄 Bidirectional Audio Streaming**: Low-latency WebSocket connection for smooth interactions
- **👂 Speech-to-Text Transcription**: Real-time transcription of user speech
- **🎯 Turn Management**: Automatic turn-taking with configurable timeouts
- **🎭 Visual State Sync**: Kwami's blob animation reflects conversation state
- **📝 Conversation Transcripts**: Live display of agent and user messages
- **🚀 Interruption Support**: Optionally allow interrupting the agent mid-speech
- **💬 Hybrid Mode**: Send text messages during voice conversations

## How It Works

### Architecture

```
User Microphone → WebSocket → ElevenLabs → Agent Response → KwamiAudio → Speaker
                      ↑                          ↓
                  Audio Stream              Text Transcript
                      ↑                          ↓
                 Voice Activity            Visual Feedback
                   Detection              (Blob Animation)
```

### Technical Implementation

1. **WebSocket Connection**: Establishes a secure WebSocket connection to ElevenLabs' conversational AI endpoint
2. **Audio Processing Pipeline**:
   - Captures microphone at 16kHz sample rate
   - Converts to PCM16 format for transmission
   - Streams audio chunks in real-time
3. **Voice Activity Detection**: ElevenLabs handles VAD server-side with configurable silence thresholds
4. **Response Handling**:
   - Receives audio chunks from agent
   - Plays through KwamiAudio for visualization
   - Updates blob state based on conversation flow

## Quick Start

### Demo Mode (Currently Available)

The current implementation provides a demonstration of the conversation interface:

```javascript
// In the Mind menu:
1. Enter your API Key
2. Enter any placeholder Agent ID (e.g., "demo-agent")
3. Configure voice settings
4. Click "Initialize AI Agent"
5. Click "Start Conversation"

// You'll see:
- Microphone permission request
- Console warnings about beta status
- Simulated conversation flow with TTS responses
```

### Full Mode (Requires Beta Access)

Once you have ElevenLabs Conversational AI beta access:

1. **Get Agent ID**: Create an agent in your ElevenLabs dashboard
2. **Enable WebSocket API**: Ensure your plan includes conversational AI
3. **Configure**: Use your real Agent ID in the configuration

### 3. Programmatic Usage

```typescript
import { Kwami } from "@kwami/core";

const kwami = new Kwami(canvas, {
  mind: {
    apiKey: "your-api-key",
    voice: {
      voiceId: "pNInz6obpgDQGcFmaJgB",
      model: "eleven_turbo_v2_5",
    },
    conversational: {
      agentId: "your-agent-id",
      firstMessage: "Hello! How can I help you today?",
      maxDuration: 300,
      allowInterruption: true,
    },
  },
});

// Start a conversation with callbacks
await kwami.startConversation({
  onAgentResponse: (text) => {
    console.log("Agent said:", text);
  },
  onUserTranscript: (text) => {
    console.log("User said:", text);
  },
  onTurnStart: () => {
    console.log("Agent is speaking...");
  },
  onTurnEnd: () => {
    console.log("Listening for user...");
  },
  onError: (error) => {
    console.error("Conversation error:", error);
  },
});

// Stop conversation when done
await kwami.stopConversation();
```

## Configuration Options

### Conversation Settings

| Parameter           | Type    | Default                            | Description                              |
| ------------------- | ------- | ---------------------------------- | ---------------------------------------- |
| `agentId`           | string  | required                           | Your ElevenLabs agent ID                 |
| `firstMessage`      | string  | "Hello! How can I help you today?" | Agent's opening message                  |
| `maxDuration`       | number  | 300                                | Maximum conversation duration in seconds |
| `allowInterruption` | boolean | true                               | Allow interrupting the agent             |

### Audio Settings

| Parameter          | Type    | Default | Description                   |
| ------------------ | ------- | ------- | ----------------------------- |
| `sampleRate`       | number  | 16000   | Audio sample rate in Hz       |
| `echoCancellation` | boolean | true    | Enable echo cancellation      |
| `noiseSuppression` | boolean | true    | Enable noise suppression      |
| `autoGainControl`  | boolean | true    | Enable automatic gain control |

### Voice Activity Detection

| Parameter      | Type   | Default   | Description                         |
| -------------- | ------ | --------- | ----------------------------------- |
| `turn_timeout` | number | 2000      | Milliseconds of silence to end turn |
| `mode`         | string | "silence" | VAD mode: "silence" or "manual"     |

## State Management

Kwami automatically manages visual states during conversations:

- **🟢 Idle**: Default state, calm blob movement
- **🔵 Listening**: Active microphone, responsive blob
- **🟡 Thinking**: Processing, contemplative movement
- **🔴 Speaking**: Agent talking, dynamic animation

### State Flow

```
Idle → Initialize → Listening ⟷ Speaking → Idle
                         ↑         ↓
                         ← Thinking ←
```

## Event Callbacks

### Available Callbacks

```typescript
interface ConversationCallbacks {
  // Called when agent completes a response
  onAgentResponse?: (text: string) => void;

  // Called when user speech is transcribed
  onUserTranscript?: (text: string) => void;

  // Called when agent starts speaking
  onTurnStart?: () => void;

  // Called when agent finishes speaking
  onTurnEnd?: () => void;

  // Called on any error
  onError?: (error: Error) => void;
}
```

### Example: Building a Chat UI

```javascript
const transcripts = [];

await kwami.startConversation({
  onAgentResponse: (text) => {
    transcripts.push({ role: "agent", text, timestamp: Date.now() });
    updateChatUI(transcripts);
  },
  onUserTranscript: (text) => {
    transcripts.push({ role: "user", text, timestamp: Date.now() });
    updateChatUI(transcripts);
  },
  onTurnStart: () => {
    showTypingIndicator(true);
  },
  onTurnEnd: () => {
    showTypingIndicator(false);
    enableUserInput();
  },
});
```

## Hybrid Mode

Send text messages during voice conversations:

```javascript
// During an active conversation
kwami.sendConversationMessage("Can you repeat that?");

// Check if conversation is active
if (kwami.isConversationActive()) {
  // Safe to send messages
}
```

## Best Practices

### 1. Microphone Setup

- Use a good quality microphone for best results
- Test microphone levels before starting conversations
- Enable noise suppression for noisy environments

### 2. Agent Configuration

- Define clear system prompts for consistent behavior
- Set appropriate max duration for your use case
- Configure interruption based on conversation style

### 3. Error Handling

```javascript
try {
  await kwami.startConversation({
    onError: (error) => {
      // Handle specific errors
      if (error.message.includes("microphone")) {
        showMicrophonePermissionDialog();
      } else if (error.message.includes("WebSocket")) {
        retryConnection();
      }
    },
  });
} catch (error) {
  console.error("Failed to start conversation:", error);
  // Fallback to text-based interaction
  await kwami.speak("I'm having trouble with voice. Let's use text instead.");
}
```

### 4. Resource Cleanup

```javascript
// Always stop conversations when done
window.addEventListener("beforeunload", async () => {
  if (kwami.isConversationActive()) {
    await kwami.stopConversation();
  }
});

// Dispose properly
kwami.dispose(); // Automatically stops active conversations
```

## Browser Compatibility

### Requirements

- **Chrome/Edge**: Full support (recommended)
- **Firefox**: Full support
- **Safari**: Requires user gesture for microphone access
- **Mobile**: Works with appropriate permissions

### Feature Detection

```javascript
// Check for required APIs
const isSupported = () => {
  return !!(
    navigator.mediaDevices?.getUserMedia &&
    window.WebSocket &&
    window.AudioContext
  );
};

if (!isSupported()) {
  console.warn("Conversational AI not supported in this browser");
  // Fall back to text-only mode
}
```

## Troubleshooting

### Common Issues

| Issue                       | Cause                   | Solution                                |
| --------------------------- | ----------------------- | --------------------------------------- |
| No microphone access        | Permissions denied      | Check browser permissions, ensure HTTPS |
| WebSocket connection failed | Network/firewall        | Check network, verify API key           |
| Agent not responding        | Invalid agent ID        | Verify agent ID in ElevenLabs dashboard |
| Audio feedback/echo         | Speaker bleeding to mic | Use headphones or adjust mic position   |
| Conversation cuts off       | Timeout reached         | Increase `maxDuration` setting          |

### Debug Mode

Enable detailed logging:

```javascript
// In browser console
window.DEBUG_CONVERSATION = true;

// Now all WebSocket messages will be logged
kwami.startConversation({
  onAgentResponse: console.log,
  onUserTranscript: console.log,
  onError: console.error,
});
```

## API Reference

### KwamiMind Methods

```typescript
class KwamiMind {
  // Start a voice conversation
  async startConversation(
    systemPrompt?: string,
    callbacks?: ConversationCallbacks
  ): Promise<void>;

  // Stop current conversation
  async stopConversation(): Promise<void>;

  // Check if conversation is active
  isConversationActive(): boolean;

  // Send text during conversation
  sendConversationMessage(text: string): void;
}
```

### Kwami Methods

```typescript
class Kwami {
  // Start conversation with Soul's personality
  async startConversation(callbacks?: ConversationCallbacks): Promise<void>;

  // Stop conversation
  async stopConversation(): Promise<void>;

  // Check status
  isConversationActive(): boolean;

  // Send text message
  sendConversationMessage(text: string): void;
}
```

## Performance Considerations

### Optimization Tips

1. **Latency Optimization**

   ```javascript
   mind.config.advancedTTS = {
     optimizeStreamingLatency: true,
     nextTextTimeout: 500, // Reduce for faster responses
   };
   ```

2. **Audio Buffer Management**

   - Kwami automatically manages audio buffers
   - Old audio URLs are cleaned up after 5 seconds

3. **WebSocket Keep-Alive**
   - Connection automatically maintained during conversation
   - Reconnection not implemented (stop and restart if needed)

## Security

### Best Practices

1. **API Key Management**

   - Never expose API keys in client-side code
   - Use environment variables or secure key management
   - Consider proxy server for production

2. **HTTPS Required**

   - Microphone access requires HTTPS
   - WebSocket uses WSS (secure) protocol

3. **Content Filtering**
   - Implement content moderation if needed
   - Monitor conversation transcripts for compliance

## Examples

### Customer Service Bot

```javascript
const serviceBot = new Kwami(canvas, {
  mind: {
    apiKey: process.env.ELEVENLABS_API_KEY,
    conversational: {
      agentId: "service-agent-id",
      firstMessage: "Welcome! How can I assist you today?",
      maxDuration: 600, // 10 minutes
    },
  },
  soul: {
    personality: "professional",
    traits: ["helpful", "patient", "knowledgeable"],
  },
});

await serviceBot.startConversation({
  onUserTranscript: (text) => {
    // Log for quality assurance
    logCustomerQuery(text);
  },
  onAgentResponse: (text) => {
    // Track resolution
    checkIfResolved(text);
  },
});
```

### Interactive Storyteller

```javascript
const storyteller = new Kwami(canvas, {
  mind: {
    voice: {
      voiceId: "storyteller-voice",
      settings: {
        stability: 0.7,
        style: 0.8, // More expressive
      },
    },
    conversational: {
      agentId: "story-agent-id",
      firstMessage: "Shall I tell you a story?",
      allowInterruption: false, // Don't interrupt stories
    },
  },
});
```

### Language Tutor

```javascript
const tutor = new Kwami(canvas, {
  mind: {
    language: "es", // Spanish
    conversational: {
      agentId: "tutor-agent-id",
      firstMessage: "¡Hola! Vamos a practicar español.",
    },
  },
});

await tutor.startConversation({
  onUserTranscript: (text) => {
    // Check pronunciation
    analyzePronunciation(text);
  },
  onAgentResponse: (text) => {
    // Display with translation
    showWithTranslation(text);
  },
});
```

## Limitations

### Beta Access Requirements

**IMPORTANT**: Full conversational AI features require:

- ElevenLabs Conversational AI beta access
- Valid Agent ID from ElevenLabs dashboard
- Appropriate subscription plan with conversational AI add-on

Without beta access, the system operates in **demo mode** with:

- Simulated conversation flow
- Standard TTS for responses
- Placeholder STT transcription
- Basic turn management

### Current Limitations

1. **Beta Access Required**: Full WebSocket functionality pending beta access
2. **No Conversation History**: Each session is independent
3. **No Multi-party**: Single user-agent conversations only
4. **No Recording**: Audio streams are not saved
5. **WebSocket Only**: No fallback to polling when available
6. **No Reconnection**: Connection loss requires restart

### Planned Enhancements

- [ ] Conversation history and resumption
- [ ] Multi-language auto-detection
- [ ] Conversation analytics
- [ ] Offline mode with queuing
- [ ] Group conversations
- [ ] Custom wake words

## Support

For issues or questions:

1. Check the [troubleshooting section](#troubleshooting)
2. Review [ElevenLabs documentation](https://elevenlabs.io/docs)
3. Open an issue on [GitHub](https://github.com/yourusername/kwami)

---

_Last updated: October 29, 2025_  
_Version: 2.1.0_
