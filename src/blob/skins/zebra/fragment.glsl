varying vec3 vNormal;
varying vec3 vPosition;
uniform vec3 _color1;
uniform vec3 _color2;
uniform vec3 _color3;
uniform vec3 lightPosition;
uniform vec3 specular_color;
uniform float shininess;

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
  
  vec3 finalColor=color+specular;
  gl_FragColor=vec4(finalColor,1.);
}

