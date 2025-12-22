/**
 * Arweave Upload Utility
 * Uploads assets and metadata to Arweave for permanent storage using Irys (formerly Bundlr)
 */

export interface UploadResult {
  uri: string
  txId: string
}

/**
 * Create a Solana wallet wrapper compatible with Irys SDK
 * The SDK expects a specific structure for Solana wallets
 */
function createIrysWalletAdapter(walletAdapter: any) {
  // Create a wallet object that mimics what Irys expects
  const wrapper = {
    publicKey: walletAdapter.publicKey,
    signTransaction: async (tx: any) => {
      return await walletAdapter.signTransaction(tx)
    },
    signAllTransactions: walletAdapter.signAllTransactions 
      ? async (txs: any[]) => await walletAdapter.signAllTransactions(txs)
      : undefined,
    signMessage: walletAdapter.signMessage
      ? async (message: Uint8Array) => await walletAdapter.signMessage(message)
      : undefined,
  }
  
  // Irys also checks for the wallet object itself in some cases
  return {
    ...wrapper,
    _wallet: walletAdapter,
    publicKey: walletAdapter.publicKey,
  }
}

/**
 * Get Irys instance for uploads
 * Uses lazy loading to avoid SSR issues
 */
async function getIrysInstance(wallet: any, connection: any) {
  try {
    // Dynamic import to avoid SSR issues
    const { default: Irys } = await import('@irys/sdk')
    
    // Config from env
    const network = import.meta.env.VITE_SOLANA_NETWORK || 'devnet'
    const rpcUrl = import.meta.env.VITE_SOLANA_RPC_URL || 'https://api.devnet.solana.com'

    // Validate wallet has required methods
    if (!wallet || !wallet.publicKey) {
      throw new Error('Invalid wallet: missing publicKey')
    }
    if (!wallet.signTransaction) {
      throw new Error('Invalid wallet: missing signTransaction method')
    }

    console.log('[Irys] Initializing with wallet:', wallet.publicKey.toBase58())
    console.log('[Irys] Wallet object keys:', Object.keys(wallet))
    console.log('[Irys] Has signTransaction:', typeof wallet.signTransaction)

    // Create Irys instance - pass wallet directly
    // The Irys SDK should detect it as an injected wallet
    const irys = new Irys({
      url: network === 'mainnet-beta' ? 'https://node1.irys.xyz' : 'https://devnet.irys.xyz',
      token: 'solana',
      key: wallet, // Pass the wallet adapter directly without wrapping
      config: { providerUrl: rpcUrl },
    })

    // Store connection for transaction confirmation
    ;(irys as any)._connection = connection

    console.log('[Irys] Instance created successfully')

    return irys
  } catch (error: any) {
    console.error('[Irys] Error initializing:', error)
    throw new Error(`Failed to initialize Irys client: ${error.message}`)
  }
}

/**
 * Upload image buffer to Arweave via Irys
 */
export async function uploadImageToArweave(
  imageBuffer: Buffer | Uint8Array,
  wallet: any,
  contentType: string = 'image/png',
  connection?: any
): Promise<UploadResult> {
  try {
    const data = Buffer.isBuffer(imageBuffer) ? imageBuffer : Buffer.from(imageBuffer)

    console.log('[Arweave] Uploading image...', { size: data.length, contentType })

    // Check if we should use mock mode (for development)
    const useMockUpload = import.meta.env.VITE_USE_MOCK_ARWEAVE === 'true'
    
    // For development/testing with mock wallet, return placeholder
    if (!wallet || typeof wallet === 'string' || useMockUpload) {
      if (useMockUpload) {
        console.warn('[Arweave] Using MOCK upload (VITE_USE_MOCK_ARWEAVE=true)')
      } else {
        console.warn('[Arweave] Using mock upload (no wallet provided)')
      }
      await new Promise(resolve => setTimeout(resolve, 1000))
      const mockTxId = `mock_img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      return {
        uri: `https://arweave.net/${mockTxId}`,
        txId: mockTxId
      }
    }

    // Real upload with Irys
    const { Connection } = await import('@solana/web3.js')
    const conn = connection || new Connection(
      import.meta.env.VITE_SOLANA_RPC_URL || 'https://api.devnet.solana.com',
      'confirmed'
    )
    const irys = await getIrysInstance(wallet, conn)

    // Check price (Irys will handle funding automatically during upload)
    const price = await irys.getPrice(data.length)
    console.log('[Irys] Upload cost:', {
      bytes: data.length,
      price: price.toString(),
    })

    // Upload image
    const receipt = await irys.upload(data, {
      tags: [
        { name: 'Content-Type', value: contentType },
        { name: 'App-Name', value: 'kwami.io' },
        { name: 'App-Version', value: '1.5.12' },
        { name: 'Type', value: 'image' },
      ],
    })

    const uri = `https://arweave.net/${receipt.id}`
    
    console.log('[Arweave] Image uploaded successfully', { txId: receipt.id, uri })

    return {
      uri,
      txId: receipt.id
    }
  } catch (error: any) {
    console.error('[Arweave] Error uploading image:', error)
    throw new Error(`Failed to upload image to Arweave: ${error.message}`)
  }
}

