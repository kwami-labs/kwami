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

float zebraStripes(float x,float frequency,float width){
  return smoothstep(.5-width*.5,.5+width*.5,mod(x*frequency+.5,1.));
}

void main(){
  vec3 lightDir=normalize(lightPosition-vPosition);
  vec3 viewDir=normalize(-vPosition);
  vec3 reflectDir=reflect(-lightDir,vNormal);
  float spec=pow(max(dot(viewDir,reflectDir),0.),shininess);
  vec3 specular=specular_color*spec;
  
  // Create zebra stripes using the tricolor colors
  float stripeX=zebraStripes(vPosition.x,5.,.1);
  float stripeY=zebraStripes(vPosition.y,5.,.1);
  float stripeZ=zebraStripes(vPosition.z,5.,.1);
  
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
    finalColor = mix(finalColor, backgroundColor, 1.0 - alpha);
  }

  gl_FragColor=vec4(finalColor,alpha);
}

