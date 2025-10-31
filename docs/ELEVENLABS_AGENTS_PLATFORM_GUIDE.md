# ElevenLabs Agents Platform Integration Guide

## Overview

The ElevenLabs Agents Platform provides a complete conversational AI system with Speech-to-Text (ASR), Language Models (LLM), Text-to-Speech (TTS), and turn-taking capabilities.

## Prerequisites

1. **ElevenLabs Account**: Sign up at [elevenlabs.io](https://elevenlabs.io)
2. **API Key**: Get from [elevenlabs.io/settings/api-keys](https://elevenlabs.io/settings/api-keys)
3. **Agent**: Create at [elevenlabs.io/app/conversational-ai](https://elevenlabs.io/app/conversational-ai)

## API Flow

### Step 1: Create an Agent (One-time)

**Via Dashboard (Recommended):**
1. Go to [elevenlabs.io/app/conversational-ai](https://elevenlabs.io/app/conversational-ai)
2. Click "Create Agent"
3. Configure:
   - Name and description
   - Language model (OpenAI, Anthropic, Google, etc.)
   - Voice selection
   - System prompt
   - Knowledge base (optional)
4. Save and note your Agent ID

**Via API:**
```javascript
const response = await fetch('https://api.elevenlabs.io/v1/convai/agents/create', {
  method: 'POST',
  headers: {
    'xi-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    conversation_config: {
      agent: {
        first_message: "Hello! How can I help you?",
        language: "en"
      },
      asr: {
        quality: "high",
        provider: "elevenlabs",
        user_input_audio_format: "pcm_16000"
      },
      tts: {
        model_id: "eleven_turbo_v2",
        voice_id: "YOUR_VOICE_ID",
        agent_output_audio_format: "pcm_16000"
      }
    }
  })
});
```

### Step 2: Get Signed URL (Per Session)

```javascript
const response = await fetch(
  `https://api.elevenlabs.io/v1/convai/conversation/get_signed_url?agent_id=${agentId}`,
  {
    method: 'GET',
    headers: {
      'xi-api-key': 'YOUR_API_KEY',
      'Content-Type': 'application/json'
    }
  }
);

const data = await response.json();
// Response format:
// {
//   "signed_url": "wss://convai.elevenlabs.io/...",
//   "expires_at": "2024-01-01T00:00:00Z"
// }
```

### Step 3: Connect WebSocket

```javascript
const ws = new WebSocket(signedUrl);

ws.onopen = () => {
  console.log('Connected to agent');
  // Start sending audio immediately
};

ws.onmessage = (event) => {
  if (event.data instanceof ArrayBuffer) {
    // Audio response from agent (PCM16 format)
    playAudio(event.data);
  } else {
    // JSON message (transcripts, events)
    const message = JSON.parse(event.data);
    handleMessage(message);
  }
};
```

### Step 4: Stream Audio

```javascript
// Get microphone stream
const stream = await navigator.mediaDevices.getUserMedia({ 
  audio: {
    sampleRate: 16000,
    echoCancellation: true,
    noiseSuppression: true
  }
});

// Process and send audio
const audioContext = new AudioContext({ sampleRate: 16000 });
const source = audioContext.createMediaStreamSource(stream);
const processor = audioContext.createScriptProcessor(4096, 1, 1);

processor.onaudioprocess = (event) => {
  // Convert Float32 to PCM16
  const float32 = event.inputBuffer.getChannelData(0);
  const pcm16 = convertToPCM16(float32);
  
  // Send directly as binary
  ws.send(pcm16.buffer);
};

source.connect(processor);
processor.connect(audioContext.destination);
```

## Message Protocol

### Incoming Messages (Server → Client)

**Binary Data:**
- PCM16 audio at 16kHz
- Agent's voice response
- Play directly or convert to desired format

**JSON Messages:**
```javascript
// User speech transcribed
{
  "type": "user_transcript",
  "text": "What's the weather?",
  "timestamp": "2024-01-01T00:00:00Z"
}

// Agent response transcript
{
  "type": "agent_response",
  "text": "The weather is sunny today.",
  "timestamp": "2024-01-01T00:00:00Z"
}

// Turn management
{
  "type": "turn_start",  // Agent starts speaking
  "timestamp": "2024-01-01T00:00:00Z"
}

{
  "type": "turn_end",    // Agent finishes speaking
  "timestamp": "2024-01-01T00:00:00Z"
}
```

### Outgoing (Client → Server)

**Binary Audio Only:**
- PCM16 format (16-bit signed integers)
- 16000 Hz sample rate
- Mono channel
- Little-endian byte order
- Send continuously while user speaks

## Audio Specifications

### Input (Your Microphone → Agent)
```
Format: PCM16 (raw audio)
Sample Rate: 16000 Hz
Channels: 1 (mono)
Bit Depth: 16 bits
Encoding: Signed Integer, Little-Endian
```

### Output (Agent → Your Speakers)
```
Format: PCM16 (raw audio)
Sample Rate: 16000 Hz  
Channels: 1 (mono)
Bit Depth: 16 bits
Encoding: Signed Integer, Little-Endian
```

## Error Handling

### Common Errors

| Status | Meaning | Solution |
|--------|---------|----------|
| 401 | Invalid API key | Check your API key |
| 404 | Agent not found | Verify agent ID exists |
| 403 | Access forbidden | Check permissions |
| 400 | Bad request | Check request format |
| 429 | Rate limited | Slow down requests |

### WebSocket Errors

| Code | Meaning | Solution |
|------|---------|----------|
| 1000 | Normal closure | Session ended normally |
| 1001 | Going away | Server shutting down |
| 1006 | Abnormal closure | Network issue |
| 1008 | Policy violation | Check audio format |
| 1011 | Server error | Try again later |

## Complete Example

```javascript
class ConversationClient {
  async start(apiKey, agentId) {
    // 1. Get signed URL
    const urlResponse = await fetch(
      `https://api.elevenlabs.io/v1/convai/conversation/get_signed_url?agent_id=${agentId}`,
      {
        headers: { 'xi-api-key': apiKey }
      }
    );
    const { signed_url } = await urlResponse.json();
    
    // 2. Connect WebSocket
    this.ws = new WebSocket(signed_url);
    
    // 3. Set up handlers
    this.ws.onmessage = (event) => {
      if (event.data instanceof ArrayBuffer) {
        this.playAudio(event.data);
      } else {
        const msg = JSON.parse(event.data);
        console.log('Message:', msg);
      }
    };
    
    // 4. Start streaming microphone
    const stream = await navigator.mediaDevices.getUserMedia({ 
      audio: { sampleRate: 16000 }
    });
    
    this.startAudioStreaming(stream);
  }
  
  startAudioStreaming(stream) {
    const context = new AudioContext({ sampleRate: 16000 });
    const source = context.createMediaStreamSource(stream);
    const processor = context.createScriptProcessor(4096, 1, 1);
    
    processor.onaudioprocess = (e) => {
      if (this.ws.readyState === WebSocket.OPEN) {
        const pcm16 = this.float32ToPCM16(
          e.inputBuffer.getChannelData(0)
        );
        this.ws.send(pcm16.buffer);
      }
    };
    
    source.connect(processor);
    processor.connect(context.destination);
  }
  
  float32ToPCM16(float32) {
    const pcm16 = new Int16Array(float32.length);
    for (let i = 0; i < float32.length; i++) {
      const sample = Math.max(-1, Math.min(1, float32[i]));
      pcm16[i] = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
    }
    return pcm16;
  }
  
  playAudio(arrayBuffer) {
    // Convert PCM16 to WAV and play
    const wav = this.pcm16ToWav(arrayBuffer);
    const audio = new Audio(URL.createObjectURL(wav));
    audio.play();
  }
}
```

## Debugging Tips

1. **Check Console Logs**: All important events are logged
2. **Monitor Network Tab**: Check WebSocket frames
3. **Test Agent in Dashboard**: Verify it works there first
4. **Audio Format**: Ensure PCM16 16kHz format
5. **Microphone Permissions**: Must be granted
6. **Agent Status**: Must be active/deployed

## Important Notes

- **No JSON wrapper for audio**: Send PCM16 directly as binary
- **No manual auth in WebSocket**: Signed URL handles it
- **Session-based**: Each signed URL is for one conversation
- **Real-time**: Stream continuously, don't batch
- **Turn-taking**: Agent manages when to speak/listen

## References

- [ElevenLabs API Docs](https://elevenlabs.io/docs/api-reference)
- [Agents Platform Docs](https://elevenlabs.io/docs/conversational-ai/docs/introduction)
- [Postman Collection](https://www.postman.com/elevenlabs/documentation/)
