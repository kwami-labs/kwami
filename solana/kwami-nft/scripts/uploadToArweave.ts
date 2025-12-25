import { Metaplex, keypairIdentity, bundlrStorage, toMetaplexFile } from '@metaplex-foundation/js';
import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import fs from 'fs';
import path from 'path';

/**
 * Configuration for Arweave upload
 */
export interface ArweaveConfig {
  rpcUrl: string;
  walletKeypair: Keypair;
  timeout?: number;
}

/**
 * Result of an Arweave upload
 */
export interface UploadResult {
  uri: string;
  success: boolean;
  error?: string;
}

/**
 * Initialize Metaplex instance for Arweave uploads
 */
export function initializeMetaplex(config: ArweaveConfig): Metaplex {
  const connection = new Connection(config.rpcUrl);
  
  const metaplex = Metaplex.make(connection)
    .use(keypairIdentity(config.walletKeypair))
    .use(bundlrStorage({
      address: 'https://node1.bundlr.network',
      providerUrl: config.rpcUrl,
      timeout: config.timeout || 60000,
    }));

  return metaplex;
}

/**
 * Upload a file buffer to Arweave
 * 
 * @param metaplex - Metaplex instance
 * @param buffer - File content as Buffer
 * @param fileName - Name of the file
 * @returns Arweave URI
 */
export async function uploadFileToArweave(
  metaplex: Metaplex,
  buffer: Buffer,
  fileName: string
): Promise<UploadResult> {
  try {
    console.log(`📤 Uploading ${fileName} to Arweave...`);
    
    const file = toMetaplexFile(buffer, fileName);
    const uri = await metaplex.storage().upload(file);
    
    console.log(`✅ Uploaded successfully: ${uri}`);
    
    return {
      uri,
      success: true,
    };
  } catch (error: any) {
    console.error(`❌ Upload failed for ${fileName}:`, error.message);
    return {
      uri: '',
      success: false,
      error: error.message,
    };
  }
}

/**
 * Upload a JSON object to Arweave
 * 
 * @param metaplex - Metaplex instance
 * @param json - JSON object to upload
 * @param fileName - Name for the file
 * @returns Arweave URI
 */
export async function uploadJsonToArweave(
  metaplex: Metaplex,
  json: object,
  fileName: string = 'metadata.json'
): Promise<UploadResult> {
  try {
    console.log(`📤 Uploading JSON metadata to Arweave...`);
    
    const jsonString = JSON.stringify(json, null, 2);
    const buffer = Buffer.from(jsonString, 'utf-8');
    
    const file = toMetaplexFile(buffer, fileName);
    const uri = await metaplex.storage().upload(file);
    
    console.log(`✅ JSON uploaded successfully: ${uri}`);
    
    return {
      uri,
      success: true,
    };
  } catch (error: any) {
    console.error(`❌ JSON upload failed:`, error.message);
    return {
      uri: '',
      success: false,
      error: error.message,
    };
  }
}

/**
 * Upload a file from disk to Arweave
 * 
 * @param metaplex - Metaplex instance
 * @param filePath - Path to file on disk
 * @returns Arweave URI
 */
export async function uploadFileFromDisk(
  metaplex: Metaplex,
  filePath: string
): Promise<UploadResult> {
  try {
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }
    
    const buffer = fs.readFileSync(filePath);
    const fileName = path.basename(filePath);
    
    return await uploadFileToArweave(metaplex, buffer, fileName);
  } catch (error: any) {
    console.error(`❌ Failed to read or upload file:`, error.message);
    return {
      uri: '',
      success: false,
      error: error.message,
    };
  }
}

/**
 * Upload Kwami NFT assets (GLB and thumbnail) to Arweave
 * 
 * @param metaplex - Metaplex instance
 * @param glbBuffer - GLB file buffer
 * @param thumbnailBuffer - Thumbnail image buffer
 * @returns Object with GLB and thumbnail URIs
 */
