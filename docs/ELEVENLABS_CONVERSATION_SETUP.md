# ElevenLabs Conversational AI Setup Guide

## ✅ Real AI Conversations Are Now Enabled!

Your Kwami can now have natural voice conversations using ElevenLabs Conversational AI. Here's how to set it up:

## 🚀 Quick Setup

### Step 1: Create Your AI Agent

1. Go to [ElevenLabs](https://elevenlabs.io)
2. Sign up for a free account (no credit card required)
3. Navigate to **Conversational AI** in the dashboard
4. Click **Create Agent**
5. Configure your agent:
   - Choose a voice
   - Set the personality/system prompt
   - Configure conversation settings
6. Save your agent

### Step 2: Get Your Agent ID

1. In your ElevenLabs dashboard, find your created agent
2. Look for the **Agent ID** (usually a string like `abc123xyz`)
3. Copy this ID

### Step 3: Configure Kwami

1. Open the Kwami playground
2. Go to the **Mind** menu (left sidebar)
3. Enter your ElevenLabs API key
4. Enter your Agent ID in the "Conversational AI Settings" section
5. Click **Initialize Mind**
6. Click **Start Conversation** or double-click Kwami!

## 🎙️ How It Works

When you start a conversation, Kwami will:

1. **Try to embed the conversation** in an iframe (seamless experience)
2. **Open a popup window** if embedding isn't possible (allow popups for elevenlabs.io)
3. **Provide a direct link** as a fallback option

## 💬 Starting Conversations

You have two options:

### Option 1: Double-Click Kwami
- Double-click the Kwami blob to start a conversation
- Double-click again to stop

### Option 2: Use the Button
- Click "Start Conversation" in the Mind menu
- Click "Stop Conversation" to end

Both methods are synchronized - the UI will update automatically!

## 🎯 Features

- **Natural voice conversations** - Speak naturally, no wake words needed
- **Voice Activity Detection** - Automatic turn-taking
- **Multiple languages** - ElevenLabs supports 29+ languages
- **Custom voices** - Use any ElevenLabs voice or clone your own
- **Real-time responses** - Low latency conversation flow
- **Visual feedback** - Kwami animates while listening/thinking/speaking

## 🔧 Troubleshooting

### Conversation won't start?
- ✅ Make sure you have a valid Agent ID
- ✅ Check that your API key is correct
- ✅ Allow microphone permissions
- ✅ Allow popups from elevenlabs.io
- ✅ Try refreshing the page

### No sound/response?
- ✅ Check your microphone is working
- ✅ Ensure browser has microphone permissions
- ✅ Try speaking louder/clearer
- ✅ Check the popup window isn't blocked

### Agent not responding correctly?
- ✅ Review your agent's system prompt in ElevenLabs dashboard
- ✅ Adjust voice settings (stability, similarity)
- ✅ Try a different voice model

## 📝 Important Notes

1. **Free Tier**: ElevenLabs offers a generous free tier for testing
2. **Browser Support**: Works best in Chrome, Edge, or Safari
3. **Mobile**: Currently optimized for desktop browsers
4. **Privacy**: Audio is processed by ElevenLabs' secure servers

## 🎨 Customization

You can customize your agent's behavior in the ElevenLabs dashboard:

- **System Prompt**: Define personality and knowledge
- **Voice Selection**: Choose from 100+ voices
- **Response Style**: Adjust formality, humor, verbosity
- **Knowledge Base**: Add custom knowledge documents
- **Tools**: Connect to external APIs and services

## 🚫 Current Limitations

- WebSocket API documentation is pending from ElevenLabs
- Embedded iframe may have cross-origin restrictions
- Some browsers may block the popup window
- Mobile browser support is limited

## 🔮 Coming Soon

- Full WebSocket integration for seamless experience
- Custom wake words
- Multi-modal interactions (vision + voice)
- Conversation history and analytics
- Tool use and function calling

## 📚 Resources

- [ElevenLabs Documentation](https://elevenlabs.io/docs/conversational-ai)
- [Create Your Agent](https://elevenlabs.io/app/conversational-ai)
- [Voice Library](https://elevenlabs.io/voice-library)
- [API Reference](https://elevenlabs.io/docs/api-reference)

## 💡 Tips

1. **Test Different Voices**: Each voice has unique characteristics
2. **Refine Your Prompt**: A good system prompt makes a huge difference
3. **Use Natural Speech**: Speak as you would to a human
4. **Allow Pauses**: The system detects when you're done speaking
5. **Experiment**: Try different agent configurations

---

## Need Help?

- Check the [ElevenLabs Community](https://discord.gg/elevenlabs)
- Report issues on [GitHub](https://github.com/elevenlabs/elevenlabs-js)
- Contact ElevenLabs support for agent-specific issues

Enjoy your conversations with Kwami! 🎉
