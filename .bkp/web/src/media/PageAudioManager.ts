import { getCurrentLanguage } from '../i18n';
import { getKwamiInstance, setVoicePlaying, setMusicPlaying } from './AudioController';

/**
 * PageAudioManager handles page-specific audio playback with i18n support
 * Loads audio files from /voice/<lang>/<page-id>.mp3 with fallback to /voice/en/<page-id>.mp3
 */
export class PageAudioManager {
  private currentPageAudio: string | null = null;
  private isPlaying = false;
  private currentPage: number | null = null;

  /**
   * Get the audio URL for a specific page with i18n support
   * @param pageId - The page number (e.g., 0, 1, 2, etc.)
   * @returns The audio URL or null if not available
   */
  private async getPageAudioUrl(pageId: number): Promise<string | null> {
    const pageIdStr = pageId.toString().padStart(2, '0');
    const currentLang = getCurrentLanguage();
    
    // Try current language first
    const langUrl = `/voice/${currentLang}/${pageIdStr}.mp3`;
    const langExists = await this.checkAudioExists(langUrl);
    
    if (langExists) {
      console.log(`🎤 Found page audio for ${pageIdStr} in language: ${currentLang}`);
      return langUrl;
    }
    
    // Fallback to English
    const enUrl = `/voice/en/${pageIdStr}.mp3`;
    const enExists = await this.checkAudioExists(enUrl);
    
    if (enExists) {
      console.log(`🎤 Falling back to English audio for page ${pageIdStr}`);
      return enUrl;
    }
    
    console.warn(`⚠️ No audio found for page ${pageIdStr} in ${currentLang} or en`);
    return null;
  }

  /**
   * Check if an audio file exists
   */
  private async checkAudioExists(url: string): Promise<boolean> {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  /**
   * Load and play audio for a specific page
   * @param pageId - The page number (0-indexed)
   */
  async loadAndPlayPageAudio(pageId: number): Promise<void> {
    const kwami = getKwamiInstance();
    if (!kwami) {
      console.warn('🎤 Kwami instance not ready yet');
      return;
    }

    // Don't reload if already playing the same page
    if (this.currentPage === pageId && this.isPlaying) {
      console.log(`🎤 Page ${pageId} audio already playing`);
      return;
    }

    const audioUrl = await this.getPageAudioUrl(pageId);
    if (!audioUrl) {
      // Stop any currently playing audio if no audio for this page
      this.stopPageAudio();
      return;
    }

    try {
      // Stop any currently playing audio
      this.stopPageAudio();

      this.currentPageAudio = audioUrl;
      this.currentPage = pageId;

      console.log(`🎤 Loading page audio: ${audioUrl}`);
      kwami.body.audio.loadAudioSource(audioUrl);
      await kwami.body.audio.play();
      
      this.isPlaying = true;
      setVoicePlaying(true);
      setMusicPlaying(false);

      // Handle audio end
      const audioElement = kwami.body.audio.getAudioElement();
      const handler = () => {
        this.isPlaying = false;
        setVoicePlaying(false);
      };
      audioElement.addEventListener('ended', handler, { once: true });

    } catch (error) {
      console.error('❌ Failed to play page audio:', error);
      this.isPlaying = false;
      setVoicePlaying(false);
    }
  }

  /**
   * Toggle play/pause for current page audio
   */
  async togglePageAudio(): Promise<void> {
    const kwami = getKwamiInstance();
    if (!kwami) {
      return;
    }

    if (this.isPlaying) {
      // Pause
      kwami.body.audio.pause();
      this.isPlaying = false;
      setVoicePlaying(false);
      console.log('⏸️ Page audio paused');
    } else if (this.currentPageAudio) {
      // Resume
      try {
        await kwami.body.audio.play();
        this.isPlaying = true;
        setVoicePlaying(true);
        console.log('▶️ Page audio resumed');
      } catch (error) {
        console.error('❌ Failed to resume page audio:', error);
      }
    }
  }

  /**
   * Stop page audio playback
   */
  stopPageAudio(): void {
    const kwami = getKwamiInstance();
    if (!kwami) {
      return;
    }

    if (this.isPlaying) {
      kwami.body.audio.pause();
      this.isPlaying = false;
      setVoicePlaying(false);
      console.log('⏹️ Page audio stopped');
    }
  }

  /**
   * Check if page audio is currently playing
   */
  isPageAudioPlaying(): boolean {
    return this.isPlaying;
  }

  /**
   * Get current page
   */
  getCurrentPage(): number | null {
    return this.currentPage;
  }
}

// Singleton instance
let pageAudioManager: PageAudioManager | null = null;

export function getPageAudioManager(): PageAudioManager {
  if (!pageAudioManager) {
    pageAudioManager = new PageAudioManager();
  }
  return pageAudioManager;
}

