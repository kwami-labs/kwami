import { createNoise3D } from 'simplex-noise';
import { type Mesh, Vector3 } from 'three';

const noise3D = createNoise3D();

// Store previous per-vertex displacements to create viscous smoothing
const previousDisplacementMap = new WeakMap<Mesh, Float32Array>();

// Audio smoothing state to keep responses fluid
const audioSmoothing = {
  low: 0,
  mid: 0,
  high: 0,
};

/**
 * Extract frequency bands from the full frequency data
 */
function getFrequencyBands(frequencyData: Uint8Array): {
  low: number;
  mid: number;
  high: number;
  ultra: number;
} {
  const dataLength = frequencyData.length;

  // Split into frequency bands (normalized 0-1)
  const lowEnd = Math.floor(dataLength * 0.1); // 0-10% (bass)
  const midEnd = Math.floor(dataLength * 0.4); // 10-40% (mids)
  const highEnd = Math.floor(dataLength * 0.7); // 40-70% (highs)
  // 70-100% (ultra high)

  let lowSum = 0, midSum = 0, highSum = 0, ultraSum = 0;

  for (let i = 0; i < dataLength; i++) {
    const value = (frequencyData[i] ?? 0) / 255; // Normalize

    if (i < lowEnd) lowSum += value;
    else if (i < midEnd) midSum += value;
    else if (i < highEnd) highSum += value;
    else ultraSum += value;
  }

  return {
    low: lowSum / lowEnd,
    mid: midSum / (midEnd - lowEnd),
    high: highSum / (highEnd - midEnd),
    ultra: ultraSum / (dataLength - highEnd),
  };
}

/**
 * Animate the blob mesh based on audio frequency data
 * Creates a liquid, speaking effect that reacts naturally to sound frequencies
 */