export async function uploadKwamiAssets(
  metaplex: Metaplex,
  glbBuffer: Buffer,
  thumbnailBuffer: Buffer
): Promise<{
  glbUri: string;
  thumbnailUri: string;
  success: boolean;
  errors?: string[];
}> {
  console.log('📤 Uploading Kwami assets to Arweave...');
  
  const errors: string[] = [];
  
  // Upload GLB
  const glbResult = await uploadFileToArweave(metaplex, glbBuffer, 'kwami.glb');
  if (!glbResult.success) {
    errors.push(`GLB upload failed: ${glbResult.error}`);
  }
  
  // Upload thumbnail
  const thumbnailResult = await uploadFileToArweave(metaplex, thumbnailBuffer, 'thumbnail.png');
  if (!thumbnailResult.success) {
    errors.push(`Thumbnail upload failed: ${thumbnailResult.error}`);
  }
  
  const success = glbResult.success && thumbnailResult.success;
  
  if (success) {
    console.log('✅ All assets uploaded successfully');
  } else {
    console.error('❌ Some assets failed to upload');
  }
  
  return {
    glbUri: glbResult.uri,
    thumbnailUri: thumbnailResult.uri,
    success,
    errors: errors.length > 0 ? errors : undefined,
  };
}

/**
 * Upload complete Kwami NFT (assets + metadata) to Arweave
 * 
 * @param config - Arweave configuration
 * @param glbBuffer - GLB file buffer
 * @param thumbnailBuffer - Thumbnail buffer
 * @param metadata - NFT metadata object
 * @returns Metadata URI
 */
export async function uploadCompleteKwamiNFT(
  config: ArweaveConfig,
  glbBuffer: Buffer,
  thumbnailBuffer: Buffer,
  metadata: object
): Promise<UploadResult> {
  console.log('🚀 Starting complete Kwami NFT upload to Arweave...');
  
  try {
    const metaplex = initializeMetaplex(config);
    
    // Step 1: Upload assets
    const assetsResult = await uploadKwamiAssets(metaplex, glbBuffer, thumbnailBuffer);
    
    if (!assetsResult.success) {
      throw new Error(`Asset upload failed: ${assetsResult.errors?.join(', ')}`);
    }
    
    // Step 2: Add asset URIs to metadata
    const metadataWithAssets = {
      ...metadata,
      image: assetsResult.thumbnailUri,
      animation_url: assetsResult.glbUri,
    };
    
    // Step 3: Upload metadata
    const metadataResult = await uploadJsonToArweave(metaplex, metadataWithAssets);
    
    if (!metadataResult.success) {
      throw new Error(`Metadata upload failed: ${metadataResult.error}`);
    }
    
    console.log('✅ Complete Kwami NFT uploaded to Arweave');
    console.log(`   Metadata URI: ${metadataResult.uri}`);
    console.log(`   GLB URI: ${assetsResult.glbUri}`);
    console.log(`   Thumbnail URI: ${assetsResult.thumbnailUri}`);
    
    return metadataResult;
  } catch (error: any) {
    console.error('❌ Complete upload failed:', error.message);
    return {
      uri: '',
      success: false,
      error: error.message,
    };
  }
}

/**
 * Get Bundlr balance for the wallet
 * 
 * @param metaplex - Metaplex instance
 * @returns Balance in lamports
 */
export async function getBundlrBalance(metaplex: Metaplex): Promise<number> {
  try {
    const balance = await metaplex.storage().driver().getBalance();
    return balance.basisPoints.toNumber();
  } catch (error) {
    console.error('Failed to get Bundlr balance:', error);
    return 0;
  }
}

/**
 * Fund Bundlr account for uploads
 * 
 * @param metaplex - Metaplex instance
 * @param amountInSol - Amount in SOL to fund
 */
export async function fundBundlr(metaplex: Metaplex, amountInSol: number): Promise<void> {
  try {
    console.log(`💰 Funding Bundlr with ${amountInSol} SOL...`);
    
    const lamports = amountInSol * 1_000_000_000;
    await metaplex.storage().driver().fund({ basisPoints: { basisPoints: BigInt(lamports), currency: { symbol: 'SOL', decimals: 9 } } });
    
    console.log('✅ Bundlr funded successfully');
  } catch (error) {
    console.error('❌ Failed to fund Bundlr:', error);
    throw error;
  }
}

/**
 * Estimate upload cost
 * 
 * @param metaplex - Metaplex instance
 * @param sizeInBytes - Size of upload in bytes
 * @returns Estimated cost in lamports
 */
export async function estimateUploadCost(
  metaplex: Metaplex,
  sizeInBytes: number
): Promise<number> {
  try {
    const price = await metaplex.storage().driver().getUploadPrice(sizeInBytes);
    return price.basisPoints.toNumber();
  } catch (error) {
    console.error('Failed to estimate upload cost:', error);
    return 0;
  }
}
