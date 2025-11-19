import { io, Socket } from 'socket.io-client'

let socketInstance: Socket | null = null

export const useSocket = () => {
  const isConnected = ref(false)
  const sessionId = ref<string | null>(null)
  const connectedUsers = ref(0)
  const lastActivity = ref<any>(null)
  const reconnecting = ref(false)

  const initSocket = () => {
    if (socketInstance && socketInstance.connected) {
      return socketInstance
    }

    // Determine the socket URL based on the environment
    const socketUrl = typeof window !== 'undefined' 
      ? window.location.origin 
      : 'http://localhost:3000'

    socketInstance = io(socketUrl, {
      path: '/socket.io/',
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    })

    // Connection events
    socketInstance.on('connect', () => {
      console.log('[Socket] Connected:', socketInstance?.id)
      isConnected.value = true
      reconnecting.value = false
      sessionId.value = socketInstance?.id || null
    })

    socketInstance.on('disconnect', () => {
      console.log('[Socket] Disconnected')
      isConnected.value = false
    })

    socketInstance.on('reconnect_attempt', () => {
      console.log('[Socket] Attempting to reconnect...')
      reconnecting.value = true
    })

    socketInstance.on('reconnect', () => {
      console.log('[Socket] Reconnected')
      reconnecting.value = false
    })

    socketInstance.on('reconnect_failed', () => {
      console.error('[Socket] Reconnection failed')
      reconnecting.value = false
    })

    // Custom events
    socketInstance.on('connection:success', (data: { sessionId: string; timestamp: number }) => {
      console.log('[Socket] Connection success:', data)
      sessionId.value = data.sessionId
    })

    socketInstance.on('users:count', (data: { count: number; timestamp: number }) => {
      console.log('[Socket] Users count updated:', data.count)
      connectedUsers.value = data.count
    })

    socketInstance.on('kwami:activity', (data: any) => {
      console.log('[Socket] KWAMI activity:', data)
      lastActivity.value = data
    })

    return socketInstance
  }

  const connect = () => {
    if (!socketInstance) {
      initSocket()
    }
  }

  const disconnect = () => {
    if (socketInstance) {
      socketInstance.disconnect()
      socketInstance = null
      isConnected.value = false
      sessionId.value = null
    }
  }

  const updateUser = (data: { walletAddress?: string }) => {
    if (socketInstance && socketInstance.connected) {
      socketInstance.emit('user:update', data)
    }
  }

  const emitMintStart = (walletAddress: string) => {
    if (socketInstance && socketInstance.connected) {
      socketInstance.emit('kwami:mint:start', { walletAddress })
    }
  }

  const emitMintSuccess = (walletAddress: string, mint: string, name: string) => {
    if (socketInstance && socketInstance.connected) {
      socketInstance.emit('kwami:mint:success', { walletAddress, mint, name })
    }
  }

  // Auto-connect on client-side
  if (import.meta.client) {
    onMounted(() => {
      connect()
    })

    onUnmounted(() => {
      // Don't disconnect on unmount to maintain connection across navigation
      // disconnect()
    })
  }

  return {
    isConnected: readonly(isConnected),
    sessionId: readonly(sessionId),
    connectedUsers: readonly(connectedUsers),
    lastActivity: readonly(lastActivity),
    reconnecting: readonly(reconnecting),
    connect,
    disconnect,
    updateUser,
    emitMintStart,
    emitMintSuccess,
  }
}

