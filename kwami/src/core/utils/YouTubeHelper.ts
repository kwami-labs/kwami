/**
 * YouTube Helper - Utilities for handling YouTube video URLs
 */

export interface YouTubeVideoInfo {
  videoId: string;
  embedUrl: string;
  isYouTube: boolean;
}

/**
 * Extract YouTube video ID from various YouTube URL formats
 * Supports:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 * - https://m.youtube.com/watch?v=VIDEO_ID
 */
export function extractYouTubeVideoId(url: string): string | null {
  if (!url) return null;

  try {
    const urlObj = new URL(url);
    
    // youtube.com/watch?v=VIDEO_ID
    if (urlObj.hostname.includes('youtube.com') && urlObj.searchParams.has('v')) {
      return urlObj.searchParams.get('v');
    }
    
    // youtu.be/VIDEO_ID
    if (urlObj.hostname === 'youtu.be') {
      return urlObj.pathname.slice(1); // Remove leading slash
    }
    
    // youtube.com/embed/VIDEO_ID
    if (urlObj.hostname.includes('youtube.com') && urlObj.pathname.includes('/embed/')) {
      const parts = urlObj.pathname.split('/');
      const embedIndex = parts.indexOf('embed');
      if (embedIndex >= 0 && parts[embedIndex + 1]) {
        return parts[embedIndex + 1];
      }
    }
    
    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Check if a URL is a YouTube URL
 */
export function isYouTubeUrl(url: string): boolean {
  return extractYouTubeVideoId(url) !== null;
}

/**
 * Convert YouTube URL to embed URL
 */
export function getYouTubeEmbedUrl(url: string, options: {
  autoplay?: boolean;
  mute?: boolean;
  loop?: boolean;
  controls?: boolean;
  playlistId?: string;
} = {}): string | null {
  const videoId = extractYouTubeVideoId(url);
  if (!videoId) return null;

  const params = new URLSearchParams();
  
  if (options.autoplay) params.set('autoplay', '1');
  if (options.mute) params.set('mute', '1');
  if (options.loop) {
    params.set('loop', '1');
    // YouTube requires playlist parameter for loop to work
    params.set('playlist', options.playlistId || videoId);
  }
  if (options.controls === false) params.set('controls', '0');
  
  // Enable iframe API
  params.set('enablejsapi', '1');
  // Hide YouTube logo
  params.set('modestbranding', '1');
  // Disable related videos from other channels
  params.set('rel', '0');

  const queryString = params.toString();
  return `https://www.youtube.com/embed/${videoId}${queryString ? '?' + queryString : ''}`;
}

/**
 * Get YouTube video info from URL
 */
export function getYouTubeVideoInfo(url: string): YouTubeVideoInfo | null {
  const videoId = extractYouTubeVideoId(url);
  if (!videoId) {
    return null;
  }

  return {
    videoId,
    embedUrl: getYouTubeEmbedUrl(url, {
      autoplay: true,
      mute: true,
      loop: true,
      controls: false,
    }) || '',
    isYouTube: true,
  };
}

/**
 * Create an iframe element for YouTube video
 */
export function createYouTubeIframe(url: string, options: {
  width?: number;
  height?: number;
  autoplay?: boolean;
  mute?: boolean;
  loop?: boolean;
  controls?: boolean;
} = {}): HTMLIFrameElement | null {
  const embedUrl = getYouTubeEmbedUrl(url, options);
  if (!embedUrl) return null;

  const iframe = document.createElement('iframe');
  iframe.src = embedUrl;
  iframe.width = options.width?.toString() || '100%';
  iframe.height = options.height?.toString() || '100%';
  iframe.style.border = 'none';
  iframe.style.position = 'absolute';
  iframe.style.top = '0';
  iframe.style.left = '0';
  iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
  iframe.allowFullscreen = true;

  return iframe;
}

