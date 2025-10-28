import { ShaderMaterial, Color, Vector3 } from 'three';
import vertexShader from './vertex.glsl?raw';
import fragmentShader from './fragment.glsl?raw';
import type { ZebraSkinConfig, TricolorSkinConfig } from '../../../types/index';

/**
 * Create a zebra stripe shader material for the blob
 * Tricolor stripes with specular highlights
 */
export function createZebraSkin(config: ZebraSkinConfig | TricolorSkinConfig): ShaderMaterial {
  // If it's a TricolorSkinConfig, use its colors; otherwise use default colors
  const colors = 'color1' in config 
    ? { color1: config.color1, color2: config.color2, color3: config.color3 }
    : { color1: '#ff0066', color2: '#00ff66', color3: '#6600ff' };
    
  return new ShaderMaterial({
    vertexShader,
    fragmentShader,
    wireframe: config.wireframe,
    lights: false,
    uniforms: {
      lightPosition: {
        value: new Vector3(
          config.lightPosition.x,
          config.lightPosition.y,
          config.lightPosition.z,
        ),
      },
      shininess: {
        value: config.shininess,
      },
      specular_color: {
        value: new Color(0xFFFFFF),
      },
      _color1: {
        value: new Color(colors.color1),
      },
      _color2: {
        value: new Color(colors.color2),
      },
      _color3: {
        value: new Color(colors.color3),
      },
    },
  });
}

export { vertexShader, fragmentShader };
