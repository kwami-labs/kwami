## Kwami Body Architecture

The body subsystem is responsible for rendering Kwami’s visual presence, managing real‑time audio reactivity, and coordinating any background media effects. It is composed of three collaborating modules:

- `KwamiBody` orchestrates the Three.js scene, camera, renderer, background planes, and lifecycle coordination.
- `Blob` encapsulates the animated shader mesh that represents Kwami’s organism.
- `KwamiAudio` handles Web Audio decoding/streaming, analyser setup, and microphone/stream piping for animation data.

All three modules live under `src/core/body` and are designed to be orchestrated exclusively through `KwamiBody`.

---

## Rendering Pipeline (`KwamiBody`)

`KwamiBody` receives an HTML canvas plus an optional `BodyConfig`.

1. **Scene bootstrap (`Scene` abstraction)**  
   The constructor delegates to `src/scene/Scene.ts` to produce a `WebGLRenderer`, `PerspectiveCamera`, and `Three.Scene`. These instances remain owned by `KwamiBody` for the entire lifecycle.

2. **Blob instantiation**  
   A `Blob` is created with references to the renderer, scene, camera, and audio subsystem. This allows the blob to render itself, access analyser data, and react to post‑render callbacks (notably `onAfterRender`, which `KwamiBody` uses to keep background planes aligned with the camera).

3. **Resize management**  
   - Prefers `ResizeObserver` to watch both the canvas and its parent. Falls back to a `window` listener when necessary.
   - Uses `requestAnimationFrame` debouncing so expensive resizes coalesce into a single frame.
   - Computes width/height from the parent/canvas/viewport cascade, updates renderer size/pixel ratio, syncs CSS pixel sizes, updates camera aspect/projection, re-applies blob scale, and finally recomputes background plane transforms.

4. **Background system**  
   `KwamiBody` maintains two state machines:
   - `backgroundState` for transparent/solid/gradient fills rendered directly onto `scene.background` (or onto a dedicated plane when glass/overlay modes are active).
   - `backgroundMediaState` for image/video planes rendered in front of the background but behind the blob. Media planes compute aspect-aware scale factors and can run in `cover`, `contain`, or `stretch` semantics.

   Gradients/solids default to GPU-efficient `CanvasTexture` assets, while media planes rely on `TextureLoader` or `VideoTexture`. Advanced modes re-use the same plane infrastructure to implement blob “glass” passes using stencil buffers.

5. **Blob transparency modes**  
   - `overlay`: injects the chosen texture into the blob shader, allowing the blob to inherit background colors.
   - `glass`: enables stencil writes on the blob mesh and configures a dedicated gradient plane rendered through `NotEqual` stencil tests, creating a portal effect.

6. **Lifecycle**  
   `dispose()` tears down observers, cancels pending RAFs, disposes all planes/textures/video elements, clears blob surface media, disposes blob/audio/renderer, and purges scene children. This prevents leaking GPU resources after unmount.

---

## Blob Subsystem (`Blob.ts`)

The blob encapsulates mesh creation, shader skinning, real-time animation, and interactive behaviors.

- **Geometry & materials**: `createBlobGeometry` generates a high-resolution sphere whose noise parameters (`spikes`) are tunable. Multiple shader materials (“skins”) are constructed via `createSkin`, cached in a map, and dynamically swapped while preserving color/opacity settings. Each shader receives optional `backgroundTexture` and `lightIntensity` uniforms.

- **Animation loop**: `Blob` owns the RAF loop. Every frame it:
  1. Smoothly eases listening/thinking transitions.
  2. Pulls FFT data from `KwamiAudio`’s analyser (if available) and delegates to `animateBlob` to drive vertex displacement, breathing, and scale oscillations.
  3. Falls back to deterministic rotation when no audio is present.
  4. Renders the scene (render call lives inside `Blob` so it can interleave touch effects and transitions before `KwamiBody`’s `onAfterRender` callback fires).

- **Touch interaction**: On mouse click the blob casts a ray into its mesh, converts hit points into local coordinates, and pushes “touch points” with timed decay. These feed into shader uniforms for rippling effects. Drag detection directly rotates the mesh, and double-click toggles conversation/listening states via the callback provided by `KwamiBody`.

