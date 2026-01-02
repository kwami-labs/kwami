/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

interface ImportMetaEnv {
  readonly VITE_SOLANA_NETWORK: string
  readonly VITE_SOLANA_RPC_URL: string
  readonly VITE_KWAMI_NFT_PROGRAM_ID: string
  readonly VITE_QWAMI_TOKEN_PROGRAM_ID: string
  readonly VITE_ARWEAVE_GATEWAY: string
  readonly VITE_COLLECTION_MINT: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// `gifenc` ships without TypeScript types in this repo; declare it as `any`.
declare module 'gifenc';
