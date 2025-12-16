import mediaLoadingManager from '../media-loading-manager.js';
import { updateError, updateStatus } from '../ui/messages.js';
import { IMAGE_PRESETS, VIDEO_PRESETS } from './media-loaders.js';

// Default background settings (kept aligned with legacy main.ts behavior)
const DEFAULT_BACKGROUND = {
  colors: ['#667eea', '#764ba2', '#f093fb'],
  opacity: 1.0,
  angle: 90,
  stops: [0, 0.5, 1],
  style: 'linear',
} as const;

// Asset paths are statically defined in arrays in the HTML / presets.
// These maps exist for legacy compatibility with resolveMediaPath().
const IMAGE_ASSET_MAP: Record<string, string> = {};
const VIDEO_ASSET_MAP: Record<string, string> = {};

// Counter for background randomization clicks
let backgroundRandomizeClickCount = 0;

// Remember previous blob opacity when enabling glass (to restore on disable)
let prevBlobOpacityForGlass: number | null = null;
let currentMediaType: 'none' | 'image' | 'video' = 'none';
let gradientOverlayOptIn = false;

function formatValue(value: unknown, decimals = 1) {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n)) return '';
  return n.toFixed(decimals);
}

function updateValueDisplay(id: string, value: unknown, decimals = 1) {
  const element = document.getElementById(id);
  if (element) {
    element.textContent = formatValue(value, decimals);
  }
}

function randomizeGradientLayout({ updateInputs = false }: { updateInputs?: boolean } = {}) {
  const angle = Math.floor(Math.random() * 361);
  const stop1Percent = Math.floor(Math.random() * 81) + 10;
  const stop2PercentRaw = Math.floor(Math.random() * (101 - stop1Percent)) + stop1Percent;
  const stop2Percent = Math.min(stop2PercentRaw, 100);

  if (updateInputs) {
    const angleSlider = document.getElementById('bg-gradient-angle') as HTMLInputElement | null;
    if (angleSlider) angleSlider.value = String(angle);
    updateValueDisplay('bg-gradient-angle-value', angle, 0);

    const stop1Slider = document.getElementById('bg-gradient-stop1') as HTMLInputElement | null;
    if (stop1Slider) stop1Slider.value = String(stop1Percent);
    updateValueDisplay('bg-gradient-stop1-value', stop1Percent, 0);

    const stop2Slider = document.getElementById('bg-gradient-stop2') as HTMLInputElement | null;
    if (stop2Slider) stop2Slider.value = String(stop2Percent);
    updateValueDisplay('bg-gradient-stop2-value', stop2Percent, 0);
  }

  return {
    angle,
    stop1Percent,
    stop2Percent,
    stops: [0, stop1Percent / 100, stop2Percent / 100],
  };
}

function resolveAsset(map: Record<string, string>, rawValue: string) {
  if (!rawValue) return null;

  const variants = [rawValue];
  variants.push(rawValue.replace(/^\.\/+/, ''));
  variants.push(rawValue.replace(/^\/+/, ''));
  variants.push(rawValue.replace(/^\.\.\//, ''));

  const filename = rawValue.split('/').pop();
  if (filename) {
    variants.push(filename);
  }

  for (const candidate of variants) {
    if (map[candidate]) {
      return map[candidate];
    }
  }

  return null;
}

export function resolveMediaPath(value: string) {
  if (!value) return '';
  if (/^(https?:)?\/\//i.test(value)) {
    return value;
  }

  const imageAsset = resolveAsset(IMAGE_ASSET_MAP, value);
  if (imageAsset) return imageAsset;

  const videoAsset = resolveAsset(VIDEO_ASSET_MAP, value);
  if (videoAsset) return videoAsset;

  return value;
}

function getMediaOptions(type: 'image' | 'video') {
  return type === 'video'
    ? VIDEO_PRESETS.map((preset) => preset.value)
    : IMAGE_PRESETS.map((preset) => preset.value);
}

function updateMediaTabs(activeType: string) {
  const tabs = document.querySelectorAll<HTMLElement>('#bg-media-tabs .media-tab');
  tabs.forEach((tab) => {
    tab.classList.toggle('active', tab.dataset.media === activeType);
  });
}

function showMediaControls(activeType: string) {
  const imageControls = document.getElementById('media-image-controls') as HTMLElement | null;
  const videoControls = document.getElementById('media-video-controls') as HTMLElement | null;
  if (imageControls) imageControls.style.display = activeType === 'image' ? 'block' : 'none';
  if (videoControls) videoControls.style.display = activeType === 'video' ? 'block' : 'none';
}

function getBackgroundElements() {
  return {
    mediaContainer: document.getElementById('background-media') as HTMLElement | null,
    videoElement: document.getElementById('background-media-video') as HTMLVideoElement | null,
    gradientElement: document.getElementById('background-gradient') as HTMLElement | null,
  };
}

function syncGradientOverlayState() {
  const body = window.kwami?.body;
  if (!body || typeof body.setGradientOverlayEnabled !== 'function') {
    return;
  }
  const wantsOverlay = gradientOverlayOptIn && currentMediaType !== 'none';
  body.setGradientOverlayEnabled(wantsOverlay);
}

function generateRandomSpheresTexture(colors: string[]) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return null;
  }

  ctx.fillStyle = colors[0];
  ctx.globalAlpha = 0.35;
  ctx.fillRect(0, 0, 512, 512);
  ctx.globalAlpha = 1;

  for (let i = 0; i < 3; i++) {
    const color = colors[i % colors.length];
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const radius = 150 + Math.random() * 200;

    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, color);
    gradient.addColorStop(0.45, `${color}90`);
    gradient.addColorStop(1, `${color}00`);

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 512, 512);
  }

  return canvas.toDataURL('image/png');
}

