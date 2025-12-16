import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js'
import {
  WalletAdapterNetwork,
  WalletReadyState,
  type WalletAdapter,
} from '@solana/wallet-adapter-base'
import { AlphaWalletAdapter } from '@solana/wallet-adapter-alpha'
import { AvanaWalletAdapter } from '@solana/wallet-adapter-avana'
import { BitKeepWalletAdapter } from '@solana/wallet-adapter-bitkeep'
import { BitpieWalletAdapter } from '@solana/wallet-adapter-bitpie'
import { CloverWalletAdapter } from '@solana/wallet-adapter-clover'
import { Coin98WalletAdapter } from '@solana/wallet-adapter-coin98'
import { CoinbaseWalletAdapter } from '@solana/wallet-adapter-coinbase'
import { CoinhubWalletAdapter } from '@solana/wallet-adapter-coinhub'
import { HuobiWalletAdapter } from '@solana/wallet-adapter-huobi'
import { HyperPayWalletAdapter } from '@solana/wallet-adapter-hyperpay'
import { KrystalWalletAdapter } from '@solana/wallet-adapter-krystal'
import { LedgerWalletAdapter } from '@solana/wallet-adapter-ledger'
import { MathWalletAdapter } from '@solana/wallet-adapter-mathwallet'
import { NekoWalletAdapter } from '@solana/wallet-adapter-neko'
import { NightlyWalletAdapter } from '@solana/wallet-adapter-nightly'
import { NufiWalletAdapter } from '@solana/wallet-adapter-nufi'
import { OntoWalletAdapter } from '@solana/wallet-adapter-onto'
import { ParticleAdapter } from '@solana/wallet-adapter-particle'
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom'
import { SafePalWalletAdapter } from '@solana/wallet-adapter-safepal'
import { SaifuWalletAdapter } from '@solana/wallet-adapter-saifu'
import { SalmonWalletAdapter } from '@solana/wallet-adapter-salmon'
import { SkyWalletAdapter } from '@solana/wallet-adapter-sky'
import { SolflareWalletAdapter } from '@solana/wallet-adapter-solflare'
import { SolongWalletAdapter } from '@solana/wallet-adapter-solong'
import { SpotWalletAdapter } from '@solana/wallet-adapter-spot'
import { TokenaryWalletAdapter } from '@solana/wallet-adapter-tokenary'
import { TokenPocketWalletAdapter } from '@solana/wallet-adapter-tokenpocket'
import { TorusWalletAdapter } from '@solana/wallet-adapter-torus'
import { TrezorWalletAdapter } from '@solana/wallet-adapter-trezor'
import { TrustWalletAdapter } from '@solana/wallet-adapter-trust'
import { UnsafeBurnerWalletAdapter } from '@solana/wallet-adapter-unsafe-burner'
import { XDEFIWalletAdapter } from '@solana/wallet-adapter-xdefi'
import { computed, ref } from 'vue'

export type CandyWalletOption = {
  name: string
  adapter: WalletAdapter
  readyState: WalletReadyState
  url?: string
}

function safeCreateAdapter<T>(factory: () => T): T | null {
  try {
    return factory()
  } catch (e) {
    console.warn('[Wallet] Failed to create adapter:', e)
    return null
  }
}