- **State APIs**: Exposes getters/setters for skin, spikes, time, rotation, colors, scale, shininess, wireframe, light intensity, opacity, and randomized DNA-based appearances. This enables GUI panels to tweak parameters without reaching into shader internals.

- **Glass mode**: When enabled, the blob’s shader writes to the stencil buffer (ref=1) and forces `depthWrite=true` so the subsequent gradient plane can use `NotEqual` tests to paint the glass background only outside the blob silhouette.

- **Surface media**: Independent from scene background. You can project images/videos directly onto the blob surface with their own lifecycle so overlay/glass backgrounds don’t interfere.

---

## Audio Subsystem (`Audio.ts`)

`KwamiAudio` isolates all audio responsibilities:

- **Playback management**: Wraps an `HTMLAudioElement` playlist with `play/pause/stop/next/previous` helpers, file uploads, base64 sources, and streamed ArrayBuffers.

- **Web Audio analyser**: Lazily instantiates `AudioContext`, bridges the media element into an `AnalyserNode`, and configures FFT size, smoothing, and decibel ranges optimized for “liquid” motion. The blob samples `getFrequencyData()` each frame.

- **Volume/time helpers**: Provides volume setters, duration/currentTime helpers, and `formatTime` utilities for UI displays.

- **Media streams**: Can connect a `MediaStream` (e.g., microphone or TTS streaming) and route it through the analyser pipeline, enabling live audio-driven animation even when no file is playing. Microphone helpers request user media with echo/noise filters and cleanly stop/disconnect tracks.

- **Lifecycle**: `dispose()` pauses playback, stops microphone streams, and closes the audio context to avoid exceeding the browser’s context limit.

---

## Interaction & State Flow

1. **Initialization**  
   ```
   const body = new KwamiBody(canvas, config);
   body.enableBlobInteraction(onToggleConversation);
   ```
   - Automatically sizes the renderer and enters the animation loop.
   - Attaches background states from `config.scene.background`.

2. **Real-time updates**  
   - UI panels call `setBackgroundColor`, `setBackgroundGradient`, `setBackgroundImage`, or `setBackgroundVideo`. `KwamiBody` updates state, fetches textures, and re-renders planes.
   - Blob parameters (spikes, skins, colors, opacity) are forwarded to `Blob`, which updates shader uniforms immediately.
   - Audio playback or microphone data continuously feeds the analyser, driving vertex motion.

3. **Background layering**  
   ```
   Camera
     ↓
   Blob mesh (may write to stencil)
     ↓
   Gradient plane (for glass/overlay)
     ↓
   Media plane (image/video)
     ↓
   Scene background (solid/gradient/transparent)
   ```
   Planes are positioned a fixed distance in front of the camera and aligned to its quaternion so they always fill the viewport. Aspect-fitting logic ensures images/videos honor `cover`/`contain`.

4. **Resize & transitions**  
   `KwamiBody` tracks the latest canvas dimensions and only reconfigures the renderer when changes occur, limiting GPU work. A `resizeTransitionActive` flag lets plane materials know to refresh once animations settle.

5. **Disposal**  
   When unmounting, call `body.dispose()` to terminate observers, RAF loops, audio contexts, media elements, textures, geometry, lights, and scene children.

---

## Extensibility Guidelines

- **New backgrounds**: Extend `SceneBackgroundConfig` and update `mapConfigToBackgroundState`. Prefer generating `CanvasTexture`s to keep GPU uploads small and deterministic.
- **Additional blob skins**: Create shader configs under `blob/skins`, register them in `initializeSkins`, and ensure uniforms include `backgroundTexture`, `opacity`, and `lightIntensity` for consistency.
- **Custom audio sources**: Plug any `MediaStream` (WebRTC, TTS) into `KwamiAudio.connectMediaStream`. The blob will react as long as an analyser is active.
- **Performance**: Keep texture dimensions reasonable (512×512 default) to balance fidelity and upload time. When introducing new planes or overlays, always dispose of `Texture` and `VideoTexture` instances to avoid GPU leaks.

This layered design keeps rendering concerns, animation logic, and audio processing decoupled while still allowing `KwamiBody` to provide a single integration point for the rest of the application.

