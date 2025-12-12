import mediaLoadingManager from '../media-loading-manager.js';
import { showError, updateStatus } from '../ui/messages.js';
import { IMAGE_PRESETS, VIDEO_PRESETS } from './media-loaders.js';

let currentBlobMediaType: 'none' | 'image' | 'video' = 'none';

function resolveMediaPath(value: string): string {
  const fn = (window as any).resolveMediaPath as ((v: string) => string) | undefined;
  return fn ? fn(value) : value;
}

function getBlobMediaOptions(type: 'image' | 'video') {
  return type === 'video'
    ? VIDEO_PRESETS.map((preset) => preset.value)
    : IMAGE_PRESETS.map((preset) => preset.value);
}

function updateBlobMediaTabs(activeType: typeof currentBlobMediaType) {
  const tabs = document.querySelectorAll<HTMLElement>('#blob-media-tabs .media-tab');
  tabs.forEach((tab) => {
    tab.classList.toggle('active', tab.dataset.media === activeType);
  });
}

function showBlobMediaControls(activeType: typeof currentBlobMediaType) {
  const imageControls = document.getElementById('blob-media-image-controls') as HTMLElement | null;
  const videoControls = document.getElementById('blob-media-video-controls') as HTMLElement | null;

  if (imageControls) imageControls.style.display = activeType === 'image' ? 'block' : 'none';
  if (videoControls) videoControls.style.display = activeType === 'video' ? 'block' : 'none';
}

export function setBlobMediaType(type: typeof currentBlobMediaType) {
  currentBlobMediaType = type;
  updateBlobMediaTabs(type);
  showBlobMediaControls(type);

  if (type === 'none') {
    const imageSelect = document.getElementById('blob-media-image') as HTMLSelectElement | null;
    if (imageSelect) imageSelect.value = '';

    const videoSelect = document.getElementById('blob-media-video') as HTMLSelectElement | null;
    if (videoSelect) videoSelect.value = '';

    updateStatus('🧽 Blob texture cleared');
  }
}

window.setBlobMediaType = setBlobMediaType;

window.randomizeBlobMedia = function randomizeBlobMedia(type: 'image' | 'video') {
  const options = getBlobMediaOptions(type);
  if (!options.length) {
    updateStatus(type === 'image'
      ? '⚠️ No image options available for blob texture.'
      : '⚠️ No video options available for blob texture.');
    return;
  }

  const value = options[Math.floor(Math.random() * options.length)];
  const resolved = resolveMediaPath(value);

  if (type === 'image') {
    mediaLoadingManager.show('Loading blob texture...');
    setBlobMediaType('image');
    window.kwami?.body?.setBlobSurfaceImage?.(resolved);
    updateStatus(`🖼️ Blob texture: ${value.split('/').pop()}`);
    setTimeout(() => mediaLoadingManager.hide(), 500);
  } else {
    mediaLoadingManager.show('Loading blob video texture...');
    setBlobMediaType('video');
    window.kwami?.body?.setBlobSurfaceVideo?.(resolved, { autoplay: true, loop: true, muted: true });
    updateStatus(`🎥 Blob video texture: ${value.split('/').pop()}`);
    setTimeout(() => mediaLoadingManager.hide(), 800);
  }
};

window.clearBlobMedia = function clearBlobMedia() {
  setBlobMediaType('none');
  window.kwami?.body?.clearBlobSurfaceMedia?.();
};

window.randomize3DTexture = function randomize3DTexture() {
  if (!window.kwami?.body) {
    showError('Kwami not initialized yet!');
    return;
  }

  const imageOptions = getBlobMediaOptions('image');
  const videoOptions = getBlobMediaOptions('video');

  const imageUrls = imageOptions.map(resolveMediaPath).filter(Boolean);
  const videoUrls = videoOptions.map(resolveMediaPath).filter(Boolean);

  if (imageUrls.length === 0 && videoUrls.length === 0) {
    updateStatus('⚠️ No texture options available. Add images or videos to blob texture section.');
    return;
  }

  const result = window.kwami.body.randomize3DTexture(imageUrls, videoUrls);

  if (result.type === 'image') {
    mediaLoadingManager.show('Loading random 3D texture...');
    setBlobMediaType('image');
    window.kwami?.body?.setBlobSurfaceImage?.(result.url);
    const filename = result.url ? String(result.url).split('/').pop() : 'texture';
    updateStatus(`🎲 Random 3D texture applied: ${filename}`);
    setTimeout(() => mediaLoadingManager.hide(), 500);
  } else if (result.type === 'video') {
    mediaLoadingManager.show('Loading random 3D video texture...');
    setBlobMediaType('video');
    window.kwami?.body?.setBlobSurfaceVideo?.(result.url, { autoplay: true, loop: true, muted: true });
    const filename = result.url ? String(result.url).split('/').pop() : 'texture';
    updateStatus(`🎲 Random 3D video texture applied: ${filename}`);
    setTimeout(() => mediaLoadingManager.hide(), 800);
  } else {
    setBlobMediaType('none');
    updateStatus('🧹 Blob texture cleared');
  }
};
