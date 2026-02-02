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
 * GLSL noise functions for procedural heightmap and displacement
 */
const noiseGLSL = /* glsl */ `
// Simplex 3D Noise by Ian McEwan, Ashima Arts
vec4 permute(vec4 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) { 
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);

  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);

  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;

  i = mod(i, 289.0);
  vec4 p = permute(permute(permute(
      i.z + vec4(0.0, i1.z, i2.z, 1.0))
    + i.y + vec4(0.0, i1.y, i2.y, 1.0))
    + i.x + vec4(0.0, i1.x, i2.x, 1.0));

  float n_ = 1.0/7.0;
  vec3 ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);

  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);

  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;

  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);

  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}

// Fractal Brownian Motion for more detailed noise
float fbm(vec3 p, float scale, int octaves) {
  float value = 0.0;
  float amplitude = 0.5;
  float frequency = scale;
  
  for (int i = 0; i < 6; i++) {
    if (i >= octaves) break;
    value += amplitude * snoise(p * frequency);
    frequency *= 2.0;
    amplitude *= 0.5;
  }
  
  return value;
}
`

/**
 * GLSL raymarching function for the magical marble effect
 */
const raymarchGLSL = /* glsl */ `
/**
 * Generate a procedural heightmap value at a given direction
 */
float getHeightmap(vec3 dir, float scale, float time) {
  // Add some time-based movement to the noise
  vec3 animatedDir = dir;
  animatedDir.y += time * 0.05;
  
  // Use FBM for detailed noise
  float noise = fbm(animatedDir, scale, 4);
  
  // Normalize to 0-1 range
  return noise * 0.5 + 0.5;
}

/**
 * Generate displacement vector for wavy animation
 */
vec3 getDisplacement(vec3 dir, float time, float strength) {
  // Two layers of noise scrolling in opposite directions
  vec3 scroll1 = vec3(time, 0.0, 0.0);
  vec3 scroll2 = vec3(-time, 0.0, 0.0);
  
  vec3 disp1 = vec3(
    snoise(dir * 2.0 + scroll1),
    snoise(dir * 2.0 + scroll1 + vec3(17.0)),
    snoise(dir * 2.0 + scroll1 + vec3(31.0))
  );
  
  vec3 disp2 = vec3(
    snoise(dir * 2.0 * vec3(1.0, -1.0, 1.0) + scroll2),
    snoise(dir * 2.0 * vec3(1.0, -1.0, 1.0) + scroll2 + vec3(17.0)),
    snoise(dir * 2.0 * vec3(1.0, -1.0, 1.0) + scroll2 + vec3(31.0))
  );
  
  return (disp1 + disp2) * strength;
}

/**
 * Raymarch through the marble volume
 * Returns the accumulated color
 */
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
  float perIteration = 1.0 / iterations;
  vec3 deltaRay = rayDir * perIteration * depth;
  
  // Audio-reactive displacement boost
  float audioDispBoost = 1.0 + bassLevel * audioReactivity * 0.5;
  float actualDispStrength = dispStrength * audioDispBoost;
  
  // Thinking mode: increase turbulence
  float thinkingBoost = 1.0 + thinkingTransition * 0.5;
  actualDispStrength *= thinkingBoost;
  
  // Listening mode: subtle pulse
  float listeningPulse = 1.0 + sin(time * 3.0) * 0.1 * listeningTransition;
  
  // Start at surface and accumulate volume
  vec3 p = rayOrigin;
  float totalVolume = 0.0;
  float animatedTime = time * dispSpeed;
  
  for (float i = 0.0; i < 64.0; i++) {
    if (i >= iterations) break;
    
    // Get displacement for wavy effect
    vec3 displaced = p + getDisplacement(normalize(p), animatedTime, actualDispStrength);
    
    // Get heightmap value at displaced position
    float heightMapVal = getHeightmap(normalize(displaced), noiseScale, time * 0.1);
    
    // Audio boost to heightmap
    heightMapVal = heightMapVal + midLevel * audioReactivity * 0.2;
    
    // Take a slice based on depth
    float currentHeight = length(p);
    float cutoff = 1.0 - i * perIteration;
    float slice = smoothstep(cutoff, cutoff + smoothingFactor, heightMapVal);
    
    // Accumulate with listening pulse
    totalVolume += slice * perIteration * listeningPulse;
    
    // March forward
    p += deltaRay;
  }
  
  // HDR color mixing for richer gradients
  // Boost colors slightly above 1.0 for HDR effect
  vec3 hdrColorA = colorA * (1.0 + highLevel * audioReactivity * 0.3);
  vec3 hdrColorB = colorB * (1.2 + midLevel * audioReactivity * 0.2);
  
  // Mix colors based on volume
  vec3 color = mix(hdrColorA, hdrColorB, clamp(totalVolume * 2.0, 0.0, 1.0));
  
  // Apply tone mapping to bring HDR back to displayable range
  // Simple Reinhard tone mapping
  color = color / (1.0 + color);
  
  return color;
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
