export default defineEventHandler(() => {
  return {
    status: 'ok',
    service: 'kwami-dao',
    version: '1.5.9',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: {
      node: process.version,
      platform: process.platform,
      network: process.env.NUXT_PUBLIC_SOLANA_NETWORK || 'devnet',
    }
  }
})

