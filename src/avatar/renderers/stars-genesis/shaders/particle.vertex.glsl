uniform float uTime;
uniform float uPixelRatio;
uniform float uBaseSize;
uniform float uAudioLevel;
uniform float uExplosionProgress;
uniform float uBreathingIntensity;
uniform float uBreathingSpeed;

attribute float aSize;
attribute float aBrightness;
attribute float aDelay;
attribute float aPhase;

varying float vBrightness;
varying float vDistanceFromCenter;
varying float vAudioLevel;

void main() {
  vec4 modelPosition = modelMatrix * vec4(position, 1.0);
  vec4 viewPosition = viewMatrix * modelPosition;
  vec4 projectedPosition = projectionMatrix * viewPosition;
  
  gl_Position = projectedPosition;
  
  // Calculate distance from center for visual effects
  vDistanceFromCenter = length(position);
  
  // Pass values to fragment shader
  vBrightness = aBrightness;
  vAudioLevel = uAudioLevel;
  
  // Breathing animation (scale oscillation)
  float breathing = 1.0 + sin(uTime * uBreathingSpeed + aPhase) * uBreathingIntensity;
  
  // Audio reactivity - much stronger effect
  float audioBoost = 1.0 + uAudioLevel * 1.5;
  
  // Explosion effect
  float explosionBoost = 1.0 + uExplosionProgress * 0.5;
  
  // Perspective size attenuation
  float sizeAttenuation = (1.0 / -viewPosition.z);
  
  // Final point size with all effects
  float finalSize = uBaseSize * aSize * uPixelRatio * sizeAttenuation;
  finalSize *= breathing * audioBoost * explosionBoost;
  
  // Clamp to reasonable range
  gl_PointSize = clamp(finalSize, 0.5, 48.0);
}
