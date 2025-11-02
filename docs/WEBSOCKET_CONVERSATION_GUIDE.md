# WebSocket Conversation Implementation Guide

## Overview

The Kwami conversation system now uses **direct WebSocket connections** to ElevenLabs, allowing real-time voice conversations through your Kwami blob interface. No popups, iframes, or external windows needed!

## How It Works

```
Your Voice → Microphone → WebSocket → ElevenLabs → AI Response → Audio → Kwami Speaks
```

## Setup

### 1. Get Your Credentials

1. **API Key**: Get from [elevenlabs.io/settings/api-keys](https://elevenlabs.io/settings/api-keys)
2. **Agent ID**: Create an agent at [elevenlabs.io/app/conversational-ai](https://elevenlabs.io/app/conversational-ai)

### 2. Configure in the UI

Both fields are at the top of the Mind menu:
- Enter your **ElevenLabs API Key**
- Enter your **Agent ID**
- Click **Initialize AI Agent**

### 3. Start Conversation

Two ways to start:
- **Double-click** the Kwami blob
- Click **Start Conversation** button

## Technical Implementation

### WebSocket Connection

```javascript
// Connection established with:
const wsUrl = `wss://api.elevenlabs.io/v1/convai/conversation`;
const ws = new WebSocket(wsUrl);

// Authentication sent as:
{
  type: 'init',
  authorization: apiKey,
  agent_id: agentId,
  config: {
    voice: voiceSettings,
    language: 'en'
  }
}
```

### Audio Streaming

**Outgoing (Your Voice)**:
1. Microphone captures audio at 16kHz
2. Converted to PCM16 format
3. Streamed continuously via WebSocket

```javascript
// Audio processing pipeline
Microphone → MediaStream → AudioContext → ScriptProcessor → PCM16 → WebSocket
```

**Incoming (Agent Response)**:
1. PCM16 audio received from WebSocket
2. Converted to WAV format
3. Played through KwamiAudio system
4. Blob animates with the voice

```javascript
// Response pipeline
WebSocket → PCM16 → WAV Conversion → KwamiAudio → Blob Animation
```

## Data Flow

### Message Types

**From Client to Server**:
- `init`: Authentication and configuration
- Binary audio data: PCM16 audio chunks

**From Server to Client**:
- `agent_response`: Text transcript of agent's speech
- `user_transcript`: Text transcript of user's speech
- `turn_start`: Agent begins speaking
- `turn_end`: Agent finishes speaking
- Binary audio data: Agent's voice as PCM16

## Audio Format Specifications

### Input (Microphone)
- Sample Rate: 16000 Hz
- Format: PCM16 (16-bit signed integers)
- Channels: Mono
- Encoding: Little-endian

### Output (Agent Voice)
- Sample Rate: 16000 Hz
- Format: PCM16 wrapped in WAV
- Channels: Mono
- Playback: Through Web Audio API

## Key Features

### Real-time Processing
- No buffering delays
- Immediate voice transmission
- Low-latency responses

### Visual Feedback
- Kwami blob animates while agent speaks
- Frequency-based animation
- State indicators (listening/speaking/thinking)

### Error Handling
- Automatic reconnection attempts
- Graceful degradation
- Clear error messages

## Architecture Benefits

### No External Dependencies
- ✅ No popup windows
- ✅ No iframes
- ✅ No external URLs
- ✅ Direct API integration

### Privacy & Security
- Audio processed locally
- Direct encrypted WebSocket
- No third-party interfaces
- Microphone permissions required only once

## Troubleshooting

### Connection Issues

**"WebSocket connection failed"**
- Check API key is valid
- Verify Agent ID exists
- Ensure agent is active in ElevenLabs dashboard

**"No audio from agent"**
- Check browser audio permissions
- Verify speakers/headphones connected
- Check volume levels

**"Agent doesn't hear me"**
- Grant microphone permission
- Check microphone is working
- Speak clearly near the microphone

### Performance Tips

1. **Use Chrome or Edge** for best WebSocket support
2. **Stable internet** connection recommended
3. **Close other tabs** using microphone
4. **Use headphones** to prevent echo

## Code Structure

### Key Files

- `src/core/Mind.ts`: WebSocket implementation
- `playground/main.js`: UI integration
- `src/core/Audio.ts`: Audio playback and visualization

### Main Methods

```typescript
// Start conversation
await kwami.mind.startConversation();

// Audio conversion
float32ToPCM16(float32: Float32Array): Int16Array
pcm16ToWav(pcmData: ArrayBuffer): Blob

// WebSocket handlers
setupWebSocketHandlers()
handleWebSocketMessage(message: any)
handleAgentAudio(audioData: ArrayBuffer)
```

## Future Enhancements

- [ ] AudioWorklet for better performance
- [ ] Automatic gain control
- [ ] Voice activity detection
- [ ] Multiple language support
- [ ] Custom wake words
- [ ] Conversation history
- [ ] Voice cloning integration

## Summary

The WebSocket implementation provides:
- **Direct communication** with ElevenLabs
- **Real-time voice** interaction
- **Native integration** with Kwami
- **No external windows** or popups
- **Full control** over the experience

Your Kwami is now a fully functional AI voice assistant!
