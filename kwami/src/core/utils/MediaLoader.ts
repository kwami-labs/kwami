/**
 * MediaLoader - Universal media loading utility
 * 
 * Handles loading media (images, videos, audio) from multiple sources:
 * - File uploads
 * - URLs (direct links)
 * - Data URLs
 * 
 * Part of the Kwami core library for consistent media handling across the application.
 */

import { logger } from '../../utils/logger';

export type MediaType = 'image' | 'video' | 'audio';

export interface MediaLoadOptions {
  /** Media type to load */
  type: MediaType;
  /** Maximum file size in MB (default: 100) */
  maxSizeMB?: number;
  /** Allowed file extensions */
  allowedExtensions?: string[];
  /** Callback for load progress */
  onProgress?: (percent: number) => void;
  /** Callback for successful load */
  onLoad?: (url: string, source: 'file' | 'url') => void;
  /** Callback for errors */
  onError?: (error: Error) => void;
}

export interface MediaValidationResult {
  valid: boolean;
  error?: string;
  url?: string;
}

/**
 * MediaLoader class - Core utility for loading media from files or URLs
 */
export class MediaLoader {
  private static readonly DEFAULT_MAX_SIZE_MB = 100;
  
  private static readonly MEDIA_TYPES: Record<MediaType, string[]> = {
    image: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp', '.ico'],
    video: ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.mkv'],
    audio: ['.mp3', '.wav', '.ogg', '.m4a', '.flac', '.aac', '.wma']
  };

  private static readonly MIME_TYPES: Record<MediaType, string[]> = {
    image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'image/bmp'],
    video: ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime', 'video/x-msvideo'],
    audio: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4', 'audio/flac', 'audio/aac']
  };

  /**
   * Load media from a File object
   */
  static async loadFromFile(
    file: File,
    options: MediaLoadOptions
  ): Promise<MediaValidationResult> {
    try {
      // Validate file type
      const typeValid = this.validateFileType(file, options.type);
      if (!typeValid.valid) {
        return typeValid;
      }

      // Validate file size
      const maxSize = (options.maxSizeMB || this.DEFAULT_MAX_SIZE_MB) * 1024 * 1024;
      if (file.size > maxSize) {
        return {
          valid: false,
          error: `File size exceeds ${options.maxSizeMB || this.DEFAULT_MAX_SIZE_MB}MB limit`
        };
      }

      // Create object URL
      const url = URL.createObjectURL(file);

      // Call onProgress if provided
      if (options.onProgress) {
        options.onProgress(100);
      }

      // Call onLoad callback
      if (options.onLoad) {
        options.onLoad(url, 'file');
      }

      return {
        valid: true,
        url
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error loading file';
      if (options.onError) {
        options.onError(new Error(errorMessage));
      }
      return {
        valid: false,
        error: errorMessage
      };
    }
  }

  /**
   * Load media from a URL
   */
  static async loadFromURL(
    url: string,
    options: MediaLoadOptions
  ): Promise<MediaValidationResult> {
    try {
      // Validate URL format
      if (!this.isValidURL(url)) {
        return {
          valid: false,
          error: 'Invalid URL format'
        };
      }

      // Check if it's a data URL
      if (url.startsWith('data:')) {
        const isValid = this.validateDataURL(url, options.type);
        if (!isValid) {
          return {
            valid: false,
            error: `Invalid data URL for ${options.type}`
          };
        }
        
        if (options.onLoad) {
          options.onLoad(url, 'url');
        }
        
        return {
          valid: true,
          url
        };
      }

      // Validate by extension (if possible)
      const extensionValid = this.validateURLExtension(url, options.type);
      if (!extensionValid) {
        return {
          valid: false,
          error: `URL does not appear to be a valid ${options.type} file`
        };
      }

      // Try to validate by fetching headers (HEAD request)
      try {
        const validation = await this.validateURLByHeaders(url, options.type);
        if (!validation.valid) {
          // If HEAD request fails, still allow it but warn
          logger.warn(`Could not validate URL headers: ${validation.error}`);
        }
      } catch (e) {
        // HEAD request failed, but we'll still try to use the URL
        logger.warn('HEAD request failed, using URL anyway');
      }

      // Call onLoad callback
      if (options.onLoad) {
        options.onLoad(url, 'url');
      }

      return {
        valid: true,
        url
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error loading URL';
      if (options.onError) {
        options.onError(new Error(errorMessage));
      }
      return {
        valid: false,
        error: errorMessage
      };
    }
  }

  /**
   * Validate file type
   */
  private static validateFileType(file: File, type: MediaType): MediaValidationResult {
    const allowedMimes = this.MIME_TYPES[type];
    const fileType = file.type.toLowerCase();

    // Check MIME type
    if (allowedMimes.some(mime => fileType.startsWith(mime.split('/')[0]))) {
      return { valid: true };
    }

    // Check file extension
    const fileName = file.name.toLowerCase();
    const allowedExtensions = this.MEDIA_TYPES[type];
    if (allowedExtensions.some(ext => fileName.endsWith(ext))) {
      return { valid: true };
    }

    return {
      valid: false,
      error: `Invalid file type. Expected ${type} file.`
    };
  }

  /**
   * Check if a string is a valid URL
   */
  private static isValidURL(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Validate data URL
   */
  private static validateDataURL(dataURL: string, type: MediaType): boolean {
    const allowedMimes = this.MIME_TYPES[type];
    const mimeMatch = dataURL.match(/^data:([^;]+);/);
    if (!mimeMatch) return false;

    const mime = mimeMatch[1].toLowerCase();
    return allowedMimes.some(allowed => mime.startsWith(allowed.split('/')[0]));
  }

  /**
   * Validate URL by file extension
   */
  private static validateURLExtension(url: string, type: MediaType): boolean {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname.toLowerCase();
      const allowedExtensions = this.MEDIA_TYPES[type];
      
      // Check if URL ends with allowed extension
      return allowedExtensions.some(ext => pathname.endsWith(ext));
    } catch {
      return false;
    }
  }

  /**
   * Validate URL by checking headers (HEAD request)
   */
  private static async validateURLByHeaders(
    url: string,
    type: MediaType
  ): Promise<MediaValidationResult> {
    try {
      const response = await fetch(url, { 
        method: 'HEAD',
        mode: 'cors'
      });

      if (!response.ok) {
        return {
          valid: false,
          error: `URL returned ${response.status} status`
        };
      }

      const contentType = response.headers.get('content-type');
      if (contentType) {
        const allowedMimes = this.MIME_TYPES[type];
        const isValid = allowedMimes.some(mime => 
          contentType.toLowerCase().includes(mime.split('/')[0])
        );

        if (!isValid) {
          return {
            valid: false,
            error: `URL content type (${contentType}) does not match ${type}`
          };
        }
      }

      return { valid: true };
    } catch (error) {
      return {
        valid: false,
        error: error instanceof Error ? error.message : 'Failed to fetch URL headers'
      };
    }
  }

  /**
   * Get accepted file types for file input
   */
  static getAcceptAttribute(type: MediaType): string {
    return this.MIME_TYPES[type].join(',');
  }

  /**
   * Get allowed extensions for display
   */
  static getAllowedExtensions(type: MediaType): string[] {
    return this.MEDIA_TYPES[type];
  }

  /**
   * Revoke object URL to free memory
   */
  static revokeObjectURL(url: string): void {
    if (url.startsWith('blob:')) {
      URL.revokeObjectURL(url);
    }
  }

  /**
   * Create a file input element with proper configuration
   */
  static createFileInput(type: MediaType): HTMLInputElement {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = this.getAcceptAttribute(type);
    return input;
  }
}

