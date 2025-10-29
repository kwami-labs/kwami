# 🚀 ElevenLabs Conversational AI - Quick Start Guide

## Step-by-Step Setup (October 2025)

### 1️⃣ Sign Up for ElevenLabs

1. Go to [elevenlabs.io/conversational-ai](https://elevenlabs.io/conversational-ai)
2. Click "Sign Up" or "Get Started"
3. Create your free account
4. Verify your email

### 2️⃣ Create Your First Agent

1. **Log in** to your ElevenLabs dashboard
2. Navigate to **"Conversational AI"** or **"Agents"** section
3. Click **"Create New Agent"**
4. Configure your agent:
   - **Name**: Give your agent a name
   - **Voice**: Select from available voices
   - **Model**: Choose the language model (e.g., Claude, GPT)
   - **Instructions**: Add system prompt/personality
   - **Knowledge Base**: Upload documents (optional)
5. **Save** and note your **Agent ID**

### 3️⃣ Test Your Agent

ElevenLabs provides several ways to test:

#### Option A: Dashboard Testing

- Use the built-in test interface in the dashboard
- Click "Test Agent" or similar button
- Have a conversation directly in the browser

#### Option B: Share Link

- Look for a "Share" or "Deploy" option
- Get a shareable link to your agent
- Test it in a new browser tab

### 4️⃣ Integration Options

Based on current availability, you might have:

#### **Embedded Widget** (Most Likely)

```html
<!-- If ElevenLabs provides an embed code -->
<iframe
  src="https://elevenlabs.io/agent/YOUR_AGENT_ID"
  width="400"
  height="600"
>
</iframe>
```

#### **JavaScript Widget** (Check Documentation)

```javascript
// If they provide a JS widget
<script src="https://elevenlabs.io/widget.js"></script>
<script>
  ElevenLabs.createAgent({
    agentId: 'YOUR_AGENT_ID',
    container: '#chat-container'
  });
</script>
```

#### **API Endpoints** (Check Latest Docs)

```javascript
// If REST API is available
const response = await fetch("https://api.elevenlabs.io/v1/convai/chat", {
  method: "POST",
  headers: {
    "xi-api-key": "YOUR_API_KEY",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    agent_id: "YOUR_AGENT_ID",
    message: "Hello",
  }),
});
```

## 📝 What to Look For in Dashboard

When you log in, look for:

- **"Agents"** or **"Conversational AI"** menu item
- **"Create Agent"** or **"New Agent"** button
- **"Deploy"**, **"Share"**, or **"Embed"** options
- **"API"** or **"Integration"** documentation

## 🔍 Finding Your Agent ID

Your Agent ID might be:

- Shown in the agent list
- In the agent settings/configuration
- In the URL when editing the agent
- In the embed/share code

## 💰 Pricing Tiers (October 2025)

- **Free**: 15 minutes/month
- **Starter**: $5/month - 50 minutes
- **Creator**: $22/month - 250 minutes
- **Business**: Custom pricing

## 🛠️ Current Kwami Implementation

While we determine the exact integration method:

### Use Demo Mode

```javascript
// Current implementation works as demo
window.kwami.mind.config.conversational = {
  agentId: "demo-agent", // Use any placeholder
  firstMessage: "Hello!",
};

// Start conversation (will use demo mode)
await window.kwami.startConversation();
```

### Alternative: Use Standard TTS

```javascript
// Use regular text-to-speech for now
await window.kwami.speak("Hello! I'm using ElevenLabs TTS.");
```

## 📚 Next Steps

1. **Check ElevenLabs Docs**: Look for their latest integration guides
2. **Test Dashboard**: Explore all available options in your account
3. **Join Community**:
   - [ElevenLabs Discord](https://discord.gg/elevenlabs)
   - Ask about programmatic access
4. **Contact Support**:
   - Email: support@elevenlabs.io
   - Ask about API/SDK access for conversational agents

## ⚠️ Important Notes

- **API May Vary**: The exact API/SDK methods may differ from standard TTS
- **Documentation**: Check [elevenlabs.io/docs](https://elevenlabs.io/docs) for latest updates
- **Widget vs API**: They might prioritize widget embedding over direct API access initially

## 🔄 We'll Update This Guide

As we learn more about the exact integration methods, we'll update:

- Specific API endpoints
- SDK methods
- WebSocket details
- Authentication methods

---

_Last checked: October 29, 2025_  
_Status: Conversational AI is PUBLIC - no beta needed!_

