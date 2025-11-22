// Declare modules for audio files
declare module '*.mp3' {
  const content: string;
  export default content;
}

// Declare modules for GLSL shader files
declare module '*?raw' {
  const content: string;
  export default content;
}

// Declare modules for GLSL files
declare module '*.glsl' {
  const content: string;
  export default content;
}

// Declare module for Three.js OrbitControls
declare module 'three/addons/controls/OrbitControls' {
  import { Camera, EventDispatcher, MOUSE, TOUCH, Vector3 } from '../../node_modules/@types/three';

  export class OrbitControls extends EventDispatcher {
    constructor(object: Camera, domElement?: HTMLElement);

    object: Camera;
    domElement: HTMLElement | Document;
    enabled: boolean;
    target: Vector3;

    minDistance: number;
    maxDistance: number;

    minPolarAngle: number;
    maxPolarAngle: number;

    minAzimuthAngle: number;
    maxAzimuthAngle: number;

    enableDamping: boolean;
    dampingFactor: number;

    enableZoom: boolean;
    zoomSpeed: number;

    enableRotate: boolean;
    rotateSpeed: number;

    enablePan: boolean;
    panSpeed: number;
    screenSpacePanning: boolean;
    keyPanSpeed: number;

    autoRotate: boolean;
    autoRotateSpeed: number;

    enableKeys: boolean;
    keys: { LEFT: string; UP: string; RIGHT: string; BOTTOM: string };

    mouseButtons: { LEFT: MOUSE; MIDDLE: MOUSE; RIGHT: MOUSE };
    touches: { ONE: TOUCH; TWO: TOUCH };

    update(): void;
    saveState(): void;
    reset(): void;
    dispose(): void;
  }
}
