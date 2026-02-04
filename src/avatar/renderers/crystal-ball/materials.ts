import {
  MeshStandardMaterial,
  Color,
  Texture,
} from 'three'

/**
 * Uniforms for the crystal ball shader
 * Based on: https://tympanus.net/codrops/2021/08/02/magical-marbles-in-three-js/
 */
export interface CrystalBallUniforms {
  uTime: { value: number }
  uColorA: { value: Color }
  uColorB: { value: Color }
  uIterations: { value: number }
  uDepth: { value: number }
  uSmoothing: { value: number }
  uNoiseScale: { value: number }
  uQuality: { value: number }
  uDisplacementSpeed: { value: number }
  uDisplacementStrength: { value: number }
  uHeightMap: { value: Texture | null }
  uDisplacementMap: { value: Texture | null }
  // Audio reactivity
  uBassLevel: { value: number }
  uMidLevel: { value: number }
  uHighLevel: { value: number }
  uAudioReactivity: { value: number }
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
  quality: number,
  displacementSpeed: number,
  displacementStrength: number,
  heightMap: Texture | null = null,
  displacementMap: Texture | null = null,
): CrystalBallUniforms {
  return {
    uTime: { value: 0 },
    uColorA: { value: new Color(colorA) },
    uColorB: { value: new Color(colorB) },
    uIterations: { value: iterations },
    uDepth: { value: depth },
    uSmoothing: { value: smoothing },
    uNoiseScale: { value: noiseScale },
    uQuality: { value: quality },
    uDisplacementSpeed: { value: displacementSpeed },
    uDisplacementStrength: { value: displacementStrength },
    uHeightMap: { value: heightMap },
    uDisplacementMap: { value: displacementMap },
    uBassLevel: { value: 0 },
    uMidLevel: { value: 0 },
    uHighLevel: { value: 0 },
    uAudioReactivity: { value: 1.0 },
  }
}

/**
 * Simplex 3D Noise - the key to the "magic" depth effect
 * This creates true 3D volumetric patterns, not just 2D textures
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

// Fractal Brownian Motion - quality parameter controls octaves (1-4)
float fbm(vec3 p, float scale, float quality) {
  float value = 0.0;
  float amplitude = 0.5;
  float frequency = scale;
  int octaves = int(quality);
  
  for (int i = 0; i < 4; i++) {
    if (i >= octaves) break;
    value += amplitude * snoise(p * frequency);
    frequency *= 2.0;
    amplitude *= 0.5;
  }
  
  return value;
}
`

/**
 * GLSL raymarching function - procedural noise version
 * This creates true 3D depth by computing noise in 3D space
 */
const raymarchGLSL = /* glsl */ `
// Generate procedural heightmap using 3D noise
float getHeightmap(vec3 dir, float scale, float time, float quality) {
  vec3 animatedDir = dir;
  animatedDir.y += time * 0.05;
  float noise = fbm(animatedDir, scale, quality);
  return noise * 0.5 + 0.5;
}

// Generate displacement using 3D noise
vec3 getDisplacement(vec3 dir, float time, float speed) {
  vec3 scroll1 = vec3(time * speed, 0.0, 0.0);
  vec3 scroll2 = vec3(-time * speed, 0.0, 0.0);
  
  vec3 dispA = vec3(
    snoise(dir * 2.0 + scroll1),
    snoise(dir * 2.0 + scroll1 + vec3(17.0)),
    snoise(dir * 2.0 + scroll1 + vec3(31.0))
  );
  
  vec3 dispB = vec3(
    snoise(dir * 2.0 * vec3(1.0, -1.0, 1.0) + scroll2),
    snoise(dir * 2.0 * vec3(1.0, -1.0, 1.0) + scroll2 + vec3(17.0)),
    snoise(dir * 2.0 * vec3(1.0, -1.0, 1.0) + scroll2 + vec3(31.0))
  );
  
  return dispA + dispB;
}

vec3 marchMarble(
  vec3 rayOrigin,
  vec3 rayDir,
  float time,
  float iterations,
  float depth,
  float smoothing,
  float noiseScale,
  float quality,
  float dispSpeed,
  float dispStrength,
  vec3 colorA,
  vec3 colorB
) {
  float perIteration = 1.0 / iterations;
  vec3 deltaRay = rayDir * perIteration * depth;

  vec3 p = rayOrigin;
  float totalVolume = 0.0;

  for (float i = 0.0; i < 64.0; i++) {
    if (i >= iterations) break;
    
    vec3 dir = normalize(p);
    
    // 3D displacement creates the wavy motion
    vec3 displacement = getDisplacement(dir, time, dispSpeed);
    vec3 displaced = dir + dispStrength * displacement;
    
    // 3D heightmap - THIS is what creates the depth!
    float heightMapVal = getHeightmap(normalize(displaced), noiseScale, time, quality);

    // Slicing: cutoff decreases as we go deeper
    float cutoff = 1.0 - i * perIteration;
    float slice = smoothstep(cutoff, cutoff + smoothing, heightMapVal);

    totalVolume += slice * perIteration;
    p += deltaRay;
  }
  
  return mix(colorA, colorB, totalVolume);
}
`