function setBackgroundImage(imageValue: string, { silent = false }: { silent?: boolean } = {}) {
  const resolved = imageValue ? resolveMediaPath(imageValue) : '';

  if (window.kwami?.body) {
    const { mediaContainer, gradientElement } = getBackgroundElements();
    if (mediaContainer) mediaContainer.style.display = 'none';
    if (gradientElement) gradientElement.style.display = 'none';

    if (resolved) {
      mediaLoadingManager.show('Loading background image...');

      window.kwami.body.setBackgroundImage(resolved, {
        opacity: 1,
        onLoad: () => {
          mediaLoadingManager.hide();
          if (!silent) updateStatus('🖼️ Background image loaded!');
        },
        onError: (error: any) => {
          mediaLoadingManager.hide();
          console.error('Failed to load background image:', error);
          updateError('Failed to load background image');
        },
      });
    } else {
      window.kwami.body.clearBackgroundMedia?.();
      if (!silent) updateStatus('Background image removed');
    }
  }
}

function setBackgroundVideo(videoValue: string, { silent = false }: { silent?: boolean } = {}) {
  const resolved = videoValue ? resolveMediaPath(videoValue) : '';

  if (window.kwami?.body) {
    const { mediaContainer, gradientElement } = getBackgroundElements();
    if (mediaContainer) mediaContainer.style.display = 'none';
    if (gradientElement) gradientElement.style.display = 'none';

    if (resolved) {
      mediaLoadingManager.show('Loading background video...');

      window.kwami.body.setBackgroundVideo(resolved, {
        opacity: 1,
        autoplay: true,
        loop: true,
        muted: true,
        onLoad: () => {
          mediaLoadingManager.hide();
          if (!silent) updateStatus('🎞️ Background video loaded!');
        },
        onError: (error: any) => {
          mediaLoadingManager.hide();
          console.error('Failed to load background video:', error);
          updateError('Failed to load background video');
        },
      });
    } else {
      window.kwami.body.clearBackgroundMedia?.();
      if (!silent) updateStatus('Background video removed');
    }
  }
}

