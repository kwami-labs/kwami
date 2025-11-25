/**
 * YouTube Connector for Kwami
 * 
 * Handles secure YouTube authentication and video management
 * Allows users to import and play their YouTube videos
 */

import { logger } from '../../utils/logger';

export interface YouTubeConfig {
  clientId?: string;
  apiKey?: string;
  scopes?: string[];
  discoveryDocs?: string[];
}

export interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  duration: string;
  channelTitle: string;
  publishedAt: string;
}

export interface YouTubePlaylist {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  videoCount: number;
}

export interface YouTubeAuthResult {
  success: boolean;
  error?: string;
  user?: {
    id: string;
    name: string;
    email: string;
    picture: string;
  };
}

/**
 * YouTubeConnector - Handles YouTube API integration
 */
export class YouTubeConnector {
  private config: YouTubeConfig;
  private isInitialized = false;
  private isAuthenticated = false;
  private gapi: any = null;
  private accessToken: string | null = null;

  constructor(config: YouTubeConfig = {}) {
    this.config = {
      scopes: config.scopes || ['https://www.googleapis.com/auth/youtube.readonly'],
      discoveryDocs: config.discoveryDocs || ['https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest'],
      ...config,
    };
  }

  /**
   * Initialize the YouTube API
   */
  async initialize(): Promise<boolean> {
    if (this.isInitialized) {
      logger.info('YouTube connector already initialized');
      return true;
    }

    if (!this.config.clientId || !this.config.apiKey) {
      logger.warn('YouTube API credentials not provided. Connector will work in limited mode.');
      return false;
    }

    try {
      // Load Google API client library
      await this.loadGoogleApiScript();
      
      // Initialize gapi client
      await this.initializeGapiClient();
      
      this.isInitialized = true;
      logger.info('YouTube connector initialized successfully');
      return true;
    } catch (error) {
      logger.error('Failed to initialize YouTube connector:', error);
      return false;
    }
  }

