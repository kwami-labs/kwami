# Animation Guide

Complete guide to Kwami's animation system, states, and visual effects.

## Overview

Kwami's animation system is built around:
- **Audio Reactivity** - Frequency-based vertex displacement
- **State Animations** - Distinct visual behaviors for different states
- **Interactive Effects** - Touch and click interactions
- **Smooth Transitions** - Seamless blending between states

## Animation States

Kwami supports four primary states, each with unique visual characteristics:

### State Overview

| State | Visual Behavior | Audio Response | Use Case |
|-------|----------------|----------------|----------|
| **Idle** | Gentle breathing | Optional music | Resting/waiting |
| **Listening** | Inward spikes | Microphone input | User speaking |
| **Thinking** | Chaotic movement | Silent | Processing |
| **Speaking** | Outward spikes | TTS output | AI responding |

## Idle State

Default resting state with gentle breathing animation.

### Characteristics
- Subtle baseline movement
- Smooth, periodic oscillation
- Optional audio visualization
- Low energy consumption

### Configuration

```typescript
kwami.setState('idle');

// Fine-tune idle animation
kwami.body.blob.setSpikes(0.2, 0.2, 0.2);
kwami.body.blob.setTime(1, 1, 1);
kwami.body.blob.setRotation(0.01, 0.01, 0);
```

### Breathing Effect

The idle state creates a "breathing" effect through:
- Sine wave-based scale modulation
- Gentle vertex displacement
- Synchronized color pulsing (optional)

```typescript
// Adjust breathing intensity
kwami.body.blob.setSpikes(0.15, 0.15, 0.15);  // Gentler
kwami.body.blob.setSpikes(0.25, 0.25, 0.25);  // More pronounced
```

## Listening State

Inward-facing spikes that react to microphone input.

### Activation

```typescript
// Start listening mode
await kwami.body.startListening();

// Check if listening
const isListening = kwami.body.isListening();

// Stop listening
kwami.body.stopListening();
```

### Characteristics
- Inward-facing vertex displacement
- Reactive to microphone amplitude
- Creates "absorption" visual effect
- Microphone frequency analysis

### Visual Behavior

```
Normal Sphere → User speaks → Spikes inward
               ← User silent ← Smoothly returns
```

### Configuration

```typescript
// Listening sensitivity
kwami.body.blob.audioEffects = {
  bassSpike: 0.4,   // More reactive to voice
  midSpike: 0.5,
  highSpike: 0.3,
  enabled: true
};
```

## Thinking State

Chaotic, contemplative movement simulating cognitive processing.

### Activation

```typescript
// Start thinking animation
kwami.body.startThinking();

// Set duration (optional)
kwami.body.blob.thinkingDuration = 5000;  // 5 seconds

// Stop thinking
kwami.body.stopThinking();
```

### Characteristics
- Random, chaotic vertex movement
- No audio input
- Multiple noise layers
- Fluid, organic motion
- Configurable duration

### Visual Behavior

The thinking animation combines multiple noise frequencies to create unpredictable, organic movement:

```typescript
// High frequency chaos
kwami.body.blob.setSpikes(0.35, 0.4, 0.38);
kwami.body.blob.setTime(1.5, 1.8, 1.6);
```

### Duration Management

```typescript
// Set duration
kwami.body.blob.thinkingDuration = 10000;  // 10 seconds

// Auto-stop after duration
kwami.body.startThinking();
// Automatically stops and returns to idle after 10s

// Manual stop
kwami.body.stopThinking();
```

## Speaking State

Outward-facing spikes synchronized with TTS audio output.

### Activation

```typescript
// Automatically activated during TTS
await kwami.speak("Hello!");

// Or manually
kwami.setState('speaking');
```

### Characteristics
- Outward-facing vertex displacement
- Synchronized with speech audio
- Amplitude-driven spike intensity
- Frequency-based motion

### Visual Behavior

```
Normal Sphere → AI speaks → Spikes outward
               ← Speech ends ← Smoothly returns
```