function applyBackground({ skipGradientOverlayOptIn = false }: { skipGradientOverlayOptIn?: boolean } = {}) {
  const gradientEnabled = (document.getElementById('bg-gradient-enabled') as HTMLInputElement | null)?.checked ?? true;
  const opacity = Number.parseFloat(
    (document.getElementById('bg-opacity') as HTMLInputElement | null)?.value ?? String(DEFAULT_BACKGROUND.opacity),
  );

  const colors = [
    (document.getElementById('bg-color-1') as HTMLInputElement | null)?.value ?? DEFAULT_BACKGROUND.colors[0],
    (document.getElementById('bg-color-2') as HTMLInputElement | null)?.value ?? DEFAULT_BACKGROUND.colors[1],
    (document.getElementById('bg-color-3') as HTMLInputElement | null)?.value ?? DEFAULT_BACKGROUND.colors[2],
  ];

  const angleDegrees = Number.parseFloat(
    (document.getElementById('bg-gradient-angle') as HTMLInputElement | null)?.value ?? String(DEFAULT_BACKGROUND.angle),
  );
  const stop1PercentRaw = Number.parseFloat(
    (document.getElementById('bg-gradient-stop1') as HTMLInputElement | null)?.value ?? String(DEFAULT_BACKGROUND.stops[1] * 100),
  );
  const stop2PercentRaw = Number.parseFloat(
    (document.getElementById('bg-gradient-stop2') as HTMLInputElement | null)?.value ?? String(DEFAULT_BACKGROUND.stops[2] * 100),
  );

  const stop1Percent = Math.max(0, Math.min(100, Number.isFinite(stop1PercentRaw) ? stop1PercentRaw : DEFAULT_BACKGROUND.stops[1] * 100));
  const stop2Percent = Math.max(stop1Percent, Math.min(100, Number.isFinite(stop2PercentRaw) ? stop2PercentRaw : DEFAULT_BACKGROUND.stops[2] * 100));
  const percentStops = [0, stop1Percent, stop2Percent];
  const normalizedStops = percentStops.map((stop) => Math.max(0, Math.min(100, stop)) / 100);

  const gradientStyle = (document.getElementById('bg-gradient-style') as HTMLSelectElement | null)?.value ?? DEFAULT_BACKGROUND.style;

  if (!skipGradientOverlayOptIn) {
    gradientOverlayOptIn = true;
  }

  const body = window.kwami?.body;
  if (body) {
    syncGradientOverlayState();

    if (!gradientEnabled) {
      body.setBackgroundOpacity(0);
      const { gradientElement } = getBackgroundElements();
      if (gradientElement) {
        gradientElement.style.display = 'none';
      }
      return;
    }

    if (gradientStyle === 'random') {
      body.setBackgroundSpheres(colors);
      body.setBackgroundOpacity(opacity);
    } else {
      const gradientOptions: any = {
        stops: normalizedStops,
        opacity,
      };
      if (gradientStyle === 'radial') {
        gradientOptions.direction = 'radial';
      } else {
        gradientOptions.angle = angleDegrees;
      }
      body.setBackgroundGradient(colors, gradientOptions);
    }

    const { gradientElement } = getBackgroundElements();
    if (gradientElement) {
      gradientElement.style.display = 'none';
    }
    return;
  }

  // Fallback: DOM overlay gradient
  const { gradientElement, mediaContainer } = getBackgroundElements();
  if (mediaContainer) mediaContainer.style.display = 'none';
  if (gradientElement) {
    if (!gradientEnabled) {
      gradientElement.style.display = 'none';
      gradientElement.style.opacity = '0';
      gradientElement.style.backgroundImage = 'none';
      return;
    }

    let backgroundImage = '';
    if (gradientStyle === 'radial') {
      backgroundImage = `radial-gradient(circle, ${colors[0]} ${percentStops[0]}%, ${colors[1]} ${percentStops[1]}%, ${colors[2]} ${percentStops[2]}%)`;
    } else if (gradientStyle === 'random') {
      const dataUrl = generateRandomSpheresTexture(colors);
      backgroundImage = dataUrl ? `url(${dataUrl})` : `linear-gradient(${angleDegrees}deg, ${colors[0]}, ${colors[1]}, ${colors[2]})`;
    } else {
      backgroundImage = `linear-gradient(${angleDegrees}deg, ${colors[0]} ${percentStops[0]}%, ${colors[1]} ${percentStops[1]}%, ${colors[2]} ${percentStops[2]}%)`;
    }

    gradientElement.style.backgroundImage = backgroundImage;
    gradientElement.style.opacity = `${opacity}`;
    gradientElement.style.display = 'block';
  }
}

