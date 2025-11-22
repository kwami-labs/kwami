import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { KwamiAudio } from '../../../core/body/Audio';
import type { AudioConfig } from '../../../types';

describe('KwamiAudio', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Constructor', () => {
    it('should create instance with no audio files', () => {
      const audio = new KwamiAudio();
      expect(audio).toBeInstanceOf(KwamiAudio);
    });

    it('should create instance with audio files', () => {
      const files = ['/audio/track1.mp3', '/audio/track2.mp3'];
      const audio = new KwamiAudio(files);
      expect(audio).toBeInstanceOf(KwamiAudio);
    });

    it('should accept audio config', () => {
      const config: AudioConfig = {
        preload: 'metadata',
        autoInitialize: true,
        volume: 0.8,
      };
      const audio = new KwamiAudio([], config);
      expect(audio).toBeInstanceOf(KwamiAudio);
    });

    it('should skip auto-initialization when configured', () => {
      const audio = new KwamiAudio([], { autoInitialize: false });
      expect(audio).toBeInstanceOf(KwamiAudio);
    });
  });

  describe('play', () => {
    it('should play audio', async () => {
      const audio = new KwamiAudio(['/test.mp3']);
      await expect(audio.play()).resolves.toBeUndefined();
    });

    it('should handle play errors gracefully', async () => {
      const audio = new KwamiAudio(['/test.mp3']);
      const element = audio.getAudioElement();
      vi.spyOn(element, 'play').mockRejectedValue(new Error('Play failed'));
      
      await expect(audio.play()).resolves.toBeUndefined();
    });

    it('should initialize analyser on first play', async () => {
      const audio = new KwamiAudio(['/test.mp3'], { autoInitialize: false });
      await audio.play();
      
      expect((audio as any).analyser).toBeDefined();
    });
  });

  describe('pause', () => {
    it('should pause audio', () => {
      const audio = new KwamiAudio(['/test.mp3']);
      expect(() => audio.pause()).not.toThrow();
    });
  });

  describe('stop', () => {
    it('should stop audio and reset position', () => {
      const audio = new KwamiAudio(['/test.mp3']);
      audio.stop();
      
      const element = audio.getAudioElement();
      expect(element.currentTime).toBe(0);
    });
  });

  describe('Volume Control', () => {
    it('should set volume', () => {
      const audio = new KwamiAudio(['/test.mp3']);
      audio.setVolume(0.5);
      
      expect(audio.getVolume()).toBe(0.5);
    });

    it('should get volume', () => {
      const audio = new KwamiAudio(['/test.mp3']);
      const volume = audio.getVolume();
      
      expect(typeof volume).toBe('number');
      expect(volume).toBeGreaterThanOrEqual(0);
      expect(volume).toBeLessThanOrEqual(1);
    });

    it('should clamp volume between 0 and 1', () => {
      const audio = new KwamiAudio(['/test.mp3']);
      
      audio.setVolume(1.5);
      expect(audio.getVolume()).toBeLessThanOrEqual(1);
      
      audio.setVolume(-0.5);
      expect(audio.getVolume()).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Track Management', () => {
    it('should get audio element', () => {
      const audio = new KwamiAudio(['/test.mp3']);
      const element = audio.getAudioElement();
      
      expect(element).toBeInstanceOf(HTMLAudioElement);
    });

    it('should get file count', () => {
      const files = ['/a.mp3', '/b.mp3', '/c.mp3'];
      const audio = new KwamiAudio(files);
      
      expect(audio.getFileCount()).toBe(3);
    });

    it('should get current file index', () => {
      const audio = new KwamiAudio(['/test.mp3']);
      const index = audio.getCurrentFileIndex();
      
      expect(typeof index).toBe('number');
      expect(index).toBeGreaterThanOrEqual(0);
    });

    it('should get all files', () => {
      const files = ['/a.mp3', '/b.mp3'];
      const audio = new KwamiAudio(files);
      
      expect(audio.getFiles()).toEqual(files);
    });
  });

  describe('Frequency Data', () => {
    it('should get frequency data', () => {
      const audio = new KwamiAudio(['/test.mp3']);
      const data = audio.getFrequencyData();
      
      expect(data).toBeInstanceOf(Uint8Array);
    });

    it('should update frequency data', () => {
      const audio = new KwamiAudio(['/test.mp3']);
      audio.updateFrequencyData();
      
      const data = audio.getFrequencyData();
      expect(data).toBeInstanceOf(Uint8Array);
    });

    it('should get analyser', () => {
      const audio = new KwamiAudio(['/test.mp3']);
      const analyser = audio.getAnalyser();
      
      expect(analyser).toBeDefined();
    });
  });

  describe('Stream Audio', () => {
    it('should connect stream for real-time analysis', () => {
      const audio = new KwamiAudio(['/test.mp3']);
      const mockStream = new MediaStream();
      
      expect(() => audio.connectStreamForAnalysis(mockStream)).not.toThrow();
    });

    it('should disconnect stream', () => {
      const audio = new KwamiAudio(['/test.mp3']);
      expect(() => audio.disconnectStream()).not.toThrow();
    });

    it('should handle stream connection errors', () => {
      const audio = new KwamiAudio(['/test.mp3'], { autoInitialize: false });
      const mockStream = new MediaStream();
      
      expect(() => audio.connectStreamForAnalysis(mockStream)).not.toThrow();
    });
  });

  describe('Playback State', () => {
    it('should check if audio is playing', () => {
      const audio = new KwamiAudio(['/test.mp3']);
      const playing = audio.isPlaying();
      
      expect(typeof playing).toBe('boolean');
    });

    it('should get current time', () => {
      const audio = new KwamiAudio(['/test.mp3']);
      const time = audio.getCurrentTime();
      
      expect(typeof time).toBe('number');
      expect(time).toBeGreaterThanOrEqual(0);
    });

    it('should get duration', () => {
      const audio = new KwamiAudio(['/test.mp3']);
      const duration = audio.getDuration();
      
      expect(typeof duration).toBe('number');
    });

    it('should seek to position', () => {
      const audio = new KwamiAudio(['/test.mp3']);
      audio.seek(5);
      
      // Just verify it doesn't throw
      expect(audio.getCurrentTime()).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Playback Rate', () => {
    it('should set playback rate', () => {
      const audio = new KwamiAudio(['/test.mp3']);
      audio.setPlaybackRate(1.5);
      
      const element = audio.getAudioElement();
      expect(element.playbackRate).toBe(1.5);
    });

    it('should get playback rate', () => {
      const audio = new KwamiAudio(['/test.mp3']);
      const rate = audio.getPlaybackRate();
      
      expect(typeof rate).toBe('number');
      expect(rate).toBeGreaterThan(0);
    });
  });

  describe('Loop Mode', () => {
    it('should enable loop', () => {
      const audio = new KwamiAudio(['/test.mp3']);
      audio.setLoop(true);
      
      const element = audio.getAudioElement();
      expect(element.loop).toBe(true);
    });

    it('should disable loop', () => {
      const audio = new KwamiAudio(['/test.mp3']);
      audio.setLoop(false);
      
      const element = audio.getAudioElement();
      expect(element.loop).toBe(false);
    });
  });

  describe('Event Listeners', () => {
    it('should add event listener', () => {
      const audio = new KwamiAudio(['/test.mp3']);
      const handler = vi.fn();
      
      expect(() => audio.addEventListener('play', handler)).not.toThrow();
    });

    it('should remove event listener', () => {
      const audio = new KwamiAudio(['/test.mp3']);
      const handler = vi.fn();
      
      audio.addEventListener('play', handler);
      expect(() => audio.removeEventListener('play', handler)).not.toThrow();
    });
  });

  describe('Disposal', () => {
    it('should dispose audio resources', () => {
      const audio = new KwamiAudio(['/test.mp3']);
      expect(() => audio.dispose()).not.toThrow();
    });

    it('should cleanup analyser on dispose', () => {
      const audio = new KwamiAudio(['/test.mp3']);
      audio.dispose();
      
      expect((audio as any).analyser).toBeNull();
    });
  });
});

