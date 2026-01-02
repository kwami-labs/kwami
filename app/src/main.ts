import './style.css'
import { createWalletConnectWidget, type WalletConnectWidgetHandle } from 'kwami/ui/wallet'
import { getWalletConnector, type WalletConnector } from 'kwami/apps/wallet'
import { createBackgroundRings } from 'kwami/ui/rings'
import { createKwamiLogoSvg } from 'kwami/ui/logo'
import type { PublicKey } from '@solana/web3.js'
import { fetchOwnedKwamiNfts, type KwamiOwnedNft } from './lib/kwamiNfts'

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
      <div class="topbar-left">
        <button class="icon-btn" id="sheetToggleBtn" type="button" aria-label="Open login panel">
          Login
        </button>
      </div>
      <div class="topbar-right" id="walletMount"></div>
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

let kwamiNfts: KwamiOwnedNft[] = []
let selectedMint: string | null = null

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
  addressValue.textContent = pk ? shortAddress(pk.toBase58()) : '—'
  collectionValue.textContent = collectionMint ?? '(not set)'
  selectedValue.textContent = selectedMint ? shortAddress(selectedMint, 7, 7) : '—'
}

function setSelectedMint(mint: string | null) {
  selectedMint = mint
  if (mint) localStorage.setItem(storageKey, mint)
  else localStorage.removeItem(storageKey)
  renderNfts()
  renderSession()
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
    btn.addEventListener('click', () => setSelectedMint(nft.mint))

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

