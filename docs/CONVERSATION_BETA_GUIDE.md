# 🚀 ElevenLabs Conversational AI Integration Guide

## 🎉 Update: Conversational AI is Now Public!

Great news! ElevenLabs Conversational AI is **now publicly available** - no beta access needed!

### How to Get Started

1. **Sign up for free** at [elevenlabs.io/conversational-ai](https://elevenlabs.io/conversational-ai)
2. **Free tier includes** 15 minutes of conversation per month
3. **Create your agent** in the ElevenLabs dashboard
4. **Get your Agent ID** for integration

## What's Working Now

### ✅ Demo Mode Features

- **Microphone Access**: Successfully captures audio from user
- **Visual States**: Blob animation syncs with conversation states
- **TTS Responses**: Uses standard ElevenLabs text-to-speech
- **UI Integration**: Full conversation interface in playground
- **Error Handling**: Proper resource cleanup and user feedback

### 🎯 What's Ready for Beta

- Complete WebSocket connection structure
- Audio streaming pipeline (PCM16 format)
- Turn management system
- Real-time transcription display
- Conversation callbacks and events

## Setting Up Your Agent

### Step 1: Create Your ElevenLabs Account

1. **Go to** [elevenlabs.io/conversational-ai](https://elevenlabs.io/conversational-ai)
2. **Sign up** for a free account
3. **Verify** your email

### Step 2: Create Your Conversational Agent

1. **Dashboard**: Navigate to the Conversational AI section
2. **Create Agent**: Click "Create New Agent"
3. **Configure**:
   - Choose a voice
   - Set the language model
   - Add custom instructions
   - Configure knowledge base (optional)
4. **Save**: Get your Agent ID

### Step 3: Integration Options

**Note**: The exact programmatic API for conversational agents may differ from standard TTS. Check their latest documentation for:

- Widget/iframe embedding
- SDK methods
- WebSocket endpoints
- REST API endpoints

### Option 2: Alternative Implementation

While waiting for beta access, you can implement full conversations using:

#### A. OpenAI Realtime API + ElevenLabs TTS

```javascript
// Use OpenAI for conversation logic
const openai = new OpenAI({ apiKey: "your-key" });

// Stream responses through ElevenLabs TTS
async function handleConversation(userInput) {
  // 1. Send to OpenAI
  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "user", content: userInput }],
    stream: true,
  });

  // 2. Convert to speech with ElevenLabs
  for await (const chunk of response) {
    if (chunk.choices[0]?.delta?.content) {
      await kwami.mind.speak(chunk.choices[0].delta.content);
    }
  }
}
```

#### B. Web Speech API + ElevenLabs TTS

```javascript
// Use browser's built-in speech recognition
const recognition = new (window.SpeechRecognition ||
  window.webkitSpeechRecognition)();

recognition.onresult = async (event) => {
  const transcript = event.results[0][0].transcript;
  console.log("User said:", transcript);

  // Process with your backend
  const response = await fetchAIResponse(transcript);

  // Speak through ElevenLabs
  await kwami.mind.speak(response);
};

recognition.start();
```

#### C. Whisper API + ElevenLabs TTS

```javascript
// Use OpenAI Whisper for STT
async function transcribeAudio(audioBlob) {
  const formData = new FormData();
  formData.append("file", audioBlob, "audio.webm");
  formData.append("model", "whisper-1");

  const response = await fetch(
    "https://api.openai.com/v1/audio/transcriptions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: formData,
    }
  );

  const { text } = await response.json();
  return text;
}
```

## Activating Full Mode

Once you have beta access:

### 1. Update Configuration

```javascript
// In playground/main.js or your app
const kwami = new Kwami(canvas, {
  mind: {
    apiKey: "your-elevenlabs-api-key",
    conversational: {
      agentId: "your-real-agent-id", // From ElevenLabs dashboard
      // ... other settings
    },
  },
});
```

### 2. Remove Demo Warnings

In `src/core/Mind.ts`, comment out or remove the demo warnings:

```typescript
// Remove these lines once you have beta access:
console.warn("⚠️ ElevenLabs Conversational AI is currently in beta...");
```

### 3. Uncomment WebSocket Code

In `src/core/Mind.ts`, uncomment the WebSocket implementation:

```typescript
// Uncomment this block:
const agentId = this.config.conversational?.agentId;
if (!agentId) {
  throw new Error("Agent ID required. Get one from ElevenLabs dashboard.");
}

// Connect to ElevenLabs WebSocket
const wsUrl = `wss://api.elevenlabs.io/v1/convai/conversation`;
this.conversationWebSocket = new WebSocket(wsUrl);
// ... rest of implementation
```

## Testing Your Setup

### 1. Check API Access

```javascript
// Test if you have conversational AI access
async function testAccess() {
  try {
    const response = await fetch("https://api.elevenlabs.io/v1/convai/agents", {
      headers: {
        "xi-api-key": "your-api-key",
      },
    });

    if (response.ok) {
      console.log("✅ You have conversational AI access!");
      const agents = await response.json();
      console.log("Your agents:", agents);
    } else {
      console.log("❌ No access yet. Status:", response.status);
    }
  } catch (error) {
    console.error("Error checking access:", error);
  }
}
```

### 2. Verify WebSocket Connection

```javascript
// Test WebSocket endpoint
const ws = new WebSocket(
  "wss://api.elevenlabs.io/v1/convai/conversation?agent_id=test"
);
ws.onopen = () => console.log("✅ WebSocket endpoint reachable");
ws.onerror = (e) => console.log("❌ WebSocket error:", e);
```

## Troubleshooting

### Common Issues

| Issue                         | Solution                                    |
| ----------------------------- | ------------------------------------------- |
| "Agent ID not found"          | Verify agent exists in ElevenLabs dashboard |
| "Unauthorized"                | Check API key and subscription plan         |
| "WebSocket connection failed" | Ensure you have beta access enabled         |
| "No audio output"             | Check browser permissions and audio context |

### Debug Mode

Enable detailed logging:

```javascript
// In browser console
localStorage.setItem("DEBUG_CONVERSATION", "true");

// Now restart conversation to see detailed logs
```

## Community Resources

- **GitHub Issues**: Report bugs or request features
- **Discord**: Join ElevenLabs Discord for beta discussions
- **Twitter**: Follow @elevenlabs for announcements
- **Blog**: Check blog.elevenlabs.io for updates

## Fallback Options

While waiting for beta access, Kwami still provides:

1. **Standard TTS**: Full text-to-speech with all voices
2. **Voice Configuration**: Complete voice customization
3. **Demo Interface**: Test the conversation UI
4. **Visual Feedback**: Blob animations and state management

## Future Updates

When ElevenLabs releases public WebSocket API:

- [ ] Auto-detection of API availability
- [ ] Seamless upgrade from demo to full mode
- [ ] Additional conversation features
- [ ] Multi-agent support
- [ ] Conversation history

## Need Help?

1. Check this guide first
2. Review [CONVERSATIONAL_AI.md](./CONVERSATIONAL_AI.md)
3. Open an issue on GitHub
4. Contact ElevenLabs support for beta access

---

_Last updated: October 29, 2025_  
_Kwami Version: 2.1.0_  
_Status: Awaiting ElevenLabs Conversational AI Beta_
