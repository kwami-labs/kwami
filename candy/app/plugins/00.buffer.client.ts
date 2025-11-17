import { Buffer } from 'buffer'

export default defineNuxtPlugin(() => {
  // Make Buffer available globally for Solana libraries
  if (typeof window !== 'undefined') {
    // @ts-ignore
    window.Buffer = Buffer
    globalThis.Buffer = Buffer
    // @ts-ignore
    window.process = window.process || { env: {} }
    // @ts-ignore
    globalThis.process = globalThis.process || { env: {} }
  }
})