### Configuration

```typescript
// Speaking animation intensity
kwami.body.blob.audioEffects = {
  bassSpike: 0.3,
  midSpike: 0.4,
  highSpike: 0.2,
  
  // Time modulation for rhythm
  midTime: 0.5,
  highTime: 0.8,
  ultraTime: 0.3
};
```

## State Transitions

All state changes are smoothly blended using interpolation.

### Transition Speed

```typescript
// Adjust transition speed
kwami.body.blob.transitionSpeed = 2.0;
// Range: 0.5 (slow) to 5.0 (instant)

// Slow, cinematic transitions
kwami.body.blob.transitionSpeed = 0.8;

// Fast, responsive transitions
kwami.body.blob.transitionSpeed = 3.0;
```

### Transition Flow

```
Idle ←→ Listening
  ↕        ↕
Speaking ←→ Thinking
```

All transitions preserve blob continuity with smooth interpolation.

### Manual State Management

```typescript
// Sequence example
kwami.setState('idle');
await delay(1000);

kwami.setState('listening');
await delay(2000);

kwami.setState('thinking');
await delay(3000);

kwami.setState('speaking');
await delay(2000);

kwami.setState('idle');
```

## Interactive Animations

### Touch Effects

Liquid-like ripple effects on user interaction.

#### Enable Interaction

```typescript
// Basic interaction
kwami.body.enableBlobInteraction();

// With callback
kwami.body.enableBlobInteraction(() => {
  console.log('Blob clicked!');
});
```

#### Configuration

```typescript
// Touch parameters
kwami.body.blob.touchStrength = 0.6;      // 0-1 (impact intensity)
kwami.body.blob.touchDuration = 1200;     // milliseconds
kwami.body.blob.maxTouchPoints = 5;       // simultaneous touches

// Gentle touches
kwami.body.blob.touchStrength = 0.3;
kwami.body.blob.touchDuration = 2000;

// Aggressive touches
kwami.body.blob.touchStrength = 0.9;
kwami.body.blob.touchDuration = 800;
```

#### Touch Behavior

```
User Click → Raycasting → Hit Point → Touch Point Object
                                            ↓
                                    Add to Touch Array
                                            ↓
                      Animation Loop: Calculate Influence
                                            ↓
                                    Apply to Vertices
                                            ↓
                                    Decay Over Time
                                            ↓
                              Remove When Time > Duration
```

### Click vs Double-Click

```typescript
kwami.body.enableBlobInteraction(() => {
  // Single click
  console.log('Single click - touch effect');
});

// Double-click toggles conversation (built-in)
// Handled internally by Kwami
```

### Drag Rotation

```typescript
// Drag to rotate blob (automatic)
// Click and drag on blob to manually rotate
// Momentum carries rotation after release
```

## Audio Reactivity

The blob reacts to audio through frequency analysis.

### Audio Effects Configuration

```typescript
kwami.body.blob.audioEffects = {
  // Frequency → Spike Modulation (0-1)
  bassSpike: 0.3,    // Low frequencies (20-250 Hz)
  midSpike: 0.4,     // Mid frequencies (250-4000 Hz)
  highSpike: 0.2,    // High frequencies (4000+ Hz)
  
  // Frequency → Time Modulation (0-2)
  midTime: 0.5,      // Mid → animation speed
  highTime: 0.8,     // High → animation speed
  ultraTime: 0.3,    // Ultra high → animation speed
  
  // Master toggles
  enabled: true,     // Enable audio reactivity
  timeEnabled: true  // Enable time modulation
};
```

### Frequency Bands

| Band | Range | Affects | Example |
|------|-------|---------|---------|
| **Bass** | 20-250 Hz | Spike intensity | Kick drum, bass guitar |
| **Mid** | 250-4000 Hz | Spike + speed | Vocals, guitar |
| **High** | 4000-8000 Hz | Spike + speed | Cymbals, hi-hats |
| **Ultra** | 8000+ Hz | Speed only | Sparkle, breath sounds |

