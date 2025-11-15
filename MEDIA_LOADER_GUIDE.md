# Media Loader - URL Upload Feature

## Overview

The Kwami playground now supports loading media (images, videos, audio) from **URLs** in addition to file uploads! This feature is fully integrated into the Kwami core library and provides a unified interface for media loading across the entire application.

## 🎯 Features

### Universal Media Loading
- ✅ **File Upload**: Traditional file picker with drag & drop support
- ✅ **URL Loading**: Direct URL input for remote media
- ✅ **Presets**: Quick access to curated media presets
- ✅ **Validation**: Automatic format and URL validation
- ✅ **Error Handling**: Clear error messages and status feedback

### Supported Media Types
- 🖼️ **Images**: JPG, PNG, GIF, WebP, SVG, BMP
- 🎥 **Videos**: MP4, WebM, OGG, MOV, AVI, MKV
- 🎵 **Audio**: MP3, WAV, OGG, M4A, FLAC, AAC

### Integration Points
- Background images (gradient overlay)
- Background videos
- Blob surface textures (images)
- Blob surface textures (videos)
- Audio player (future enhancement)

## 📦 Core Components

### 1. MediaLoader Utility (`src/core/utils/MediaLoader.ts`)

The core utility class that handles media loading from files and URLs.

```typescript
import { MediaLoader } from '@kwami';

// Load from URL
const result = await MediaLoader.loadFromURL('https://example.com/image.jpg', {
  type: 'image',
  onLoad: (url, source) => {
    console.log('Loaded:', url);
  },
  onError: (error) => {
    console.error('Error:', error);
  }
});

// Load from File
const file = fileInput.files[0];
const result = await MediaLoader.loadFromFile(file, {
  type: 'image',
  maxSizeMB: 100,
  onLoad: (url, source) => {
    console.log('Loaded:', url);
  }
});
```

**Key Methods:**
- `loadFromURL(url, options)` - Load media from a URL
- `loadFromFile(file, options)` - Load media from a file
- `getAcceptAttribute(type)` - Get HTML accept attribute
- `getAllowedExtensions(type)` - Get allowed file extensions
- `revokeObjectURL(url)` - Clean up blob URLs

### 2. MediaLoaderUI Component (`playground/media-loader-ui.js`)

Reusable UI component that provides a tabbed interface for media loading.

```javascript
import { createMediaLoaderUI } from './media-loader-ui.js';

const loader = createMediaLoaderUI({
  type: 'image',
  label: 'Background Image',
  presets: [
    { name: 'Galaxy', value: 'src/assets/img/galaxy.jpg' },
    { name: 'Mountains', value: 'https://example.com/mountains.jpg' }
  ],
  showPresets: true,
  onLoad: (url, source) => {
    // Handle loaded media
  },
  onError: (error) => {
    // Handle errors
  }
});

document.getElementById('container').appendChild(loader);
```

### 3. Styled UI Components (`playground/styles.css`)

Beautiful, modern CSS with:
- Smooth animations
- Hover effects
- Drag & drop visual feedback
- Status messages (success/error)
- Dark mode support
- Responsive design

## 🎨 UI Features

### Three Loading Methods

1. **Presets Tab** 📋
   - Quick access to curated media
   - Dropdown selection
   - Organized by category

2. **URL Tab** 🔗
   - Direct URL input
   - Real-time validation
   - Support for data URLs
   - CORS-friendly

3. **Upload Tab** 📁
   - File picker button
   - Drag & drop zone
   - Visual feedback on hover/drag
   - File type validation

### Visual Feedback

- ✅ **Success messages**: Green with checkmark icon
- ⚠️ **Error messages**: Red with warning icon
- ⏳ **Loading states**: Status indicators during operations
- 🎯 **Hover effects**: Smooth transitions and highlights

## 📍 Integration in Playground

### Background Media

**Location**: Body Section → Background → Media Background

```html
<!-- Background Image -->
<div id="bg-image-loader"></div>

<!-- Background Video -->
<div id="bg-video-loader"></div>
```

### Blob Texture Media

**Location**: Body Section → Blob Texture → Texture Source

```html
<!-- Blob Texture Image -->
<div id="blob-image-loader"></div>

<!-- Blob Texture Video -->
<div id="blob-video-loader"></div>
```

## 🔧 Usage Examples

### Load Image from URL

1. Navigate to **Body** → **Background** → **Media Background**
2. Select **Image** tab
3. Click **URL** tab
4. Paste image URL: `https://picsum.photos/1920/1080`
5. Click **Load** button
6. Image appears as background!

### Load Video from URL

1. Navigate to **Body** → **Blob Texture** → **Texture Source**
2. Select **Video** tab
3. Click **URL** tab
4. Paste video URL: `https://example.com/video.mp4`
5. Click **Load** button
6. Video texture applied to blob!

