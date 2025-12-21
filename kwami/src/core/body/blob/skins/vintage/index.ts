import { ShaderMaterial, Color, Vector3 } from 'three';
import vertexShader from './vertex.glsl?raw';
import fragmentShader from './fragment.glsl?raw';
import type { TricolorSkinConfig } from '../../../../../types/index';

/**
 * Vintage subtype for the Tricolor skin.
 * Tricolor stripes with specular highlights.
 */
export function createVintageSkin(config: TricolorSkinConfig): ShaderMaterial {
  const opacity = config.opacity;
  const isTransparent = opacity < 0.999;

  const colors = { color1: config.color1, color2: config.color2, color3: config.color3 };

  return new ShaderMaterial({
    vertexShader,
    fragmentShader,
    wireframe: config.wireframe,
    lights: false,
    transparent: isTransparent,
    depthWrite: !isTransparent,
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
      opacity: {
        value: opacity,
      },
      backgroundTexture: {
        value: null,
      },
      useBackgroundTexture: {
        value: false,
      },
      lightIntensity: {
        value: 0,
      },
    },
  });
}

export { vertexShader, fragmentShader };
