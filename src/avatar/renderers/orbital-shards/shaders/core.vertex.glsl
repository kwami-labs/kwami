// Crystal Core Vertex Shader
// Creates pulsing energy core effect

uniform float uTime;
uniform float uPulseSpeed;
uniform float uBassLevel;
uniform float uAudioReactivity;

varying vec3 vNormal;
varying vec3 vPosition;
varying vec3 vWorldPosition;
varying float vPulse;

void main() {
  vNormal = normalize(normalMatrix * normal);
  vPosition = position;
  
  // Pulse effect - core breathes with time and audio
  float basePulse = sin(uTime * uPulseSpeed) * 0.5 + 0.5;
  float audioPulse = uBassLevel * uAudioReactivity;
  vPulse = basePulse * 0.1 + audioPulse * 0.15;
  
  // Apply pulse displacement
  vec3 newPosition = position * (1.0 + vPulse);
  
  // Calculate world position
  vec4 worldPos = modelMatrix * vec4(newPosition, 1.0);
  vWorldPosition = worldPos.xyz;
  
  gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
}
