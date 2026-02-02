varying vec3 vNormal;
varying vec3 vPosition;
varying vec2 vUv;
uniform vec3 _color1;
uniform vec3 _color2;
uniform vec3 _color3;
uniform vec3 lightPosition;
uniform vec3 specular_color;
uniform float shininess;
uniform float opacity;
uniform sampler2D backgroundTexture;
uniform bool useBackgroundTexture;
uniform float lightIntensity;

void main(){
  vec3 lightDir=normalize(lightPosition-vPosition);
  vec3 viewDir=normalize(-vPosition);
  vec3 reflectDir=reflect(-lightDir,vNormal);
  // Only calculate specular if shininess > 0
  float spec = 0.0;
  if(shininess > 0.0) {
    // Scale shininess to be more intuitive (0-200 range)
    // Lower values = less shine, higher values = more shine
    float adjustedShininess = max(1.0, shininess);
    float specIntensity = shininess / 200.0; // Normalize intensity
    spec = pow(max(dot(viewDir,reflectDir),0.),adjustedShininess) * specIntensity;
  }
  vec3 specular=specular_color*spec;
  
  // Normalize Y position to range [0, 1] based on blob radius
  // Assuming the blob is roughly spherical with radius ~1
  float normalizedY = (vPosition.y + 1.0) / 2.0; // Maps from [-1, 1] to [0, 1]
  
  vec3 _color;
  
  // Create three bands: top (color1), middle (color2), bottom (color3)
  // Top band: normalizedY > 0.66
  // Middle band (donut): 0.33 < normalizedY < 0.66
  // Bottom band: normalizedY < 0.33
  
  if (normalizedY > 0.66) {
    // Top zone: transition from color2 to color1
    float t = (normalizedY - 0.66) / 0.34; // Normalize to [0, 1]
    _color = mix(_color2, _color1, smoothstep(0.0, 1.0, t));
  } else if (normalizedY > 0.33) {
    // Middle zone (donut): pure color2 with slight gradients at edges
    float distFromCenter = abs(normalizedY - 0.5) / 0.17; // Distance from center of middle band
    _color = _color2;
  } else {
    // Bottom zone: transition from color2 to color3
    float t = normalizedY / 0.33; // Normalize to [0, 1]
    _color = mix(_color3, _color2, smoothstep(0.0, 1.0, t));
  }
  
  vec3 finalColor=clamp(_color+specular,0.,1.);

  if(lightIntensity>0.){
    float normalizedIntensity=clamp(lightIntensity/2.5,0.,3.);
    float rim=pow(1.-max(dot(normalize(vNormal),viewDir),0.),2.);
    vec3 emissionColor=finalColor*(0.4+rim*0.6);
    finalColor=clamp(finalColor+emissionColor*normalizedIntensity,0.,1.);
  }
  float alpha = opacity;

  if (useBackgroundTexture) {
    vec3 backgroundColor = texture2D(backgroundTexture, vUv).rgb;
    finalColor = backgroundColor;
  }

  gl_FragColor=vec4(finalColor,alpha);
}
