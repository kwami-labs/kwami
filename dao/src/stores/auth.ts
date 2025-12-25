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
    const message = error instanceof Error ? error.message : 'Failed to verify KWAMI NFT ownership'
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

  const wallet = getWalletConnector()

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


