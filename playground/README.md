# 🎮 Kwami Playground

Interactive playground for testing the Kwami AI companion library locally.

## 🚀 Quick Start

### 1. Get Your ElevenLabs API Key

1. Go to [ElevenLabs](https://elevenlabs.io/)
2. Sign up or log in
3. Navigate to [API Settings](https://elevenlabs.io/app/settings/api-keys)
4. Copy your API key

### 2. Run the Playground

```bash
# From the kwami root directory
npm run playground
```

This will start a local dev server at `http://localhost:3000`

### 3. Use the Playground

1. **Enter API Key**: Paste your ElevenLabs API key in the "Voice Settings" section (Mind sidebar)
2. **Initialize Mind**: Click "Initialize AI Agent" button
3. **Make Kwami Speak**: Enter text and click "🎤 Speak"
4. **Watch the Magic**: The blob will animate to the speech! 🎨
5. **Customize Appearance**: Use the Body sidebar controls to adjust colors, spikes, scale
6. **Explore Soul**: Click the swap buttons to access personality configuration
7. **Switch Personalities**: Try Kaya (😊), Nexus (💼), or Spark (✨)

## 🎨 Features

The playground features a **rotating 3-section sidebar system** with two visible sidebars at any time:

- **Left Sidebar**: Initially shows Mind (AI Agent)
- **Right Sidebar**: Initially shows Body (Visual Config)
- **Center Canvas**: Real-time 3D blob visualization
- **Swap Buttons**: Toggle between Mind, Body, and Soul sections

### Rotating Sidebar System

The playground manages **three main configuration sections** across two sidebars:

#### 🤖 Mind (AI Agent Configuration)

**Initially on Left Sidebar**

- **Voice Settings (ElevenLabs)**
  - Configure ElevenLabs API key
  - Select voice ID (default: Adam voice)
  - Initialize the AI Agent
- **Test Speech**
  - Enter custom text for Kwami to speak
  - Real-time state indicator (IDLE, SPEAKING, etc.)
  - Blob automatically animates to speech frequencies

#### 🎨 Body (Visual Configuration)

**Initially on Right Sidebar**

- **Background Controls**

  - Type: Gradient, Solid Color, or Transparent
  - Opacity control (0-1)
  - Gradient: 3 colors with direction (vertical/horizontal/radial)
  - Solid: Single color picker
  - 🎲 Randomize and 🔄 Reset buttons

- **Body Parameters**

  - **Spikes (Noise Frequency)**: X, Y, Z sliders (0-20) for noise frequency on each axis
  - **Time (Animation Speed)**: X, Y, Z sliders (0-5) for animation speed
  - **Camera Position**: X, Y, Z sliders for orbiting around the blob
  - **Auto Rotation Speed**: X, Y, Z sliders (0-0.01) for continuous rotation
  - **Colors (Tricolor Skin)**: Three color pickers for X, Y, Z axes
  - **Appearance**:
    - Scale (3-8): Size of the blob
    - Resolution (120-220): Mesh detail level
    - Shininess (0-100000): Specular highlight intensity
    - Wireframe Mode: Toggle wireframe rendering
    - Skin Type: Switch between tricolor and zebra skins
  - **Quick Actions**:
    - 🎲 Randomize Blob: Generate random appearance
    - 🔄 Reset to Defaults: Restore default values

#### ✨ Soul (Personality Configuration)

**Initially Hidden - Access via Swap Buttons**

- **Personality Settings**

  - Name: Kwami's identity
  - Personality Description: Character traits and communication style
  - System Prompt: Base AI behavior instructions
  - Response Length: Short, Medium, or Long
  - Emotional Tone: Neutral, Warm, Enthusiastic, or Calm
  - ✅ Apply Soul Config: Save personality changes

- **Preset Personalities**
  - **Kaya (😊)**: Warm, empathetic companion
  - **Nexus (💼)**: Professional, knowledgeable assistant
  - **Spark (✨)**: Playful, energetic companion

### How to Use Swap Buttons

Each sidebar has a swap button at the top showing which section is currently hidden:

- **Left Swap Button** (top-left): Click to bring the hidden section to the left sidebar
- **Right Swap Button** (top-right): Click to bring the hidden section to the right sidebar

**Example Flow:**

1. Start: Mind (left) | Body (right) | Soul (hidden)
2. Click left swap: Soul (left) | Body (right) | Mind (hidden)
3. Click right swap: Soul (left) | Mind (right) | Body (hidden)

## 📝 Tips

- **Swap Buttons**: Use the buttons at the top of each sidebar to rotate through Mind, Body, and Soul sections
- **Audio-Reactive**: The blob animates more dynamically when Kwami speaks - try higher spike values!
- **Personalities**: Each personality (Kaya, Nexus, Spark) has unique traits - use Soul section to customize
- **Camera Controls**: Use the Camera Position sliders or drag with your mouse to orbit around the blob
- **Background Opacity**: Set opacity to 0 for a transparent canvas background
- **Voice Library**: Experiment with different voice IDs from [ElevenLabs Voice Library](https://elevenlabs.io/voice-library)
- **State Indicator**: Watch the state change between IDLE, LISTENING, THINKING, and SPEAKING
- **Randomize**: Hit 🎲 Randomize Blob for instant creative variations

## 🔧 Troubleshooting

### "Failed to initialize Mind"

- Make sure you've entered a valid ElevenLabs API key
- Check your internet connection
- Verify your API key has available credits

### Blob not animating

- Make sure audio is playing (check browser console for errors)
- Try clicking on the page first (some browsers require user interaction for audio)

### CORS errors

- The playground uses Vite's dev server which handles CORS automatically
- If you're serving the files differently, you may need to configure CORS

## 🎯 What You're Testing

This playground demonstrates the complete Kwami system through three main sections:

### 🤖 Mind (AI Agent)

- **ElevenLabs Integration**: Text-to-Speech voice synthesis
- **Voice Configuration**: Select from various voice models
- **Real-time State Management**: Visual feedback for IDLE, SPEAKING states

### 🎨 Body (3D Visualization)

- **Audio-Reactive Animation**: Blob morphs to speech frequencies
- **Customizable Appearance**: Control colors, scale, resolution, spikes
- **Camera Controls**: Orbit around the blob from any angle
- **Background Management**: Gradient, solid, or transparent with opacity
- **Dual Skin System**: Tricolor and Zebra shader materials

### ✨ Soul (Personality)

- **Personality Configuration**: Define name, traits, and behavior
- **System Prompts**: Customize AI response patterns
- **Emotional Tone**: Adjust response style and length
- **Preset Personalities**: Quick access to Kaya, Nexus, and Spark

### What Happens When You Click "Speak"

1. Text is sent to ElevenLabs TTS API
2. Audio is generated and returned
3. Audio is loaded into Web Audio API analyzer
4. Blob geometry reacts to frequency data in real-time
5. State machine updates visual behavior
6. Soul personality influences the communication style

Enjoy experimenting with your AI companion! 🎉
