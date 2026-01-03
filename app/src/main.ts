import './style.css'
import { createWalletConnectWidget, type WalletConnectWidgetHandle } from 'kwami/ui/wallet'
import { getWalletConnector, type WalletConnector } from 'kwami/apps/wallet'
import { createBackgroundRings } from 'kwami/ui/rings'
import { createKwamiLogoSvg } from 'kwami/ui/logo'
import { createGlassPopover } from 'kwami/ui'
import type { PublicKey } from '@solana/web3.js'
import { fetchOwnedKwamiNfts, type KwamiOwnedNft } from './lib/kwamiNfts'
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
        <button class="icon-btn" id="sheetToggleBtn" type="button" aria-label="Open login panel" style="display: none;">
          Login
        </button>
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
        <div class="hero-actions">
          <button class="btn btn-primary" id="openSelectBtn" type="button">Select NFT</button>
        </div>
      </div>
    </main>

    <div id="blob-container"></div>

    <section class="sheet" id="sheet" data-open="0" aria-label="Wallet login and NFT selection">
      <div class="sheet-inner">
        <div class="sheet-header">
          <div class="sheet-title">Login</div>
          <button class="icon-btn" id="sheetCloseBtn" type="button" aria-label="Close login panel">Close</button>
        </div>

        <div class="sheet-row">
          <div class="sheet-k">Collection</div>
          <div class="sheet-v mono" id="collectionValue"></div>
        </div>

        <div class="sheet-actions">
          <button class="btn" id="refreshBtn" type="button">Refresh NFTs</button>
        </div>

        <div class="status" id="statusLine"></div>
        <div class="grid" id="nftsGrid"></div>
      </div>
    </section>
  </div>