function setMediaType(type: 'none' | 'image' | 'video', { silent = false }: { silent?: boolean } = {}) {
  currentMediaType = type;
  updateMediaTabs(type);
  showMediaControls(type);

  if (type === 'none') {
    const imageSelect = document.getElementById('bg-media-image') as HTMLSelectElement | null;
    if (imageSelect) imageSelect.value = '';
    const videoSelect = document.getElementById('bg-media-video') as HTMLSelectElement | null;
    if (videoSelect) videoSelect.value = '';
    setBackgroundVideo('', { silent: true });
    setBackgroundImage('', { silent: true });
    if (!silent) updateStatus('🧹 Background media cleared');
  } else if (type === 'image') {
    const videoSelect = document.getElementById('bg-media-video') as HTMLSelectElement | null;
    if (videoSelect) videoSelect.value = '';
    const imageSelect = document.getElementById('bg-media-image') as HTMLSelectElement | null;
    const selected = imageSelect?.value;
    if (selected) {
      setBackgroundImage(selected, { silent: true });
    } else {
      setBackgroundVideo('', { silent: true });
      setBackgroundImage('', { silent: true });
    }
  } else if (type === 'video') {
    const imageSelect = document.getElementById('bg-media-image') as HTMLSelectElement | null;
    if (imageSelect) imageSelect.value = '';
    const videoSelect = document.getElementById('bg-media-video') as HTMLSelectElement | null;
    const selected = videoSelect?.value;
    if (selected) {
      setBackgroundVideo(selected, { silent: true });
    } else {
      setBackgroundImage('', { silent: true });
      setBackgroundVideo('', { silent: true });
    }
  }

  syncGradientOverlayState();
}

