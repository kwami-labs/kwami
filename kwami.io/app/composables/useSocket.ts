import { io, Socket } from 'socket.io-client'

let socket: Socket | null = null

export const useSocket = () => {
  const connectedUsers = ref(0)
  const isConnected = ref(false)
  const sessionId = ref<string | null>(null)
  const lastActivity = ref<any>(null)

  const connect = () => {
    if (socket?.connected) {
      return socket
    }

    // Get the base URL
    const baseUrl = window.location.origin

    // Initialize socket connection
    socket = io(baseUrl, {
      path: '/socket.io/',
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    })

    // Connection events
    socket.on('connect', () => {
      isConnected.value = true
      console.log('[Socket] Connected:', socket?.id)
    })

    socket.on('connection:success', (data) => {
      sessionId.value = data.sessionId
      console.log('[Socket] Connection success:', data)
    })

    socket.on('disconnect', (reason) => {
      isConnected.value = false
      console.log('[Socket] Disconnected:', reason)
    })

    socket.on('connect_error', (error) => {
      console.error('[Socket] Connection error:', error)
    })

    // User count updates
    socket.on('users:count', (data) => {
      connectedUsers.value = data.count
      console.log('[Socket] Users online:', data.count)
    })

    // KWAMI activity updates
    socket.on('kwami:activity', (data) => {
      lastActivity.value = data
      console.log('[Socket] KWAMI activity:', data)
    })

    return socket
  }

  const disconnect = () => {
    if (socket) {
      socket.disconnect()
      socket = null
      isConnected.value = false
      sessionId.value = null
    }
  }

  // Update user info
  const updateUserInfo = (data: any) => {
    if (socket?.connected) {
      socket.emit('user:update', data)
    }
  }

  // Emit minting events
  const emitMintStart = () => {
    if (socket?.connected) {
      socket.emit('kwami:mint:start', { timestamp: Date.now() })
    }
  }

  const emitMintSuccess = (mint: string) => {
    if (socket?.connected) {
      socket.emit('kwami:mint:success', { mint, timestamp: Date.now() })
    }
  }

  // Auto-connect on mount
  onMounted(() => {
    connect()
  })

  // Auto-disconnect on unmount
  onUnmounted(() => {
    disconnect()
  })

  return {
    socket,
    isConnected,
    sessionId,
    connectedUsers,
    lastActivity,
    connect,
    disconnect,
    updateUserInfo,
    emitMintStart,
    emitMintSuccess,
  }
}

