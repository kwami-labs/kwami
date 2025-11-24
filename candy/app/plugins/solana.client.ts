// Client-only plugin to handle Solana Web3 imports
export default defineNuxtPlugin(() => {
  // This ensures Solana packages are only loaded on the client side
  if (process.server) {
    return
  }

  // Pre-load critical dependencies to avoid dynamic import issues
  return {
    provide: {
      solanaReady: true,
    },
  }
})

