# Body Component

The Body manages Kwami's visual presence - the 3D scene, renderer, animated blob, and all visual interactions.

## Overview

The Body is responsible for:
- **3D Scene Management** - Renderer, camera, lighting
- **Blob Rendering** - Animated 3D mesh with shader materials
- **Audio Integration** - Playback and frequency analysis
- **Background System** - Gradients, images, videos
- **User Interaction** - Touch, click, drag

## Architecture

```
KwamiBody
├── Scene (renderer, camera, lights)
├── Blob (animated 3D mesh)
├── Audio (playback + analysis)
└── Background (multi-layer system)
```

## Basic Usage

```typescript
import { KwamiBody } from 'kwami';

const canvas = document.querySelector('canvas');
const body = new KwamiBody(canvas, {
  audioFiles: ['/audio/track.mp3'],
  initialSkin: { skin: 'tricolor', subtype: 'poles' },
  blob: {
    resolution: 180,
    spikes: { x: 0.2, y: 0.2, z: 0.2 },
    colors: {
      x: '#ff0066',
      y: '#00ff66',
      z: '#6600ff'
    }
  }
});
```

## Scene Management

### Configuration

```typescript
const body = new KwamiBody(canvas, {
  scene: {
    fov: 100,                          // Field of view
    near: 0.1,                         // Near clipping plane
    far: 1000,                         // Far clipping plane
    cameraPosition: { x: 0, y: 6, z: 0 },
    enableShadows: true,               // Soft shadows
    enableControls: false              // Orbit controls (for debugging)
  }
});
```

### Camera Control

```typescript
// Get camera
const camera = body.getCamera();

// Set position
body.setCameraPosition(0, 8, 0);

// Camera moves with scene transitions
```

### Lighting

The scene includes three lights:
- **Top Directional Light** - Main illumination
- **Bottom Directional Light** - Fill light
- **Ambient Light** - Global illumination

```typescript
// Adjust light intensity
body.setLightIntensity(1.5); // 0-3 range
```

## Blob System

The blob is the core visual element - an audio-reactive 3D sphere.

### Appearance

```typescript
// Change skin (Tricolor + subtype)
body.blob.setSkin({ skin: 'tricolor', subtype: 'poles' });   // Tricolor - Poles
body.blob.setSkin({ skin: 'tricolor', subtype: 'donut' });   // Tricolor - Donut
body.blob.setSkin({ skin: 'tricolor', subtype: 'vintage' }); // Tricolor - Vintage

// Set colors (for Tricolor skins)
body.blob.setColors('#ff0000', '#00ff00', '#0000ff');
body.blob.setColor('x', '#ff00ff'); // Single axis

// Randomize appearance
body.blob.setRandomBlob();

// Scale
body.blob.setScale(1.5); // 0.1 - 3.0

// Resolution (mesh detail)
body.blob.setResolution(200); // 120-220

// Shininess
body.blob.setShininess(50000); // 0-100000

// Wireframe mode
body.blob.setWireframe(true);

// Opacity
body.blob.setOpacity(0.8); // 0-1
```

### Animation Parameters

```typescript
// Spike intensity (noise frequency)
body.blob.setSpikes(0.3, 0.3, 0.3); // x, y, z: 0-20

// Animation speed
body.blob.setTime(1.2, 1.2, 1.2); // x, y, z: 0-5

// Rotation speed
body.blob.setRotation(0.01, 0.01, 0); // x, y, z: 0-0.01
```

### Audio Reactivity

Configure how audio affects the blob:

```typescript
body.blob.audioEffects = {
  // Frequency to spike modulation (0-1)
  bassSpike: 0.3,    // Low frequencies
  midSpike: 0.4,     // Mid frequencies
  highSpike: 0.2,    // High frequencies
  
  // Frequency to time modulation (0-2)
  midTime: 0.5,      // Mid frequencies
  highTime: 0.8,     // High frequencies
  ultraTime: 0.3,    // Ultra high frequencies
  
  // Toggles
  enabled: true,     // Master switch
  timeEnabled: true  // Time modulation toggle
};
```

## Animation States

The blob supports multiple animation states with smooth transitions.

### Listening State

Inward audio-reactive spikes responding to microphone input:

