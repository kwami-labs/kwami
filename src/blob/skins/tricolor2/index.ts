import { ShaderMaterial, Color, Vector3 } from 'three';
import vertexShader from './vertex.glsl?raw';
import fragmentShader from './fragment.glsl?raw';
import type { TricolorSkinConfig } from '../../../types/index';

/**
 * Create a tricolor2 shader material for the blob
 * Colors are distributed vertically like a donut:
 * - Color 1 at the top
 * - Color 2 in the middle (donut band)
 * - Color 3 at the bottom
 */
export function createTricolor2Skin(config: TricolorSkinConfig): ShaderMaterial {
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
        value: new Color(config.color1),
      },
      _color2: {
        value: new Color(config.color2),
      },
      _color3: {
        value: new Color(config.color3),
      },
    },
  });
}

export { vertexShader, fragmentShader };

