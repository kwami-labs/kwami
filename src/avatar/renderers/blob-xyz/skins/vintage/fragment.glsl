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

float vintageStripes(float x,float frequency,float width){
  return smoothstep(.5-width*.5,.5+width*.5,mod(x*frequency+.5,1.));
}

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
  
  // Create vintage stripes using the Tricolor colors
  float stripeX=vintageStripes(vPosition.x,5.,.1);
  float stripeY=vintageStripes(vPosition.y,5.,.1);
  float stripeZ=vintageStripes(vPosition.z,5.,.1);
  
  // Mix colors based on stripes
  vec3 color=mix(_color1,_color2,stripeX);
  color=mix(color,_color3,stripeY*0.5);
  
  vec3 finalColor=clamp(color+specular,0.,1.);

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
