# 🚀 Kwami Quick Start Guide

Get your AI companion up and running in 3 minutes!

## 📋 Prerequisites

- Node.js 16+ installed
- ElevenLabs API key ([Get one here](https://elevenlabs.io/app/settings/api-keys))

## 🎯 Option 1: Test Locally with Playground

Perfect for trying out Kwami and seeing it in action!

### 1. Clone and Setup
```bash
git clone https://github.com/alexcolls/kwami.git
cd kwami
npm install
```

### 2. Run the Playground
```bash
npm run playground
```

### 3. Open Your Browser
Navigate to `http://localhost:3000`

### 4. Configure and Test
1. Enter your ElevenLabs API key
2. Click "Initialize Mind"
3. Choose a personality (Kaya, Nexus, or Spark)
4. Click "🎤 Speak" and watch the blob animate! 🎨

See [playground/README.md](playground/README.md) for detailed playground instructions.

---

## 📦 Option 2: Use as Library in Your Project

### 1. Install Kwami
```bash
npm install @kwami/core three simplex-noise
```

### 2. Create Your HTML
```html
<!DOCTYPE html>
<html>
<head>
  <style>
    body { margin: 0; }
    canvas { width: 100vw; height: 100vh; display: block; }
  </style>
</head>
<body>
  <canvas id="kwami-canvas"></canvas>
  <script type="module" src="./main.js"></script>
</body>
</html>
```

### 3. Initialize Kwami
```javascript
// main.js
import { Kwami } from '@kwami/core';

const canvas = document.getElementById('kwami-canvas');

const kwami = new Kwami(canvas, {
  mind: {
    apiKey: 'your-elevenlabs-api-key',
    voice: {
      voiceId: 'pNInz6obpgDQGcFmaJgB', // Adam voice
      model: 'eleven_multilingual_v2'
    }
  },
  soul: {
    name: 'Kaya',
    personality: 'friendly and helpful AI companion',
    traits: ['empathetic', 'curious', 'patient']
  }
});

// Make Kwami speak - blob animates automatically!
document.addEventListener('click', async () => {
  await kwami.speak('Hello! I am Kwami, your AI companion!');
});
```

### 4. Run Your Project
```bash
# Using Vite (recommended)
npx vite

# Or any other dev server
npx serve
```

---

## 🎨 Customization Examples

### Change Voice
```javascript
kwami.mind.setVoiceId('EXAVITQu4vr4xnSDxMaL'); // Bella voice
kwami.mind.setVoiceSettings({
  stability: 0.7,
  similarity_boost: 0.8,
  style: 0.5
});
```

### Load Personality Template
```javascript
await kwami.soul.loadPersonality('/assets/personalities/playful.json');
```

### Update Visual Appearance
```javascript
// Randomize blob
kwami.body.blob.setRandomBlob();

// Change colors
kwami.body.blob.setColors('#ff0066', '#00ff66', '#6600ff');

// Switch skin
kwami.body.setSkin('zebra');
```

### State-Based Interactions
```javascript
kwami.setState('listening');  // Visual feedback
await kwami.listen();         // Start microphone

kwami.setState('thinking');   // Contemplative animation
// ... process input ...

kwami.setState('speaking');   // Active animation
await kwami.speak('Here is my response!');
```

---

## 🎯 What You Get

✅ **Body**: Audio-reactive 3D blob that animates to sound  
✅ **Mind**: ElevenLabs voice synthesis integration  
✅ **Soul**: Customizable personality system  
✅ **States**: Visual feedback for different interaction modes  
✅ **Skins**: Multiple visual styles (tricolor, zebra)  
✅ **TypeScript**: Fully typed for great developer experience  

---

## 📚 Next Steps

- Read [ELEVENLABS_INTEGRATION.md](ELEVENLABS_INTEGRATION.md) for detailed documentation
- Explore the [playground](playground/) for interactive examples
- Check out [ARCHITECTURE.md](ARCHITECTURE.md) to understand the system design
- Browse the [API documentation](README.md) for all available methods

---

## 🆘 Need Help?

- **API Key Issues**: Get your key from [ElevenLabs Settings](https://elevenlabs.io/app/settings/api-keys)
- **TypeScript Errors**: Make sure you have `three` and `@types/three` installed
- **Blob Not Animating**: Ensure audio is playing and check browser console for errors
- **Voice Not Working**: Verify your API key has available credits

---

## 💡 Pro Tips

1. **Try Different Voices**: Browse the [ElevenLabs Voice Library](https://elevenlabs.io/voice-library)
2. **Create Custom Personalities**: Use the personality templates as a starting point
3. **Experiment with States**: Different states create different visual behaviors
4. **Adjust Voice Settings**: Play with stability, similarity, and style for different effects

---

**Ready to create your AI companion? Let's go! 🚀**
