/**
 * IPFS Upload Utility using Pinata REST API
 * Provides instant image availability (no 10-60 min wait like Arweave)
 */

export interface UploadResult {
  uri: string
  txId: string
}

// Pinata API credentials (get free at https://pinata.cloud)
// Sign up and get your JWT token
const PINATA_JWT = import.meta.env.VITE_PINATA_JWT || ''
const PINATA_GATEWAY = import.meta.env.VITE_PINATA_GATEWAY || 'gateway.pinata.cloud'

/**
 * Upload image buffer to IPFS via Pinata REST API
 * Images are instantly available (no waiting like Arweave)
 */
export async function uploadImageToIpfs(
  imageBuffer: Buffer | Uint8Array,
  wallet?: any,
  contentType: string = 'image/png'
): Promise<UploadResult> {
  try {
    const data = Buffer.isBuffer(imageBuffer) ? imageBuffer : Buffer.from(imageBuffer)

    console.log('[IPFS] Uploading image...', { size: data.length, contentType })

    // Create FormData for Pinata API
    const formData = new FormData()
    const blob = new Blob([data], { type: contentType })
    const file = new File([blob], 'kwami.png', { type: contentType })
    formData.append('file', file)
    
    // Upload to IPFS via Pinata REST API
    console.log('[IPFS] Uploading to IPFS via Pinata...')
    const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PINATA_JWT}`
      },
      body: formData
    })
    
    if (!response.ok) {
      const errorData = await response.text()
      throw new Error(`Pinata API error: ${response.status} - ${errorData}`)
    }
    
    const upload = await response.json()
    
    // Use Pinata's dedicated gateway for instant access
    const result = {
      uri: `https://${PINATA_GATEWAY}/ipfs/${upload.IpfsHash}`,
      txId: upload.IpfsHash,
    }
    
    console.log('[IPFS] ✅ Image uploaded successfully!')
    console.log('[IPFS] URL:', result.uri)
    console.log('[IPFS] 🚀 Image is immediately available!')
    return result

  } catch (error: any) {
    console.error('[IPFS] ❌ Upload failed:', error)
    throw new Error(`Failed to upload image to IPFS: ${error.message}`)
  }
}

/**
 * Upload metadata JSON to IPFS via Pinata REST API
 */
export async function uploadMetadataToIpfs(
  metadata: any,
  wallet?: any
): Promise<UploadResult> {
  try {
    console.log('[IPFS] Uploading metadata...', { name: metadata.name })

    // Convert metadata to JSON and create FormData
    const formData = new FormData()
    const metadataJson = JSON.stringify(metadata, null, 2)
    const blob = new Blob([metadataJson], { type: 'application/json' })
    const file = new File([blob], 'metadata.json', { type: 'application/json' })
    formData.append('file', file)
    
    // Upload to IPFS via Pinata REST API
    console.log('[IPFS] Uploading metadata to IPFS...')
    const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PINATA_JWT}`
      },
      body: formData
    })
    
    if (!response.ok) {
      const errorData = await response.text()
      throw new Error(`Pinata API error: ${response.status} - ${errorData}`)
    }
    
    const upload = await response.json()
    
    const result = {
      uri: `https://${PINATA_GATEWAY}/ipfs/${upload.IpfsHash}`,
      txId: upload.IpfsHash,
    }
    
    console.log('[IPFS] ✅ Metadata uploaded successfully!')
    console.log('[IPFS] URL:', result.uri)
    return result

  } catch (error: any) {
    console.error('[IPFS] ❌ Upload failed:', error)
    throw new Error(`Failed to upload metadata to IPFS: ${error.message}`)
  }
}

/**
 * Convert blob configuration to NFT attributes
 * (Re-exported for compatibility)
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