export function animateBlob(
  mesh: Mesh,
  frequencyData: Uint8Array<ArrayBuffer>,
  analyser: AnalyserNode,
  spikeX: number,
  spikeY: number,
  spikeZ: number,
  timeX: number,
  timeY: number,
  timeZ: number,
  baseScale: number = 1.0,
  touchPoints: Array<{
    position: Vector3;
    strength: number;
    startTime: number;
    duration: number;
  }> = [],
  listeningBlend: number = 0,  // 0 to 1 transition
  thinkingBlend: number = 0,   // 0 to 1 transition
  thinkingProgress: number = 0,
  audioEffects: {
    bassSpike: number;
    midSpike: number;
    highSpike: number;
    midTime: number;
    highTime: number;
    ultraTime: number;
    enabled: boolean;
    timeEnabled: boolean;
  } = {
    bassSpike: 0.35,
    midSpike: 0.30,
    highSpike: 0.25,
    midTime: 0.2,
    highTime: 0.3,
    ultraTime: 0.15,
    enabled: true,
    timeEnabled: false
  },
): void {
  const positions = mesh.geometry.attributes.position;
  if (!positions) return;

  const vertex = new Vector3();

  // Previous displacement buffer for viscous smoothing
  let previousDisplacements = previousDisplacementMap.get(mesh);
  if (!previousDisplacements || previousDisplacements.length !== positions.count) {
    previousDisplacements = new Float32Array(positions.count);
    previousDisplacements.fill(1);
    previousDisplacementMap.set(mesh, previousDisplacements);
  }

  // Get frequency data
  analyser.getByteFrequencyData(frequencyData);

  // Extract frequency bands for natural sound reaction
  const bands = getFrequencyBands(frequencyData);

  // Smooth frequency bands for viscous response
  const audioSmoothFactor = 0.15;
  audioSmoothing.low += (bands.low - audioSmoothing.low) * audioSmoothFactor;
  audioSmoothing.mid += (bands.mid - audioSmoothing.mid) * audioSmoothFactor;
  audioSmoothing.high += (bands.high - audioSmoothing.high) * audioSmoothFactor;

  const smoothBands = {
    low: audioSmoothing.low,
    mid: audioSmoothing.mid,
    high: audioSmoothing.high,
  };
  
  // Time calculation - smooth animation
  const reduction = 0.00003;
  const perf = performance.now() * reduction;
  
  // Optionally modulate time with audio (can create chaotic effects if too strong)
  const audioTimeMod = (audioEffects.enabled && audioEffects.timeEnabled)
    ? 1 + (
        smoothBands.mid * audioEffects.midTime
        + smoothBands.high * audioEffects.highTime
        + bands.ultra * audioEffects.ultraTime
      )
    : 1;
  
  const tX = perf * timeX * audioTimeMod;
  const tY = perf * timeY * audioTimeMod;
  const tZ = perf * timeZ * audioTimeMod;

  // Gentle breathing based on bass frequencies
  const breathScale = 1 + smoothBands.low * 0.05;
  const finalScale = baseScale * breathScale;
  mesh.scale.set(finalScale, finalScale, finalScale);

  // Calculate noise frequencies for smooth, organic movement
  const baseFreqX = Math.max(0.025, spikeX);
  const baseFreqY = Math.max(0.025, spikeY);
  const baseFreqZ = Math.max(0.025, spikeZ);

  // Apply frequency-reactive noise to each vertex
  for (let i = 0; i < positions.count; i++) {
    vertex.fromBufferAttribute(positions, i);
    
    // Get the spherical direction from vertex position
    const direction = vertex.clone().normalize();

    // Calculate vertex position factors
    const heightFactor = (direction.y + 1) * 0.5; // 0 at bottom, 1 at top
    const radialFactor = Math.sqrt(
      direction.x * direction.x + direction.z * direction.z,
    );
    const angleFactor = Math.atan2(direction.z, direction.x) / Math.PI;

    // Audio enhances the natural noise amplitude instead of adding separate effects
    // This creates a more organic, liquid response to sound
    
    // Calculate audio-reactive amplitude multiplier (smooth and natural)
    const weightedAudioEnergy
      = smoothBands.low * audioEffects.bassSpike
      + smoothBands.mid * audioEffects.midSpike
      + smoothBands.high * audioEffects.highSpike;

    const audioIntensity = audioEffects.enabled
      ? 1 + Math.min(2.5, weightedAudioEnergy * 2.2)
      : 1;

    // Generate multi-layered noise for liquid texture (smoother)
    const noise1 = noise3D(
      direction.x * baseFreqX * 0.5 + tX,
      direction.y * baseFreqY * 0.5 + tY,
      direction.z * baseFreqZ * 0.5 + tZ,
    );

    // Second noise layer for detail (slower, gentler)
    const noise2 = noise3D(
      direction.x * baseFreqX * 1.2 + tX * 1.2,
      direction.y * baseFreqY * 1.2 + tY * 1.2,
      direction.z * baseFreqZ * 1.2 + tZ * 1.2,
    );

    // Third noise layer for even smoother transitions
    const noise3 = noise3D(
      direction.x * baseFreqX * 0.3 + tX * 0.8,
      direction.y * baseFreqY * 0.3 + tY * 0.8,
      direction.z * baseFreqZ * 0.3 + tZ * 0.8,
    );

    // Combine noises with frequency weighting (more layers for smoothness)
    const finalNoise = noise1 * 0.5 + noise2 * 0.3 + noise3 * 0.2;

    // Base amplitude enhanced by audio (creates natural, liquid response)
    const baseAmplitude = 0.18;

    // Touch interactions modulate amplitude (not direct displacement)
    let touchModulation = 0;
    if (touchPoints.length > 0) {
      const currentTime = Date.now();
      for (const touch of touchPoints) {
        const elapsed = currentTime - touch.startTime;
        const progress = elapsed / touch.duration;

        let easeFactor;
        if (progress < 0.25) {
          const t = progress / 0.25;
          easeFactor = t * t;
        } else {
          const t = (progress - 0.25) / 0.75;
          easeFactor = 1 - Math.pow(t, 3);
        }

        if (easeFactor > 0.01) {
          const dist = vertex.distanceTo(touch.position);
          const influenceRadius = 2.2;
          if (dist > influenceRadius) continue;

          const influence = Math.max(0, 1 - (dist / influenceRadius));
          const smoothInfluence = Math.pow(influence, 3);

          // Touch pulls blob inward slightly (viscous sink)
          const inwardPull = -touch.strength * 0.18 * smoothInfluence * easeFactor;

          // Gentle ripples emanating from touch point
          const wave = Math.sin(dist * 3.2 - progress * 6) * 0.10 * smoothInfluence * easeFactor;

          touchModulation += inwardPull + wave;
        }
      }

      // Clamp modulation to maintain stability
      touchModulation = Math.max(-0.35, Math.min(0.25, touchModulation));
    }

    const amplitudeFactor = Math.max(0.65, 1 + touchModulation);
    const amplitude = baseAmplitude * audioIntensity * amplitudeFactor;

    // High-frequency detail shimmer driven by treble content
    const detailNoise = audioEffects.enabled
      ? noise3D(
          direction.x * baseFreqX * 2.2 + tX * 2.4,
          direction.y * baseFreqY * 2.2 + tY * 2.4,
          direction.z * baseFreqZ * 2.2 + tZ * 2.4,
        ) * smoothBands.high * audioEffects.highSpike * 0.35
      : 0;
    
    // Calculate displacement for each state separately
    // Normal/Speaking mode displacement (outward spikes, enhanced by audio)
    const speakingDisplacement = amplitude * finalNoise + detailNoise;
    
    // Listening mode displacement (inward spikes, enhanced by audio)
    const listeningDisplacement = -amplitude * finalNoise + detailNoise * 0.6;
    
    // Thinking mode displacement (fluid, flowing movements)
    let thinkingDisplacement = 0;
    if (thinkingBlend > 0.01) {
      // Use smoother, lower frequencies for liquid motion
      const thinkNoise1 = noise3D(
        direction.x * 2 + tX * 3.5 + Math.sin(thinkingProgress * Math.PI * 2) * 1.5,
        direction.y * 2 + tY * 3.5 + Math.cos(thinkingProgress * Math.PI * 2.5) * 1.5,
        direction.z * 2 + tZ * 3.5 + Math.sin(thinkingProgress * Math.PI * 3) * 1.5,
      );
      
      const thinkNoise2 = noise3D(
        direction.x * 1 + tX * 2.5 - thinkingProgress * 3,
        direction.y * 1 + tY * 2.5 + thinkingProgress * 2.5,
        direction.z * 1 + tZ * 2.5 - thinkingProgress * 3.5,
      );
      
      const thinkNoise3 = noise3D(
        direction.x * 0.5 + tX * 1.5,
        direction.y * 0.5 + tY * 1.5,
        direction.z * 0.5 + tZ * 1.5,
      );
      
      // Smooth flowing pulse effect
      const pulse = Math.sin(thinkingProgress * Math.PI * 5) * 0.3 + 0.7;
      
      // Gradually reduce intensity as we approach the end
      const fadeOut = 1 - Math.pow(thinkingProgress, 2);
      
      // Combine for fluid thinking animation
      const thinkingNoise = (thinkNoise1 * 0.4 + thinkNoise2 * 0.35 + thinkNoise3 * 0.25) * pulse;
      thinkingDisplacement = thinkingNoise * 0.35 * fadeOut;
    }
    
    // Blend between states smoothly
    let audioDisplacement;
    
    if (thinkingBlend > 0.01) {
      // Thinking takes priority - blend from normal/listening to thinking
      const normalDisplacement = speakingDisplacement * (1 - listeningBlend) + listeningDisplacement * listeningBlend;
      audioDisplacement = normalDisplacement * (1 - thinkingBlend) + thinkingDisplacement * thinkingBlend;
    } else {
      // Blend between speaking and listening
      audioDisplacement = speakingDisplacement * (1 - listeningBlend) + listeningDisplacement * listeningBlend;
    }
    
    // Start with base displacement of 1.0 (normalized sphere)
    let displacement = 1 + audioDisplacement;
    
    // Final safety clamp and viscous smoothing
    const minDisplacement = 0.75;
    const maxDisplacement = 1.45;
    const targetDisplacement = Math.max(minDisplacement, Math.min(maxDisplacement, displacement));

    const previous = previousDisplacements[i];
    const smoothingStrength = Math.min(0.35, 0.18 + smoothBands.mid * 0.12 + smoothBands.low * 0.08);
    const smoothedDisplacement = previous + (targetDisplacement - previous) * smoothingStrength;
    previousDisplacements[i] = smoothedDisplacement;

    // Set final position: direction * displacement
    vertex.normalize().multiplyScalar(smoothedDisplacement);
    positions.setXYZ(i, vertex.x, vertex.y, vertex.z);
  }

  positions.needsUpdate = true;
  mesh.geometry.computeVertexNormals();
}
