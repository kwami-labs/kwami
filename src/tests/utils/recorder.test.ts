import { describe, it, expect, vi, beforeEach } from 'vitest';
import SpeechSynthesisRecorder from '../../utils/recorder';

describe('SpeechSynthesisRecorder', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Constructor', () => {
    it('should create an instance with required text', () => {
      const recorder = new SpeechSynthesisRecorder({ text: 'Hello world' });
      expect(recorder).toBeInstanceOf(SpeechSynthesisRecorder);
    });

    it('should throw error when text is not provided', () => {
      expect(() => {
        new SpeechSynthesisRecorder({ text: '' });
      }).toThrow('no words to synthesize');
    });

    it('should initialize with utterance options', () => {
      const recorder = new SpeechSynthesisRecorder({
        text: 'Test',
        utteranceOptions: {
          lang: 'en-US',
          rate: 1.5,
          pitch: 1.2,
        },
      });
      expect(recorder).toBeInstanceOf(SpeechSynthesisRecorder);
    });

    it('should validate rate within bounds (0.1 to 10)', () => {
      const recorder = new SpeechSynthesisRecorder({
        text: 'Test',
        utteranceOptions: { rate: 5 },
      });
      expect(recorder).toBeInstanceOf(SpeechSynthesisRecorder);
    });

    it('should validate pitch within bounds (0 to 2)', () => {
      const recorder = new SpeechSynthesisRecorder({
        text: 'Test',
        utteranceOptions: { pitch: 1.5 },
      });
      expect(recorder).toBeInstanceOf(SpeechSynthesisRecorder);
    });

    it('should accept custom recorder options', () => {
      const recorder = new SpeechSynthesisRecorder({
        text: 'Test',
        recorderOptions: {
          mimeType: 'audio/webm',
          bitsPerSecond: 128000,
        },
      });
      expect(recorder).toBeInstanceOf(SpeechSynthesisRecorder);
    });

    it('should accept dataType parameter', () => {
      const recorder = new SpeechSynthesisRecorder({
        text: 'Test',
        dataType: 'mediaStream',
      });
      expect(recorder).toBeInstanceOf(SpeechSynthesisRecorder);
    });
  });

  describe('start', () => {
    it('should start recording with text', async () => {
      const recorder = new SpeechSynthesisRecorder({ text: 'Hello' });
      const result = await recorder.start();
      expect(result).toBeDefined();
    });

    it('should accept new text in start method', async () => {
      const recorder = new SpeechSynthesisRecorder({ text: 'Hello' });
      const result = await recorder.start('New text');
      expect(result).toBeDefined();
    });

    it('should throw error when starting without text', async () => {
      const recorder = new SpeechSynthesisRecorder({ text: 'Hello' });
      await expect(async () => {
        (recorder as any).text = '';
        await recorder.start();
      }).rejects.toThrow('no words to synthesize');
    });

    it('should return mediaStream data when dataType is mediaStream', async () => {
      const recorder = new SpeechSynthesisRecorder({
        text: 'Test',
        dataType: 'mediaStream',
      });
      const result = await recorder.start();
      expect(result).toHaveProperty('tts');
      expect(result).toHaveProperty('data');
    });
  });

  describe('blob', () => {
    it('should throw error when no data to return', async () => {
      const recorder = new SpeechSynthesisRecorder({ text: 'Test' });
      await expect(recorder.blob()).rejects.toThrow('no data to return');
    });

    it('should return blob after recording', async () => {
      const recorder = new SpeechSynthesisRecorder({ text: 'Test' });
      await recorder.start();
      
      // Simulate data available
      (recorder as any).chunks = [new Blob(['test'])];
      
      const result = await recorder.blob();
      expect(result).toHaveProperty('tts');
      expect(result).toHaveProperty('data');
      expect(result.data).toBeInstanceOf(Blob);
    });

    it('should return single chunk when chunks length is 1', async () => {
      const recorder = new SpeechSynthesisRecorder({ text: 'Test' });
      const testBlob = new Blob(['test']);
      (recorder as any).chunks = [testBlob];
      
      const result = await recorder.blob();
      expect(result.data).toBe(testBlob);
    });

    it('should combine multiple chunks into single blob', async () => {
      const recorder = new SpeechSynthesisRecorder({ text: 'Test' });
      (recorder as any).chunks = [new Blob(['test1']), new Blob(['test2'])];
      
      const result = await recorder.blob();
      expect(result.data).toBeInstanceOf(Blob);
    });
  });

  describe('arrayBuffer', () => {
    it('should throw error when no data to return', async () => {
      const recorder = new SpeechSynthesisRecorder({ text: 'Test' });
      await expect(recorder.arrayBuffer()).rejects.toThrow('no data to return');
    });

    it('should return arrayBuffer after recording', async () => {
      const recorder = new SpeechSynthesisRecorder({ text: 'Test' });
      (recorder as any).chunks = [new Blob(['test'])];
      
      const result = await recorder.arrayBuffer();
      expect(result).toHaveProperty('tts');
      expect(result).toHaveProperty('data');
      expect(result.data).toBeInstanceOf(ArrayBuffer);
    });

    it('should handle provided blob parameter', async () => {
      const recorder = new SpeechSynthesisRecorder({ text: 'Test' });
      (recorder as any).chunks = [new Blob(['test'])];
      
      const customBlob = new Blob(['custom']);
      const result = await recorder.arrayBuffer(customBlob);
      expect(result.data).toBeInstanceOf(ArrayBuffer);
    });
  });

  describe('audioBuffer', () => {
    it('should throw error when no data to return', async () => {
      const recorder = new SpeechSynthesisRecorder({ text: 'Test' });
      await expect(recorder.audioBuffer()).rejects.toThrow('no data to return');
    });

    it('should return audioBuffer after recording', async () => {
      const recorder = new SpeechSynthesisRecorder({ text: 'Test' });
      (recorder as any).chunks = [new Blob(['test'])];
      
      const result = await recorder.audioBuffer();
      expect(result).toHaveProperty('tts');
      expect(result).toHaveProperty('data');
    });
  });

  describe('mediaSource', () => {
    it('should throw error when no data to return', async () => {
      const recorder = new SpeechSynthesisRecorder({ text: 'Test' });
      await expect(recorder.mediaSource()).rejects.toThrow('no data to return');
    });

    it('should return mediaSource after recording', async () => {
      const recorder = new SpeechSynthesisRecorder({ text: 'Test' });
      (recorder as any).chunks = [new Blob(['test'])];
      
      const promise = recorder.mediaSource();
      
      // Trigger onsourceopen
      setTimeout(() => {
        (recorder as any).mediaSource_.onsourceopen?.();
      }, 10);
      
      const result = await promise;
      expect(result).toHaveProperty('tts');
      expect(result).toHaveProperty('data');
    });
  });

  describe('readableStream', () => {
    it('should throw error when no data to return', async () => {
      const recorder = new SpeechSynthesisRecorder({ text: 'Test' });
      await expect(recorder.readableStream()).rejects.toThrow('no data to return');
    });

    it('should return readableStream after recording', async () => {
      const recorder = new SpeechSynthesisRecorder({ text: 'Test' });
      (recorder as any).chunks = [new Blob(['test'])];
      
      const result = await recorder.readableStream();
      expect(result).toHaveProperty('tts');
      expect(result).toHaveProperty('data');
      expect(result.data).toBeInstanceOf(ReadableStream);
    });

    it('should accept custom options', async () => {
      const recorder = new SpeechSynthesisRecorder({ text: 'Test' });
      (recorder as any).chunks = [new Blob(['test'])];
      
      const result = await recorder.readableStream({
        size: 2048,
        controllerOptions: {},
        rsOptions: {},
      });
      expect(result.data).toBeInstanceOf(ReadableStream);
    });

    it('should use default size of 1024', async () => {
      const recorder = new SpeechSynthesisRecorder({ text: 'Test' });
      (recorder as any).chunks = [new Blob(['test'])];
      
      const result = await recorder.readableStream();
      expect(result.data).toBeInstanceOf(ReadableStream);
    });
  });
});