/**
 * Upload metadata JSON to Arweave via Irys
 */
export async function uploadMetadataToArweave(
  metadata: any,
  wallet: any,
  connection?: any
): Promise<UploadResult> {
  try {
    console.log('[Arweave] Uploading metadata...', { name: metadata.name })

    // Check if we should use mock mode (for development)
    const useMockUpload = import.meta.env.VITE_USE_MOCK_ARWEAVE === 'true'
    
    // For development/testing with mock wallet, return placeholder
    if (!wallet || typeof wallet === 'string' || useMockUpload) {
      if (useMockUpload) {
        console.warn('[Arweave] Using MOCK upload (VITE_USE_MOCK_ARWEAVE=true)')
      } else {
        console.warn('[Arweave] Using mock upload (no wallet provided)')
      }
      await new Promise(resolve => setTimeout(resolve, 1000))
      const mockTxId = `mock_meta_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      return {
        uri: `https://arweave.net/${mockTxId}`,
        txId: mockTxId
      }
    }

    // Convert metadata to JSON buffer
    const metadataJson = JSON.stringify(metadata, null, 2)
    const metadataBuffer = Buffer.from(metadataJson, 'utf-8')

    // Real upload with Irys
    const { Connection } = await import('@solana/web3.js')
    const conn = connection || new Connection(
      import.meta.env.VITE_SOLANA_RPC_URL || 'https://api.devnet.solana.com',
      'confirmed'
    )
    const irys = await getIrysInstance(wallet, conn)

    // Check price (Irys will handle funding automatically during upload)
    const price = await irys.getPrice(metadataBuffer.length)
    console.log('[Irys] Upload cost for metadata:', {
      bytes: metadataBuffer.length,
      price: price.toString(),
    })

    // Upload metadata
    const receipt = await irys.upload(metadataBuffer, {
      tags: [
        { name: 'Content-Type', value: 'application/json' },
        { name: 'App-Name', value: 'kwami.io' },
        { name: 'App-Version', value: '1.5.12' },
        { name: 'Type', value: 'metadata' },
      ],
    })

    const uri = `https://arweave.net/${receipt.id}`
    
    console.log('[Arweave] Metadata uploaded successfully', { txId: receipt.id, uri })

    return {
      uri,
      txId: receipt.id
    }
  } catch (error: any) {
    console.error('[Arweave] Error uploading metadata:', error)
    throw new Error(`Failed to upload metadata to Arweave: ${error.message}`)
  }
}

/**
 * Convert blob configuration to NFT attributes
 */
export function configToAttributes(config: any): Array<{ trait_type: string; value: any }> {
  const skin = config?.skin
  const skinName = skin?.skin ? String(skin.skin) : 'tricolor'
  const subtype = skin?.subtype ? String(skin.subtype) : 'poles'

  return [
    { trait_type: 'Resolution', value: config.resolution },
    { trait_type: 'Color R', value: config.colors?.x?.toFixed(2) || '0' },
    { trait_type: 'Color G', value: config.colors?.y?.toFixed(2) || '0' },
    { trait_type: 'Color B', value: config.colors?.z?.toFixed(2) || '0' },
    { trait_type: 'Spike X', value: config.spikes?.x?.toFixed(2) || '0' },
    { trait_type: 'Spike Y', value: config.spikes?.y?.toFixed(2) || '0' },
    { trait_type: 'Spike Z', value: config.spikes?.z?.toFixed(2) || '0' },
    { trait_type: 'Rotation X', value: config.rotation?.x?.toFixed(3) || '0' },
    { trait_type: 'Rotation Y', value: config.rotation?.y?.toFixed(3) || '0' },
    { trait_type: 'Rotation Z', value: config.rotation?.z?.toFixed(3) || '0' },
    { trait_type: 'Base Scale', value: config.baseScale?.toFixed(2) || '1.5' },
    { trait_type: 'Shininess', value: config.shininess || 50 },
    { trait_type: 'Skin', value: skinName === 'tricolor' ? 'Tricolor' : skinName },
    { trait_type: 'Skin Subtype', value: subtype.charAt(0).toUpperCase() + subtype.slice(1) },
  ]
}
