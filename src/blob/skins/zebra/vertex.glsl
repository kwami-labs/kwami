varying vec3 vNormal;
varying vec3 vPosition;
varying vec2 vUV;

void main(){
  vNormal=normalize(normalMatrix*normal);
  vPosition=(modelViewMatrix*vec4(position,1.)).xyz;
  vUV=uv;
  gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);
}

