uniform vec3 uColor;
uniform vec3 uGlowColor;
uniform float uOpacity;
uniform float uGlowIntensity;
uniform float uSharpness;
uniform float uTime;
uniform float uAudioLevel;

varying float vBrightness;
varying float vDistanceFromCenter;
varying float vAudioLevel;

void main() {
  // Calculate distance from center of point sprite
  vec2 center = gl_PointCoord - vec2(0.5);
  float dist = length(center);
  
  // Adjustable sharpness: higher = sharper edges
  // sharpness 0 = very soft (0.0 to 0.5 smoothstep)
  // sharpness 1 = very sharp (0.4 to 0.5 smoothstep)
  float innerEdge = mix(0.0, 0.4, uSharpness);
  float outerEdge = 0.5;
  
  // Circular falloff with adjustable sharpness
  float alpha = 1.0 - smoothstep(innerEdge, outerEdge, dist);
  
  // Discard fully transparent pixels
  if (alpha < 0.01) discard;
  
  // Core brightness - sharper core
  float coreEdge = mix(0.0, 0.15, uSharpness);
  float core = 1.0 - smoothstep(0.0, mix(0.25, coreEdge, uSharpness), dist);
  
  // Glow effect - exponential falloff
  float glow = exp(-dist * (3.0 + uSharpness * 2.0)) * uGlowIntensity;
  
  // Audio reactivity affects brightness significantly
  float audioBoost = 1.0 + vAudioLevel * 0.8;
  float audioPulse = 1.0 + vAudioLevel * 0.3 * sin(uTime * 8.0 + vDistanceFromCenter);
  
  // Combine colors
  vec3 coreColor = uColor * vBrightness * audioBoost * audioPulse;
  vec3 glowPart = uGlowColor * glow * (1.0 + vAudioLevel * 0.5);
  vec3 finalColor = coreColor * core + glowPart;
  
  // Subtle shimmer based on time and position
  float shimmer = 0.95 + 0.05 * sin(uTime * 3.0 + vDistanceFromCenter * 2.0);
  finalColor *= shimmer;
  
  // Final alpha with opacity
  float finalAlpha = alpha * uOpacity;
  
  gl_FragColor = vec4(finalColor, finalAlpha);
}
