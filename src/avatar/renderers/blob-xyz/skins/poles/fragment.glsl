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
  float angle=atan(vPosition.y,vPosition.x);
  float hue=angle/(2.*3.14159265359)+.5;// Normalize the angle to [0, 1]
  vec3 _color;
  if(hue<1./3.){
    _color=mix(_color1,_color2,3.*hue);
  }else if(hue<2./3.){
    _color=mix(_color2,_color3,3.*(hue-1./3.));
  }else{
    _color=mix(_color3,_color1,3.*(hue-2./3.));
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
    // When a blob surface texture is provided, use it as the primary color
    // (independent from material alpha used for transparency)
    vec3 backgroundColor = texture2D(backgroundTexture, vUv).rgb;
    finalColor = backgroundColor;
  }

  gl_FragColor=vec4(finalColor,alpha);
}
