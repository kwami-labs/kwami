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

1. **Enter API Key**: Paste your ElevenLabs API key in the "Voice Settings" section
2. **Initialize Mind**: Click "Initialize Mind" button
3. **Choose Personality**: Select Kaya (😊), Nexus (💼), or Spark (✨)
4. **Make Kwami Speak**: Enter text and click "🎤 Speak"
5. **Watch the Magic**: The blob will animate to the speech! 🎨

## 🎨 Features

The playground features a **dual sidebar layout**:
- **Left Sidebar**: Configuration, personality, and environment controls
- **Right Sidebar**: Speech and body appearance controls
- **Center Canvas**: Real-time 3D blob visualization

### Left Sidebar

#### About
Learn about Kwami and what makes it unique.

#### Voice Settings (ElevenLabs)
- Configure ElevenLabs API key
- Select voice ID (default: Adam voice)
- Initialize the Mind system

#### Personality Selection
- **Kaya (😊)**: Warm, empathetic companion
- **Nexus (💼)**: Professional, knowledgeable assistant
- **Spark (✨)**: Playful, energetic companion

#### Background Controls
- **3 Color Gradient**: Customize background with three colors
- **Angle** (0-360°): Control gradient direction
- **Color Stops**: Adjust position of each color (0-100%)
- **🎲 Randomize**: Generate random gradient combinations
- **🔄 Reset**: Restore default background

### Right Sidebar

#### Speech Synthesis
- Enter custom text for Kwami to speak
- Blob automatically animates to speech frequencies
- Real-time state indicator (IDLE, SPEAKING, etc.)

### Body Controls

Fine-tune the Kwami blob's visual appearance and behavior in real-time:

#### Spikes (Noise Frequency)
- **X, Y, Z sliders** (0-20): Control the noise frequency on each axis
- Higher values create more dramatic deformations

#### Time (Animation Speed)
- **X, Y, Z sliders** (0-5): Control animation speed on each axis
- Affects how fast the blob morphs and moves

#### Rotation Speed
- **X, Y, Z sliders** (0-0.01): Control rotation speed on each axis
- Creates spinning effects on different axes

#### Colors (Tricolor Skin)
- **Color X, Y, Z pickers**: Choose three colors for the tricolor skin
- Colors blend based on the blob's geometry

#### Appearance
- **Scale** (0.1-3.0): Size of the blob
- **Resolution** (120-220): Mesh detail level (higher = smoother)
- **Shininess** (0-100000): Specular highlight intensity
- **Wireframe Mode**: Toggle wireframe rendering
- **Skin Type**: Switch between tricolor and zebra skins

#### Quick Actions
- **🎲 Randomize Blob**: Generate random appearance with all parameters
- **🔄 Reset to Defaults**: Restore all parameters to default values

## 📝 Tips

- The blob animation is audio-reactive - it will move more dynamically when Kwami speaks!
- Try different personalities to see how Kwami's "character" changes
- Experiment with different voice IDs from [ElevenLabs Voice Library](https://elevenlabs.io/voice-library)
- The state indicator shows when Kwami is IDLE, LISTENING, THINKING, or SPEAKING

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

This playground demonstrates the complete Kwami system:
- **Body**: 3D audio-reactive blob visualization
- **Mind**: ElevenLabs voice synthesis integration
- **Soul**: Personality system with template loading

When you click "Speak", here's what happens:
1. Text is sent to ElevenLabs TTS API
2. Audio is generated and returned
3. Audio is loaded into Web Audio API analyzer
4. Blob geometry reacts to frequency data in real-time
5. State machine updates visual behavior

Enjoy experimenting with your AI companion! 🎉
