import type { Kwami } from 'kwami';
import { VIDEO_FILES } from '../config/constants';
import { getMediaDisplayName } from '../utils/mediaUtils';
import { hideSongTitle, showSongTitle } from './SongTitleDisplay';
import { getKwamiInstance } from './AudioController';

/**
 * Check if a URL is a YouTube URL
 */
function isYouTubeUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.includes('youtube.com') || urlObj.hostname === 'youtu.be';
  } catch {
    return false;
  }
}

const PLAYABLE_VIDEO_LINKS = VIDEO_FILES.filter(url => typeof url === 'string' && url.length > 0);

let currentVideoUrl: string | null = null;
let isVideoLoading = false;
let currentVideoMode: 'none' | 'background' | 'blob' = 'none';
let activeVideoStream: MediaStream | null = null;
let videoElementCleanup: (() => void) | null = null;

type VideoAttachResult = 'success' | 'no-audio' | 'stream-error';

export function getVideoState() {
  return {
    currentVideoUrl,
    isVideoLoading,
    currentVideoMode,
  };
}

function getKwamiVideoElement(kwami: Kwami): HTMLVideoElement | null {
  const body = kwami.body as any;
  if (!body) {
    return null;
  }

  if (currentVideoMode === 'blob') {
    const blobVideo = typeof body.getBlobSurfaceVideoElement === 'function'
      ? body.getBlobSurfaceVideoElement()
      : body.blobSurfaceVideoElement;
    if (blobVideo instanceof HTMLVideoElement) {
      return blobVideo;
    }
  }

  const backgroundVideo = typeof body.getBackgroundVideoElement === 'function'
    ? body.getBackgroundVideoElement()
    : body.backgroundVideoElement;
  if (backgroundVideo instanceof HTMLVideoElement) {
    return backgroundVideo;
  }

  const candidates = [
    typeof body.getBackgroundVideoElement === 'function' ? body.getBackgroundVideoElement() : undefined,
    body.backgroundVideoElement,
    typeof body.getBlobSurfaceVideoElement === 'function' ? body.getBlobSurfaceVideoElement() : undefined,
    body.blobSurfaceVideoElement,
  ];

  for (const candidate of candidates) {
    if (candidate instanceof HTMLVideoElement) {
      return candidate;
    }
  }

  return null;
}

function pickRandomVideoUrl(exclude: Set<string> = new Set()): string | null {
  if (!PLAYABLE_VIDEO_LINKS.length) {
    return null;
  }

  const candidates = PLAYABLE_VIDEO_LINKS.filter(link => !exclude.has(link));
  if (!candidates.length) {
    return null;
  }

  let selectionPool = candidates;
  if (candidates.length > 1 && currentVideoUrl) {
    const filtered = candidates.filter(link => link !== currentVideoUrl);
    if (filtered.length) {
      selectionPool = filtered;
    }
  }

  const randomIndex = Math.floor(Math.random() * selectionPool.length);
  return selectionPool[randomIndex];
}

function cleanupVideoElementListeners() {
  if (videoElementCleanup) {
    videoElementCleanup();
    videoElementCleanup = null;
  }
}

function releaseActiveVideoStream() {
  if (activeVideoStream) {
    activeVideoStream.getTracks().forEach(track => track.stop());
    activeVideoStream = null;
  }
}

export function stopVideoPlayback(explicitKwami?: Kwami | null, options: { preserveUrl?: boolean } = {}) {
  const kwami = explicitKwami ?? getKwamiInstance();

  cleanupVideoElementListeners();
  releaseActiveVideoStream();
  hideSongTitle();

  if (!kwami) {
    currentVideoUrl = null;
    currentVideoMode = 'none';
    isVideoLoading = false;
    return;
  }

  try {
    const activeVideo = getKwamiVideoElement(kwami);
    activeVideo?.pause();
  } catch (error) {
    console.warn('🎥 Failed to pause video element:', error);
  }

  kwami.body.audio.disconnectMediaStream();

  if (currentVideoMode === 'background') {
    kwami.body.clearBackgroundMedia();
  }
  if (currentVideoMode === 'blob' && typeof kwami.body.setBlobSurfaceVideo === 'function') {
    kwami.body.setBlobSurfaceVideo(null);
  }

  currentVideoMode = 'none';
  isVideoLoading = false;
  if (!options.preserveUrl) {
    currentVideoUrl = null;
  }
}

