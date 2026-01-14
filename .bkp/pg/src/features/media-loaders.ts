/**
 * Media Loader Integration
 *
 * Creates media loader UIs for background and blob texture upload areas.
 *
 * NOTE: This module intentionally calls into globally-exposed functions (setBackgroundImage, etc.)
 * because those controls are still implemented in the main playground file.
 */

import { createMediaLoaderUI } from '../media-loader-ui.js';
import mediaLoadingManager from '../media-loading-manager.js';

// Image presets for backgrounds and blob textures
export const IMAGE_PRESETS = [
  { name: 'Alaska', value: '/img/bg/alaska.jpeg' },
  { name: 'Binary Reality', value: '/img/bg/binary-reality.jpg' },
  { name: 'Black Candle', value: '/img/bg/black-candle.jpg' },
  { name: 'Black Hole', value: '/img/bg/black-hole.jpg' },
  { name: 'Black Sea', value: '/img/bg/black-sea.jpg' },
  { name: 'Black Windows', value: '/img/bg/black-windows.jpg' },
  { name: 'Black', value: '/img/bg/black.jpg' },
  { name: 'Colors', value: '/img/bg/colors.jpeg' },
  { name: 'Galaxy', value: '/img/bg/galaxy.jpg' },
  { name: 'Galaxy 2', value: '/img/bg/galaxy2.jpg' },
  { name: 'Galaxy 3', value: '/img/bg/galaxy3.jpg' },
  { name: 'Galaxy 4', value: '/img/bg/galaxy4.jpg' },
  { name: 'Gargantua', value: '/img/bg/gargantua.jpg' },
  { name: 'Interstellar', value: '/img/bg/interstellar.png' },
  { name: 'Island', value: '/img/bg/islan.jpg' },
  { name: 'Lake', value: '/img/bg/lake.jpg' },
  { name: 'Mountain', value: '/img/bg/mountain.jpeg' },
  { name: 'Paisaje', value: '/img/bg/paisaje.jpg' },
  { name: 'Pik', value: '/img/bg/pik.jpg' },
  { name: 'Planet', value: '/img/bg/planet.jpg' },
  { name: 'Planet 2', value: '/img/bg/planet2.jpg' },
  { name: 'Planet 3', value: '/img/bg/planet3.jpg' },
  { name: 'Sahara', value: '/img/bg/sahara.jpeg' },
  { name: 'Skinet', value: '/img/bg/skinet.png' },
  { name: 'Skynet', value: '/img/bg/skynet.png' },
  { name: 'Universe', value: '/img/bg/universe.jpg' },
  { name: 'White Tree', value: '/img/bg/white-tree.jpg' },
] as const;

