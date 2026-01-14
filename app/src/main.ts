import './style.css'
import { createWalletConnectWidget } from 'kwami/ui/wallet'
import { getWalletConnector } from 'kwami/apps/wallet'
import type { KwamiOwnedNft } from 'kwami/apps/wallet'
import { createBackgroundRings } from 'kwami/ui/rings'
import { createKwamiLogoSvg } from 'kwami/ui/logo'
import { BlobView } from './lib/BlobView'
import { KwamiAuthApi, signAuthMessage } from './lib/authApi'

function readEnv(key: string): string | undefined {
  const v = (import.meta as any).env?.[key]
  return typeof v === 'string' && v.trim().length ? v.trim() : undefined
}

const network = readEnv('VITE_SOLANA_NETWORK') ?? 'devnet'
const rpcEndpoint = readEnv('VITE_SOLANA_RPC_URL')
const collectionMint = readEnv('VITE_KWAMI_COLLECTION_ADDRESS') ?? readEnv('VITE_COLLECTION_MINT')
const symbol = readEnv('VITE_KWAMI_SYMBOL') ?? 'KWAMI'
const authServerUrl = readEnv('VITE_AUTH_SERVER_URL') ?? 'http://localhost:3000'

const connector = getWalletConnector({ network: network as any, rpcEndpoint })
const authApi = new KwamiAuthApi(authServerUrl)

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
        <div class="hero-sub">Connect wallet · Select your KWAMI</div>
      </div>
    </main>

    <div id="blob-container"></div>
  </div>
`

const walletMount = mustGet<HTMLDivElement>('#walletMount')
const logoMount = mustGet<HTMLDivElement>('#logoMount')
const blobContainer = mustGet<HTMLDivElement>('#blob-container')

let blobView: BlobView | null = null

async function authenticateWithServer(nft: KwamiOwnedNft) {
  try {
    // Get public key from connector
    const publicKey = connector.getPublicKey()
    if (!publicKey) {
      console.warn('⚠️  No wallet connected')
      return
    }

    // Access the internal wallet adapter through the connector
    // @ts-ignore - accessing internal property
    const walletAdapter = connector.wallet
    if (!walletAdapter || !walletAdapter.signMessage) {
      console.warn('⚠️  Wallet does not support message signing')
      return
    }

    console.log('🔐 Authenticating with server...')
    
    // Check server health
    const healthy = await authApi.healthCheck()
    if (!healthy) {
      console.warn('⚠️  Auth server is not reachable at', authServerUrl)
      return
    }

    const pubkey = publicKey.toBase58()
    
    // Request nonce
    const { nonce, message } = await authApi.requestNonce(pubkey)
    console.log('📝 Signing message:', message)
    
    // Sign message
    const signature = await signAuthMessage(walletAdapter.signMessage.bind(walletAdapter), message)
    
    // Login
    const loginResult = await authApi.login({
      pubkey,
      signature,
      message,
      nonce
    })
    
    console.log('✅ Authenticated with server, JWT token received')
    console.log('🎨 Server found', loginResult.owned_kwamis.length, 'KWAMIs')
    
    // Select the current NFT
    const selectResult = await authApi.selectKwami(nft.mint)
    console.log('✨ Selected KWAMI:', selectResult.kwami_mint)
    
    // Store token in localStorage
    localStorage.setItem('kwami-auth-token', authApi.getToken() || '')
    
  } catch (error: any) {
    console.error('❌ Authentication failed:', error)
    
    // Check if the error is about no KWAMIs found
    if (error?.message?.includes('No KWAMIs found')) {
      console.info('ℹ️  This wallet doesn\'t have any KWAMI NFTs on ' + network)
      console.info('ℹ️  The app will continue in local-only mode')
    }
    
    // Continue with local-only mode
  }
}

function handleNftLogin(nft: KwamiOwnedNft) {
  console.log('✅ Logged in with KWAMI:', nft.name)
  
  // Authenticate with server in background
  authenticateWithServer(nft).catch(err => {
    console.error('Auth error:', err)
  })
  
  // Hide hero center
  document.querySelector('.hero-center')?.classList.add('hero-center--hidden')
  
  // Initialize and show Blob
  if (!blobView) blobView = new BlobView(blobContainer)
  blobView.initBlob(nft.body ?? null)
  blobView.start()
  
  blobContainer.classList.add('blob--visible')
}

function handleLogout() {
  console.log('👋 Logged out')
  
  // Clear auth token
  authApi.clearToken()
  localStorage.removeItem('kwami-auth-token')
  
  // Clean up Blob
  if (blobView) {
    blobView.stop()
  }
  blobContainer.classList.remove('blob--visible')
  
  // Show hero center
  document.querySelector('.hero-center')?.classList.remove('hero-center--hidden')
}

// Create Wallet Widget with NFT Login
const widget = createWalletConnectWidget({
  wallet: connector as any,
  connectLabel: 'Connect Wallet',
  showBalanceInButton: false,
  nftLoginOptions: {
    enabled: true,
    collectionMint,
    symbol,
    storageKey: 'kwami-app:nft-login',
    avatarPosition: 'top-left',
    batchSize: 20,
  },
  onNftLogin: (result) => {
    handleNftLogin(result.nft)
  },
  onDisconnected: () => {
    handleLogout()
  },
  onError: (err) => {
    console.error('❌ Wallet error:', err)
  },
})

walletMount.appendChild(widget.element)

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