function waitForKwamiVideoElement(kwami: Kwami, timeout = 7000): Promise<HTMLVideoElement | null> {
  const start = performance.now();

  return new Promise(resolve => {
    let latestElement: HTMLVideoElement | null = null;

    const tick = () => {
      const videoElement = getKwamiVideoElement(kwami);
      if (videoElement) {
        latestElement = videoElement;
      }

      if (latestElement && latestElement.readyState >= 2) {
        resolve(latestElement);
        return;
      }

      if (performance.now() - start >= timeout) {
        resolve(latestElement);
        return;
      }

      requestAnimationFrame(tick);
    };

    tick();
  });
}

async function attachVideoAudioToKwami(
  kwami: Kwami,
  videoElement: HTMLVideoElement,
  sourceUrl: string,
  mode: 'background' | 'blob'
): Promise<VideoAttachResult> {
  cleanupVideoElementListeners();

  const handleEnded = () => {
    if (videoElement.loop) {
      return;
    }
    currentVideoMode = 'none';
  };

  const handleError = (event: Event) => {
    console.error('🎥 Blob surface video error:', event);
    stopVideoPlayback(kwami);
  };

  videoElement.addEventListener('ended', handleEnded);
  videoElement.addEventListener('error', handleError);
  videoElementCleanup = () => {
    videoElement.removeEventListener('ended', handleEnded);
    videoElement.removeEventListener('error', handleError);
  };

  const captureStream: (() => MediaStream | null) | undefined =
    (videoElement as any).captureStream ||
    (videoElement as any).mozCaptureStream ||
    (videoElement as any).webkitCaptureStream;

  if (typeof captureStream !== 'function') {
    console.warn('🎥 captureStream() not supported in this browser; skipping audio visualization for video.');
    return 'stream-error';
  }

  try {
    const stream = captureStream.call(videoElement);
    if (!stream) {
      console.warn('🎥 Failed to capture MediaStream from video element.');
      return 'stream-error';
    }

    const hasAudioTrack = stream.getAudioTracks().length > 0;
    if (!hasAudioTrack) {
      return 'no-audio';
    }

    releaseActiveVideoStream();
    activeVideoStream = stream;

    await kwami.body.audio.connectMediaStream(stream);

    if (videoElement.paused) {
      await videoElement.play().catch(() => {});
    }

    console.log(`🎥 Blob video audio stream attached: ${sourceUrl}`);
    currentVideoMode = mode;
    return 'success';
  } catch (error) {
    console.error('🎥 Unable to connect video audio stream:', error);
    return 'stream-error';
  }
}

async function playVideoAsBackground(kwami: Kwami, url: string): Promise<boolean> {
  try {
    kwami.body.clearBackgroundMedia();
    kwami.body.setBackgroundVideo(url, {
      autoplay: true,
      loop: true,
      muted: true,
      fit: 'cover',
    });

    // Check if it's a YouTube URL
    if (isYouTubeUrl(url)) {
      // YouTube videos use iframe embedding, no video element to wait for
      const videoName = getMediaDisplayName(url);
      showSongTitle(videoName, 'video');
      currentVideoMode = 'background';
      console.log('🎥 YouTube video background loaded successfully!');
      return true;
    }

    // For regular video files, wait for video element
    const videoElement = await waitForKwamiVideoElement(kwami);

    if (!videoElement) {
      console.warn('🎥 Background video element was not ready, trying another source...');
      return false;
    }

    videoElement.muted = true;
    videoElement.volume = 0;

    if (videoElement.paused) {
      try {
        await videoElement.play();
      } catch (playError) {
        console.warn('🎥 Failed to auto-play background video:', playError);
      }
    }

    const attachResult = await attachVideoAudioToKwami(kwami, videoElement, url, 'background');
    const videoName = getMediaDisplayName(url);
    showSongTitle(videoName, 'video');

    if (attachResult === 'success') {
      console.log('🎥 Video streaming with audio-reactive blob!');
      return true;
    }

    if (attachResult === 'no-audio') {
      console.warn('🎥 Video has no audio track. Playing visual-only background.');
      currentVideoMode = 'background';
      return true;
    }

    return false;
  } catch (error) {
    console.error('🎥 Error while loading background video:', error);
    return false;
  }
}

