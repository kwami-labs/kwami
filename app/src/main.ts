import './style.css'
import { createKwamiNftLoginPanel, type KwamiNftLoginResult } from 'kwami/ui/nft-login'
import { getWalletConnector } from 'kwami/apps/wallet'
import { createBackgroundRings } from 'kwami/ui/rings'
import { createKwamiLogoSvg } from 'kwami/ui/logo'
import { BlobView } from './lib/BlobView'

function readEnv(key: string): string | undefined {
  const v = (import.meta as any).env?.[key]
  return typeof v === 'string' && v.trim().length ? v.trim() : undefined
}

const network = readEnv('VITE_SOLANA_NETWORK') ?? 'devnet'
const rpcEndpoint = readEnv('VITE_SOLANA_RPC_URL')
const collectionMint = readEnv('VITE_KWAMI_COLLECTION_ADDRESS') ?? readEnv('VITE_COLLECTION_MINT')
const symbol = readEnv('VITE_KWAMI_SYMBOL') ?? 'KWAMI'

const connector = getWalletConnector({ network: network as any, rpcEndpoint })

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
        <div id="loginMount"></div>
      </div>
      <div class="topbar-right"></div>
    </header>

    <main class="hero">
      <div class="hero-center">
        <div id="logoMount" class="logo-mount" aria-label="KWAMI"></div>
        <div class="hero-sub">Connect with your KWAMI NFT</div>
      </div>
    </main>

    <div id="blob-container"></div>
  </div>
`

const loginMount = mustGet<HTMLDivElement>('#loginMount')
const logoMount = mustGet<HTMLDivElement>('#logoMount')
const blobContainer = mustGet<HTMLDivElement>('#blob-container')

let blobView: BlobView | null = null

function handleLogin(result: KwamiNftLoginResult) {
  console.log('✅ Logged in with KWAMI:', result.nft.name)
  console.log('📍 Wallet:', result.walletAddress)
  console.log('🎨 NFT Mint:', result.nftMint)
  
  // Hide hero center
  document.querySelector('.hero-center')?.classList.add('hero-center--hidden')
  
  // Initialize and show Blob
  if (!blobView) blobView = new BlobView(blobContainer)
  blobView.initBlob(result.nft.body ?? null)
  blobView.start()
  
  blobContainer.classList.add('blob--visible')
}

function handleLogout() {
  console.log('👋 Logged out')
  
  // Clean up Blob
  if (blobView) {
    blobView.stop()
  }
  blobContainer.classList.remove('blob--visible')
  
  // Show hero center
  document.querySelector('.hero-center')?.classList.remove('hero-center--hidden')
}

// Create NFT Login Panel
const loginPanel = createKwamiNftLoginPanel({
  wallet: connector as any,
  collectionMint,
  symbol,
  avatarPosition: 'top-left',
  batchSize: 20,
  storageKey: 'kwami-app:nft-login',
  autoRestore: true,
  onLogin: handleLogin,
  onLogout: handleLogout,
  onError: (err: unknown) => {
    console.error('❌ NFT Login error:', err)
  },
})

loginMount.appendChild(loginPanel.element)

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