// Video presets
export const VIDEO_PRESETS = [
  // Local videos
  { name: 'Stars (Local)', value: '/vid/bg/stars.mp4' },

  // Pexels videos - Space & Abstract
  { name: 'Cosmic Nebula 1', value: 'https://videos.pexels.com/video-files/6394054/6394054-uhd_2732_1366_24fps.mp4' },
  { name: 'Galaxy Swirl', value: 'https://videos.pexels.com/video-files/1448735/1448735-uhd_2732_1440_24fps.mp4' },
  { name: 'Abstract Waves 1', value: 'https://videos.pexels.com/video-files/3571264/3571264-uhd_2560_1440_30fps.mp4' },
  { name: 'Smoke Art 1', value: 'https://videos.pexels.com/video-files/8820216/8820216-uhd_2560_1440_25fps.mp4' },
  { name: 'Liquid Gold', value: 'https://videos.pexels.com/video-files/4763824/4763824-uhd_2560_1440_24fps.mp4' },
  { name: 'Abstract Flow 1', value: 'https://videos.pexels.com/video-files/5946371/5946371-uhd_2560_1440_30fps.mp4' },
  { name: 'Particle Storm', value: 'https://videos.pexels.com/video-files/3214448/3214448-uhd_2560_1440_25fps.mp4' },
  { name: 'Digital Waves', value: 'https://videos.pexels.com/video-files/2098989/2098989-uhd_2560_1440_30fps.mp4' },
  { name: 'Smoke Art 2', value: 'https://videos.pexels.com/video-files/4205697/4205697-uhd_2560_1440_30fps.mp4' },
  { name: 'Fluid Motion 1', value: 'https://videos.pexels.com/video-files/4125029/4125029-uhd_2560_1440_24fps.mp4' },

  // Pexels videos - Colorful Abstract
  { name: 'Rainbow Smoke', value: 'https://videos.pexels.com/video-files/4873244/4873244-uhd_2560_1440_25fps.mp4' },
  { name: 'Ink in Water 1', value: 'https://videos.pexels.com/video-files/4927963/4927963-uhd_2732_1440_30fps.mp4' },
  { name: 'Neon Lights 1', value: 'https://videos.pexels.com/video-files/5173766/5173766-uhd_2560_1440_30fps.mp4' },
  { name: 'Abstract Colors 1', value: 'https://videos.pexels.com/video-files/5581999/5581999-uhd_2560_1440_30fps.mp4' },
  { name: 'Plasma Effect', value: 'https://videos.pexels.com/video-files/6212548/6212548-uhd_2560_1440_25fps.mp4' },
  { name: 'Bokeh Lights 1', value: 'https://videos.pexels.com/video-files/1851190/1851190-uhd_2560_1440_25fps.mp4' },
  { name: 'Neon Glow', value: 'https://videos.pexels.com/video-files/2611250/2611250-uhd_2560_1440_30fps.mp4' },
  { name: 'Light Rays 1', value: 'https://videos.pexels.com/video-files/5155396/5155396-uhd_2560_1440_30fps.mp4' },
  { name: 'Abstract Gradient 1', value: 'https://videos.pexels.com/video-files/5453622/5453622-uhd_2560_1440_24fps.mp4' },
  { name: 'Color Smoke 1', value: 'https://videos.pexels.com/video-files/5382333/5382333-uhd_2560_1440_30fps.mp4' },

  // Pexels videos - Energy & Motion
  { name: 'Energy Field 1', value: 'https://videos.pexels.com/video-files/9341381/9341381-uhd_2560_1440_24fps.mp4' },
  { name: 'Particle Flow 1', value: 'https://videos.pexels.com/video-files/5167233/5167233-uhd_2560_1440_30fps.mp4' },
  { name: 'Abstract Motion 1', value: 'https://videos.pexels.com/video-files/5170522/5170522-uhd_2560_1440_30fps.mp4' },
  { name: 'Fluid Motion 2', value: 'https://videos.pexels.com/video-files/4182916/4182916-uhd_2560_1440_30fps.mp4' },
  { name: 'Cosmic Energy', value: 'https://videos.pexels.com/video-files/10477097/10477097-uhd_2560_1440_24fps.mp4' },
  { name: 'Abstract Flow 2', value: 'https://videos.pexels.com/video-files/19145265/19145265-uhd_2560_1440_24fps.mp4' },
  { name: 'Bokeh Lights 2', value: 'https://videos.pexels.com/video-files/856857/856857-uhd_2732_1440_30fps.mp4' },
  { name: 'Light Show 1', value: 'https://videos.pexels.com/video-files/855835/855835-hd_1920_1080_30fps.mp4' },
  { name: 'Neon Lights 2', value: 'https://videos.pexels.com/video-files/3141208/3141208-uhd_2560_1440_25fps.mp4' },
  { name: 'Neon Lights 3', value: 'https://videos.pexels.com/video-files/3141209/3141209-uhd_2560_1440_25fps.mp4' },

  // Pexels videos - Dark & Mystical
  { name: 'Dark Waves', value: 'https://videos.pexels.com/video-files/3059861/3059861-uhd_2560_1440_25fps.mp4' },
  { name: 'Black Smoke', value: 'https://videos.pexels.com/video-files/2715412/2715412-uhd_2560_1440_30fps.mp4' },
  { name: 'Ink Bloom', value: 'https://videos.pexels.com/video-files/5649204/5649204-uhd_2560_1440_25fps.mp4' },
  { name: 'Dark Glow', value: 'https://videos.pexels.com/video-files/854999/854999-uhd_2560_1440_30fps.mp4' },
  { name: 'Mystic Flow', value: 'https://videos.pexels.com/video-files/6051402/6051402-uhd_2560_1440_25fps.mp4' },
  { name: 'Abstract Waves 2', value: 'https://videos.pexels.com/video-files/3571195/3571195-uhd_2560_1440_30fps.mp4' },
  { name: 'Smoke Art 3', value: 'https://videos.pexels.com/video-files/4205790/4205790-uhd_1920_1440_30fps.mp4' },
  { name: 'Dark Energy', value: 'https://videos.pexels.com/video-files/10490756/10490756-uhd_2560_1440_30fps.mp4' },
  { name: 'Black Ink', value: 'https://videos.pexels.com/video-files/2334654/2334654-uhd_2560_1440_30fps.mp4' },
  { name: 'Shadow Flow', value: 'https://videos.pexels.com/video-files/2110771/2110771-uhd_2560_1440_30fps.mp4' },

  // Pexels videos - Organic & Natural
  { name: 'Ink in Water 2', value: 'https://videos.pexels.com/video-files/2711116/2711116-uhd_2560_1440_24fps.mp4' },
  { name: 'Color Diffusion 1', value: 'https://videos.pexels.com/video-files/2063228/2063228-uhd_2560_1440_24fps.mp4' },
  { name: 'Liquid Art 1', value: 'https://videos.pexels.com/video-files/4259460/4259460-uhd_2560_1440_25fps.mp4' },
  { name: 'Fluid Dynamics 1', value: 'https://videos.pexels.com/video-files/4125031/4125031-uhd_2560_1440_24fps.mp4' },
  { name: 'Ink Spread 1', value: 'https://videos.pexels.com/video-files/5796436/5796436-uhd_2560_1440_30fps.mp4' },
  { name: 'Color Mix 1', value: 'https://videos.pexels.com/video-files/4423694/4423694-uhd_2560_1440_30fps.mp4' },
  { name: 'Liquid Color 1', value: 'https://videos.pexels.com/video-files/5828446/5828446-uhd_2560_1440_24fps.mp4' },
  { name: 'Ink Flow 1', value: 'https://videos.pexels.com/video-files/2856781/2856781-uhd_2560_1440_30fps.mp4' },
  { name: 'Abstract Paint 1', value: 'https://videos.pexels.com/video-files/5396819/5396819-uhd_2560_1440_30fps.mp4' },
  { name: 'Abstract Paint 2', value: 'https://videos.pexels.com/video-files/5396826/5396826-uhd_2560_1440_30fps.mp4' },

  // Pexels videos - Vibrant & Dynamic
  { name: 'Color Burst 1', value: 'https://videos.pexels.com/video-files/5538822/5538822-uhd_2560_1440_30fps.mp4' },
  { name: 'Abstract Paint 3', value: 'https://videos.pexels.com/video-files/5396825/5396825-uhd_2560_1440_30fps.mp4' },
  { name: 'Color Explosion', value: 'https://videos.pexels.com/video-files/7031954/7031954-uhd_2560_1440_24fps.mp4' },
  { name: 'Vibrant Flow 1', value: 'https://videos.pexels.com/video-files/3108007/3108007-uhd_2560_1440_25fps.mp4' },
  { name: 'Dynamic Abstract 1', value: 'https://videos.pexels.com/video-files/3130182/3130182-uhd_2560_1440_30fps.mp4' },
  { name: 'Color Dance 1', value: 'https://videos.pexels.com/video-files/3129576/3129576-uhd_2560_1440_30fps.mp4' },
  { name: 'Psychedelic 1', value: 'https://videos.pexels.com/video-files/10755266/10755266-hd_2560_1440_30fps.mp4' },
  { name: 'Color Wave 1', value: 'https://videos.pexels.com/video-files/3129902/3129902-uhd_2560_1440_25fps.mp4' },
  { name: 'Abstract Blend 1', value: 'https://videos.pexels.com/video-files/3129785/3129785-uhd_2560_1440_25fps.mp4' },
  { name: 'Gradient Flow 1', value: 'https://videos.pexels.com/video-files/6804117/6804117-uhd_2732_1440_25fps.mp4' },

  // Pexels videos - Ethereal & Dreamy
  { name: 'Ethereal Glow 1', value: 'https://videos.pexels.com/video-files/5925291/5925291-uhd_2560_1440_24fps.mp4' },
  { name: 'Dreamy Smoke 1', value: 'https://videos.pexels.com/video-files/8721932/8721932-uhd_2732_1440_25fps.mp4' },
  { name: 'Soft Motion 1', value: 'https://videos.pexels.com/video-files/10532470/10532470-uhd_2560_1440_30fps.mp4' },
  { name: 'Ambient Flow 1', value: 'https://videos.pexels.com/video-files/14003675/14003675-uhd_2560_1440_60fps.mp4' },
  { name: 'Gentle Waves 1', value: 'https://videos.pexels.com/video-files/11274330/11274330-uhd_2560_1440_25fps.mp4' },
  { name: 'Dreamy Smoke 2', value: 'https://videos.pexels.com/video-files/8720758/8720758-uhd_2732_1440_25fps.mp4' },
  { name: 'Soft Glow 1', value: 'https://videos.pexels.com/video-files/6346224/6346224-uhd_2732_1440_25fps.mp4' },
  { name: 'Ethereal Motion 1', value: 'https://videos.pexels.com/video-files/8379231/8379231-uhd_2560_1440_25fps.mp4' },
  { name: 'Pastel Flow 1', value: 'https://videos.pexels.com/video-files/3094026/3094026-uhd_2560_1440_30fps.mp4' },
  { name: 'Misty Abstract 1', value: 'https://videos.pexels.com/video-files/3089895/3089895-uhd_2560_1440_30fps.mp4' },
] as const;

