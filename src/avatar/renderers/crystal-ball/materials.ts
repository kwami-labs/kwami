import {
  MeshStandardMaterial,
  Color,
} from 'three'

/**
 * Uniforms for the crystal ball shader
 */
export interface CrystalBallUniforms {
  uTime: { value: number }
  uColorA: { value: Color }
  uColorB: { value: Color }
  uIterations: { value: number }
  uDepth: { value: number }
  uSmoothing: { value: number }
  uNoiseScale: { value: number }
  uDisplacementSpeed: { value: number }
  uDisplacementStrength: { value: number }
  uPulseSpeed: { value: number }
  uPulseIntensity: { value: number }
  uBassLevel: { value: number }
  uMidLevel: { value: number }
  uHighLevel: { value: number }
  uAudioReactivity: { value: number }
  uListeningTransition: { value: number }
  uThinkingTransition: { value: number }
}

/**
 * Create uniforms for the crystal ball
 */
export function createCrystalBallUniforms(
  colorA: string,
  colorB: string,
  iterations: number,
  depth: number,
  smoothing: number,
  noiseScale: number,
  displacementSpeed: number,
  displacementStrength: number,
  pulseSpeed: number,
  pulseIntensity: number,
): CrystalBallUniforms {
  return {
    uTime: { value: 0 },
    uColorA: { value: new Color(colorA) },
    uColorB: { value: new Color(colorB) },
    uIterations: { value: iterations },
    uDepth: { value: depth },
    uSmoothing: { value: smoothing },
    uNoiseScale: { value: noiseScale },
    uDisplacementSpeed: { value: displacementSpeed },
    uDisplacementStrength: { value: displacementStrength },
    uPulseSpeed: { value: pulseSpeed },
    uPulseIntensity: { value: pulseIntensity },
    uBassLevel: { value: 0 },
    uMidLevel: { value: 0 },
    uHighLevel: { value: 0 },
    uAudioReactivity: { value: 1.0 },
    uListeningTransition: { value: 0 },
    uThinkingTransition: { value: 0 },
  }
}

/**
 * GLSL noise - ultra simple for maximum performance
 */
const noiseGLSL = /* glsl */ `
// Super fast hash noise - single function
float hash(vec3 p) {
  p = fract(p * 0.3183099 + 0.1);
  p *= 17.0;
  return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}

// Simple smooth noise - very fast
float noise(vec3 p) {
  vec3 i = floor(p);
  vec3 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  
  return mix(
    mix(mix(hash(i), hash(i + vec3(1,0,0)), f.x),
        mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
    mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x),
        mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y), f.z);
}
`

/**
 * GLSL raymarching - ultra optimized for smooth 60fps
 */
const raymarchGLSL = /* glsl */ `
vec3 marchMarble(
  vec3 rayOrigin,
  vec3 rayDir,
  float time,
  float iterations,
  float depth,
  float smoothingFactor,
  float noiseScale,
  float dispSpeed,
  float dispStrength,
  vec3 colorA,
  vec3 colorB,
  float bassLevel,
  float midLevel,
  float highLevel,
  float audioReactivity,
  float listeningTransition,
  float thinkingTransition
) {
  // Pre-compute everything possible
  float invIter = 1.0 / iterations;
  vec3 deltaRay = rayDir * invIter * depth;
  float animTime = time * dispSpeed;
  float audioBass = bassLevel * audioReactivity;
  float audioMid = midLevel * audioReactivity;
  
  vec3 p = rayOrigin;
  float totalVolume = 0.0;
  
  // Ultra simple loop - just 16 iterations default
  for (float i = 0.0; i < 32.0; i++) {
    if (i >= iterations) break;
    
    // Simple animated sample position
    vec3 sp = p * noiseScale;
    sp.x += sin(animTime + p.y * 3.0) * dispStrength;
    sp.y += sin(animTime * 1.3 + p.z * 3.0) * dispStrength;
    sp.z += animTime * 0.5;
    
    // Single noise sample
    float h = noise(sp) + audioBass * 0.2;
    
    // Accumulate
    float cutoff = 1.0 - i * invIter;
    totalVolume += smoothstep(cutoff, cutoff + smoothingFactor, h) * invIter;
    
    p += deltaRay;
  }
  
  // Color mix
  vec3 cA = colorA * (1.0 + audioMid * 0.15);
  vec3 cB = colorB * 1.1;
  vec3 color = mix(cA, cB, clamp(totalVolume * 2.0, 0.0, 1.0));
  
  return color / (1.0 + color);
}
`

/**
 * Create the crystal ball material with custom shader injection
 */
