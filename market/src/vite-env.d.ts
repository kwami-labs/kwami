/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SOLANA_NETWORK: string
  readonly VITE_SOLANA_RPC_URL: string
  readonly VITE_KWAMI_NFT_PROGRAM_ID: string
  readonly VITE_KWAMI_COLLECTION_MINT: string
  readonly VITE_KWAMI_COLLECTION_AUTHORITY: string
  readonly VITE_KWAMI_DNA_REGISTRY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
