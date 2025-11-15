# Mind Playground Quick Start Guide

## Get Started in 5 Minutes! 🚀

This guide will help you get up and running with the refactored Kwami Mind Playground focused on ElevenLabs Conversational AI Agents.

## Prerequisites

1. **ElevenLabs Account** - Sign up at [elevenlabs.io](https://elevenlabs.io)
2. **API Key** - Get from [elevenlabs.io/settings/api-keys](https://elevenlabs.io/settings/api-keys)
3. **Browser** - Modern browser with WebRTC support (Chrome, Firefox, Safari, Edge)

## Step-by-Step Setup

### 1. Open the Playground

```bash
cd playground
# Open index.html in your browser
# OR if you have a local server:
python -m http.server 8000
# Then visit http://localhost:8000
```

### 2. Navigate to Mind Sidebar

- Click on the **Mind** sidebar (left or right, depending on your swap button configuration)
- You'll see the new **Provider Tabs** at the top:
  - 🎙️ **ElevenLabs** (Active)
  - 🧠 **OpenAI** (Coming Soon)
  - 🤖 **Anthropic** (Coming Soon)
  - 🔮 **Google** (Coming Soon)

### 3. Initialize Agent Manager

1. **Enter your ElevenLabs API Key** in the "API Authentication" section
2. Click **🚀 Initialize Agent Manager**
3. Wait for the green checkmark: ✅ Agent Manager Ready

All agent management sections will now be enabled!

### 4. Create Your First Agent

In the **✨ Create New Agent** section:

1. **Agent Name**: `My First Agent` (or any name you like)
2. **System Prompt**: `You are a friendly AI assistant who loves helping people`
3. **First Message**: `Hello! I'm here to help. What can I do for you today?`
4. **Language Model**: `GPT-4` (Recommended)
5. **Temperature**: `0.7` (Balanced creativity)
6. **Max Response Tokens**: `500`

Voice Configuration:
1. **Voice Selection**: Choose a voice (e.g., Adam, Bella, Antoni)
2. **TTS Model**: `Eleven Turbo v2` (Recommended)
3. **Voice Stability**: `0.5` (Balanced)
4. **Similarity Boost**: `0.75` (Clear)

Click **✨ Create Agent** and wait for success message!

### 5. Select Your Agent

In the **📋 My Agents** section:

1. Click **🔄 Refresh List** to see your new agent
2. Click on your agent card to select it
3. The card will turn green and appear in **🎯 Active Agent**

### 6. Start a Conversation

In the **🎯 Active Agent** section:

1. Click **🎙️ Start Conversation**
2. Allow microphone access when prompted
3. Wait for "🎙️ Connected! Start speaking..."
4. **Start talking to Kwami!** 🗣️

Watch Kwami animate and respond to your voice in real-time!

### 7. Stop the Conversation

When done:
- Click **⏹️ Stop Conversation**
- Kwami will return to idle state

## UI Overview

### Provider Tabs
```
┌─────────────────────────────────────┐
│ 🎙️       🧠       🤖       🔮      │
│ ElevenLabs OpenAI Anthropic Google │
│   (Active) (Soon)   (Soon)  (Soon) │
└─────────────────────────────────────┘
```

### ElevenLabs Sections

1. **🔑 API Authentication** - Enter API key & initialize
2. **✨ Create New Agent** - Build new conversational agents
3. **📋 My Agents** - View and manage your agents
4. **🎯 Active Agent** - Start/stop conversations
5. **🧪 Test Agent** - Simulate conversations without voice
6. **💰 Cost Calculator** - Estimate token usage and costs
7. **🔗 Share Agent** - Get public shareable links

## Common Tasks

### Test Agent Before Conversation

In **🧪 Test Agent**:
1. Enter a test message: `Hello! Tell me about yourself.`
2. Click **🧪 Test Agent**
3. View the response without using voice
4. Iterate on your agent's prompt until satisfied

### Calculate Costs

In **💰 Cost Calculator**:
1. **Expected Conversation Turns**: `10`
2. **Average Message Length**: `50` characters
3. Click **💰 Calculate Cost**
4. View estimated costs per conversation

### Share Your Agent

In **🔗 Share Agent**:
1. Click **🔗 Get Shareable Link**
2. Copy the generated URL
3. Share with friends/colleagues
4. They can talk to your agent directly!

## Tips & Tricks

### 1. Voice Selection

Different voices work better for different personalities:
- **Adam** - Deep, professional, great for business
- **Bella** - Soft, friendly, great for customer support
- **Antoni** - Well-rounded, versatile
- **Elli** - Emotional, expressive
- **Josh** - Young, energetic

### 2. Temperature Settings

- **0.1-0.3**: Very focused, consistent, predictable
- **0.4-0.7**: Balanced, recommended for most cases
- **0.8-1.0**: Creative, varied, spontaneous

### 3. System Prompt Best Practices

✅ **Good Prompts:**
```
You are a friendly tutor who explains complex topics in simple terms.
Always use examples and encourage questions.
```

```
You are a professional interviewer conducting a podcast.
Ask insightful follow-up questions and keep the conversation engaging.
```

❌ **Bad Prompts:**
```
Help people
```

```
You are an AI
```

### 4. Conversation Flow

```
You speak → Kwami listens (state: listening)
           ↓
       Kwami thinks
           ↓
   Kwami speaks → You listen (state: speaking)
           ↓
       Repeat!
```

### 5. Troubleshooting Quick Fixes

**"Agent Manager not initializing"**
- Check API key is correct (starts with `sk-`)
- Ensure no extra spaces in API key
- Verify you have ElevenLabs credits

**"Can't start conversation"**
- Ensure agent is selected (green card in My Agents)
- Check microphone permissions in browser
- Verify internet connection

**"No audio from Kwami"**
- Check browser audio isn't muted
- Verify speakers/headphones are connected
- Test with Test Agent first

**"WebSocket connection failed"**
- Refresh the page
- Re-select the agent
- Check agent still exists (refresh agents list)

## Advanced Features

### Duplicate an Agent

In the agent card:
1. Click the **📋** (duplicate) icon
2. Agent will be cloned with "(Copy)" suffix
3. Modify the copy without affecting original

### Update an Agent

1. Select agent in My Agents
2. Go back to Create New Agent section
3. Settings will auto-fill
4. Modify as needed
5. Create button becomes Update button

### Delete an Agent

In the agent card:
1. Click the **🗑️** (delete) icon
2. Confirm deletion
3. Agent is permanently removed

## Keyboard Shortcuts (Coming Soon)

- `Ctrl/Cmd + M` - Toggle Mind sidebar
- `Ctrl/Cmd + Space` - Start/stop conversation
- `Esc` - Stop conversation

## Example Use Cases

### 1. Personal Assistant
```
Name: Alex
Prompt: You are my personal assistant. Help me stay organized,
        remember important dates, and provide quick answers to questions.
Voice: Adam
Temperature: 0.5
```

### 2. Language Tutor
```
Name: Profesora María
Prompt: You are a Spanish language tutor. Correct my mistakes gently,
        teach new vocabulary, and encourage me to practice speaking.
Voice: Bella
Temperature: 0.6
```

### 3. Interview Coach
```
Name: Career Coach
Prompt: You are an interview coach helping me prepare for job interviews.
        Ask me common interview questions and provide constructive feedback.
Voice: Antoni
Temperature: 0.4
```

### 4. Creative Writing Partner
```
Name: Story Weaver
Prompt: You are a creative writing partner. Help me brainstorm ideas,
        develop characters, and overcome writer's block.
Voice: Elli
Temperature: 0.9
```

### 5. Tech Support
```
Name: TechBot
Prompt: You are a knowledgeable tech support agent. Explain technical
        concepts clearly and provide step-by-step troubleshooting.
Voice: Brian
Temperature: 0.3
```

## Next Steps

### Explore Soul (Personality)
- Click the **Soul** sidebar
- Load personality templates (Kaya, Nexus, Spark)
- Customize emotional traits
- Save your unique personality

### Explore Body (Visuals)
- Click the **Body** sidebar
- Randomize blob appearance
- Configure audio reactivity
- Test different animations

### Combine All Three!
```
Mind (ElevenLabs Agent)
  +
Soul (Custom Personality)
  +
Body (Visual Configuration)
  =
Your Unique Kwami! ✨
```

## Getting Help

- **Documentation**: See `/docs` folder
- **Mind README**: `/src/core/mind/README.md`
- **Issues**: Check GitHub issues
- **Community**: Join Discord (link in main README)

## What's Next?

The Mind refactoring sets the foundation for:
- 🧠 **OpenAI Provider** - GPT-4 powered agents
- 🤖 **Anthropic Provider** - Claude-powered conversations
- 🔮 **Google Provider** - Gemini multimodal AI
- 🎯 **Multi-agent conversations** - Multiple agents talking
- 📚 **Knowledge bases** - Custom context for agents
- 🔧 **Function calling** - Agents that can take actions
- 📊 **Analytics dashboard** - Conversation insights

## Congratulations! 🎉

You've successfully:
- ✅ Initialized the Kwami Mind
- ✅ Created a conversational AI agent
- ✅ Started a real-time voice conversation
- ✅ Explored the refactored UI

Now go forth and create amazing conversational experiences with Kwami! 🎙️🤖✨

---

**Pro Tip**: Start simple with a basic agent, then gradually experiment with different prompts, voices, and settings. The best agents come from iteration! 🚀

