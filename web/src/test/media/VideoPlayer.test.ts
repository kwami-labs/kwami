import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getVideoState } from '../../media/VideoPlayer';

// Mock AudioController
vi.mock('../../media/AudioController', () => ({
  getKwamiInstance: vi.fn(() => null)
}));

// Mock SongTitleDisplay
vi.mock('../../media/SongTitleDisplay', () => ({
  showSongTitle: vi.fn(),
  hideSongTitle: vi.fn()
}));

// Mock constants
vi.mock('../../config/constants', () => ({
  VIDEO_FILES: [
    '/video/video1.mp4',
    '/video/video2.mp4'
  ]
}));

// Mock media utils
vi.mock('../../utils/mediaUtils', () => ({
  getMediaDisplayName: vi.fn((path) => path.split('/').pop() || 'Unknown Video')
}));

describe('VideoPlayer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return video state', () => {
    const state = getVideoState();
    expect(state).toHaveProperty('currentVideoUrl');
    expect(state).toHaveProperty('isVideoLoading');
    expect(state).toHaveProperty('currentVideoMode');
  });

  it('should initialize with no video mode', () => {
    const state = getVideoState();
    expect(state.currentVideoMode).toBe('none');
    expect(state.currentVideoUrl).toBeNull();
    expect(state.isVideoLoading).toBe(false);
  });

  it('should have valid video mode values', () => {
    const state = getVideoState();
    const validModes = ['none', 'background', 'blob'];
    expect(validModes).toContain(state.currentVideoMode);
  });
});