export function createCrystalBallMaterial(
  uniforms: CrystalBallUniforms,
  roughness: number = 0.1,
  metalness: number = 0.0,
  envMapIntensity: number = 0.8,
): MeshStandardMaterial {
  const material = new MeshStandardMaterial({
    roughness,
    metalness,
    envMapIntensity,
    transparent: true,
    opacity: 1.0,
  })

  // Hook into the shader compilation
  material.onBeforeCompile = (shader: any) => {
    // Add our uniforms to the shader
    shader.uniforms.uTime = uniforms.uTime
    shader.uniforms.uColorA = uniforms.uColorA
    shader.uniforms.uColorB = uniforms.uColorB
    shader.uniforms.uIterations = uniforms.uIterations
    shader.uniforms.uDepth = uniforms.uDepth
    shader.uniforms.uSmoothing = uniforms.uSmoothing
    shader.uniforms.uNoiseScale = uniforms.uNoiseScale
    shader.uniforms.uDisplacementSpeed = uniforms.uDisplacementSpeed
    shader.uniforms.uDisplacementStrength = uniforms.uDisplacementStrength
    shader.uniforms.uPulseSpeed = uniforms.uPulseSpeed
    shader.uniforms.uPulseIntensity = uniforms.uPulseIntensity
    shader.uniforms.uBassLevel = uniforms.uBassLevel
    shader.uniforms.uMidLevel = uniforms.uMidLevel
    shader.uniforms.uHighLevel = uniforms.uHighLevel
    shader.uniforms.uAudioReactivity = uniforms.uAudioReactivity
    shader.uniforms.uListeningTransition = uniforms.uListeningTransition
    shader.uniforms.uThinkingTransition = uniforms.uThinkingTransition

    // Add varying for object-space position in vertex shader
    shader.vertexShader = shader.vertexShader.replace(
      '#include <common>',
      /* glsl */ `
        #include <common>
        varying vec3 vObjectPosition;
      `
    )

    // Set the object-space position in vertex shader
    shader.vertexShader = shader.vertexShader.replace(
      '#include <begin_vertex>',
      /* glsl */ `
        #include <begin_vertex>
        vObjectPosition = position;
      `
    )

    // Add uniform and varying declarations to fragment shader
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <common>',
      /* glsl */ `
        #include <common>
        
        varying vec3 vObjectPosition;
        
        uniform float uTime;
        uniform vec3 uColorA;
        uniform vec3 uColorB;
        uniform float uIterations;
        uniform float uDepth;
        uniform float uSmoothing;
        uniform float uNoiseScale;
        uniform float uDisplacementSpeed;
        uniform float uDisplacementStrength;
        uniform float uPulseSpeed;
        uniform float uPulseIntensity;
        uniform float uBassLevel;
        uniform float uMidLevel;
        uniform float uHighLevel;
        uniform float uAudioReactivity;
        uniform float uListeningTransition;
        uniform float uThinkingTransition;
        
        ${noiseGLSL}
        ${raymarchGLSL}
      `
    )

    // Replace the diffuse color calculation with our raymarching result
    shader.fragmentShader = shader.fragmentShader.replace(
      'vec4 diffuseColor = vec4( diffuse, opacity );',
      /* glsl */ `
        // Use object-space position for raymarching (so interior rotates with mesh)
        vec3 objectPos = normalize(vObjectPosition);
        
        // Get view-space normal for fresnel calculation
        vec3 viewNormal = normalize(vNormal);
        vec3 viewDir = normalize(-vViewPosition);
        
        // Ray origin is the object-space surface position (normalized to unit sphere)
        vec3 rayOrigin = objectPos;
        
        // Ray direction: we march inward from the surface in object space
        // Using negative object position gives us the direction toward center
        vec3 rayDir = -objectPos;
        
        // Apply pulse breathing effect
        float pulse = sin(uTime * uPulseSpeed) * uPulseIntensity;
        rayOrigin *= (1.0 + pulse);
        
        // Perform raymarching to get the magical marble color
        vec3 marbleColor = marchMarble(
          rayOrigin,
          rayDir,
          uTime,
          uIterations,
          uDepth,
          uSmoothing,
          uNoiseScale,
          uDisplacementSpeed,
          uDisplacementStrength,
          uColorA,
          uColorB,
          uBassLevel,
          uMidLevel,
          uHighLevel,
          uAudioReactivity,
          uListeningTransition,
          uThinkingTransition
        );
        
        // Add subtle fresnel glow at edges (using view-space for proper lighting)
        float fresnel = pow(1.0 - abs(dot(viewDir, viewNormal)), 3.0);
        vec3 glowColor = mix(uColorA, uColorB, 0.5) * fresnel * 0.5;
        glowColor *= (1.0 + uHighLevel * uAudioReactivity * 0.5);
        
        // Combine marble color with fresnel glow
        vec3 finalColor = marbleColor + glowColor;
        
        vec4 diffuseColor = vec4(finalColor, opacity);
      `
    )

      // Store the shader reference for later updates
      ; (material as unknown as { userData: { shader: any } }).userData = {
        shader,
      }
  }

  return material
}

/**
 * Update material uniforms
 */
export function updateMaterialUniforms(
  uniforms: CrystalBallUniforms,
  time: number,
  bassLevel: number,
  midLevel: number,
  highLevel: number,
  listeningTransition: number,
  thinkingTransition: number,
): void {
  uniforms.uTime.value = time
  uniforms.uBassLevel.value = bassLevel
  uniforms.uMidLevel.value = midLevel
  uniforms.uHighLevel.value = highLevel
  uniforms.uListeningTransition.value = listeningTransition
  uniforms.uThinkingTransition.value = thinkingTransition
}
