// Crystal Core Fragment Shader  
// Creates glowing energy core with plasma/nebula effects

uniform float uTime;
uniform vec3 uInnerColor;
uniform vec3 uOuterColor;
uniform float uGlowIntensity;
uniform float uHighLevel;
uniform float uMidLevel;
uniform float uAudioReactivity;

varying vec3 vNormal;
varying vec3 vPosition;
varying vec3 vWorldPosition;
varying float vPulse;

// Simplex noise for plasma effect
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  
  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  
  i = mod289(i);
  vec4 p = permute(permute(permute(
    i.z + vec4(0.0, i1.z, i2.z, 1.0))
    + i.y + vec4(0.0, i1.y, i2.y, 1.0))
    + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  
  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
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

void main() {
  vec3 viewDir = normalize(cameraPosition - vWorldPosition);
  vec3 normal = normalize(vNormal);
  
  // Fresnel for edge glow
  float fresnel = pow(1.0 - abs(dot(viewDir, normal)), 3.0);
  
  // Animated plasma noise
  vec3 noisePos = vPosition * 2.0 + uTime * 0.5;
  float noise = snoise(noisePos) * 0.5 + 0.5;
  
  // Second layer of noise for complexity
  float noise2 = snoise(noisePos * 2.0 - uTime * 0.3) * 0.5 + 0.5;
  
  // Combine noises
  float plasma = mix(noise, noise2, 0.5 + uMidLevel * 0.3);
  
  // Audio-reactive color mixing
  float colorMix = plasma * (0.5 + uHighLevel * 0.5 * uAudioReactivity);
  vec3 coreColor = mix(uInnerColor, uOuterColor, colorMix);
  
  // Add energy veins effect
  float veins = pow(abs(sin(vPosition.y * 10.0 + uTime * 2.0)), 8.0);
  coreColor += uOuterColor * veins * 0.3 * uAudioReactivity;
  
  // Glow intensity based on audio
  float glowMult = uGlowIntensity * (1.0 + vPulse * 2.0);
  glowMult *= 1.0 + uHighLevel * 0.5 * uAudioReactivity;
  
  // Final color with fresnel edge
  vec3 finalColor = coreColor * glowMult;
  finalColor += uOuterColor * fresnel * 1.5;
  
  // Alpha based on depth and fresnel
  float alpha = 0.85 + fresnel * 0.15;
  
  gl_FragColor = vec4(finalColor, alpha);
}
