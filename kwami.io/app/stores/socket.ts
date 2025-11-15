import { defineStore } from 'pinia'

export const useSocketStore = defineStore('socket', () => {
  const { 
    isConnected, 
    sessionId, 
    connectedUsers, 
    lastActivity,
    connect,
    disconnect,
    updateUserInfo,
    emitMintStart,
    emitMintSuccess,
  } = useSocket()

  // Watch wallet connection and update socket
  const walletStore = useWalletStore()
  
  watch(() => walletStore.connected, (connected) => {
    if (connected && walletStore.address) {
      updateUserInfo({
        walletConnected: true,
        address: walletStore.address,
      })
    } else {
      updateUserInfo({
        walletConnected: false,
        address: null,
      })
    }
  })

  // Helper to notify about minting
  const notifyMintStart = () => {
    emitMintStart()
  }

  const notifyMintSuccess = (mint: string) => {
    emitMintSuccess(mint)
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

