import { Server as SocketIOServer } from 'socket.io'
import type { NitroApp } from 'nitropack'

interface UserSession {
  id: string
  connectedAt: number
  walletAddress?: string
  lastActivity?: number
}

const sessions = new Map<string, UserSession>()

export default defineNitroPlugin((nitroApp: NitroApp) => {
  const io = new SocketIOServer({
    cors: {
      origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:4000'],
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
    path: '/socket.io/',
  })

  // Store io instance in nitro app for access in API routes
  // @ts-ignore
  nitroApp.socketIO = io

  io.on('connection', (socket) => {
    const sessionId = socket.id
    console.log(`[Socket.IO] User connected: ${sessionId} (Total: ${io.engine.clientsCount})`)

    // Create new session
    const session: UserSession = {
      id: sessionId,
      connectedAt: Date.now(),
    }
    sessions.set(sessionId, session)

    // Emit connection success
    socket.emit('connection:success', {
      sessionId,
      timestamp: Date.now(),
    })

    // Broadcast updated user count
    io.emit('users:count', {
      count: io.engine.clientsCount,
      timestamp: Date.now(),
    })

    // Handle user updates (e.g., wallet connection)
    socket.on('user:update', (data: { walletAddress?: string }) => {
      const session = sessions.get(sessionId)
      if (session) {
        if (data.walletAddress) {
          session.walletAddress = data.walletAddress
        }
        session.lastActivity = Date.now()
        sessions.set(sessionId, session)
        console.log(`[Socket.IO] User ${sessionId} updated:`, data)
      }
    })

    // Handle KWAMI minting start
    socket.on('kwami:mint:start', (data: { walletAddress: string }) => {
      const session = sessions.get(sessionId)
      if (session) {
        session.lastActivity = Date.now()
        
        // Broadcast to all clients that someone started minting
        io.emit('kwami:activity', {
          type: 'mint:start',
          walletAddress: data.walletAddress,
          sessionId,
          timestamp: Date.now(),
        })
        
        console.log(`[Socket.IO] Mint started by ${data.walletAddress}`)
      }
    })

    // Handle KWAMI minting success
    socket.on('kwami:mint:success', (data: { walletAddress: string; mint: string; name: string }) => {
      const session = sessions.get(sessionId)
      if (session) {
        session.lastActivity = Date.now()
        
        // Broadcast to all clients that someone successfully minted
        io.emit('kwami:activity', {
          type: 'mint:success',
          walletAddress: data.walletAddress,
          mint: data.mint,
          name: data.name,
          sessionId,
          timestamp: Date.now(),
        })
        
        console.log(`[Socket.IO] Mint success by ${data.walletAddress}: ${data.mint}`)
      }
    })

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`[Socket.IO] User disconnected: ${sessionId} (Total: ${io.engine.clientsCount})`)
      sessions.delete(sessionId)
      
      // Broadcast updated user count
      io.emit('users:count', {
        count: io.engine.clientsCount,
        timestamp: Date.now(),
      })
    })
  })

  // Expose sessions for API access
  // @ts-ignore
  nitroApp.socketSessions = sessions

  console.log('[Socket.IO] Server initialized and ready')
})

