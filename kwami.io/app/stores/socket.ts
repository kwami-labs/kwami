import { defineStore } from 'pinia'

export const useSocketStore = defineStore('socket', () => {
  // Temporary mock for socket functionality
  // TODO: Re-implement with proper WebSocket setup
  const isConnected = ref(false)
  const sessionId = ref<string | null>(null)
  const connectedUsers = ref(0)
  const lastActivity = ref<any>(null)

  const connect = () => {
    console.log('[Socket] Mock connection (disabled)')
  }

  const disconnect = () => {
    console.log('[Socket] Mock disconnection (disabled)')
  }

  const notifyMintStart = () => {
    console.log('[Socket] Mock mint start (disabled)')
  }

  const notifyMintSuccess = (mint: string) => {
    console.log('[Socket] Mock mint success (disabled)', mint)
  }

  return {
    isConnected,
    sessionId,
    connectedUsers,
    lastActivity,
    connect,
    disconnect,
    notifyMintStart,
    notifyMintSuccess,
  }
})