export function initializeBackgroundControls() {
  // Glass transparency toggle
  const glassCheckbox = document.getElementById('blob-image-transparency') as HTMLInputElement | null;
  if (glassCheckbox) {
    glassCheckbox.addEventListener('change', (e) => {
      if (!window.kwami?.body) return;

      const currentBlobOpacity = window.kwami.body.blob.getOpacity?.() ?? 1;
      const target = e.target as HTMLInputElement | null;
      const checked = Boolean(target?.checked);

      if (checked) {
        window.kwami.body.setBlobImageTransparencyMode?.(true, { mode: 'glass' });

        if (currentBlobOpacity >= 1) {
          prevBlobOpacityForGlass = currentBlobOpacity;
          window.kwami.body.blob.setOpacity?.(0.8);
          const blobOpacitySlider = document.getElementById('blob-opacity') as HTMLInputElement | null;
          if (blobOpacitySlider) blobOpacitySlider.value = '0.80';
          updateValueDisplay('blob-opacity-value', 0.8, 2);
        }
        updateStatus('🪟 Glass transparency enabled');
      } else {
        window.kwami.body.setBlobImageTransparencyMode?.(false);

        if (prevBlobOpacityForGlass !== null) {
          window.kwami.body.blob.setOpacity?.(prevBlobOpacityForGlass);
          const blobOpacitySlider = document.getElementById('blob-opacity') as HTMLInputElement | null;
          if (blobOpacitySlider) blobOpacitySlider.value = String(prevBlobOpacityForGlass);
          updateValueDisplay('blob-opacity-value', prevBlobOpacityForGlass, 2);
          prevBlobOpacityForGlass = null;
        }
        updateStatus('🎨 Glass transparency disabled');
      }
    });
  }

  const gradientEnabledCheckbox = document.getElementById('bg-gradient-enabled') as HTMLInputElement | null;
  if (gradientEnabledCheckbox) {
    gradientEnabledCheckbox.addEventListener('change', (e) => {
      const controlsContainer = document.getElementById('gradient-controls-container');
      const target = e.target as HTMLInputElement | null;
      if (controlsContainer) {
        controlsContainer.classList.toggle('gradient-controls-disabled', !target?.checked);
      }
      applyBackground();
    });
  }

  const bgOpacitySlider = document.getElementById('bg-opacity') as HTMLInputElement | null;
  if (bgOpacitySlider) {
    bgOpacitySlider.addEventListener('input', (e) => {
      const target = e.target as HTMLInputElement | null;
      updateValueDisplay('bg-opacity-value', target?.value, 2);
      applyBackground();
    });
  }

  const blobOpacitySlider = document.getElementById('blob-opacity') as HTMLInputElement | null;
  if (blobOpacitySlider) {
    blobOpacitySlider.addEventListener('input', (e) => {
      const target = e.target as HTMLInputElement | null;
      const value = Number.parseFloat(target?.value ?? '1');
      updateValueDisplay('blob-opacity-value', value, 2);
      window.kwami?.body?.blob?.setOpacity?.(value);
    });
  }

  ['1', '2', '3'].forEach((num) => {
    const colorPicker = document.getElementById(`bg-color-${num}`) as HTMLInputElement | null;
    if (colorPicker) {
      colorPicker.addEventListener('input', () => applyBackground());
    }
  });

  const gradientStyleSelect = document.getElementById('bg-gradient-style') as HTMLSelectElement | null;
  if (gradientStyleSelect) {
    gradientStyleSelect.addEventListener('change', () => applyBackground());
  }

  const angleSlider = document.getElementById('bg-gradient-angle') as HTMLInputElement | null;
  if (angleSlider) {
    angleSlider.addEventListener('input', (e) => {
      const target = e.target as HTMLInputElement | null;
      updateValueDisplay('bg-gradient-angle-value', target?.value, 0);
      applyBackground();
    });
  }

  const stop1Slider = document.getElementById('bg-gradient-stop1') as HTMLInputElement | null;
  if (stop1Slider) {
    stop1Slider.addEventListener('input', (e) => {
      const target = e.target as HTMLInputElement | null;
      const value = Math.min(100, Math.max(0, Number.parseFloat(target?.value ?? '0')));
      stop1Slider.value = String(value);
      updateValueDisplay('bg-gradient-stop1-value', value, 0);
      applyBackground();
    });
  }

  const stop2Slider = document.getElementById('bg-gradient-stop2') as HTMLInputElement | null;
  if (stop2Slider) {
    stop2Slider.addEventListener('input', (e) => {
      const target = e.target as HTMLInputElement | null;
      const value = Math.min(100, Math.max(0, Number.parseFloat(target?.value ?? '0')));
      stop2Slider.value = String(value);
      updateValueDisplay('bg-gradient-stop2-value', value, 0);
      applyBackground();
    });
  }

  const mediaTabs = document.querySelectorAll<HTMLElement>('#bg-media-tabs .media-tab');
  mediaTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      setMediaType((tab.dataset.media as any) ?? 'none');
    });
  });

  const imageSelect = document.getElementById('bg-media-image') as HTMLSelectElement | null;
  if (imageSelect) {
    imageSelect.addEventListener('change', (e) => {
      const target = e.target as HTMLSelectElement | null;
      if (target?.value) {
        setMediaType('image');
        setBackgroundImage(target.value);
      } else if (currentMediaType === 'image') {
        window.clearMediaSelection?.('image');
      }
    });
  }

  const videoSelect = document.getElementById('bg-media-video') as HTMLSelectElement | null;
  if (videoSelect) {
    videoSelect.addEventListener('change', (e) => {
      const target = e.target as HTMLSelectElement | null;
      if (target?.value) {
        setMediaType('video');
        setBackgroundVideo(target.value);
      } else if (currentMediaType === 'video') {
        window.clearMediaSelection?.('video');
      }
    });
  }

  const defaultAngle = DEFAULT_BACKGROUND.angle;
  const defaultStop1Percent = Math.round(DEFAULT_BACKGROUND.stops[1] * 100);
  const defaultStop2Percent = Math.round(DEFAULT_BACKGROUND.stops[2] * 100);

  const color1Input = document.getElementById('bg-color-1') as HTMLInputElement | null;
  const color2Input = document.getElementById('bg-color-2') as HTMLInputElement | null;
  const color3Input = document.getElementById('bg-color-3') as HTMLInputElement | null;
  if (color1Input) color1Input.value = DEFAULT_BACKGROUND.colors[0];
  if (color2Input) color2Input.value = DEFAULT_BACKGROUND.colors[1];
  if (color3Input) color3Input.value = DEFAULT_BACKGROUND.colors[2];

  if (angleSlider) {
    angleSlider.value = String(defaultAngle);
    updateValueDisplay('bg-gradient-angle-value', defaultAngle, 0);
  }
  if (stop1Slider) {
    stop1Slider.value = String(defaultStop1Percent);
    updateValueDisplay('bg-gradient-stop1-value', defaultStop1Percent, 0);
  }
  if (stop2Slider) {
    stop2Slider.value = String(defaultStop2Percent);
    updateValueDisplay('bg-gradient-stop2-value', defaultStop2Percent, 0);
  }

  if (gradientStyleSelect) {
    gradientStyleSelect.value = DEFAULT_BACKGROUND.style;
  }

  if (bgOpacitySlider) {
    bgOpacitySlider.value = DEFAULT_BACKGROUND.opacity.toString();
    updateValueDisplay('bg-opacity-value', DEFAULT_BACKGROUND.opacity, 2);
  }

  setMediaType('none', { silent: true });
  applyBackground({ skipGradientOverlayOptIn: true });
}

