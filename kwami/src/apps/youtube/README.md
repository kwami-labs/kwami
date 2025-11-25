# YouTube Connector for Kwami

Secure YouTube integration for Kwami that allows users to:
- Authenticate with their YouTube account
- Import and play their own videos
- Search public YouTube videos
- Access playlists and channels

## Features

✅ **OAuth 2.0 Authentication** - Secure Google sign-in  
✅ **User Videos** - Access authenticated user's videos  
✅ **Playlists** - Browse and play from playlists  
✅ **Public Search** - Search YouTube without authentication  
✅ **Video Embedding** - Generate proper embed URLs  
✅ **TypeScript Support** - Full type safety  

## Setup

### 1. Get YouTube API Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable **YouTube Data API v3**
4. Create **OAuth 2.0 Client ID** credentials
5. Add authorized JavaScript origins (e.g., `http://localhost:3333`)
6. Copy your Client ID and API Key

### 2. Initialize the Connector

```typescript
import { getYouTubeConnector } from 'kwami';

const youtube = getYouTubeConnector({
  clientId: 'YOUR_CLIENT_ID.apps.googleusercontent.com',
  apiKey: 'YOUR_API_KEY',
});

// Initialize the connector
await youtube.initialize();
```

## Usage

### Authentication

```typescript
// Sign in
const result = await youtube.signIn();
if (result.success) {
  console.log('Signed in as:', result.user?.name);
} else {
  console.error('Sign in failed:', result.error);
}

// Check if signed in
if (youtube.isSignedIn()) {
  console.log('User is authenticated');
}

// Sign out
await youtube.signOut();
```

### Get User's Videos

```typescript
// Requires authentication
const videos = await youtube.getUserVideos(50);

videos.forEach(video => {
  console.log(video.title);
  console.log(video.thumbnailUrl);
  console.log(video.id);
});
```

### Get User's Playlists

```typescript
// Requires authentication
const playlists = await youtube.getUserPlaylists(50);

playlists.forEach(playlist => {
  console.log(playlist.title);
  console.log(playlist.videoCount);
});

// Get videos from a specific playlist
const playlistVideos = await youtube.getPlaylistVideos(playlists[0].id);
```

### Search Public Videos

```typescript
// No authentication required (but connector must be initialized)
const searchResults = await youtube.searchVideos('lofi music', 25);

searchResults.forEach(video => {
  console.log(video.title);
  console.log(video.channelTitle);
});
```

### Play Videos in Kwami

```typescript
import { Kwami } from 'kwami';

const canvas = document.querySelector('canvas');
const kwami = new Kwami(canvas);

// Get user's videos
const videos = await youtube.getUserVideos();

// Play first video as background
const videoId = videos[0].id;
const embedUrl = youtube.getVideoEmbedUrl(videoId, {
  autoplay: true,
  mute: true,
  loop: true,
  controls: false,
});

kwami.body.setBackgroundVideo(embedUrl, {
  autoplay: true,
  loop: true,
  muted: true,
  fit: 'cover',
});
```

## Complete Example

```typescript
import { Kwami, getYouTubeConnector } from 'kwami';

// Initialize YouTube connector
const youtube = getYouTubeConnector({
  clientId: process.env.YOUTUBE_CLIENT_ID,
  apiKey: process.env.YOUTUBE_API_KEY,
});

await youtube.initialize();

// Sign in button
document.getElementById('sign-in')?.addEventListener('click', async () => {
  const result = await youtube.signIn();
  if (result.success) {
    console.log('Welcome', result.user?.name);
    loadUserVideos();
  }
});

// Load and display user's videos
async function loadUserVideos() {
  const videos = await youtube.getUserVideos();
  
  const videoList = document.getElementById('video-list');
  videos.forEach(video => {
    const button = document.createElement('button');
    button.textContent = video.title;
    button.onclick = () => playVideo(video.id);
    videoList?.appendChild(button);
  });
}

// Play selected video in Kwami
const canvas = document.querySelector('canvas');
const kwami = new Kwami(canvas);

function playVideo(videoId: string) {
  const embedUrl = youtube.getVideoEmbedUrl(videoId, {
    autoplay: true,
    mute: true,
    loop: true,
  });
  
  kwami.body.setBackgroundVideo(embedUrl, {
    autoplay: true,
    loop: true,
    muted: true,
  });
}
```

## API Reference

### `YouTubeConnector`

#### Methods

- `initialize()` - Initialize the YouTube API client
- `signIn()` - Authenticate user with Google OAuth
- `signOut()` - Sign out the current user
- `isSignedIn()` - Check if user is authenticated
- `getUserVideos(maxResults?)` - Get authenticated user's videos
- `getUserPlaylists(maxResults?)` - Get user's playlists
- `getPlaylistVideos(playlistId, maxResults?)` - Get videos from a playlist
- `searchVideos(query, maxResults?)` - Search public videos
- `getVideoEmbedUrl(videoId, options)` - Generate embed URL
- `getAccessToken()` - Get current OAuth access token

### Types

```typescript
interface YouTubeConfig {
  clientId?: string;
  apiKey?: string;
  scopes?: string[];
  discoveryDocs?: string[];
}

interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  duration: string;
  channelTitle: string;
  publishedAt: string;
}

interface YouTubePlaylist {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  videoCount: number;
}

interface YouTubeAuthResult {
  success: boolean;
  error?: string;
  user?: {
    id: string;
    name: string;
    email: string;
    picture: string;
  };
}
```

## Environment Variables

Create a `.env` file:

```env
VITE_YOUTUBE_CLIENT_ID=your_client_id.apps.googleusercontent.com
VITE_YOUTUBE_API_KEY=your_api_key
```

## Security Notes

⚠️ **Never commit API keys to version control**  
✅ Use environment variables for credentials  
✅ Add `.env` to `.gitignore`  
✅ Use OAuth for user authentication  
✅ Request only necessary scopes  

## Troubleshooting

### "API credentials missing"
- Ensure `clientId` and `apiKey` are provided
- Check environment variables are loaded

### "Not authenticated"
- Call `signIn()` before accessing user data
- Check OAuth consent screen is configured

### "Failed to load Google API script"
- Check internet connection
- Verify no ad blockers blocking googleapis.com

## License

MIT

