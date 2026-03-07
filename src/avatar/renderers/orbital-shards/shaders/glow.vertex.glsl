// Crystal Glow Vertex Shader
// Creates volumetric glow effect around core

uniform float uTime;
uniform float uBassLevel;
uniform float uAudioReactivity;

varying vec3 vNormal;
varying vec3 vWorldPosition;
varying float vIntensity;

void main() {
  vNormal = normalize(normalMatrix * normal);
  
  // Calculate view direction for intensity
  vec4 worldPos = modelMatrix * vec4(position, 1.0);
  vWorldPosition = worldPos.xyz;
  
  vec3 viewDir = normalize(cameraPosition - worldPos.xyz);
  
  // Fresnel-based intensity - brighter at edges
  vIntensity = pow(1.0 - abs(dot(viewDir, vNormal)), 2.0);
  
  // Audio-reactive size pulse
  float pulse = 1.0 + uBassLevel * 0.2 * uAudioReactivity;
  vec3 newPosition = position * pulse;
  
  gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
}
