export default defineEventHandler((event) => {
  // Access the socket.io instance from nitro app
  const nitroApp = useNitroApp()
  
  // @ts-ignore
  const io = nitroApp.socketIO
  // @ts-ignore
  const sessions = nitroApp.socketSessions

  if (!io) {
    return {
      error: 'Socket.IO not initialized',
      connectedUsers: 0,
      sessions: [],
      timestamp: Date.now(),
    }
  }

  // Get session data
  const sessionData = Array.from(sessions.values()).map((session: any) => ({
    id: session.id,
    connectedAt: session.connectedAt,
    walletAddress: session.walletAddress,
    lastActivity: session.lastActivity,
  }))

  return {
    connectedUsers: io.engine.clientsCount,
    sessions: sessionData,
    timestamp: Date.now(),
  }
})