/**
 * Create the crystal ball material with custom shader injection
 * Following the tutorial's onBeforeCompile approach
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

  // Hook into the shader compilation (Step 1 from tutorial)
  material.onBeforeCompile = (shader) => {
    // Wire up our uniforms
    shader.uniforms.uTime = uniforms.uTime
    shader.uniforms.uColorA = uniforms.uColorA
    shader.uniforms.uColorB = uniforms.uColorB
    shader.uniforms.uIterations = uniforms.uIterations
    shader.uniforms.uDepth = uniforms.uDepth
    shader.uniforms.uSmoothing = uniforms.uSmoothing
    shader.uniforms.uNoiseScale = uniforms.uNoiseScale
    shader.uniforms.uQuality = uniforms.uQuality
    shader.uniforms.uDisplacementSpeed = uniforms.uDisplacementSpeed
    shader.uniforms.uDisplacementStrength = uniforms.uDisplacementStrength
    shader.uniforms.uBassLevel = uniforms.uBassLevel
    shader.uniforms.uMidLevel = uniforms.uMidLevel
    shader.uniforms.uHighLevel = uniforms.uHighLevel
    shader.uniforms.uAudioReactivity = uniforms.uAudioReactivity

    // Add varying for object-space position (CRITICAL for proper spherical mapping)
    shader.vertexShader = shader.vertexShader.replace(
      '#include <common>',
      /* glsl */ `
        #include <common>
        varying vec3 vObjectNormal;
      `
    )

    // Pass object-space normal (= position for unit sphere) to fragment shader
    shader.vertexShader = shader.vertexShader.replace(
      '#include <begin_vertex>',
      /* glsl */ `
        #include <begin_vertex>
        vObjectNormal = normal; // object-space normal = position direction for unit sphere
      `
    )

    // Add uniforms, noise functions, and raymarching to fragment shader
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <common>',
      /* glsl */ `
        #include <common>
        
        varying vec3 vObjectNormal;
        
        uniform float uTime;
        uniform vec3 uColorA;
        uniform vec3 uColorB;
        uniform float uIterations;
        uniform float uDepth;
        uniform float uSmoothing;
        uniform float uNoiseScale;
        uniform float uQuality;
        uniform float uDisplacementSpeed;
        uniform float uDisplacementStrength;
        uniform float uBassLevel;
        uniform float uMidLevel;
        uniform float uHighLevel;
        uniform float uAudioReactivity;
        
        ${noiseGLSL}
        ${raymarchGLSL}
      `
    )

    // Replace the diffuse color with our raymarched result
    shader.fragmentShader = shader.fragmentShader.replace(
      'vec4 diffuseColor = vec4( diffuse, opacity );',
      /* glsl */ `
        // Ray origin: surface point on unit sphere (object space)
        vec3 rayOrigin = normalize(vObjectNormal);
        
        // Ray direction: toward center of sphere
        vec3 rayDir = -rayOrigin;
        
        // Audio-reactive displacement boost
        float dispBoost = 1.0 + uBassLevel * uAudioReactivity * 0.3;
        float actualDispStrength = uDisplacementStrength * dispBoost;
        
        // Perform raymarching with procedural 3D noise
        vec3 marbleColor = marchMarble(
          rayOrigin,
          rayDir,
          uTime,
          uIterations,
          uDepth,
          uSmoothing,
          uNoiseScale,
          uQuality,
          uDisplacementSpeed,
          actualDispStrength,
          uColorA,
          uColorB
        );
        
        // Audio-reactive color boost
        marbleColor *= (1.0 + uMidLevel * uAudioReactivity * 0.2);
        
        vec4 diffuseColor = vec4(marbleColor, opacity);
      `
    )

    // Store shader reference
    ;(material as any).userData = { shader }
  }

  return material
}

/**
 * Update material uniforms
 */
export function updateMaterialUniforms(
  uniforms: CrystalBallUniforms,
  time: number,
  bassLevel: number = 0,
  midLevel: number = 0,
  highLevel: number = 0,
): void {
  uniforms.uTime.value = time
  uniforms.uBassLevel.value = bassLevel
  uniforms.uMidLevel.value = midLevel
  uniforms.uHighLevel.value = highLevel
}