async function playVideoInsideBlob(kwami: Kwami, url: string): Promise<boolean> {
  try {
    kwami.body.clearBackgroundMedia();

    // YouTube videos don't support blob surface mode (can't texture map an iframe)
    // Fall back to background mode for YouTube URLs
    if (isYouTubeUrl(url)) {
      console.log('🎥 YouTube videos in blob mode not supported, using background mode instead');
      return await playVideoAsBackground(kwami, url);
    }

    kwami.body.setBlobSurfaceVideo(url, {
      autoplay: true,
      loop: true,
      muted: true,
      playbackRate: 1,
    });

    currentVideoMode = 'blob';

    const videoElement = await waitForKwamiVideoElement(kwami);

    if (!videoElement) {
      console.warn('🎥 Blob video element was not ready, trying another source...');
      currentVideoMode = 'none';
      return false;
    }

    videoElement.muted = true;

    if (videoElement.paused) {
      try {
        await videoElement.play();
      } catch (playError) {
        console.warn('🎥 Failed to auto-play blob video:', playError);
      }
    }

    const attachResult = await attachVideoAudioToKwami(kwami, videoElement, url, 'blob');
    const videoName = getMediaDisplayName(url);
    showSongTitle(videoName, 'video');

    if (attachResult === 'success') {
      console.log('🎥 Video streaming inside blob with glass effect!');
      return true;
    }

    if (attachResult === 'no-audio') {
      console.warn('🎥 Blob video has no audio track. Showing visual-only mode.');
      return true;
    }

    return false;
  } catch (error) {
    console.error('🎥 Error while loading blob video:', error);
    return false;
  }
}

export async function playRandomVideo(options: { mode?: 'background' | 'blob'; reuseCurrent?: boolean } = {}) {
  const mode = options.mode ?? 'background';
  const reuseCurrent = options.reuseCurrent ?? false;

  if (isVideoLoading) {
    console.warn('🎥 A video is already loading, please wait...');
    return;
  }

  if (!PLAYABLE_VIDEO_LINKS.length) {
    console.warn('🎥 No video files found in /video/ directory');
    return;
  }

  const kwami = getKwamiInstance();
  if (!kwami) {
    console.warn('🎥 Kwami instance not ready yet');
    return;
  }

  const attempted = new Set<string>();
  let playbackStarted = false;

  isVideoLoading = true;
  stopVideoPlayback(kwami, { preserveUrl: reuseCurrent });

  try {
    while (attempted.size < PLAYABLE_VIDEO_LINKS.length) {
      let nextUrl: string | null = null;
      if (reuseCurrent && currentVideoUrl && attempted.size === 0) {
        nextUrl = currentVideoUrl;
      } else {
        nextUrl = pickRandomVideoUrl(attempted);
      }

      if (!nextUrl) {
        break;
      }

      attempted.add(nextUrl);
      currentVideoUrl = nextUrl;

      console.log(`🎥 Loading ${mode === 'blob' ? 'blob' : 'background'} video stream: ${nextUrl}`);

      playbackStarted = mode === 'blob'
        ? await playVideoInsideBlob(kwami, nextUrl)
        : await playVideoAsBackground(kwami, nextUrl);

      if (playbackStarted) {
        break;
      }
    }

    if (!playbackStarted) {
      console.warn('🎥 Could not start video playback from /video/ directory');
    }
  } finally {
    if (!playbackStarted) {
      stopVideoPlayback(kwami, { preserveUrl: reuseCurrent });
    }
    isVideoLoading = false;
  }
}

export async function toggleVideoPresentation() {
  if (currentVideoMode === 'background') {
    await playRandomVideo({ mode: 'blob', reuseCurrent: true });
    return;
  }

  if (currentVideoMode === 'blob') {
    await playRandomVideo({ mode: 'background', reuseCurrent: true });
    return;
  }

  await playRandomVideo({ mode: 'background' });
}


