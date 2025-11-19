import { defineStore } from 'pinia'

export const useSocketStore = defineStore('socket', () => {
  const walletStore = useWalletStore()
  const socket = useSocket()

  // Re-export socket state
  const isConnected = socket.isConnected
  const sessionId = socket.sessionId
  const connectedUsers = socket.connectedUsers
  const lastActivity = socket.lastActivity
  const reconnecting = socket.reconnecting

  // Watch wallet connection and update socket
  watch(() => walletStore.connected, (connected) => {
    if (connected && walletStore.address) {
      socket.updateUser({ walletAddress: walletStore.address })
    }
  })

  // Helper methods for minting notifications
  const notifyMintStart = () => {
    if (walletStore.connected && walletStore.address) {
      socket.emitMintStart(walletStore.address)
    }
  }

  const notifyMintSuccess = (mint: string, name: string = 'KWAMI') => {
    if (walletStore.connected && walletStore.address) {
      socket.emitMintSuccess(walletStore.address, mint, name)
    }
  }

  return {
    isConnected,
    sessionId,
    connectedUsers,
    lastActivity,
    reconnecting,
    connect: socket.connect,
    disconnect: socket.disconnect,
    notifyMintStart,
    notifyMintSuccess,
  }
})

