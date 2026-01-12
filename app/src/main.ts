import './style.css'
import { createWalletConnectWidget, type WalletConnectWidgetHandle } from 'kwami/ui/wallet'
import { getWalletConnector, type WalletConnector } from 'kwami/apps/wallet'
import type { KwamiOwnedNft } from 'kwami/apps/wallet'
import { createBackgroundRings } from 'kwami/ui/rings'
import { createKwamiLogoSvg } from 'kwami/ui/logo'
import type { PublicKey } from '@solana/web3.js'
import { BlobView } from './lib/BlobView'

function readEnv(key: string): string | undefined {
  const v = (import.meta as any).env?.[key]
  return typeof v === 'string' && v.trim().length ? v.trim() : undefined
}

const network = readEnv('VITE_SOLANA_NETWORK') ?? 'devnet'
const rpcEndpoint = readEnv('VITE_SOLANA_RPC_URL')
const collectionMint = readEnv('VITE_KWAMI_COLLECTION_ADDRESS') ?? readEnv('VITE_COLLECTION_MINT')
const symbol = readEnv('VITE_KWAMI_SYMBOL') ?? 'KWAMI'

const connector: WalletConnector = getWalletConnector({ network: network as any, rpcEndpoint })

const root = document.querySelector<HTMLDivElement>('#app')
if (!root) throw new Error('Missing #app mount element')

function mustGet<T extends Element>(selector: string): T {
  const el = document.querySelector(selector)
  if (!el) throw new Error(`Missing element: ${selector}`)
  return el as T
}

root.innerHTML = `
  <div class="app-root">
    <header class="topbar">
      <div class="topbar-left" id="topbarLeft">
        <div id="walletMount"></div>
      </div>
      <div class="topbar-right"></div>
    </header>

    <main class="hero">
      <div class="hero-center">
        <div id="logoMount" class="logo-mount" aria-label="KWAMI"></div>
        <div class="hero-sub">Connect a wallet · Select your Kwami NFT</div>
        <div class="hero-meta">
          <div class="meta-pill"><span class="meta-k">Network</span><span class="mono" id="networkValue"></span></div>
          <div class="meta-pill"><span class="meta-k">Wallet</span><span class="mono" id="addressValue"></span></div>
          <div class="meta-pill"><span class="meta-k">Selected</span><span class="mono" id="selectedValue"></span></div>
        </div>
      </div>
    </main>

    <div id="blob-container"></div>
  </div>
`

const walletMount = mustGet<HTMLDivElement>('#walletMount')
const networkValue = mustGet<HTMLDivElement>('#networkValue')
const addressValue = mustGet<HTMLDivElement>('#addressValue')
const selectedValue = mustGet<HTMLSpanElement>('#selectedValue')
const logoMount = mustGet<HTMLDivElement>('#logoMount')
const blobContainer = mustGet<HTMLDivElement>('#blob-container')

let selectedNft: KwamiOwnedNft | null = null
let blobView: BlobView | null = null

function shortAddress(value: string, left = 6, right = 6) {
  if (!value) return '—'
  if (value.length <= left + right + 3) return value
  return `${value.slice(0, left)}…${value.slice(-right)}`
}

function getPublicKey(): PublicKey | null {
  return connector.getPublicKey()
}

function renderSession() {
  networkValue.textContent = connector.getNetwork()
  const pk = getPublicKey()
  const address = pk ? shortAddress(pk.toBase58()) : '—'
  addressValue.textContent = address
  selectedValue.textContent = selectedNft ? shortAddress(selectedNft.mint, 7, 7) : '—'
}

function handleNftSelected(nft: KwamiOwnedNft) {
  selectedNft = nft
  
  // Hide hero center
  document.querySelector('.hero-center')?.classList.add('hero-center--hidden')
  
  // Initialize and show Blob
  if (!blobView) blobView = new BlobView(blobContainer)
  blobView.initBlob(nft.body ?? null)
  blobView.start()
  
  blobContainer.classList.add('blob--visible')
  
  renderSession()
}

const widget: WalletConnectWidgetHandle = createWalletConnectWidget({
  connectLabel: 'Connect Wallet',
  showBalanceInButton: true,
  autoRefreshBalanceMs: 30_000,
  wallet: connector as any,
  nftLoginOptions: {
    enabled: true,
    collectionMint,
    symbol,
    storageKey: 'kwami-app:selectedKwamiMint',
  },
  onConnected: () => {
    renderSession()
  },
  onDisconnected: () => {
    selectedNft = null
    if (blobView) {
      blobView.stop()
    }
    blobContainer.classList.remove('blob--visible')
    document.querySelector('.hero-center')?.classList.remove('hero-center--hidden')
    renderSession()
  },
  onNftSelected: (nft) => {
    handleNftSelected(nft)
  },
  onError: (err) => {
    console.error('Wallet error:', err)
  },
})

walletMount.appendChild(widget.element)
renderSession()

// Background rings (same approach as web/)
const rings = createBackgroundRings({
  mount: root,
  insert: 'first',
  zIndex: '0',
  sizeSource: 'mount',
  resize: 'auto',
  initialOpacity: 0.9,
  maxRingOpacity: 0.22,
})
rings.show()

// Center logo (same wordmark as web/)
const logo = createKwamiLogoSvg({
  className: 'kwami-logo-svg',
  gradientId: 'kwami-logo-grad-app',
  strokeWidth: 4,
})
logoMount.appendChild(logo)

