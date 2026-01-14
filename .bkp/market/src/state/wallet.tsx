import type { PublicKey } from '@solana/web3.js'
import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { getWalletConnector, type WalletConnector } from 'kwami/apps/wallet'
import { fetchOwnedKwamiNfts, type KwamiOwnedNft } from '@/lib/kwamiNfts'

type WalletState = {
  connector: WalletConnector
  connected: boolean
  publicKey: PublicKey | null
  network: string
  hasKwamiNft: boolean
  kwamiNfts: KwamiOwnedNft[]
  selectedKwamiMint: string | null
  setSelectedKwamiMint: (mint: string | null) => void
  kwamiLoading: boolean
  kwamiError?: string
  refreshKwamiNfts: () => Promise<void>
}

const Ctx = createContext<WalletState | null>(null)

function readEnv(key: string): string | undefined {
  const v = (import.meta as any).env?.[key]
  return typeof v === 'string' && v.length ? v : undefined
}

export function WalletProvider(props: { children: React.ReactNode }) {
  const network = readEnv('VITE_SOLANA_NETWORK') ?? 'devnet'
  const rpcEndpoint = readEnv('VITE_SOLANA_RPC_URL')
  const collectionMint = readEnv('VITE_COLLECTION_MINT')

  const connector = useMemo(
    () => getWalletConnector({ network: network as any, rpcEndpoint }),
    [network, rpcEndpoint],
  )

  const [connected, setConnected] = useState(() => connector.isWalletConnected())
  const [publicKey, setPublicKey] = useState<PublicKey | null>(() => connector.getPublicKey())

  const [kwamiNfts, setKwamiNfts] = useState<KwamiOwnedNft[]>([])
  const [kwamiLoading, setKwamiLoading] = useState(false)
  const [kwamiError, setKwamiError] = useState<string | undefined>(undefined)

  // De-dupe + mild throttling to avoid RPC bursts (Metaplex calls are expensive and can 429).
  const kwamiRefreshInFlightRef = useRef<Promise<void> | null>(null)
  const kwamiLastRefreshAtRef = useRef<number>(0)
  const [selectedKwamiMint, setSelectedKwamiMintState] = useState<string | null>(() => {
    const saved = localStorage.getItem('kwami-market:selectedKwamiMint')
    return saved && saved.length ? saved : null
  })

  const setSelectedKwamiMint = (mint: string | null) => {
    setSelectedKwamiMintState(mint)
    if (mint) localStorage.setItem('kwami-market:selectedKwamiMint', mint)
    else localStorage.removeItem('kwami-market:selectedKwamiMint')
  }

  const refreshKwamiNfts = async () => {
    const owner = connector.getPublicKey()
    if (!owner) {
      setKwamiNfts([])
      setKwamiError(undefined)
      return
    }

    // If we already have a refresh in-flight, re-use it.
    if (kwamiRefreshInFlightRef.current) return kwamiRefreshInFlightRef.current

    // Basic throttle: if called repeatedly (connect + accountChange + widget init, etc.),
    // coalesce into one refresh.
    const now = Date.now()
    if (now - kwamiLastRefreshAtRef.current < 750) return
    kwamiLastRefreshAtRef.current = now

    const run = (async () => {
      setKwamiLoading(true)
      setKwamiError(undefined)
      try {
        const nfts = await fetchOwnedKwamiNfts({
          connection: connector.getConnection(),
          owner,
          collectionMint,
        })
        setKwamiNfts(nfts)
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Failed to load NFTs'
        setKwamiError(msg)
        setKwamiNfts([])
      } finally {
        setKwamiLoading(false)
      }
    })()

    kwamiRefreshInFlightRef.current = run
    try {
      await run
    } finally {
      kwamiRefreshInFlightRef.current = null
    }
  }

  // Keep selected mint valid when list changes.
  useEffect(() => {
    if (kwamiNfts.length === 0) {
      setSelectedKwamiMint(null)
      return
    }
    if (selectedKwamiMint && kwamiNfts.some((n) => n.mint === selectedKwamiMint)) return
    setSelectedKwamiMint(kwamiNfts[0]!.mint)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kwamiNfts])

  useEffect(() => {
    const onConnect = () => {
      setConnected(true)
      setPublicKey(connector.getPublicKey())
      void refreshKwamiNfts()
    }

    const onDisconnect = () => {
      setConnected(false)
      setPublicKey(null)
      setKwamiNfts([])
      setKwamiError(undefined)
    }

    const onAccountChange = () => {
      setConnected(connector.isWalletConnected())
      setPublicKey(connector.getPublicKey())
      void refreshKwamiNfts()
    }

    connector.on('connect', onConnect)
    connector.on('disconnect', onDisconnect)
    connector.on('accountChange', onAccountChange)

    return () => {
      connector.off('connect', onConnect)
      connector.off('disconnect', onDisconnect)
      connector.off('accountChange', onAccountChange)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connector, collectionMint])

  const value: WalletState = {
    connector,
    connected,
    publicKey,
    network: connector.getNetwork(),
    hasKwamiNft: kwamiNfts.length > 0,
    kwamiNfts,
    selectedKwamiMint,
    setSelectedKwamiMint,
    kwamiLoading,
    kwamiError,
    refreshKwamiNfts,
  }

  return <Ctx.Provider value={value}>{props.children}</Ctx.Provider>
}

export function useWallet() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useWallet must be used within WalletProvider')
  return ctx
}