### Upload Local File

1. Navigate to any media section
2. Click **Upload** tab
3. Either:
   - Click **Choose File** button
   - Drag & drop file onto dropzone
4. File loads instantly!

## 🌐 URL Requirements

### Valid URL Formats

✅ **Direct URLs**
```
https://example.com/image.jpg
https://storage.googleapis.com/video.mp4
https://cdn.example.com/audio.mp3
```

✅ **Data URLs**
```
data:image/png;base64,iVBORw0KGgoAAAANS...
data:video/mp4;base64,AAAAIGZ0eXBpc29t...
```

### CORS Considerations

⚠️ **Note**: Some URLs may be blocked by CORS policies. For best results:
- Use URLs from the same domain
- Use services that allow cross-origin requests
- Use URLs with proper CORS headers

## 🎯 API Reference

### MediaLoader Options

```typescript
interface MediaLoadOptions {
  type: 'image' | 'video' | 'audio';
  maxSizeMB?: number;              // Default: 100
  allowedExtensions?: string[];    // Optional filter
  onProgress?: (percent: number) => void;
  onLoad?: (url: string, source: 'file' | 'url') => void;
  onError?: (error: Error) => void;
}
```

### MediaValidationResult

```typescript
interface MediaValidationResult {
  valid: boolean;
  error?: string;
  url?: string;
}
```

## 🎨 CSS Classes

### Main Container
- `.media-loader-container` - Main wrapper
- `.media-loader-tabs` - Tab navigation
- `.media-loader-content` - Content area

### Tabs
- `.media-loader-tab` - Individual tab button
- `.media-loader-tab.active` - Active tab
- `.media-loader-tab-content` - Tab content panel

### Input Elements
- `.media-loader-url-input` - URL text input
- `.media-loader-url-btn` - URL load button
- `.media-loader-upload-btn` - File upload button
- `.media-loader-dropzone` - Drag & drop area
- `.media-loader-preset-select` - Preset dropdown

### Status
- `.media-loader-status` - Status message container
- `.media-loader-status.success` - Success state
- `.media-loader-status.error` - Error state

## 🚀 Advanced Usage

### Custom Presets

```javascript
const customPresets = [
  { name: 'My Image 1', value: 'https://mycdn.com/img1.jpg' },
  { name: 'My Image 2', value: '/local/path/img2.png' },
  { name: 'My Image 3', value: 'data:image/png;base64,...' }
];

const loader = createMediaLoaderUI({
  type: 'image',
  label: 'Custom Images',
  presets: customPresets,
  onLoad: (url) => applyCustomImage(url)
});
```

### Programmatic Loading

```javascript
// Load from URL programmatically
import { MediaLoader } from '@kwami';

const result = await MediaLoader.loadFromURL(
  'https://example.com/video.mp4',
  {
    type: 'video',
    onLoad: (url) => {
      window.kwami.body.setBlobSurfaceVideo(url);
    }
  }
);
```

### Error Handling

```javascript
const loader = createMediaLoaderUI({
  type: 'image',
  label: 'Background',
  onError: (error) => {
    if (error.message.includes('CORS')) {
      console.error('CORS error - try a different URL');
    } else if (error.message.includes('Invalid')) {
      console.error('Invalid file format');
    }
  }
});
```

## 📝 Files Modified/Created

### Core Library
- ✨ **NEW**: `src/core/utils/MediaLoader.ts` - Core utility class
- 📝 **Modified**: `index.ts` - Export MediaLoader

### Playground
- ✨ **NEW**: `playground/media-loader-ui.js` - UI component
- 📝 **Modified**: `playground/styles.css` - Media loader styles
- 📝 **Modified**: `playground/index.html` - Updated all upload areas
- 📝 **Modified**: `playground/main.js` - Integration code

## 🎉 Benefits

1. **Flexibility**: Load media from files OR URLs
2. **Consistency**: Unified interface across all media types
3. **User Experience**: Beautiful, intuitive UI with clear feedback
4. **Validation**: Automatic format checking and error handling
5. **Core Integration**: Built into Kwami library, reusable anywhere
6. **Modern Design**: Smooth animations, drag & drop, responsive

## 🔮 Future Enhancements

- [ ] Audio player URL loading
- [ ] URL history/favorites
- [ ] Image optimization/compression
- [ ] Preview thumbnails before loading
- [ ] Batch URL loading
- [ ] URL validation with preview

## 📖 Documentation

For more information:
- Core library: See `src/core/utils/MediaLoader.ts`
- UI component: See `playground/media-loader-ui.js`
- Examples: See `playground/main.js` initialization code

---

**Made with ❤️ for Kwami - The 3D Interactive AI Companion**