// ---- window APIs (used by HTML and other modules) ----
window.resolveMediaPath = resolveMediaPath;
window.setMediaType = setMediaType;
window.setBackgroundImage = setBackgroundImage;
window.setBackgroundVideo = setBackgroundVideo;

window.randomizeGradientColors = function randomizeGradientColors() {
  const randomColor = () => '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
  const colors = [randomColor(), randomColor(), randomColor()];

  const c1 = document.getElementById('bg-color-1') as HTMLInputElement | null;
  const c2 = document.getElementById('bg-color-2') as HTMLInputElement | null;
  const c3 = document.getElementById('bg-color-3') as HTMLInputElement | null;

  if (c1) c1.value = colors[0];
  if (c2) c2.value = colors[1];
  if (c3) c3.value = colors[2];

  applyBackground();
  updateStatus('🎨 Gradient colors randomized!');
};

window.randomizeBackground = function randomizeBackground() {
  const randomColor = () => '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
  const colors = [randomColor(), randomColor(), randomColor()];

  backgroundRandomizeClickCount++;

  const c1 = document.getElementById('bg-color-1') as HTMLInputElement | null;
  const c2 = document.getElementById('bg-color-2') as HTMLInputElement | null;
  const c3 = document.getElementById('bg-color-3') as HTMLInputElement | null;
  if (c1) c1.value = colors[0];
  if (c2) c2.value = colors[1];
  if (c3) c3.value = colors[2];

  randomizeGradientLayout({ updateInputs: true });

  const stylePattern = ['radial', 'radial', 'radial', 'radial', 'linear', 'linear', 'linear', 'random', 'random', 'random'] as const;
  const patternIndex = (backgroundRandomizeClickCount - 1) % 10;
  const selectedStyle = stylePattern[patternIndex];

  const gradientStyleSelect = document.getElementById('bg-gradient-style') as HTMLSelectElement | null;
  if (gradientStyleSelect) {
    gradientStyleSelect.value = selectedStyle;
  }

  const opacityStr = backgroundRandomizeClickCount % 3 === 0
    ? (Math.random() * 0.6 + 0.3).toFixed(2)
    : '1.00';

  const opacitySlider = document.getElementById('bg-opacity') as HTMLInputElement | null;
  if (opacitySlider) opacitySlider.value = opacityStr;
  updateValueDisplay('bg-opacity-value', opacityStr, 2);

  applyBackground();

  const styleLabel = selectedStyle === 'random' ? 'Spheres' : selectedStyle === 'radial' ? 'Radial' : 'Linear';
  updateStatus(`🎲 ${styleLabel} gradient created!`);
};

window.randomizeMediaSelection = function randomizeMediaSelection(type: 'image' | 'video') {
  const options = getMediaOptions(type);
  if (!options.length) {
    updateStatus(type === 'image'
      ? '⚠️ Add image assets to randomize the background.'
      : '⚠️ Add video sources to randomize the background.');
    return;
  }

  const value = options[Math.floor(Math.random() * options.length)];

  if (type === 'image') {
    setMediaType('image');
    setBackgroundImage(value);
  } else {
    setMediaType('video');
    setBackgroundVideo(value);
  }
};

window.clearMediaSelection = function clearMediaSelection(type: 'image' | 'video') {
  if (type === 'image') {
    setBackgroundImage('');
  } else {
    setBackgroundVideo('');
  }
  setMediaType('none');
};

window.uploadMediaFile = function uploadMediaFile(type: 'image' | 'video') {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = type === 'image' ? 'image/*' : 'video/*';

  input.onchange = function onChange(event) {
    const target = event.target as HTMLInputElement | null;
    const file = target?.files?.[0];
    if (!file) return;

    const isValidType = type === 'image'
      ? file.type.startsWith('image/')
      : file.type.startsWith('video/');

    if (!isValidType) {
      updateStatus(`⚠️ Please select a valid ${type} file.`);
      return;
    }

    const fileURL = URL.createObjectURL(file);

    if (type === 'image') {
      const imageSelect = document.getElementById('bg-media-image') as HTMLSelectElement | null;
      if (imageSelect) imageSelect.value = '';
      setMediaType('image');
      setBackgroundImage(fileURL);
      updateStatus(`🖼️ Uploaded image applied: ${file.name}`);
    } else {
      const videoSelect = document.getElementById('bg-media-video') as HTMLSelectElement | null;
      if (videoSelect) videoSelect.value = '';
      setMediaType('video');
      setBackgroundVideo(fileURL);
      updateStatus(`🎥 Uploaded video applied: ${file.name}`);
    }
  };

  input.click();
};

