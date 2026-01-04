import { derived, writable } from 'svelte/store'
import type { PublicKey } from '@solana/web3.js'
import { getWalletConnector } from 'kwami/apps/wallet'
import { fetchOwnedKwamiNfts, type KwamiOwnedNft } from '@/lib/kwamiNfts'

export type DaoAuthState = {
  status: 'disconnected' | 'connected' | 'checking' | 'member' | 'error'
  publicKey: string | null
  network: string
  kwamiNfts: KwamiOwnedNft[]
  errorMessage?: string
  lastCheckedAt?: number
}

const initial: DaoAuthState = {
  status: 'disconnected',
  publicKey: null,
  network: 'mainnet-beta',
  kwamiNfts: [],
  errorMessage: undefined,
  lastCheckedAt: undefined,
}

export const auth = writable<DaoAuthState>(initial)

export const isWalletConnected = derived(auth, ($a) => $a.status !== 'disconnected')
export const isMember = derived(auth, ($a) => $a.status === 'member')

const short = (s: string, left = 4, right = 4) => (s.length <= left + right + 3 ? s : `${s.slice(0, left)}…${s.slice(-right)}`)

export const walletLabel = derived(auth, ($a) => ($a.publicKey ? short($a.publicKey, 6, 6) : 'Not connected'))

let initialized = false

function getCollectionMintFromEnv(): string | undefined {
  const v = (import.meta as any).env?.VITE_KWAMI_COLLECTION_ADDRESS as string | undefined
  return v && v.trim().length ? v.trim() : undefined
}

async function refreshFromWallet(): Promise<void> {
  const wallet = getWalletConnector()
  const pk = wallet.getPublicKey()
  const network = wallet.getNetwork?.() ?? 'mainnet-beta'

  if (!pk) {
    auth.set({ ...initial, network })
    return
  }

  auth.update((s) => ({
    ...s,
    status: 'connected',
    publicKey: pk.toBase58(),
    network,
    errorMessage: undefined,
  }))

  await verifyKwamiOwnership(pk)
}

function formatAuthError(error: unknown): string {
  const raw = error instanceof Error ? error.message : String(error ?? 'Failed to verify KWAMI NFT ownership')

  // Common RPC error shape we see in the UI: `403 : {"jsonrpc":"2.0","error":{"code":403,"message":"Access forbidden"}...}`
  if (/\b403\b/.test(raw) && /Access forbidden/i.test(raw)) {
    return [
      'RPC 403 (Access forbidden).',
      'Your RPC endpoint is rejecting requests (missing/invalid API key or blocked origin).',
      'Set a working Solana RPC in your wallet connector / environment and try again.',
      '',
      raw,
    ].join('\n')
  }

  return raw
}

export async function verifyKwamiOwnership(publicKey?: PublicKey | null): Promise<void> {
  const wallet = getWalletConnector()
  const pk = publicKey ?? wallet.getPublicKey()
  const network = wallet.getNetwork?.() ?? 'mainnet-beta'

  if (!pk) {
    auth.update((s) => ({ ...s, status: 'disconnected', publicKey: null, kwamiNfts: [], errorMessage: undefined }))
    return
  }

  auth.update((s) => ({
    ...s,
    status: 'checking',
    publicKey: pk.toBase58(),
    network,
    errorMessage: undefined,
  }))

  try {
    const connection = wallet.getConnection()
    const collectionMint = getCollectionMintFromEnv()

    const kwamiNfts = await fetchOwnedKwamiNfts({
      connection,
      owner: pk,
      collectionMint,
      symbol: 'KWAMI',
    })

    const hasMembership = kwamiNfts.length > 0

    auth.update((s) => ({
      ...s,
      status: hasMembership ? 'member' : 'connected',
      publicKey: pk.toBase58(),
      network,
      kwamiNfts,
      errorMessage: undefined,
      lastCheckedAt: Date.now(),
    }))
  } catch (error) {
    const message = formatAuthError(error)
    auth.update((s) => ({
      ...s,
      status: 'error',
      errorMessage: message,
      kwamiNfts: [],
      lastCheckedAt: Date.now(),
    }))
  }
}

export function initAuth(): void {
  if (initialized) return
  initialized = true

  const rpcEndpoint = (import.meta as any).env?.VITE_SOLANA_RPC_URL as string | undefined
  const network = (import.meta as any).env?.VITE_SOLANA_NETWORK as 'mainnet-beta' | 'devnet' | 'testnet' | undefined
  const wallet = getWalletConnector({ rpcEndpoint, network })

  wallet.on('connect', () => {
    void refreshFromWallet()
  })
  wallet.on('disconnect', () => {
    void refreshFromWallet()
  })
  wallet.on('accountChange', () => {
    void refreshFromWallet()
  })
  wallet.on('networkChange', () => {
    void refreshFromWallet()
  })

  void refreshFromWallet()
}


