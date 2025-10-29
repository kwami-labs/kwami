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
): void {
  // Time calculation - faster for more responsive animation
  const reduction = 0.00003;
  const perf = performance.now() * reduction;
  const tX = perf * timeX;
  const tY = perf * timeY;
  const tZ = perf * timeZ;

  const positions = mesh.geometry.attributes.position;
  if (!positions) return;

  const vertex = new Vector3();

  // Get frequency data
  analyser.getByteFrequencyData(frequencyData);

  // Extract frequency bands for natural sound reaction
  const bands = getFrequencyBands(frequencyData);

  // Very subtle overall scale based only on low frequencies (bass)
  // This creates a "breathing" effect without dominating the animation
  const breathScale = 1 + (bands.low * 0.08);
  // Apply user's base scale as a multiplier
  const finalScale = baseScale * breathScale;
  mesh.scale.set(finalScale, finalScale, finalScale);

  // Calculate noise frequencies for smooth, organic movement
  const baseFreqX = Math.max(0.025, spikeX);
  const baseFreqY = Math.max(0.025, spikeY);
  const baseFreqZ = Math.max(0.025, spikeZ);

  // Apply frequency-reactive noise to each vertex
  for (let i = 0; i < positions.count; i++) {
    vertex.fromBufferAttribute(positions, i);

    // Normalize to get the direction
    const direction = vertex.clone().normalize();

    // Calculate vertex position factors
    const heightFactor = (direction.y + 1) * 0.5; // 0 at bottom, 1 at top
    const radialFactor = Math.sqrt(
      direction.x * direction.x + direction.z * direction.z,
    );
    const angleFactor = Math.atan2(direction.z, direction.x) / Math.PI;

    // Map frequency bands to different parts of the blob for liquid effect
    // Low frequencies (bass) - affect bottom/center more (creates pulsing waves)
    const lowInfluence = (1 - heightFactor * 0.5) * bands.low * 1.2;

    // Mid frequencies - affect middle regions and create "speaking" motion (more varied)
    const midInfluence
      = (0.5 + Math.sin(angleFactor * 6 + tY * 2) * 0.5) * bands.mid * 1.5;

    // High frequencies - affect top and create detail/texture (more reactive)
    const highInfluence = (heightFactor * 0.7 + 0.3) * bands.high * 1.3;

    // Ultra high - create surface ripples (more varied patterns)
    const ultraInfluence = bands.ultra * (radialFactor * 0.8 + Math.sin(angleFactor * 8 + tZ * 2) * 0.3);

    // Combine all influences for natural, varied amplitude (more dynamic)
    const combinedAmplitude = 0.2
      + lowInfluence * 0.5
      + midInfluence * 0.65
      + highInfluence * 0.45
      + ultraInfluence * 0.25;

    // Add frequency-modulated time offset for more dynamic movement
    const timeOffset = bands.mid * 2 + bands.high * 3;

    // Generate multi-layered noise for liquid texture (smoother)
    const noise1 = noise3D(
      direction.x * baseFreqX * 0.5 + tX + timeOffset,
      direction.y * baseFreqY * 0.5 + tY + timeOffset * 0.5,
      direction.z * baseFreqZ * 0.5 + tZ + timeOffset * 0.3,
    );

    // Second noise layer for detail (slower, gentler)
    const noise2 = noise3D(
      direction.x * baseFreqX * 1.2 + tX * 1.2 + bands.high * 3,
      direction.y * baseFreqY * 1.2 + tY * 1.2 + bands.mid * 2,
      direction.z * baseFreqZ * 1.2 + tZ * 1.2 + bands.ultra * 3,
    );

    // Third noise layer for even smoother transitions
    const noise3 = noise3D(
      direction.x * baseFreqX * 0.3 + tX * 0.8,
      direction.y * baseFreqY * 0.3 + tY * 0.8,
      direction.z * baseFreqZ * 0.3 + tZ * 0.8,
    );

    // Combine noises with frequency weighting (more layers for smoothness)
    const finalNoise = noise1 * 0.5 + noise2 * 0.3 + noise3 * 0.2;

    // Calculate displacement for each state separately
    // Normal/Speaking mode displacement (outward spikes)
    const speakingDisplacement = combinedAmplitude * finalNoise;
    
    // Listening mode displacement (inward spikes)
    const listeningDisplacement = -combinedAmplitude * finalNoise;
    
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
    // When thinking, blend between speaking/listening and thinking
    // When not thinking, blend between speaking and listening
    let audioDisplacement;
    
    if (thinkingBlend > 0.01) {
      // Thinking takes priority - blend from normal/listening to thinking
      const normalDisplacement = speakingDisplacement * (1 - listeningBlend) + listeningDisplacement * listeningBlend;
      audioDisplacement = normalDisplacement * (1 - thinkingBlend) + thinkingDisplacement * thinkingBlend;
    } else {
      // Blend between speaking and listening
      audioDisplacement = speakingDisplacement * (1 - listeningBlend) + listeningDisplacement * listeningBlend;
    }
    
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
          
          // Smooth gaussian falloff - reduced power for wider spread
          const smoothInfluence = Math.pow(influence, 3);
          
          // Stronger inward push for more intensity
          const touchEffect = -touch.strength * 0.9 * smoothInfluence * easeFactor;
          
          // More pronounced liquid wave with spike-like ripples
          const waveFreq = 4; // Higher frequency for more defined waves
          const wave = Math.cos(dist * waveFreq - progress * 5) * 0.5 + 0.5;
          const subtleWave = -wave * 0.35 * smoothInfluence * easeFactor;
          
          // Accumulate touch effects
          totalTouchEffect += touchEffect + subtleWave;
        }
      }
      
      // Clamp total touch effect to prevent over-collapse
      // Maximum inward displacement is -0.45 (45% of radius) for more dramatic effect
      totalTouchEffect = Math.max(totalTouchEffect, -0.45);
      
      // Apply clamped touch effect
      displacement += totalTouchEffect;
    }
    
    // Final safety clamp: ensure displacement never causes collapse or extreme spikes
    // Keep blob between 50% and 150% of its base size at any vertex
    displacement = Math.max(0.5, Math.min(1.5, displacement));

    vertex.normalize().multiplyScalar(displacement);
    positions.setXYZ(i, vertex.x, vertex.y, vertex.z);
  }

  positions.needsUpdate = true;
  mesh.geometry.computeVertexNormals();
}