  /**
   * Load Google API script
   */
  private loadGoogleApiScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Check if already loaded
      if ((window as any).gapi) {
        this.gapi = (window as any).gapi;
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = () => {
        this.gapi = (window as any).gapi;
        resolve();
      };
      script.onerror = () => reject(new Error('Failed to load Google API script'));
      document.head.appendChild(script);
    });
  }

  /**
   * Initialize GAPI client
   */
  private initializeGapiClient(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.gapi.load('client:auth2', async () => {
        try {
          await this.gapi.client.init({
            apiKey: this.config.apiKey,
            clientId: this.config.clientId,
            scope: this.config.scopes?.join(' '),
            discoveryDocs: this.config.discoveryDocs,
          });
          resolve();
        } catch (error) {
          reject(error);
        }
      });
    });
  }

  /**
   * Sign in to YouTube
   */
  async signIn(): Promise<YouTubeAuthResult> {
    if (!this.isInitialized) {
      const initialized = await this.initialize();
      if (!initialized) {
        return {
          success: false,
          error: 'YouTube connector not initialized. API credentials missing.',
        };
      }
    }

    try {
      const auth2 = this.gapi.auth2.getAuthInstance();
      const googleUser = await auth2.signIn();
      
      const profile = googleUser.getBasicProfile();
      const authResponse = googleUser.getAuthResponse();
      
      this.accessToken = authResponse.access_token;
      this.isAuthenticated = true;

      logger.info('Successfully signed in to YouTube');

      return {
        success: true,
        user: {
          id: profile.getId(),
          name: profile.getName(),
          email: profile.getEmail(),
          picture: profile.getImageUrl(),
        },
      };
    } catch (error) {
      logger.error('Failed to sign in to YouTube:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Sign out from YouTube
   */
  async signOut(): Promise<boolean> {
    if (!this.isInitialized || !this.isAuthenticated) {
      return true;
    }

    try {
      const auth2 = this.gapi.auth2.getAuthInstance();
      await auth2.signOut();
      
      this.isAuthenticated = false;
      this.accessToken = null;
      
      logger.info('Successfully signed out from YouTube');
      return true;
    } catch (error) {
      logger.error('Failed to sign out from YouTube:', error);
      return false;
    }
  }

  /**
   * Check if user is authenticated
   */
  isSignedIn(): boolean {
    return this.isAuthenticated;
  }

  /**
   * Get user's YouTube videos
   */
  async getUserVideos(maxResults = 50): Promise<YouTubeVideo[]> {
    if (!this.isAuthenticated) {
      throw new Error('Not authenticated. Please sign in first.');
    }

    try {
      const response = await this.gapi.client.youtube.search.list({
        part: 'snippet',
        forMine: true,
        type: 'video',
        maxResults,
      });

      return response.result.items.map((item: any) => ({
        id: item.id.videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnailUrl: item.snippet.thumbnails.medium.url,
        duration: '', // Would need separate API call to get duration
        channelTitle: item.snippet.channelTitle,
        publishedAt: item.snippet.publishedAt,
      }));
    } catch (error) {
      logger.error('Failed to fetch user videos:', error);
      throw error;
    }
  }

  /**
   * Get user's YouTube playlists
   */
  async getUserPlaylists(maxResults = 50): Promise<YouTubePlaylist[]> {
    if (!this.isAuthenticated) {
      throw new Error('Not authenticated. Please sign in first.');
    }

    try {
      const response = await this.gapi.client.youtube.playlists.list({
        part: 'snippet,contentDetails',
        mine: true,
        maxResults,
      });

      return response.result.items.map((item: any) => ({
        id: item.id,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnailUrl: item.snippet.thumbnails.medium.url,
        videoCount: item.contentDetails.itemCount,
      }));
    } catch (error) {
      logger.error('Failed to fetch user playlists:', error);
      throw error;
    }
  }

  /**
   * Get videos from a playlist
   */
  async getPlaylistVideos(playlistId: string, maxResults = 50): Promise<YouTubeVideo[]> {
    if (!this.isAuthenticated) {
      throw new Error('Not authenticated. Please sign in first.');
    }

    try {
      const response = await this.gapi.client.youtube.playlistItems.list({
        part: 'snippet',
        playlistId,
        maxResults,
      });

      return response.result.items.map((item: any) => ({
        id: item.snippet.resourceId.videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnailUrl: item.snippet.thumbnails.medium.url,
        duration: '',
        channelTitle: item.snippet.channelTitle,
        publishedAt: item.snippet.publishedAt,
      }));
    } catch (error) {
      logger.error('Failed to fetch playlist videos:', error);
      throw error;
    }
  }

  /**
   * Search YouTube videos (public search, doesn't require auth)
   */
  async searchVideos(query: string, maxResults = 25): Promise<YouTubeVideo[]> {
    if (!this.isInitialized) {
      throw new Error('YouTube connector not initialized');
    }

    try {
      const response = await this.gapi.client.youtube.search.list({
        part: 'snippet',
        q: query,
        type: 'video',
        maxResults,
      });

      return response.result.items.map((item: any) => ({
        id: item.id.videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnailUrl: item.snippet.thumbnails.medium.url,
        duration: '',
        channelTitle: item.snippet.channelTitle,
        publishedAt: item.snippet.publishedAt,
      }));
    } catch (error) {
      logger.error('Failed to search videos:', error);
      throw error;
    }
  }

  /**
   * Get video embed URL
   */
  getVideoEmbedUrl(videoId: string, options: {
    autoplay?: boolean;
    mute?: boolean;
    loop?: boolean;
    controls?: boolean;
  } = {}): string {
    const params = new URLSearchParams();
    
    if (options.autoplay) params.set('autoplay', '1');
    if (options.mute) params.set('mute', '1');
    if (options.loop) {
      params.set('loop', '1');
      params.set('playlist', videoId);
    }
    if (options.controls === false) params.set('controls', '0');
    
    params.set('enablejsapi', '1');
    params.set('modestbranding', '1');
    params.set('rel', '0');

    const queryString = params.toString();
    return `https://www.youtube.com/embed/${videoId}${queryString ? '?' + queryString : ''}`;
  }

  /**
   * Get access token
   */
  getAccessToken(): string | null {
    return this.accessToken;
  }
}

// Singleton instance
let youtubeConnector: YouTubeConnector | null = null;

/**
 * Get or create YouTube connector instance
 */
export function getYouTubeConnector(config?: YouTubeConfig): YouTubeConnector {
  if (!youtubeConnector) {
    youtubeConnector = new YouTubeConnector(config);
  }
  return youtubeConnector;
}