### Custom Audio Mapping

```typescript
// Get analyser for custom control
const analyser = kwami.body.audio.getAnalyser();

// Configure FFT
analyser.fftSize = 2048;
analyser.smoothingTimeConstant = 0.7;

// Get frequency data
const frequencyData = kwami.body.audio.getFrequencyData();

// Custom mapping
const bass = frequencyData.slice(0, 10).reduce((a, b) => a + b) / 10;
const mid = frequencyData.slice(10, 40).reduce((a, b) => a + b) / 30;
const high = frequencyData.slice(40, 80).reduce((a, b) => a + b) / 40;

// Apply custom modulation
kwami.body.blob.setSpikes(
  bass / 255 * 0.5,
  mid / 255 * 0.4,
  high / 255 * 0.3
);
```

## Animation Parameters

### Core Parameters

```typescript
// Spikes (noise frequency) - affects deformation intensity
kwami.body.blob.setSpikes(x, y, z);  // 0-20
// Low (0.1-0.5): Gentle undulation
// Medium (0.5-1.0): Noticeable deformation
// High (1.0-5.0): Strong distortion

// Time (animation speed) - affects motion responsiveness
kwami.body.blob.setTime(x, y, z);    // 0-5
// Low (0.1-0.5): Slow, fluid motion
// Medium (0.5-1.5): Natural pace
// High (1.5-5.0): Rapid, energetic

// Rotation (spin speed) - creates orbital effects
kwami.body.blob.setRotation(x, y, z); // 0-0.01
// X: Pitch (forward/back tilt)
// Y: Yaw (left/right spin)
// Z: Roll (barrel roll)
```

### Visual Effects Parameters

```typescript
// Scale - overall blob size
kwami.body.blob.setScale(1.5);       // 0.1-3.0

// Resolution - mesh detail
kwami.body.blob.setResolution(180);  // 120-220
// Lower: Better performance
// Higher: Smoother appearance

// Shininess - specular highlight intensity
kwami.body.blob.setShininess(50000); // 0-100000
// Low: Matte appearance
// High: Glossy, metallic

// Opacity - transparency
kwami.body.blob.setOpacity(0.8);     // 0-1
// 0: Fully transparent
// 1: Fully opaque

// Wireframe - debug visualization
kwami.body.blob.setWireframe(true);  // boolean
```

### Color Parameters

```typescript
// Set all colors
kwami.body.blob.setColors('#ff0000', '#00ff00', '#0000ff');

// Set individual axis
kwami.body.blob.setColor('x', '#ff00ff');
kwami.body.blob.setColor('y', '#00ffff');
kwami.body.blob.setColor('z', '#ffff00');

// Color affects vertex displacement mapping
```

## Animation Presets

### Calm Preset

```typescript
function setCalmAnimation() {
  kwami.body.blob.setSpikes(0.15, 0.15, 0.15);
  kwami.body.blob.setTime(0.8, 0.8, 0.8);
  kwami.body.blob.setRotation(0.005, 0.005, 0);
  kwami.body.blob.transitionSpeed = 1.0;
}
```

### Energetic Preset

```typescript
function setEnergeticAnimation() {
  kwami.body.blob.setSpikes(0.4, 0.4, 0.4);
  kwami.body.blob.setTime(1.8, 1.8, 1.8);
  kwami.body.blob.setRotation(0.015, 0.015, 0.005);
  kwami.body.blob.transitionSpeed = 3.0;
}
```

### Fluid Preset

```typescript
function setFluidAnimation() {
  kwami.body.blob.setSpikes(0.25, 0.3, 0.28);
  kwami.body.blob.setTime(1.2, 1.5, 1.3);
  kwami.body.blob.setRotation(0.008, 0.012, 0.003);
  kwami.body.blob.transitionSpeed = 1.5;
}
```

## Performance Optimization

### Lower Resolution

```typescript
// Reduce vertex count for better performance
kwami.body.blob.setResolution(120);  // vs 200
```

### Reduce FFT Size

