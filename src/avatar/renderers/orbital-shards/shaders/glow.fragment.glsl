// Crystal Glow Fragment Shader
// Creates soft volumetric glow

uniform vec3 uGlowColor;
uniform float uGlowIntensity;
uniform float uTime;
uniform float uHighLevel;
uniform float uAudioReactivity;

varying vec3 vNormal;
varying vec3 vWorldPosition;
varying float vIntensity;

void main() {
  // Base glow color with intensity falloff
  vec3 glow = uGlowColor * vIntensity * uGlowIntensity;
  
  // Animated shimmer
  float shimmer = sin(uTime * 3.0 + vWorldPosition.y * 5.0) * 0.5 + 0.5;
  glow *= 0.8 + shimmer * 0.2;
  
  // Audio boost
  float boost = 1.0 + uHighLevel * 0.5 * uAudioReactivity;
  glow *= boost;
  
  // Soft alpha falloff
  float alpha = vIntensity * 0.6 * uGlowIntensity;
  alpha *= boost;
  
  gl_FragColor = vec4(glow, alpha);
}
