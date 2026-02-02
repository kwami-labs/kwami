// Crystal Shard Fragment Shader
// Creates prismatic refraction, iridescence, and dynamic coloring

uniform float uTime;
uniform vec3 uPrimaryColor;
uniform vec3 uSecondaryColor;
uniform vec3 uAccentColor;
uniform float uOpacity;
uniform float uHighLevel;
uniform float uAudioReactivity;
uniform vec3 uLightPosition;
uniform float uShininess;

varying vec3 vNormal;
varying vec3 vPosition;
varying vec3 vWorldPosition;
varying vec2 vUv;
varying float vFresnel;

// Iridescence function - creates rainbow shimmer based on view angle
vec3 iridescence(float angle, float time) {
  float hue = fract(angle * 0.5 + time * 0.1);
  
  // Convert HSL to RGB (simplified)
  vec3 rgb;
  float x = 1.0 - abs(mod(hue * 6.0, 2.0) - 1.0);
  
  if (hue < 1.0/6.0) rgb = vec3(1.0, x, 0.0);
  else if (hue < 2.0/6.0) rgb = vec3(x, 1.0, 0.0);
  else if (hue < 3.0/6.0) rgb = vec3(0.0, 1.0, x);
  else if (hue < 4.0/6.0) rgb = vec3(0.0, x, 1.0);
  else if (hue < 5.0/6.0) rgb = vec3(x, 0.0, 1.0);
  else rgb = vec3(1.0, 0.0, x);
  
  return rgb;
}

void main() {
  vec3 normal = normalize(vNormal);
  vec3 viewDir = normalize(cameraPosition - vWorldPosition);
  vec3 lightDir = normalize(uLightPosition - vWorldPosition);
  
  // Base color gradient based on position
  float gradientFactor = (vPosition.y + 1.0) * 0.5;
  vec3 baseColor = mix(uPrimaryColor, uSecondaryColor, gradientFactor);
  
  // Add iridescent shimmer
  float iridAngle = dot(viewDir, normal);
  vec3 iridColor = iridescence(iridAngle, uTime);
  baseColor = mix(baseColor, iridColor, 0.3 * uHighLevel * uAudioReactivity);
  
  // Phong lighting
  float diffuse = max(dot(normal, lightDir), 0.0);
  vec3 reflectDir = reflect(-lightDir, normal);
  float specular = pow(max(dot(viewDir, reflectDir), 0.0), uShininess);
  
  // Ambient light
  float ambient = 0.2;
  
  // Combine lighting
  vec3 litColor = baseColor * (ambient + diffuse * 0.7) + vec3(1.0) * specular * 0.5;
  
  // Add fresnel edge glow with accent color
  vec3 edgeGlow = uAccentColor * vFresnel * (0.5 + uHighLevel * 0.5);
  litColor += edgeGlow;
  
  // Audio-reactive brightness pulse
  float pulse = 1.0 + uHighLevel * 0.3 * uAudioReactivity;
  litColor *= pulse;
  
  // Apply transparency
  float alpha = uOpacity * (0.7 + vFresnel * 0.3);
  
  gl_FragColor = vec4(litColor, alpha);
}
