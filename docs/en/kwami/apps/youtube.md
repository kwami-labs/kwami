# YouTube Connector

The YouTube Connector allows Kwami to integrate with YouTube, enabling users to:
- Sign in with their Google account
- Access their YouTube videos and playlists
- Search and play public videos
- Securely manage video content

## Quick Start

```typescript
import { Kwami, getYouTubeConnector } from 'kwami';

// Initialize connector
const youtube = getYouTubeConnector({
  clientId: 'YOUR_CLIENT_ID.apps.googleusercontent.com',
  apiKey: 'YOUR_API_KEY',
});

await youtube.initialize();

// Sign in
const result = await youtube.signIn();
if (result.success) {
  // Get user's videos
  const videos = await youtube.getUserVideos();
  
  // Play first video
  const kwami = new Kwami(canvas);
  const embedUrl = youtube.getVideoEmbedUrl(videos[0].id);
  kwami.body.setBackgroundVideo(embedUrl);
}
```

## Features

### Authentication
- OAuth 2.0 Google Sign-In
- Secure token management
- User profile access

### Video Management
- Browse user's uploaded videos
- Access playlists
- Search public videos
- Get video metadata

### Kwami Integration
- Seamless video playback
- Background and blob surface modes
- Auto-looping and muting options

## Setup Guide

See the [complete documentation](../../kwami/src/apps/youtube/README.md) for:
- Getting API credentials
- Configuration options
- Usage examples
- Security best practices

## API Reference

### `YouTubeConnector`

Main class for YouTube integration.

**Methods:**
- `initialize()` - Setup YouTube API
- `signIn()` - Authenticate user
- `signOut()` - Sign out user
- `getUserVideos()` - Get user's videos
- `getUserPlaylists()` - Get playlists
- `searchVideos()` - Search public videos
- `getVideoEmbedUrl()` - Generate embed URL

### `getYouTubeConnector(config)`

Get or create YouTube connector singleton.

**Parameters:**
- `config.clientId` - Google OAuth client ID
- `config.apiKey` - YouTube Data API key
- `config.scopes` - Optional OAuth scopes
- `config.discoveryDocs` - Optional API discovery documents

## Examples

### User Video Gallery

```typescript
const youtube = getYouTubeConnector({ clientId, apiKey });
await youtube.initialize();

// Sign in
await youtube.signIn();

// Get videos
const videos = await youtube.getUserVideos(50);

// Display in UI
videos.forEach(video => {
  console.log(`${video.title} by ${video.channelTitle}`);
});
```

### Playlist Player

```typescript
// Get playlists
const playlists = await youtube.getUserPlaylists();

// Get videos from first playlist
const videos = await youtube.getPlaylistVideos(playlists[0].id);

// Play in Kwami
const kwami = new Kwami(canvas);
videos.forEach((video, index) => {
  setTimeout(() => {
    const url = youtube.getVideoEmbedUrl(video.id, {
      autoplay: true,
      loop: true,
    });
    kwami.body.setBackgroundVideo(url);
  }, index * 30000); // Switch every 30 seconds
});
```

### Public Video Search

```typescript
// Search doesn't require authentication
const youtube = getYouTubeConnector({ apiKey });
await youtube.initialize();

const videos = await youtube.searchVideos('lofi hip hop', 10);
// Play search results
```

## Security

⚠️ **Important Security Notes:**

1. **Never commit credentials** - Use environment variables
2. **Validate tokens** - Check authentication before API calls
3. **Limit scopes** - Request only necessary permissions
4. **Secure storage** - Don't expose tokens in client code

## Troubleshooting

### Common Issues

**"API credentials missing"**
- Verify `clientId` and `apiKey` are set
- Check environment variables

**"Not authenticated"**
- Call `signIn()` before accessing user data
- Verify OAuth consent screen is configured

**"CORS errors"**
- Add your domain to authorized origins
- Check Google Cloud Console settings

## Related

- [YouTube Data API](https://developers.google.com/youtube/v3)
- [Google OAuth 2.0](https://developers.google.com/identity/protocols/oauth2)
- [Kwami Body API](../core/body.md)

