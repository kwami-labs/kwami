export default defineEventHandler(() => {
  return {
    status: 'ok',
    service: 'kwami-dao',
    version: '0.1.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: {
      node: process.version,
      platform: process.platform,
      network: process.env.NUXT_PUBLIC_SOLANA_NETWORK || 'devnet',
    }
  }
})

