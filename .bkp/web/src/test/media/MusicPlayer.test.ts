import { describe, it, expect, beforeEach, vi } from 'vitest';
import { isMusicPlaying, getMusicState } from '../../media/MusicPlayer';

// Mock the AudioController module
vi.mock('../../media/AudioController', () => ({
  getAudioState: vi.fn(() => ({
    isMusicPlaying: false,
    isVoicePlaying: false,
    isLowpassFilterActive: false
  })),
  getKwamiInstance: vi.fn(() => null),
  onAudioStop: vi.fn((callback) => {}),
  setLowpassState: vi.fn(),
  setMusicPlaying: vi.fn(),
  setVoicePlaying: vi.fn(),
  stopKwamiAudio: vi.fn()
}));

// Mock SongTitleDisplay
vi.mock('../../media/SongTitleDisplay', () => ({
  showSongTitle: vi.fn(),
  hideSongTitle: vi.fn()
}));

// Mock constants
vi.mock('../../config/constants', () => ({
  LOWPASS_CLOSED_FREQUENCY: 400,
  LOWPASS_OPEN_FREQUENCY: 22000,
  MUSIC_FILES: [
    '/music/song1.mp3',
    '/music/song2.mp3',
    '/music/song3.mp3'
  ]
}));

// Mock media utils
vi.mock('../../utils/mediaUtils', () => ({
  getMediaDisplayName: vi.fn((path) => path.split('/').pop() || 'Unknown')
}));

describe('MusicPlayer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return music playing state', () => {
    const isPlaying = isMusicPlaying();
    expect(typeof isPlaying).toBe('boolean');
  });

  it('should return music state with current index', () => {
    const state = getMusicState();
    expect(state).toHaveProperty('currentMusicIndex');
    expect(state).toHaveProperty('isMusicPlaying');
  });

  it('should initialize with negative music index', () => {
    const state = getMusicState();
    expect(state.currentMusicIndex).toBe(-1);
  });
});


