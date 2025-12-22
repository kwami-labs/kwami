/**
 * Arweave Upload Utility
 * Simplified version using mock uploads (Irys removed)
 * TODO: Implement real Arweave uploads with AR tokens
 */

export interface UploadResult {
  uri: string
  txId: string
}

/**
 * Upload image buffer to Arweave
 */
export async function uploadImageToArweave(
  imageBuffer: Buffer | Uint8Array,
  wallet: any,
  contentType: string = 'image/png',
  connection?: any
): Promise<UploadResult> {
  try {
    const data = Buffer.isBuffer(imageBuffer) ? imageBuffer : Buffer.from(imageBuffer)

    console.log('[Arweave] Uploading image...', { size: data.length, contentType, wallet: wallet?.publicKey?.toBase58() })

    // For now, always use mock uploads
    // Real Arweave uploads require AR tokens and proper setup
    console.log('[Arweave] Using mock upload (real Arweave requires AR tokens)')
    
    await new Promise(resolve => setTimeout(resolve, 1500))
    const mockTxId = `mock_img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const result = {
      uri: `https://arweave.net/${mockTxId}`,
      txId: mockTxId
    }
    
    console.log('[Arweave] Mock image uploaded:', result.uri)
    return result

  } catch (error: any) {
    console.error('[Arweave] Error uploading image:', error)
    throw new Error(`Failed to upload image to Arweave: ${error.message}`)
  }
}

/**
 * Upload metadata JSON to Arweave
 */
export async function uploadMetadataToArweave(
  metadata: any,
  wallet: any,
  connection?: any
): Promise<UploadResult> {
  try {
    console.log('[Arweave] Uploading metadata...', { name: metadata.name, wallet: wallet?.publicKey?.toBase58() })

    // Convert metadata to JSON
    const metadataJson = JSON.stringify(metadata, null, 2)
    
    // For now, always use mock uploads
    console.log('[Arweave] Using mock upload (real Arweave requires AR tokens)')
    
    await new Promise(resolve => setTimeout(resolve, 1500))
    const mockTxId = `mock_meta_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const result = {
      uri: `https://arweave.net/${mockTxId}`,
      txId: mockTxId
    }
    
    console.log('[Arweave] Mock metadata uploaded:', result.uri)
    return result

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