```typescript
const analyser = kwami.body.audio.getAnalyser();
analyser.fftSize = 1024;  // vs 2048
```

### Disable Time Modulation

```typescript
// Disable time modulation for simpler animation
kwami.body.blob.audioEffects.timeEnabled = false;
```

### Limit Touch Points

```typescript
// Reduce simultaneous touch effects
kwami.body.blob.maxTouchPoints = 3;  // vs 5
```

## Advanced Techniques

### Custom Animation Loop

```typescript
// Access the blob's animation function
const customAnimate = (deltaTime: number) => {
  // Custom vertex manipulation
  const mesh = kwami.body.blob.getMesh();
  const geometry = mesh.geometry;
  
  // Modify vertices
  // ... custom logic ...
  
  geometry.attributes.position.needsUpdate = true;
};

// Integrate into render loop
// (Note: Kwami handles the loop internally)
```

### State-Based Animation Variants

```typescript
function updateAnimationForState(state: string) {
  switch (state) {
    case 'idle':
      kwami.body.blob.setSpikes(0.2, 0.2, 0.2);
      kwami.body.blob.setTime(1, 1, 1);
      break;
    case 'listening':
      kwami.body.blob.setSpikes(0.4, 0.4, 0.4);
      kwami.body.blob.setTime(1.5, 1.5, 1.5);
      break;
    case 'thinking':
      kwami.body.blob.setSpikes(0.15, 0.15, 0.15);
      kwami.body.blob.setTime(0.5, 0.5, 0.5);
      break;
    case 'speaking':
      kwami.body.blob.setSpikes(0.3, 0.3, 0.3);
      kwami.body.blob.setTime(1.2, 1.2, 1.2);
      break;
  }
}
```

### Personality-Driven Animation

```typescript
// Sync animation with Soul personality
const energy = kwami.soul.getEmotionalTrait('energy') || 0;
const calmness = kwami.soul.getEmotionalTrait('calmness') || 0;

// Map energy to animation speed
const timeScale = 0.5 + (energy / 100) * 1.5;  // 0.5-2.0
kwami.body.blob.setTime(timeScale, timeScale, timeScale);

// Map calmness to spike intensity
const spikeIntensity = 0.4 - (calmness / 100) * 0.3;  // 0.1-0.4
kwami.body.blob.setSpikes(spikeIntensity, spikeIntensity, spikeIntensity);

// Map happiness to colors
const happiness = kwami.soul.getEmotionalTrait('happiness') || 0;
if (happiness > 50) {
  kwami.body.blob.setColors('#ff6b9d', '#ffd93d', '#6bcf7f'); // Bright
} else {
  kwami.body.blob.setColors('#4a5568', '#2d3748', '#1a202c'); // Muted
}
```

## Troubleshooting

### Animation Too Subtle

```typescript
// Increase spike intensity
kwami.body.blob.setSpikes(0.5, 0.5, 0.5);

// Increase audio effects
kwami.body.blob.audioEffects.bassSpike = 0.5;
kwami.body.blob.audioEffects.midSpike = 0.6;
```

### Animation Too Chaotic

```typescript
// Reduce spike intensity
kwami.body.blob.setSpikes(0.1, 0.1, 0.1);

// Slow down time
kwami.body.blob.setTime(0.5, 0.5, 0.5);

// Smooth audio analysis
const analyser = kwami.body.audio.getAnalyser();
analyser.smoothingTimeConstant = 0.9;
```

### State Transitions Too Abrupt

```typescript
// Slow down transitions
kwami.body.blob.transitionSpeed = 0.8;
```

### Touch Effects Not Visible

```typescript
// Increase touch strength
kwami.body.blob.touchStrength = 0.9;

// Increase duration
kwami.body.blob.touchDuration = 2000;
```

## Related

- **[Body Component](../core/body.md)** - Body system details
- **[Configuration Guide](./configuration.md)** - Configuration options
- **[Skins Guide](./skins.md)** - Custom shader materials

---

Master Kwami's animation system to create engaging visual experiences.

