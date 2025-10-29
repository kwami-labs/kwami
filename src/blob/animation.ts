import { createNoise3D } from 'simplex-noise';
import { type Mesh, Vector3 } from 'three';

const noise3D = createNoise3D();

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
    bassSpike: 0.3,
    midSpike: 0.4,
    highSpike: 0.2,
    midTime: 0.2,
    highTime: 0.3,
    ultraTime: 0.15,
    enabled: true,
    timeEnabled: true
  },
): void {
  const positions = mesh.geometry.attributes.position;
  if (!positions) return;

  const vertex = new Vector3();

  // Get frequency data
  analyser.getByteFrequencyData(frequencyData);

  // Extract frequency bands for natural sound reaction
  const bands = getFrequencyBands(frequencyData);
  
  // Time calculation - smooth animation
  const reduction = 0.00003;
  const perf = performance.now() * reduction;
  
  // Optionally modulate time with audio (can create chaotic effects if too strong)
  const audioTimeMod = (audioEffects.enabled && audioEffects.timeEnabled)
    ? 1 + (bands.mid * audioEffects.midTime + bands.high * audioEffects.highTime + bands.ultra * audioEffects.ultraTime)
    : 1;
  
  const tX = perf * timeX * audioTimeMod;
  const tY = perf * timeY * audioTimeMod;
  const tZ = perf * timeZ * audioTimeMod;

  // No overall scale change from audio - keep mesh size constant
  mesh.scale.set(baseScale, baseScale, baseScale);

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
    const audioIntensity = audioEffects.enabled
      ? 1 + (
          bands.low * audioEffects.bassSpike * 0.8 +      // Bass creates overall energy
          bands.mid * audioEffects.midSpike * 0.6 +       // Mids add movement
          bands.high * audioEffects.highSpike * 0.4       // Highs add detail
        )
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
    const baseAmplitude = 0.15;
    const amplitude = baseAmplitude * audioIntensity;
    
    // Calculate displacement for each state separately
    // Normal/Speaking mode displacement (outward spikes, enhanced by audio)
    const speakingDisplacement = amplitude * finalNoise;
    
    // Listening mode displacement (inward spikes, enhanced by audio)
    const listeningDisplacement = -amplitude * finalNoise;
    
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

    // Apply touch/click effects
    if (touchPoints.length > 0) {
      const currentTime = Date.now();
      let totalTouchEffect = 0;
      
      for (const touch of touchPoints) {
        // Calculate elapsed time since touch started
        const elapsed = currentTime - touch.startTime;
        const progress = elapsed / touch.duration;
        
        // Fast ease-in-out curve for quicker recovery
        let easeFactor;
        if (progress < 0.25) {
          // Quick ease-in (first 25%)
          const t = progress / 0.25;
          easeFactor = t * t; // Quadratic ease-in
        } else {
          // Fast ease-out (last 75%)
          const t = (progress - 0.25) / 0.75;
          // Cubic ease-out for faster return to normal
          easeFactor = 1 - Math.pow(t, 3);
        }
        
        if (easeFactor > 0.01) { // Skip very small values
          // Calculate distance from touch point to current vertex
          const dist = vertex.distanceTo(touch.position);
          
          // Larger influence radius for gentler gradients
          const influenceRadius = 2.2;
          
          // Skip vertices too far away
          if (dist > influenceRadius) continue;
          
          const influence = Math.max(0, 1 - (dist / influenceRadius));
          
          // Smooth gaussian falloff
          const smoothInfluence = Math.pow(influence, 3);
          
          // Very gentle inward push (must work safely with audio effects)
          const touchEffect = -touch.strength * 0.25 * smoothInfluence * easeFactor;
          
          // Subtle liquid wave with spike-like ripples
          const waveFreq = 4; // Higher frequency for more defined waves
          const wave = Math.cos(dist * waveFreq - progress * 5) * 0.5 + 0.5;
          const subtleWave = -wave * 0.08 * smoothInfluence * easeFactor;
          
          // Accumulate touch effects
          totalTouchEffect += touchEffect + subtleWave;
        }
      }
      
      // Clamp total touch effect to prevent over-collapse
      // Maximum inward displacement is -0.15 (15% of radius) - safe with audio effects
      totalTouchEffect = Math.max(totalTouchEffect, -0.15);
      
      // Apply touch effect to displacement
      displacement += totalTouchEffect;
    }
    
    // Final safety clamp: ensure displacement never causes collapse or extreme spikes
    // Strict minimum prevents black lines, reasonable maximum allows liquid movement
    displacement = Math.max(0.75, Math.min(1.45, displacement));

    // Set final position: direction * displacement
    vertex.normalize().multiplyScalar(displacement);
    positions.setXYZ(i, vertex.x, vertex.y, vertex.z);
  }

  positions.needsUpdate = true;
  mesh.geometry.computeVertexNormals();
}