```typescript
// Start listening mode
body.startListening();

// Check if listening
const isListening = body.isListening();

// Stop listening
body.stopListening();
```

### Thinking State

Chaotic fluid movements simulating contemplation:

```typescript
// Start thinking animation
body.startThinking();

// Configure duration
body.blob.thinkingDuration = 10000; // milliseconds

// Stop thinking
body.stopThinking();
```

### Speaking State

Outward audio-reactive spikes for TTS playback:

```typescript
// Automatically activated when TTS plays
// Or manually:
kwami.setState('speaking');
```

### Interactive State

Liquid-like touch effects on user interaction:

```typescript
// Enable interaction
body.enableBlobInteraction();

// Configure touch behavior
body.blob.touchStrength = 0.6;      // 0-1
body.blob.touchDuration = 1200;     // milliseconds
body.blob.maxTouchPoints = 5;       // max simultaneous

// Optional callback
body.enableBlobInteraction(() => {
  console.log('Blob clicked!');
});
```

### Transition Speed

```typescript
// Adjust state transition smoothness
body.blob.transitionSpeed = 2.0; // 0.5-5.0
```

## Audio System

The Body includes a complete audio management system.

### Playback

```typescript
// Play audio
await body.audio.play();

// Pause
body.audio.pause();

// Stop
body.audio.stop();

// Next/Previous track
body.audio.next();
body.audio.previous();

// Volume control
body.audio.setVolume(0.5); // 0-1

// Seek
body.audio.setCurrentTime(30); // seconds
```

### Audio Upload

```typescript
// From file input
const fileInput = document.querySelector('input[type="file"]');
fileInput.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  const arrayBuffer = await file.arrayBuffer();
  await body.audio.loadAudio(arrayBuffer);
  await body.audio.play();
});

// From URL
await body.audio.loadAudio('/audio/new-track.mp3');
```

### Frequency Analysis

```typescript
// Get analyser node
const analyser = body.audio.getAnalyser();

// Configure analysis
analyser.fftSize = 2048;
analyser.smoothingTimeConstant = 0.7;

// Get frequency data (used internally by blob)
const frequencyData = body.audio.getFrequencyData();
```

### Media Streams

Connect external audio sources (microphone, TTS):

```typescript
// Connect media stream
const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
body.audio.connectMediaStream(stream);

// Start microphone
await body.audio.startMicrophone();

// Stop microphone
body.audio.stopMicrophone();
```

## Background System

Multi-layer background management with gradients, colors, images, and videos.

### Gradient Backgrounds

```typescript
// Simple gradient
body.setBackgroundGradient('#1a1a2e', '#16213e');

// Advanced configuration
body.setBackground({
  type: 'gradient',
  color1: '#ff0066',
  color2: '#00ff66',
  color3: '#6600ff',  // Optional third color
  opacity: 0.8,
  gradient: {
    direction: 'diagonal',  // 'horizontal' | 'vertical' | 'diagonal'
    angle: 315,            // 0-360 degrees
    stops: [0, 0.5, 1]    // Color stop positions
  }
});

// Enable gradient overlay (renders via Three.js)
body.setGradientOverlayEnabled(true);
```

### Solid Colors

```typescript
body.setBackgroundColor('#000000');

// With opacity
body.setBackground({
  type: 'solid',
  color1: '#000000',
  opacity: 0.5
});
```

### Transparent Background

```typescript
body.setBackgroundTransparent();
```

### Image Backgrounds

```typescript
// Simple
body.setBackgroundImage('/path/to/image.jpg');

// Advanced
body.setBackgroundImage('/path/to/image.jpg', {
  opacity: 0.8,
  fit: 'cover'  // 'cover' | 'contain' | 'stretch'
});
```

### Video Backgrounds

```typescript
// Simple
body.setBackgroundVideo('/path/to/video.mp4');

// Advanced
body.setBackgroundVideo('/path/to/video.mp4', {
  opacity: 0.6,
  fit: 'cover',
  autoplay: true,
  loop: true,
  muted: true
});
```

### Background Type

```typescript
// Get current background type
const bgType = body.getBackgroundType();
// Returns: 'gradient' | 'solid' | 'transparent' | 'image' | 'video'
```

## Glass Mode

Create a "glass" effect where the blob acts as a portal:

