# Mind Menu - Complete ElevenLabs Configuration Guide

## 🧠 Overview

The Mind menu provides comprehensive configuration for ElevenLabs AI audio agents, enabling you to build powerful voice-enabled AI companions. This guide covers all available options and features.

---

## 📋 Table of Contents

1. [Authentication](#authentication)
2. [Voice Configuration](#voice-configuration)
3. [Voice Settings (Fine-tuning)](#voice-settings-fine-tuning)
4. [Advanced TTS Options](#advanced-tts-options)
5. [Conversational AI](#conversational-ai)
6. [Speech-to-Text Settings](#speech-to-text-settings)
7. [Pronunciation & Phonetics](#pronunciation--phonetics)
8. [Test & Preview](#test--preview)
9. [Usage Information](#usage-information)
10. [Quick Actions & Presets](#quick-actions--presets)
11. [API Reference](#api-reference)

---

## 🔑 Authentication

### API Key Setup

**Input:** API Key (Password field)

**How to get your API key:**

1. Visit [ElevenLabs Dashboard](https://elevenlabs.io/app/settings/api-keys)
2. Create or copy your API key
3. Paste it into the Mind menu

**Security Note:** Your API key is stored in memory only and never saved to disk in the playground.

**Button:** Initialize AI Agent

- Initializes the ElevenLabs client with your API key
- Validates credentials
- Enables all Mind features

---

## 🎙️ Voice Configuration

### Voice Selection

Choose from **20+ pre-configured voices** or use your own custom voice:

#### Pre-configured Voices:

| Voice         | Characteristics     | Best For                         |
| ------------- | ------------------- | -------------------------------- |
| **Adam**      | Deep, Professional  | Narration, Presentations         |
| **Bella**     | Soft, Female        | Calm explanations, Meditation    |
| **Antoni**    | Well-rounded, Male  | General purpose, Podcasts        |
| **Elli**      | Emotional, Female   | Storytelling, Expressive content |
| **Josh**      | Young, Male         | Casual conversations, Gaming     |
| **Arnold**    | Crisp, Male         | Technical content, Instructions  |
| **Bill**      | Strong, Male        | Announcements, Authority         |
| **Brian**     | Deep, Authoritative | News, Documentaries              |
| **Callum**    | Hoarse, Male        | Character voices, Unique tone    |
| **Charlie**   | Casual, Male        | Friendly chats, Social media     |
| **Charlotte** | Seductive, Female   | Romance, ASMR content            |
| **Chris**     | Casual, American    | Vlogs, Commentary                |
| **Daniel**    | Deep, Authoritative | Corporate, Serious content       |
| **Eric**      | Friendly, Male      | Customer service, Help content   |
| **George**    | Warm, British       | Storytelling, Audiobooks         |
| **Jessica**   | Expressive, Female  | Entertainment, Dynamic content   |
| **Laura**     | Upbeat, Female      | Energetic content, Tutorials     |
| **Lily**      | Raspy, Female       | Unique character, Creative       |
| **Matilda**   | Warm, Female        | Children's content, Comfort      |

#### Custom Voice ID

Select **"Custom Voice ID..."** to use:

- Your cloned voices
- Professional voices from ElevenLabs library
- Voice IDs from voice lab experiments

**Load My Voices Button:**

- Fetches all voices from your ElevenLabs account
- Shows custom/cloned voices
- Easy selection and preview

### Model Selection

| Model                  | Speed   | Quality   | Use Case                             |
| ---------------------- | ------- | --------- | ------------------------------------ |
| **Multilingual v2** ⭐ | Medium  | Excellent | Default, supports 29 languages       |
| **Turbo v2**           | Fastest | Good      | Real-time conversations, low latency |
| **Turbo v2.5**         | Fast    | Very Good | Balanced performance                 |
| **Monolingual v1**     | Medium  | Excellent | English-only, highest quality        |
| **Multilingual v1**    | Slow    | Good      | Legacy support                       |

### Language Support

Select from **15+ languages:**

- English, Spanish, French, German, Italian
- Portuguese, Polish, Dutch
- Japanese, Chinese, Korean
- Arabic, Hindi, Russian, Turkish

**Note:** Multilingual models automatically detect language or you can specify it explicitly.

---

## 🎚️ Voice Settings (Fine-tuning)

### Stability (0.0 - 1.0)

**Default:** 0.50

**What it does:** Controls consistency vs. expressiveness

- **Low (0.0 - 0.4):** More variable, expressive, emotional

  - Use for: Creative content, storytelling, character voices
  - Warning: Can be unstable, may introduce artifacts

- **Medium (0.4 - 0.6):** Balanced expression and consistency

  - Use for: General content, conversations, tutorials
  - Recommended starting point

- **High (0.6 - 1.0):** Very consistent, predictable
  - Use for: Technical content, documentation, formal speech
  - Less emotional variation

### Similarity Boost (0.0 - 1.0)

**Default:** 0.75

**What it does:** Enhances voice clarity and adherence to original voice

- **Low (0.0 - 0.5):** More creative interpretation

  - Can drift from original voice characteristics
  - More variation in tone

- **High (0.5 - 1.0):** Closer to original voice
  - Better clarity and recognition
  - More faithful reproduction
  - **Recommended:** 0.75 - 0.85 for best results

### Style (0.0 - 1.0)

**Default:** 0.00

**What it does:** Adds stylistic expressiveness

- **0.0:** No additional style, most stable
- **0.1 - 0.3:** Subtle expressiveness
- **0.4 - 0.6:** Moderate style enhancement
- **0.7 - 1.0:** Maximum expressiveness

**⚠️ Warning:** High style values can:

- Increase latency
- Introduce audio artifacts
- Make voice less predictable
- Use with caution and test thoroughly

### Speaker Boost

**Default:** Enabled

**What it does:** Enhances voice clarity and quality

- ✅ **Enabled:** Better audio quality, clearer voice
- ❌ **Disabled:** Raw voice output

**Recommendation:** Keep enabled unless you have specific audio processing needs.

---

## ⚙️ Advanced TTS Options

### Output Format

Choose audio format based on your needs:

#### MP3 Formats (Recommended)

| Format                     | Bitrate | File Size | Quality   | Use Case           |
| -------------------------- | ------- | --------- | --------- | ------------------ |
| **MP3 44.1kHz 128kbps** ⭐ | 128     | Medium    | Excellent | Default, balanced  |
| MP3 44.1kHz 64kbps         | 64      | Small     | Good      | Bandwidth-limited  |
| MP3 44.1kHz 192kbps        | 192     | Large     | Premium   | High-quality needs |

#### PCM Formats (Lower latency)

| Format       | Sample Rate | Latency | Use Case                 |
| ------------ | ----------- | ------- | ------------------------ |
| PCM 16kHz    | 16000 Hz    | Lowest  | Real-time conversations  |
| PCM 22.05kHz | 22050 Hz    | Low     | Voice calls, streaming   |
| PCM 24kHz    | 24000 Hz    | Low     | Good quality streaming   |
| PCM 44.1kHz  | 44100 Hz    | Medium  | CD quality, broadcasting |

### Optimize Streaming Latency

**Default:** Disabled

**Enable when:**

- Building real-time voice applications
- Conversational AI agents
- Live streaming scenarios
- Response time is critical

**Disable when:**

- Pre-generating content
- Quality is priority over speed
- Not time-sensitive

### Next Text Timeout

**Range:** 100ms - 5000ms  
**Default:** 1000ms

**What it does:** Wait time before processing next text chunk

- **Short (100-500ms):** Rapid-fire speech, fast pacing
- **Medium (500-1500ms):** Natural conversation pacing
- **Long (1500-5000ms):** Deliberate, thoughtful pacing

---

## 💬 Conversational AI

Build interactive voice agents that can have real-time conversations.

### Agent ID

**Optional:** Enter your ElevenLabs Agent ID

**What it does:**

- Enables conversational AI mode
- Connects to pre-configured agents
- Supports turn-by-turn conversations

**How to create an agent:**

1. Visit [ElevenLabs Conversational AI](https://elevenlabs.io/conversational-ai)
2. Create and configure your agent
3. Copy the Agent ID
4. Paste into Mind menu

### First Message

**What to enter:** The agent's opening greeting

**Examples:**

- "Hello! How can I help you today?"
- "Welcome! I'm here to assist you."
- "Hi there! What would you like to know?"

### Max Duration

**Range:** 10 - 3600 seconds  
**Default:** 300 seconds (5 minutes)

**What it does:** Maximum conversation length

**Set based on use case:**

- **Quick queries:** 60-120 seconds
- **Standard conversations:** 300-600 seconds
- **Extended sessions:** 1800-3600 seconds

### Allow Interruption

**Default:** Disabled

**Enable to:**

- Let users interrupt the agent mid-speech
- Create more natural conversation flow
- Improve responsiveness

**Disable for:**

- One-way announcements
- Scripted presentations
- When completeness is important

---

## 🎤 Speech-to-Text Settings

Configure speech recognition for voice input.

### STT Model

| Model      | Speed   | Accuracy | Use Case                     |
| ---------- | ------- | -------- | ---------------------------- |
| **Base**   | Fastest | ~85%     | Quick transcription, testing |
| **Small**  | Fast    | ~90%     | Balanced performance         |
| **Medium** | Medium  | ~95%     | High accuracy needs          |
| **Large**  | Slowest | ~98%     | Maximum accuracy, production |

### Automatic Punctuation

**Default:** Enabled

**What it does:** Adds punctuation marks automatically

- ✅ **Enabled:** More readable transcriptions
- ❌ **Disabled:** Raw text without punctuation

### Speaker Diarization

**Default:** Disabled

**What it does:** Identifies and labels different speakers

**Use cases:**

- Multi-person conversations
- Meeting transcriptions
- Interview recordings
- Podcast analysis

**Note:** May increase processing time and cost.

---

## 📖 Pronunciation & Phonetics

Customize how specific words are pronounced.

### Pronunciation Dictionary

**Format:** `word:pronunciation` (one per line)

**Examples:**

```
Kwami:kwah-mee
ElevenLabs:eh-leh-ven labs
API:ay-pee-eye
SQL:sequel
GIF:jiff
```

**Tips:**

- Use phonetic spelling
- Test pronunciations before deployment
- Keep dictionary updated
- Document special terms

### Use IPA Phonemes

**What it is:** International Phonetic Alphabet

**Enable to:**

- Use precise phonetic notation
- Support complex pronunciations
- Work with multiple languages

**Example IPA notation:**

```
Kwami:/ˈkwɑːmi/
API:/ˌeɪ.piːˈaɪ/
```

---

## 🎬 Test & Preview

### Text to Speak

Enter any text to test the current voice configuration.

**Sample texts:**

- **Technical:** "The system processed 1,234 requests per second."
- **Emotional:** "Wow! I can't believe how amazing this sounds!"
- **Narrative:** "Once upon a time, in a land far away..."
- **Numbers:** "The total is $12,345.67, due by March 15th."

### Speak Text Button

- Generates speech with current settings
- Animates the blob in real-time
- Full audio-visual experience

### Preview Voice Button

- Quick voice preview
- Uses sample text
- Fast way to test changes

### Generation Status

Shows real-time status:

- Ready
- Generating...
- Playing
- Complete
- Error (with details)

---

## 📊 Usage Information

Monitor your ElevenLabs API usage.

### Check API Usage Button

Displays:

- **Characters Used:** Total characters synthesized
- **Character Limit:** Your plan's monthly limit
- **Remaining:** Available characters

**Plans:**

- **Free:** 10,000 characters/month
- **Starter:** 30,000 characters/month
- **Creator:** 100,000 characters/month
- **Pro:** 500,000 characters/month
- **Scale:** 2,000,000+ characters/month

**Note:** Usage tracking requires additional API implementation.

---

## ⚡ Quick Actions & Presets

### Voice Presets

#### 🌿 Natural

- Stability: 0.5
- Similarity Boost: 0.75
- Style: 0.0
- **Use for:** General content, everyday conversations

#### 🎭 Expressive

- Stability: 0.3
- Similarity Boost: 0.8
- Style: 0.4
- **Use for:** Storytelling, emotional content, entertainment

#### 🎯 Stable

- Stability: 0.8
- Similarity Boost: 0.7
- Style: 0.0
- **Use for:** Technical documentation, formal presentations

#### 💎 Clear & Crisp

- Stability: 0.7
- Similarity Boost: 0.9
- Style: 0.0
- **Use for:** Instructions, tutorials, clarity-focused content

### Export Configuration

**What it does:** Saves all Mind settings to JSON file

**Exported data includes:**

- Voice ID and model
- All voice settings
- Advanced TTS options
- Conversational AI settings
- STT configuration
- Pronunciation rules

**Use cases:**

- Backup configurations
- Share settings with team
- Version control
- Quick setup on new systems

### Import Configuration

**What it does:** Loads Mind settings from JSON file

**Features:**

- Validates configuration
- Applies all settings automatically
- Updates UI to match imported values
- Error handling for invalid files

---

## 🔧 API Reference

### JavaScript Functions

All Mind functions are globally accessible via `window`:

```javascript
// Initialize Mind with API key
window.initializeMind();

// Apply voice settings
window.applyVoiceSettings();

// Load available voices
await window.loadAvailableVoices();

// Select user voice
window.selectUserVoice();

// Apply voice preset
window.applyVoicePreset("natural" | "expressive" | "stable" | "clear");

// Preview voice
await window.previewVoice();

// Start conversation
await window.startConversation();

// Stop conversation
await window.stopConversation();

// Test microphone
await window.testMicrophone();

// Apply pronunciation rules
window.applyPronunciation();

// Check API usage
await window.checkUsage();

// Export/Import configuration
window.exportMindConfig();
window.importMindConfig();
```

### Accessing Kwami Mind Directly

```javascript
// Access Mind instance
const mind = window.kwami.mind;

// Set voice ID
mind.setVoiceId("pNInz6obpgDQGcFmaJgB");

// Set model
mind.setModel("eleven_multilingual_v2");

// Set voice settings
mind.setVoiceSettings({
  stability: 0.5,
  similarity_boost: 0.75,
  style: 0.0,
  use_speaker_boost: true,
});

// Initialize
await mind.initialize();

// Generate speech
await mind.speak("Hello, world!");

// Get available voices
const voices = await mind.getAvailableVoices();

// Start/stop listening
const stream = await mind.listen();
mind.stopListening();

// Conversation mode
await mind.startConversation("You are a helpful assistant.");
await mind.stopConversation();

// Check if ready
const isReady = mind.isReady();

// Get configuration
const config = mind.getConfig();
```

---

## 🎯 Best Practices

### Voice Selection

1. **Test multiple voices** for your use case
2. **Consider your audience** (language, accent preferences)
3. **Match voice to content** (professional vs. casual)
4. **Use voice cloning** for brand consistency

### Voice Settings

1. **Start with defaults** and adjust incrementally
2. **Test with real content**, not just samples
3. **Balance stability and expressiveness**
4. **Document your final settings**

### Performance Optimization

1. **Use Turbo models** for real-time applications
2. **Enable latency optimization** for conversations
3. **Choose appropriate output format** for bandwidth
4. **Cache frequently used audio** when possible

### Quality Assurance

1. **Test pronunciation** of technical terms
2. **Verify numbers and dates** are spoken correctly
3. **Check audio at different volumes**
4. **Test on target playback devices**

### Cost Management

1. **Monitor usage regularly**
2. **Use preview for testing**, not production
3. **Implement caching strategies**
4. **Choose appropriate plan** for your needs

---

## 🐛 Troubleshooting

### Common Issues

#### "Failed to initialize Mind"

- **Check API key** is correct
- **Verify internet connection**
- **Check ElevenLabs service status**

#### Voice sounds distorted

- **Lower style value** (try 0.0)
- **Increase stability** (0.7+)
- **Check output format** compatibility

#### High latency

- **Use Turbo model**
- **Enable latency optimization**
- **Use lower quality output format**

#### Pronunciation errors

- **Add custom pronunciation rules**
- **Test with IPA phonemes**
- **Contact ElevenLabs support** for persistent issues

#### Microphone not working

- **Check browser permissions**
- **Verify microphone is connected**
- **Test in other applications**
- **Try different browser**

---

## 📚 Additional Resources

- [ElevenLabs Documentation](https://elevenlabs.io/docs)
- [ElevenLabs API Reference](https://elevenlabs.io/docs/api-reference)
- [Voice Library](https://elevenlabs.io/voice-library)
- [Conversational AI Docs](https://elevenlabs.io/docs/conversational-ai)
- [Get API Key](https://elevenlabs.io/app/settings/api-keys)
- [Pricing Plans](https://elevenlabs.io/pricing)

---

## 💡 Tips & Tricks

### For Developers

1. **Export configurations** for different environments (dev, staging, prod)
2. **Use environment variables** for API keys
3. **Implement error handling** around all Mind functions
4. **Cache voice lists** to reduce API calls
5. **Test with rate limiting** in mind

### For Content Creators

1. **Create voice presets** for different content types
2. **Maintain pronunciation dictionary** for your niche
3. **Test voices with actual scripts**, not samples
4. **Keep backups** of working configurations
5. **Document what works** for future reference

### For Product Managers

1. **Match voices to user personas**
2. **A/B test different voices** with users
3. **Monitor usage patterns** to optimize costs
4. **Collect user feedback** on voice quality
5. **Plan for scale** with appropriate ElevenLabs plan

---

## 🎉 Summary

The Mind menu provides **complete control** over ElevenLabs AI audio agents, including:

✅ **20+ Professional Voices** + custom voice support  
✅ **Multiple Models** optimized for different use cases  
✅ **Fine-grained Voice Control** with 4 parameters  
✅ **Advanced TTS Options** for format and latency  
✅ **Conversational AI** for interactive agents  
✅ **Speech-to-Text** with 4 model options  
✅ **Custom Pronunciation** with dictionary support  
✅ **Voice Presets** for quick setup  
✅ **Import/Export** for configuration management  
✅ **Real-time Preview** and testing

Build powerful, natural-sounding AI voice agents with the most comprehensive ElevenLabs configuration interface available! 🚀