`

const walletMount = mustGet<HTMLDivElement>('#walletMount')
const networkValue = mustGet<HTMLDivElement>('#networkValue')
const addressValue = mustGet<HTMLDivElement>('#addressValue')
const collectionValue = mustGet<HTMLDivElement>('#collectionValue')
const selectedValue = mustGet<HTMLSpanElement>('#selectedValue')
const statusLine = mustGet<HTMLDivElement>('#statusLine')
const nftsGrid = mustGet<HTMLDivElement>('#nftsGrid')
const refreshBtn = mustGet<HTMLButtonElement>('#refreshBtn')
const sheet = mustGet<HTMLElement>('#sheet')
const sheetToggleBtn = mustGet<HTMLButtonElement>('#sheetToggleBtn')
const sheetCloseBtn = mustGet<HTMLButtonElement>('#sheetCloseBtn')
const openSelectBtn = mustGet<HTMLButtonElement>('#openSelectBtn')
const logoMount = mustGet<HTMLDivElement>('#logoMount')
const blobContainer = mustGet<HTMLDivElement>('#blob-container')

let kwamiNfts: KwamiOwnedNft[] = []
let selectedMint: string | null = null
let blobView: BlobView | null = null
let activeKwamiButton: HTMLElement | null = null

const storageKey = 'kwami-app:selectedKwamiMint'

function shortAddress(value: string, left = 6, right = 6) {
  if (!value) return '—'
  if (value.length <= left + right + 3) return value
  return `${value.slice(0, left)}…${value.slice(-right)}`
}

function getPublicKey(): PublicKey | null {
  return connector.getPublicKey()
}

function setStatus(text: string, kind: 'muted' | 'error' | 'ok' = 'muted') {
  statusLine.textContent = text
  statusLine.dataset.kind = kind
}

function renderSession() {
  networkValue.textContent = connector.getNetwork()
  const pk = getPublicKey()
  const address = pk ? shortAddress(pk.toBase58()) : '—'
  addressValue.textContent = address
  collectionValue.textContent = collectionMint ?? '(not set)'
  selectedValue.textContent = selectedMint ? shortAddress(selectedMint, 7, 7) : '—'

  // Toggle visibility between Wallet Widget and Login Button
  const isConnected = !!pk
  const widgetEl = walletMount.firstElementChild as HTMLElement
  
  if (isConnected) {
    if (widgetEl) widgetEl.style.display = 'none'
    sheetToggleBtn.style.display = 'block'
    sheetToggleBtn.textContent = address
  } else {
    if (widgetEl) widgetEl.style.display = 'block'
    sheetToggleBtn.style.display = 'none'
  }
}

function setSelectedMint(mint: string | null) {
  selectedMint = mint
  if (mint) localStorage.setItem(storageKey, mint)
  else localStorage.removeItem(storageKey)
  renderNfts()
  renderSession()
}

function handleNftSelection(mint: string, cardElement: HTMLElement) {
  // 1. Clone the card for animation
  const rect = cardElement.getBoundingClientRect()
  const clone = cardElement.cloneNode(true) as HTMLElement
  activeKwamiButton = clone
  
  // Set initial position
  clone.style.position = 'fixed'
  clone.style.left = `${rect.left}px`
  clone.style.top = `${rect.top}px`
  clone.style.width = `${rect.width}px`
  clone.style.height = `${rect.height}px`
  clone.style.margin = '0'
  clone.style.zIndex = '1000'
  
  document.body.appendChild(clone)
  
  // Force layout
  void clone.getBoundingClientRect()
  
  // 2. Trigger animations
  clone.classList.add('nft--flying')
  sheet.classList.add('sheet--hidden')
  document.querySelector('.hero-center')?.classList.add('hero-center--hidden')
  
  // Hide the Login button (it will be replaced by the Kwami button)
  sheetToggleBtn.style.opacity = '0'
  sheetToggleBtn.style.pointerEvents = 'none'

  // 3. Update state
  selectedMint = mint
  localStorage.setItem(storageKey, mint)
  
  // 4. Initialize and show Blob
  const nft = kwamiNfts.find(n => n.mint === mint)
  
  if (!blobView) blobView = new BlobView(blobContainer)
  blobView.initBlob(nft?.body ?? null)
  blobView.start()
  
  blobContainer.classList.add('blob--visible')

  // 5. Setup Interactive Popover on the Clone
  setTimeout(() => {
    clone.style.pointerEvents = 'auto'
    clone.style.cursor = 'pointer'
    
    const popover = createGlassPopover({
      width: 280,
      header: 'Kwami Account',
      content: () => {
        const container = document.createElement('div')
        container.style.display = 'flex'
        container.style.flexDirection = 'column'
        container.style.gap = '12px'

        const info = document.createElement('div')
        info.innerHTML = `
          <div style="font-size: 14px; font-weight: 700; color: #fff; margin-bottom: 4px;">${nft?.name || 'Unnamed'}</div>
          <div class="mono" style="font-size: 12px; opacity: 0.7;">${shortAddress(mint, 8, 8)}</div>
        `
        container.appendChild(info)

        const logoutBtn = document.createElement('button')
        logoutBtn.className = 'btn'
        logoutBtn.style.width = '100%'
        logoutBtn.style.background = 'rgba(239, 68, 68, 0.2)'
        logoutBtn.style.borderColor = 'rgba(239, 68, 68, 0.3)'
        logoutBtn.textContent = 'Logout'
        logoutBtn.onclick = () => {
           popover.hide()
           logout()
        }
        container.appendChild(logoutBtn)
        
        return container
      }
    })

    clone.addEventListener('click', (e) => {
      const rect = clone.getBoundingClientRect()
      // Position popover below the button
      popover.show(rect.left + rect.width / 2, rect.bottom + 10)
      e.stopPropagation()
    })
  }, 1000)
}

function logout() {
  selectedMint = null
  localStorage.removeItem(storageKey)
  
  // Clean up Blob
  if (blobView) {
    blobView.stop()
  }
  blobContainer.classList.remove('blob--visible')

  // Clean up UI
  if (activeKwamiButton) {
    activeKwamiButton.remove()
    activeKwamiButton = null
  }
  
  sheet.classList.remove('sheet--hidden')
  document.querySelector('.hero-center')?.classList.remove('hero-center--hidden')
  
  // Restore Login button
  sheetToggleBtn.style.opacity = '1'
  sheetToggleBtn.style.pointerEvents = 'auto'
  
  renderSession()
  renderNfts()
  
  // Reset sheet state
  setSheetOpen(false)
}

function renderNfts() {
  nftsGrid.innerHTML = ''

  if (kwamiNfts.length === 0) {
    const empty = document.createElement('div')
    empty.className = 'empty'
    empty.textContent = connector.isWalletConnected()
      ? 'No Kwami NFTs found in this wallet.'
      : 'Connect a wallet to load your NFTs.'
    nftsGrid.appendChild(empty)
    return
  }

  for (const nft of kwamiNfts) {
    const card = document.createElement('div')
    card.className = ['nft', selectedMint === nft.mint ? 'nft--selected' : ''].filter(Boolean).join(' ')

    const img = document.createElement('div')
    img.className = 'nft-img'
    if (nft.image) {
      const el = document.createElement('img')
      el.src = nft.image
      el.alt = nft.name
      el.loading = 'lazy'
      el.decoding = 'async'
      img.appendChild(el)
    } else {
      img.textContent = 'No image'
    }

    const meta = document.createElement('div')
    meta.className = 'nft-meta'

    const name = document.createElement('div')
    name.className = 'nft-name'
    name.textContent = nft.name || 'Unnamed'

    const mint = document.createElement('div')
    mint.className = 'nft-mint mono'
    mint.textContent = shortAddress(nft.mint, 7, 7)

    const btn = document.createElement('button')
    btn.className = 'btn btn-primary'
    btn.type = 'button'
    btn.textContent = selectedMint === nft.mint ? 'Selected' : 'Select'
    btn.disabled = selectedMint === nft.mint
    btn.addEventListener('click', (e) => {
      const card = (e.target as HTMLElement).closest('.nft') as HTMLElement
      handleNftSelection(nft.mint, card)
    })

    meta.appendChild(name)
    meta.appendChild(mint)
    meta.appendChild(btn)

    card.appendChild(img)
    card.appendChild(meta)

    nftsGrid.appendChild(card)
  }
}

async function refreshKwamiNfts() {
  renderSession()

  const owner = connector.getPublicKey()
  if (!owner) {
    kwamiNfts = []
    setStatus('Wallet not connected.', 'muted')
    renderNfts()
    return
  }

  setStatus('Loading NFTs…', 'muted')
  try {
    kwamiNfts = await fetchOwnedKwamiNfts({
      connection: connector.getConnection(),
      owner,
      collectionMint,
      symbol,
    })

    if (!selectedMint) {
      const saved = localStorage.getItem(storageKey)
      selectedMint = saved && saved.length ? saved : null
    }

    if (selectedMint && kwamiNfts.some((n) => n.mint === selectedMint)) {
      // keep selection
    } else {
      setSelectedMint(kwamiNfts[0]?.mint ?? null)
    }

    setStatus(`Loaded ${kwamiNfts.length} NFT${kwamiNfts.length === 1 ? '' : 's'}.`, 'ok')
    renderNfts()
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Failed to load NFTs'
    kwamiNfts = []
    setStatus(msg, 'error')
    renderNfts()
  }
}

const widget: WalletConnectWidgetHandle = createWalletConnectWidget({
  connectLabel: 'Connect Wallet',
  showBalanceInButton: true,
  autoRefreshBalanceMs: 30_000,
  wallet: connector as any,
  onConnected: () => {
    void refreshKwamiNfts()
  },
  onDisconnected: () => {
    kwamiNfts = []
    setSelectedMint(null)
    renderSession()
    setStatus('Disconnected.', 'muted')
    renderNfts()
  },
  onAccountChange: () => {
    void refreshKwamiNfts()
  },
  onNetworkChange: () => {
    void refreshKwamiNfts()
  },
  onError: (err) => {
    const msg = err instanceof Error ? err.message : 'Wallet error'
    setStatus(msg, 'error')
  },
})

walletMount.appendChild(widget.element)
refreshBtn.addEventListener('click', () => void refreshKwamiNfts())

renderSession()
renderNfts()
void refreshKwamiNfts()

function setSheetOpen(open: boolean) {
  sheet.dataset.open = open ? '1' : '0'
}

sheetToggleBtn.addEventListener('click', () => setSheetOpen(sheet.dataset.open !== '1'))
sheetCloseBtn.addEventListener('click', () => setSheetOpen(false))
openSelectBtn.addEventListener('click', () => setSheetOpen(true))

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