function resolveMediaPath(url: string): string {
  const fn = (window as any).resolveMediaPath as ((value: string) => string) | undefined;
  return fn ? fn(url) : url;
}

export function initializeMediaLoaders(): void {
  // Background Image Loader
  const bgImageContainer = document.getElementById('bg-image-loader');
  if (bgImageContainer && !bgImageContainer.hasChildNodes()) {
    const bgImageLoader = createMediaLoaderUI({
      type: 'image',
      label: 'Background Image',
      presets: [...IMAGE_PRESETS],
      showPresets: true,
      onLoad: (url) => {
        const resolved = resolveMediaPath(url);
        (window as any).setMediaType?.('image');
        (window as any).setBackgroundImage?.(resolved);
      },
      onError: (error) => {
        mediaLoadingManager.hide();
        (window as any).updateError?.(`Failed to load background image: ${error.message}`);
      },
    });
    bgImageContainer.appendChild(bgImageLoader);
  }

  // Background Video Loader
  const bgVideoContainer = document.getElementById('bg-video-loader');
  if (bgVideoContainer && !bgVideoContainer.hasChildNodes()) {
    const bgVideoLoader = createMediaLoaderUI({
      type: 'video',
      label: 'Background Video',
      presets: [...VIDEO_PRESETS],
      showPresets: true,
      onLoad: (url) => {
        const resolved = resolveMediaPath(url);
        (window as any).setMediaType?.('video');
        (window as any).setBackgroundVideo?.(resolved);
      },
      onError: (error) => {
        mediaLoadingManager.hide();
        (window as any).updateError?.(`Failed to load background video: ${error.message}`);
      },
    });
    bgVideoContainer.appendChild(bgVideoLoader);
  }

  // Blob Texture Image Loader
  const blobImageContainer = document.getElementById('blob-image-loader');
  if (blobImageContainer && !blobImageContainer.hasChildNodes()) {
    const blobImageLoader = createMediaLoaderUI({
      type: 'image',
      label: 'Blob Texture Image',
      presets: [...IMAGE_PRESETS],
      showPresets: true,
      onLoad: (url, source) => {
        const resolved = resolveMediaPath(url);
        mediaLoadingManager.show('Loading blob texture...');
        (window as any).setBlobMediaType?.('image');
        (window as any).kwami?.body?.setBlobSurfaceImage?.(resolved);
        (window as any).updateStatus?.(`🖼️ Blob texture loaded from ${source}`);
        setTimeout(() => mediaLoadingManager.hide(), 500);
      },
      onError: (error) => {
        mediaLoadingManager.hide();
        (window as any).updateError?.(`Failed to load blob texture: ${error.message}`);
      },
    });
    blobImageContainer.appendChild(blobImageLoader);
  }

  // Blob Texture Video Loader
  const blobVideoContainer = document.getElementById('blob-video-loader');
  if (blobVideoContainer && !blobVideoContainer.hasChildNodes()) {
    const blobVideoLoader = createMediaLoaderUI({
      type: 'video',
      label: 'Blob Texture Video',
      presets: [...VIDEO_PRESETS],
      showPresets: true,
      onLoad: (url, source) => {
        const resolved = resolveMediaPath(url);
        mediaLoadingManager.show('Loading blob video texture...');
        (window as any).setBlobMediaType?.('video');
        (window as any).kwami?.body?.setBlobSurfaceVideo?.(resolved, {
          autoplay: true,
          loop: true,
          muted: true,
        });
        (window as any).updateStatus?.(`🎥 Blob video texture loaded from ${source}`);
        setTimeout(() => mediaLoadingManager.hide(), 800);
      },
      onError: (error) => {
        mediaLoadingManager.hide();
        (window as any).updateError?.(`Failed to load blob video texture: ${error.message}`);
      },
    });
    blobVideoContainer.appendChild(blobVideoLoader);
  }

  console.log('[MediaLoader] Media loader UI components initialized');
}

// Auto init
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeMediaLoaders);
} else {
  initializeMediaLoaders();
}

(window as any).initializeMediaLoaders = initializeMediaLoaders;