export const useSolanaWallet = () => {
  const network = (import.meta.env.VITE_SOLANA_NETWORK || 'devnet') as WalletAdapterNetwork
  const rpcUrl = import.meta.env.VITE_SOLANA_RPC_URL || clusterApiUrl(network)

  const connection = ref(new Connection(rpcUrl, 'confirmed'))

  const wallet = ref<any>(null)
  const publicKey = ref<PublicKey | null>(null)
  const connected = ref(false)
  const connecting = ref(false)

  const selectedWalletName = ref<string>('Phantom')

  const adapters = computed(() => {

    const list = [
      // Phantom first (default)
      safeCreateAdapter(() => new PhantomWalletAdapter()),
      safeCreateAdapter(() => new SolflareWalletAdapter({ network })),

      safeCreateAdapter(() => new CoinbaseWalletAdapter()),
      safeCreateAdapter(() => new LedgerWalletAdapter()),
      safeCreateAdapter(() => new TrustWalletAdapter()),
      safeCreateAdapter(() => new Coin98WalletAdapter()),
      safeCreateAdapter(() => new SafePalWalletAdapter()),
      safeCreateAdapter(() => new TokenPocketWalletAdapter()),
      safeCreateAdapter(() => new NightlyWalletAdapter()),

      safeCreateAdapter(() => new AlphaWalletAdapter()),
      safeCreateAdapter(() => new AvanaWalletAdapter()),
      safeCreateAdapter(() => new BitKeepWalletAdapter()),
      safeCreateAdapter(() => new BitpieWalletAdapter()),
      safeCreateAdapter(() => new CloverWalletAdapter()),
      safeCreateAdapter(() => new CoinhubWalletAdapter()),
      safeCreateAdapter(() => new HuobiWalletAdapter()),
      safeCreateAdapter(() => new HyperPayWalletAdapter()),
      safeCreateAdapter(() => new KrystalWalletAdapter()),
      safeCreateAdapter(() => new MathWalletAdapter()),
      safeCreateAdapter(() => new NekoWalletAdapter()),
      safeCreateAdapter(() => new NufiWalletAdapter()),
      safeCreateAdapter(() => new OntoWalletAdapter()),
      safeCreateAdapter(() => new ParticleAdapter()),
      safeCreateAdapter(() => new SaifuWalletAdapter()),
      safeCreateAdapter(() => new SalmonWalletAdapter()),
      safeCreateAdapter(() => new SkyWalletAdapter()),
      safeCreateAdapter(() => new SolongWalletAdapter()),
      safeCreateAdapter(() => new SpotWalletAdapter()),
      safeCreateAdapter(() => new TokenaryWalletAdapter()),
      safeCreateAdapter(() => new TorusWalletAdapter()),
      safeCreateAdapter(() => new TrezorWalletAdapter()),
      safeCreateAdapter(() => new UnsafeBurnerWalletAdapter()),
      safeCreateAdapter(() => new XDEFIWalletAdapter()),
    ].filter(Boolean) as WalletAdapter[]

    return list
  })

  const walletOptions = computed<CandyWalletOption[]>(() =>
    adapters.value.map((adapter) => ({
      name: String((adapter as any).name ?? adapter.constructor?.name ?? 'Wallet'),
      adapter,
      readyState: adapter.readyState,
      url: (adapter as any).url as string | undefined,
    }))
  )

  const setSelectedWalletName = (name: string) => {
    selectedWalletName.value = name
  }

  const getSelectedWallet = (): CandyWalletOption | undefined => {
    const exact = walletOptions.value.find((w) => w.name === selectedWalletName.value)
    if (exact) return exact
    return walletOptions.value.find((w) => w.name.toLowerCase().includes('phantom'))
  }

  const syncFromAdapter = (adapter: WalletAdapter) => {
    publicKey.value = adapter.publicKey ? new PublicKey(adapter.publicKey.toBase58()) : null
    connected.value = Boolean(publicKey.value)
  }

  const connect = async () => {
    const selected = getSelectedWallet()
    if (!selected) {
      throw new Error('No wallet adapters available')
    }

    if (selected.readyState === WalletReadyState.NotDetected) {
      if (selected.url) window.open(selected.url, '_blank')
      throw new Error(`${selected.name} wallet not detected`)
    }

    try {
      connecting.value = true

      if (wallet.value?.disconnect) {
        try {
          await wallet.value.disconnect()
        } catch {
          // ignore
        }
      }

      wallet.value = selected.adapter

      // Avoid accumulating duplicate listeners when reconnecting
      if (typeof (selected.adapter as any).removeAllListeners === 'function') {
        ;(selected.adapter as any).removeAllListeners()
      }

      selected.adapter.on('connect', () => syncFromAdapter(selected.adapter))
      selected.adapter.on('disconnect', () => {
        wallet.value = null
        publicKey.value = null
        connected.value = false
      })

      await selected.adapter.connect()
      syncFromAdapter(selected.adapter)

      return publicKey.value
    } finally {
      connecting.value = false
    }
  }

  const disconnect = async () => {
    try {
      if (wallet.value?.disconnect) {
        await wallet.value.disconnect()
      }
    } finally {
      wallet.value = null
      publicKey.value = null
      connected.value = false
    }
  }

  const getBalance = async (): Promise<number> => {
    if (!publicKey.value) return 0

    try {
      const balance = await connection.value.getBalance(publicKey.value)
      return balance / 1e9
    } catch (error) {
      console.error('Error getting balance:', error)
      return 0
    }
  }

  const requestAirdrop = async (amount: number = 1): Promise<string> => {
    if (!publicKey.value) {
      throw new Error('Wallet not connected')
    }

    if (network !== WalletAdapterNetwork.Devnet) {
      throw new Error('Airdrop only available on devnet')
    }

    const signature = await connection.value.requestAirdrop(publicKey.value, amount * 1e9)
    await connection.value.confirmTransaction(signature)
    return signature
  }

  return {
    connection,
    wallet,
    publicKey,
    connected,
    connecting,
    network,
    rpcUrl,

    walletOptions,
    selectedWalletName,
    setSelectedWalletName,

    connect,
    disconnect,
    getBalance,
    requestAirdrop,
  }
}