window.randomizeBackgroundWithGlass = function randomizeBackgroundWithGlass() {
  if (!window.kwami?.body) {
    updateError('Kwami not initialized yet!');
    return;
  }

  const imageOptions = getMediaOptions('image');
  const videoOptions = getMediaOptions('video');

  const imageUrls = imageOptions.map((option) => resolveMediaPath(option)).filter(Boolean);
  const videoUrls = videoOptions.map((option) => resolveMediaPath(option)).filter(Boolean);

  const result = window.kwami.body.randomizeBackgroundWithGlass(imageUrls, videoUrls);

  if (result.backgroundType === 'image') {
    setMediaType('image', { silent: true });
    setBackgroundImage(result.backgroundUrl);
    const filename = result.backgroundUrl ? result.backgroundUrl.split('/').pop() : 'image';
    updateStatus(`🪟 Glass effect with ${filename} (opacity: ${(result.opacity * 100).toFixed(0)}%)`);
  } else if (result.backgroundType === 'video') {
    setMediaType('video', { silent: true });
    setBackgroundVideo(result.backgroundUrl);
    const filename = result.backgroundUrl ? result.backgroundUrl.split('/').pop() : 'video';
    updateStatus(`🪟 Glass effect with ${filename} (opacity: ${(result.opacity * 100).toFixed(0)}%)`);
  } else {
    setMediaType('none', { silent: true });
    updateStatus(`🪟 Glass effect with random gradient (opacity: ${(result.opacity * 100).toFixed(0)}%)`);
  }

  const glassCheckbox = document.getElementById('blob-image-transparency') as HTMLInputElement | null;
  if (glassCheckbox) glassCheckbox.checked = true;

  const opacitySlider = document.getElementById('blob-opacity') as HTMLInputElement | null;
  if (opacitySlider) opacitySlider.value = result.opacity.toFixed(2);
  updateValueDisplay('blob-opacity-value', result.opacity, 2);
};

window.resetBackground = function resetBackground() {
  const colorInputs = [
    document.getElementById('bg-color-1') as HTMLInputElement | null,
    document.getElementById('bg-color-2') as HTMLInputElement | null,
    document.getElementById('bg-color-3') as HTMLInputElement | null,
  ];
  colorInputs.forEach((input, index) => {
    if (input) input.value = DEFAULT_BACKGROUND.colors[index];
  });

  const angleSlider = document.getElementById('bg-gradient-angle') as HTMLInputElement | null;
  if (angleSlider) angleSlider.value = String(DEFAULT_BACKGROUND.angle);
  updateValueDisplay('bg-gradient-angle-value', DEFAULT_BACKGROUND.angle, 0);

  const stop1Slider = document.getElementById('bg-gradient-stop1') as HTMLInputElement | null;
  if (stop1Slider) stop1Slider.value = String(DEFAULT_BACKGROUND.stops[1] * 100);
  updateValueDisplay('bg-gradient-stop1-value', DEFAULT_BACKGROUND.stops[1] * 100, 0);

  const stop2Slider = document.getElementById('bg-gradient-stop2') as HTMLInputElement | null;
  if (stop2Slider) stop2Slider.value = String(DEFAULT_BACKGROUND.stops[2] * 100);
  updateValueDisplay('bg-gradient-stop2-value', DEFAULT_BACKGROUND.stops[2] * 100, 0);

  const gradientStyleSelect = document.getElementById('bg-gradient-style') as HTMLSelectElement | null;
  if (gradientStyleSelect) gradientStyleSelect.value = DEFAULT_BACKGROUND.style;

  const opacitySlider = document.getElementById('bg-opacity') as HTMLInputElement | null;
  if (opacitySlider) opacitySlider.value = String(DEFAULT_BACKGROUND.opacity);
  updateValueDisplay('bg-opacity-value', DEFAULT_BACKGROUND.opacity, 2);

  setMediaType('none', { silent: true });
  gradientOverlayOptIn = false;
  syncGradientOverlayState();
  applyBackground({ skipGradientOverlayOptIn: true });
  updateStatus('🔄 Background reset to defaults!');
};

export { setMediaType, setBackgroundImage, setBackgroundVideo, applyBackground };