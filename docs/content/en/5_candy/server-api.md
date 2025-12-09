# 🔌 Server-Side Implementation

## WebSocket Real-Time Features

### Overview

The Kwami.io app uses **Socket.IO** for real-time communication between the server and all connected clients. This enables live updates of user counts, minting activity, and future real-time features.

### Architecture

```
┌─────────────────┐         WebSocket         ┌─────────────────┐
│                 │◄──────────────────────────►│                 │
│  Client (Vue)   │      socket.io-client      │  Server (Nitro) │
│                 │◄──────────────────────────►│                 │
└─────────────────┘         Events            └─────────────────┘
        │                                              │
        │                                              │
   useSocket()                              plugins/socket.ts
   (Composable)                              (Socket.IO Server)
```

### Files Structure

```
server/
├── plugins/
│   └── socket.ts                # Socket.IO server initialization
└── api/
    └── socket/
        └── stats.get.ts         # REST API for socket stats

app/
├── composables/
│   └── useSocket.ts             # Socket.IO client composable
├── stores/
│   └── socket.ts                # Socket state management
├── components/
│   └── UsersOnline.vue          # UI component showing user count
└── plugins/
    └── socket.client.ts         # Client-side socket initialization
```

## Server Side

### `server/plugins/socket.ts`

Main Socket.IO server implementation:

**Features:**
- ✅ Tracks connected users in real-time
- ✅ Broadcasts user count updates
- ✅ Manages user sessions
- ✅ Handles KWAMI minting events
- ✅ Auto-cleanup on disconnect

**Events Emitted (Server → Client):**
- `connection:success` - Sent on successful connection
- `users:count` - Broadcasts current user count
- `kwami:activity` - Broadcasts minting activity

**Events Received (Client → Server):**
- `user:update` - Updates user session info
- `kwami:mint:start` - User started minting
- `kwami:mint:success` - User successfully minted

**Configuration:**
```typescript
{
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
  path: '/socket.io/',
}
```

### `server/api/socket/stats.get.ts`

REST endpoint for socket statistics:

```
GET /api/socket/stats
```

**Response:**
```json
{
  "connectedUsers": 5,
  "sessions": [...],
  "timestamp": 1700000000000
}
```

## Client Side

### `app/composables/useSocket.ts`

Main composable for Socket.IO client:

**Usage:**
```typescript
const { 
  isConnected, 
  connectedUsers, 
  emitMintStart,
  emitMintSuccess 
} = useSocket()
```

**Features:**
- ✅ Auto-connect on mount
- ✅ Auto-disconnect on unmount
- ✅ Reconnection logic
- ✅ Real-time user count
- ✅ Event emitters for minting

**Reactive State:**
- `isConnected` - Connection status
- `sessionId` - Current session ID
- `connectedUsers` - Number of users online
- `lastActivity` - Last KWAMI activity

### `app/stores/socket.ts`

Pinia store for socket state:

**Features:**
- ✅ Integrates with wallet store
- ✅ Auto-updates user info on wallet connection
- ✅ Helper methods for minting notifications

**Usage:**
```typescript
const socketStore = useSocketStore()

// Notify about minting
socketStore.notifyMintStart()
socketStore.notifyMintSuccess(mintAddress)
```

### `app/components/UsersOnline.vue`

UI component displaying connected users:

**Features:**
- ✅ Real-time user count
- ✅ Connection status indicator
- ✅ Animated pulse when connected
- ✅ Tooltip with "Users currently online"

## Events Flow

### User Connection Flow

1. **Client connects** → `useSocket()` composable initialized
2. **Server receives connection** → Increments `connectedUsers`
3. **Server broadcasts** → `users:count` to all clients
4. **All clients update** → UI shows new count

### Wallet Connection Flow

1. **User connects wallet** → `walletStore.connected = true`
2. **Socket store watches** → Detects wallet connection
3. **Emits user:update** → Sends wallet address to server
4. **Server updates session** → Stores wallet info

### Minting Flow

1. **User starts minting** → `socketStore.notifyMintStart()`
2. **Server broadcasts** → `kwami:activity` to all clients
3. **User completes mint** → `socketStore.notifyMintSuccess(mint)`
4. **All clients see** → Live minting activity

## Configuration

### Nitro Configuration

In `nuxt.config.ts`:

```typescript
nitro: {
  preset: 'node-server', // Required for WebSocket
  experimental: {
    websocket: true, // Enable WebSocket support
  },
}
```

### Environment Variables

No additional environment variables needed. Socket.IO automatically adapts to the current origin.

## Testing

### Test Socket Connection

1. **Start the dev server:**
   ```bash
   bun run dev
   ```

2. **Open multiple browser tabs** to `http://localhost:3000`

3. **Watch the user count** update in real-time

4. **Check console logs:**
   - Client: `[Socket] Connected: <id>`
   - Server: `[Socket.IO] User connected: <id> (Total: X)`

### Test REST API

```bash
curl http://localhost:3000/api/socket/stats
```

## Future Enhancements

### Planned Features

- 🔄 **Live NFT Feed** - Show recent mints across all users
- 💬 **Chat System** - Allow users to communicate
- 🎨 **Collaborative DNA** - Users can share blob configurations
- 📊 **Real-time Stats** - Live minting statistics dashboard
- 🔔 **Notifications** - Alert users of important events
- 🏆 **Leaderboard** - Track top minters in real-time

### Scaling Considerations

For production deployment:

1. **Redis Adapter** - For multi-server scaling
   ```typescript
   import { createAdapter } from '@socket.io/redis-adapter'
   io.adapter(createAdapter(redisClient))
   ```

2. **Sticky Sessions** - Load balancer configuration

3. **Message Queue** - For reliable event delivery

4. **Rate Limiting** - Prevent socket spam

## Troubleshooting

### Connection Issues

**Problem:** Socket not connecting

**Solutions:**
- Check Nitro preset is `node-server` not `static`
- Verify `experimental.websocket: true` in config
- Check CORS configuration matches your domain
- Ensure port is not blocked by firewall

**Problem:** User count not updating

**Solutions:**
- Check browser console for socket errors
- Verify server logs show connection/disconnection
- Test with multiple browser tabs
- Check `useSocket()` is initialized in component

### Development Tips

- **Hot Module Replacement:** Socket connections may disconnect on HMR. This is normal.
- **Multiple Tabs:** Use incognito/private windows to test multiple users locally
- **Console Logs:** Enable detailed logging with `localStorage.debug = '*'`

## Resources

- [Socket.IO Documentation](https://socket.io/docs/v4/)
- [Nuxt Nitro WebSocket](https://nitro.unjs.io/guide/websocket)
- [Socket.IO Client API](https://socket.io/docs/v4/client-api/)

---

**Version:** 1.5.10  
**Status:** ✅ Implemented  
**Last Updated:** 2025-11-15

