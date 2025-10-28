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
    // Low frequencies (bass) - affect bottom/center more (smoother)
    const lowInfluence = (1 - heightFactor * 0.5) * bands.low;

    // Mid frequencies - affect middle regions and create "speaking" motion (less angular)
    const midInfluence
      = (0.5 + Math.sin(angleFactor * 4 + tY * 1.5) * 0.5) * bands.mid;

    // High frequencies - affect top and create detail/texture (gentler)
    const highInfluence = (heightFactor * 0.6 + 0.4) * bands.high;

    // Ultra high - create surface ripples (subtler)
    const ultraInfluence = bands.ultra * radialFactor * 0.5;

    // Combine all influences for natural, varied amplitude (deeper but smooth)
    const combinedAmplitude = 0.15
      + lowInfluence * 0.35
      + midInfluence * 0.45
      + highInfluence * 0.30
      + ultraInfluence * 0.18;

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

    // Apply displacement with natural liquid motion
    const displacement = 1 + combinedAmplitude * finalNoise;

    vertex.normalize().multiplyScalar(displacement);
    positions.setXYZ(i, vertex.x, vertex.y, vertex.z);
  }

  positions.needsUpdate = true;
  mesh.geometry.computeVertexNormals();
}
