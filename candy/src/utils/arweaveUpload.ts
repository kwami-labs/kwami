/**
 * Arweave Upload Utility
 * Uploads assets and metadata to Arweave for permanent storage using Irys (formerly Bundlr)
 */

export interface UploadResult {
  uri: string
  txId: string
}

/**
 * Get Irys instance for uploads
 * Uses lazy loading to avoid SSR issues
 */
async function getIrysInstance(wallet: any) {
  try {
    // Dynamic import to avoid SSR issues
    const { default: Irys } = await import('@irys/sdk')
    
    // Config from env
    const network = import.meta.env.VITE_SOLANA_NETWORK || 'devnet'
    const rpcUrl = import.meta.env.VITE_SOLANA_RPC_URL || 'https://api.devnet.solana.com'

    // Create Irys instance
    const irys = new Irys({
      network: network === 'mainnet-beta' ? 'mainnet' : 'devnet',
      token: 'solana',
      key: wallet,
      config: {
        providerUrl: rpcUrl,
      },
    })

    return irys
  } catch (error) {
    console.error('[Irys] Error initializing:', error)
    throw new Error('Failed to initialize Irys client')
  }
}

/**
 * Upload image buffer to Arweave via Irys
 */
export async function uploadImageToArweave(
  imageBuffer: Buffer | Uint8Array,
  wallet: any,
  contentType: string = 'image/png'
): Promise<UploadResult> {
  try {
    const data = Buffer.isBuffer(imageBuffer) ? imageBuffer : Buffer.from(imageBuffer)

    console.log('[Arweave] Uploading image...', { size: data.length, contentType })

    // For development/testing with mock wallet, return placeholder
    if (!wallet || typeof wallet === 'string') {
      console.warn('[Arweave] Using mock upload (no wallet provided)')
      await new Promise(resolve => setTimeout(resolve, 1000))
      const mockTxId = `mock_img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      return {
        uri: `https://arweave.net/${mockTxId}`,
        txId: mockTxId
      }
    }

    // Real upload with Irys
    const irys = await getIrysInstance(wallet)

    // Fund if needed (check balance first)
    const price = await irys.getPrice(data.length)
    const balance = await irys.getLoadedBalance()
    
    if (balance.lt(price)) {
      console.log('[Irys] Funding account...', { needed: price.toString(), current: balance.toString() })
      await irys.fund(price.multipliedBy(1.1)) // Fund 110% to cover fees
    }

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
  wallet: any
): Promise<UploadResult> {
  try {
    console.log('[Arweave] Uploading metadata...', { name: metadata.name })

    // For development/testing with mock wallet, return placeholder
    if (!wallet || typeof wallet === 'string') {
      console.warn('[Arweave] Using mock upload (no wallet provided)')
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
    const irys = await getIrysInstance(wallet)

    // Fund if needed
    const price = await irys.getPrice(metadataBuffer.length)
    const balance = await irys.getLoadedBalance()
    
    if (balance.lt(price)) {
      console.log('[Irys] Funding account for metadata...', { needed: price.toString() })
      await irys.fund(price.multipliedBy(1.1))
    }

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