```typescript
// Enable glass mode
body.blob.setGlassMode(true);

// Blob becomes transparent with gradient showing through
// Stencil buffer creates portal effect
```

## Blob Surface Media

Project images/videos directly onto the blob surface:

```typescript
// Set surface image
body.blob.setSurfaceImage('/path/to/texture.jpg');

// Set surface video
body.blob.setSurfaceVideo('/path/to/video.mp4');

// Clear surface media
body.blob.clearSurfaceMedia();
```

## Export Functionality

### GLB Export

Export the blob as a 3D model:

```typescript
// Export current blob state
body.blob.exportGLTF();

// Downloads as .glb file
// Includes geometry, materials, and current configuration
```

### DNA Generation

Each blob configuration can be encoded as DNA:

```typescript
// Generate unique DNA string
const dna = body.blob.generateDNA();
// Returns: string encoding all parameters

// Recreate blob from DNA
body.blob.fromDNA(dna);
```

## Resize Handling

The Body automatically handles canvas resizing:

```typescript
// Handled automatically via ResizeObserver
// Updates:
// - Renderer size
// - Pixel ratio
// - Camera aspect
// - Background planes
// - Blob scale
```

## Cleanup

```typescript
// Dispose when done
body.dispose();

// Cleans up:
// - ResizeObserver
// - Animation frames
// - Audio context
// - WebGL resources
// - Textures
// - Geometries
// - Video elements
```

## Advanced Configuration

### Complete Configuration Example

```typescript
const body = new KwamiBody(canvas, {
  // Audio files
  audioFiles: [
    '/audio/track1.mp3',
    '/audio/track2.mp3'
  ],
  
  // Initial appearance
  initialSkin: 'Poles',
  
  // Audio settings
  audio: {
    preload: 'auto',      // 'none' | 'metadata' | 'auto'
    autoInitialize: true,
    volume: 0.8
  },
  
  // Scene settings
  scene: {
    fov: 100,
    near: 0.1,
    far: 1000,
    cameraPosition: { x: 0, y: 6, z: 0 },
    enableShadows: true,
    enableControls: false,
    background: {
      type: 'gradient',
      color1: '#1a1a2e',
      color2: '#16213e',
      opacity: 1,
      gradient: {
        direction: 'diagonal',
        angle: 315,
        stops: [0, 1]
      }
    }
  },
  
  // Blob settings
  blob: {
    resolution: 180,
    spikes: { x: 0.2, y: 0.2, z: 0.2 },
    time: { x: 1, y: 1, z: 1 },
    rotation: { x: 0.01, y: 0.01, z: 0 },
    colors: {
      x: '#ff0066',
      y: '#00ff66',
      z: '#6600ff'
    },
    shininess: 100,
    wireframe: false,
    scale: 1.0,
    opacity: 1.0
  }
});
```

## Events & Callbacks

```typescript
// Audio events
body.audio.addEventListener('play', () => {
  console.log('Audio started');
});

body.audio.addEventListener('pause', () => {
  console.log('Audio paused');
});

body.audio.addEventListener('ended', () => {
  console.log('Track ended');
});

body.audio.addEventListener('timeupdate', () => {
  const current = body.audio.getCurrentTime();
  const duration = body.audio.getDuration();
  console.log(`${current} / ${duration}`);
});
```

## Performance Tips

1. **Lower Resolution for Mobile**
   ```typescript
   if (isMobile) {
     body.blob.setResolution(120);
   }
   ```

2. **Reduce FFT Size**
   ```typescript
   const analyser = body.audio.getAnalyser();
   analyser.fftSize = 1024; // Lower = faster
   ```

3. **Disable Shadows on Low-End Devices**
   ```typescript
   const body = new KwamiBody(canvas, {
     scene: { enableShadows: false }
   });
   ```

4. **Use Smaller Background Textures**
   - Prefer 512x512 over 2048x2048
   - Compress images before use

## See Also

- **[Audio API](../api/audio.md)** - Detailed audio system docs
- **[Blob API](../api/blob.md)** - Blob customization reference
- **[Animations Guide](../guides/animations.md)** - Animation system details
- **[Skins Guide](../guides/skins.md)** - Custom shader materials

---

The Body component provides everything needed for rich visual AI companions.

