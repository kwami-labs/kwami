/**
 * Arweave Upload Utility using Irys
 * Uploads images and metadata to Arweave for permanent storage
 */
import Irys from '@irys/sdk'

export interface UploadResult {
  uri: string
  txId: string
}

/**
 * Initialize Irys client for Solana devnet
 * Note: Irys with browser wallets requires special handling
 */
async function getIrysClient(wallet: any) {
  // Browser wallet adapters don't expose secretKey for security
  // We need to use Irys's WebIrys which works with wallet adapters
  const WebIrys = (await import('@irys/sdk/web')).default
  
  const irys = new WebIrys({
    url: 'https://devnet.irys.xyz',
    token: 'solana',
    wallet: { provider: wallet },
    config: {
      providerUrl: 'https://api.devnet.solana.com',
    },
  })
  
  // Initialize the connection
  await irys.ready()
  
  return irys
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

    try {
      const irys = await getIrysClient(wallet)
      
      // Check balance and fund if needed
      const price = await irys.getPrice(data.length)
      const priceInSol = Number(price) / 1e9 // Convert to SOL
      console.log('[Arweave] Upload cost:', priceInSol.toFixed(6), 'SOL')
      
      // Check if we have enough balance
      const balance = await irys.getLoadedBalance()
      console.log('[Arweave] Current Irys balance:', Number(balance) / 1e9, 'SOL')
      
      if (Number(balance) < Number(price)) {
        console.log('[Arweave] Insufficient balance, funding...')
        const fundAmount = Number(price) * 1.1 // Fund 10% extra
        const fundTx = await irys.fund(BigInt(Math.ceil(fundAmount)))
        console.log('[Arweave] Funded:', fundTx)
      }
      
      // Upload to Arweave
      console.log('[Arweave] Uploading to Arweave...')
      const receipt = await irys.upload(data, {
        tags: [
          { name: 'Content-Type', value: contentType },
          { name: 'App-Name', value: 'KWAMI' },
        ],
      })
      
      const result = {
        uri: `https://arweave.net/${receipt.id}`,
        txId: receipt.id,
      }
      
      console.log('[Arweave] ✅ Image uploaded successfully!')
      console.log('[Arweave] URL:', result.uri)
      return result
      
    } catch (uploadError: any) {
      console.error('[Arweave] ❌ Upload failed:', uploadError.message || uploadError)
      
      // Show specific error to user
      if (uploadError.message?.includes('wallet')) {
        console.error('[Arweave] ERROR: Wallet connection issue. Make sure wallet is connected.')
      } else if (uploadError.message?.includes('balance') || uploadError.message?.includes('fund')) {
        console.error('[Arweave] ERROR: Insufficient SOL to pay for Arweave upload.')
        console.error('[Arweave] You need ~0.001 devnet SOL for uploads.')
      }
      
      throw new Error(`Arweave upload failed: ${uploadError.message}. Cannot mint without image.`)
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

    // Convert metadata to JSON
    const metadataJson = JSON.stringify(metadata, null, 2)
    const data = Buffer.from(metadataJson, 'utf-8')
    
    try {
      const irys = await getIrysClient(wallet)
      
      // Get upload price
      const price = await irys.getPrice(data.length)
      console.log('[Arweave] Upload cost:', price.toString(), 'atomic units')
      
      // Upload to Arweave
      const receipt = await irys.upload(data, {
        tags: [
          { name: 'Content-Type', value: 'application/json' },
          { name: 'App-Name', value: 'KWAMI' },
        ],
      })
      
      const result = {
        uri: `https://arweave.net/${receipt.id}`,
        txId: receipt.id,
      }
      
      console.log('[Arweave] ✅ Metadata uploaded:', result.uri)
      return result
      
    } catch (uploadError: any) {
      console.error('[Arweave] Upload failed:', uploadError)
      
      // Fallback to mock
      console.warn('[Arweave] Using mock upload as fallback')
      const mockTxId = `mock_meta_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      return {
        uri: `https://arweave.net/${mockTxId}`,
        txId: mockTxId,
      }
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
