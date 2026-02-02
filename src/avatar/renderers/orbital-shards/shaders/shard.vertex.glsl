// Crystal Shard Vertex Shader
// Creates prismatic light refraction and dynamic animation

uniform float uTime;
uniform float uAudioReactivity;
uniform float uBassLevel;
uniform float uMidLevel;
uniform float uHighLevel;

varying vec3 vNormal;
varying vec3 vPosition;
varying vec3 vWorldPosition;
varying vec2 vUv;
varying float vFresnel;

void main() {
  vNormal = normalize(normalMatrix * normal);
  vPosition = position;
  vUv = uv;
  
  // Calculate world position for lighting
  vec4 worldPos = modelMatrix * vec4(position, 1.0);
  vWorldPosition = worldPos.xyz;
  
  // Audio-reactive displacement
  float displacement = 0.0;
  
  // Bass creates expansion/contraction
  displacement += sin(uTime * 2.0 + position.y * 3.0) * uBassLevel * 0.1 * uAudioReactivity;
  
  // Mids add shimmer
  displacement += sin(uTime * 5.0 + position.x * 4.0) * uMidLevel * 0.05 * uAudioReactivity;
  
  // Apply displacement along normal
  vec3 newPosition = position + normal * displacement;
  
  // Calculate fresnel for edge glow
  vec3 viewDir = normalize(cameraPosition - worldPos.xyz);
  vFresnel = pow(1.0 - abs(dot(viewDir, vNormal)), 2.0);
  
  gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
}
