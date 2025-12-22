/**
 * Solana Blockchain Helpers
 * Utilities for interacting with Solana and the KWAMI NFT program using Anchor
 */

import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL, Keypair } from '@solana/web3.js'
import { TOKEN_PROGRAM_ID } from '@solana/spl-token'
import { AnchorProvider, Program, web3 } from '@coral-xyz/anchor'
import type { KwamiNft } from '../types/kwami_nft'
import type { QwamiToken } from '../types/qwami_token'
import { 
  checkDnaExistsDirect,
  mintKwamiDirect,
  fetchOwnedKwamisDirect,
  getTotalMintedCountDirect 
} from './solanaDirectHelpers'

// Get Solana connection
export function getSolanaConnection(): Connection {
  const rpcUrl = import.meta.env.VITE_SOLANA_RPC_URL || 'https://api.devnet.solana.com'
  return new Connection(rpcUrl, 'confirmed')
}

// Get KWAMI NFT Program ID from config
export function getKwamiProgramId(): PublicKey | null {
  const programId = import.meta.env.VITE_KWAMI_NFT_PROGRAM_ID
  
  if (!programId) {
    console.warn('[Solana] KWAMI NFT Program ID not configured')
    return null
  }
  
  try {
    return new PublicKey(programId)
  } catch (error) {
    console.error('[Solana] Invalid KWAMI NFT Program ID:', programId)
    return null
  }
}

// Get QWAMI Token Program ID from config
export function getQwamiProgramId(): PublicKey | null {
  const programId = import.meta.env.VITE_QWAMI_TOKEN_PROGRAM_ID
  
  if (!programId) {
    console.warn('[Solana] QWAMI Token Program ID not configured')
    return null
  }
  
  try {
    return new PublicKey(programId)
  } catch (error) {
    console.error('[Solana] Invalid QWAMI Token Program ID:', programId)
    return null
  }
}

/**
 * Get Anchor provider from wallet
 */
export function getAnchorProvider(wallet: any): AnchorProvider | null {
  if (!wallet || !wallet.publicKey) {
    console.warn('[Anchor] Wallet not connected')
    return null
  }

  const connection = getSolanaConnection()
  
  // Create provider
  const provider = new AnchorProvider(
    connection,
    wallet,
    { commitment: 'confirmed' }
  )

  return provider
}

/**
 * Get KWAMI NFT Program instance
 */
export async function getKwamiProgram(wallet: any): Promise<Program<KwamiNft> | null> {
  try {
    const programId = getKwamiProgramId()
    if (!programId) return null

    const provider = getAnchorProvider(wallet)
    if (!provider) return null

    // Load IDL - in production this would be fetched from chain or bundled
    const idl = await loadKwamiIdl()
    if (!idl) {
      console.warn('[Anchor] KWAMI IDL not found, using mock mode')
      return null
    }

    // Use the address from IDL if available, otherwise use env config
    const idlAddress = idl.address || idl.metadata?.address
    const finalProgramId = idlAddress ? new PublicKey(idlAddress) : programId
    
    const program = new Program(idl as any, finalProgramId, provider)
    return program as Program<KwamiNft>
  } catch (error) {
    console.error('[Anchor] Error loading KWAMI program:', error)
    return null
  }
}

/**
 * Get QWAMI Token Program instance
 */
export async function getQwamiProgram(wallet: any): Promise<Program<QwamiToken> | null> {
  try {
    const programId = getQwamiProgramId()
    if (!programId) return null

    const provider = getAnchorProvider(wallet)
    if (!provider) return null

    const idl = await loadQwamiIdl()
    if (!idl) {
      console.warn('[Anchor] QWAMI IDL not found, using mock mode')
      return null
    }

    // Use the address from IDL if available, otherwise use env config
    const idlAddress = idl.address || idl.metadata?.address
    const finalProgramId = idlAddress ? new PublicKey(idlAddress) : programId
    
    const program = new Program(idl as any, finalProgramId, provider)
    return program as Program<QwamiToken>
  } catch (error) {
    console.error('[Anchor] Error loading QWAMI program:', error)
    return null
  }
}

/**
 * Load KWAMI NFT IDL
 */
async function loadKwamiIdl(): Promise<any | null> {
  try {
    // Try to load IDL from public directory
    const response = await fetch('/idl/kwami_nft.json')
    if (response.ok) {
      return await response.json()
    }
    return null
  } catch (error) {
    console.warn('[IDL] Could not load KWAMI IDL:', error)
    return null
  }
}

/**
 * Load QWAMI Token IDL
 */
async function loadQwamiIdl(): Promise<any | null> {
  try {
    const response = await fetch('/idl/qwami_token.json')
    if (response.ok) {
      return await response.json()
    }
    return null
  } catch (error) {
    console.warn('[IDL] Could not load QWAMI IDL:', error)
    return null
  }
}

/**
 * Check if DNA already exists on-chain
 * Calls the Anchor program's check_dna_exists instruction
 */
export async function checkDnaExists(dna: string, wallet: any): Promise<boolean> {
  try {
    const connection = getSolanaConnection()
    
    console.log('[Solana] Checking DNA existence using direct web3.js...')
    const exists = await checkDnaExistsDirect(connection, dna)
    
    console.log('[Solana] DNA exists:', exists)
    return exists
  } catch (error: any) {
    console.error('[Solana] Error checking DNA:', error)
    throw new Error(`Failed to check DNA uniqueness: ${error.message}`)
  }
}

/**
 * Mint KWAMI NFT on Solana using Anchor program
 * Creates the NFT using the KWAMI NFT program with DNA validation
 */
export async function mintKwamiNft(
  wallet: any,
  dna: string,
  metadataUri: string,
  name: string
): Promise<string> {
  try {
    if (!wallet || !wallet.publicKey) {
      throw new Error('Wallet not connected properly')
    }

    const connection = getSolanaConnection()
    
    console.log('[Solana] Minting KWAMI using direct web3.js...')
    const mintAddress = await mintKwamiDirect(connection, wallet, dna, metadataUri, name)
    
    console.log('[Solana] KWAMI minted:', mintAddress)
    return mintAddress
  } catch (error: any) {
    console.error('[Solana] Error minting KWAMI:', error)
    throw new Error(`Failed to mint KWAMI: ${error.message}`)
  }
}

/**
 * Fetch NFTs owned by wallet address
 * Uses Metaplex SDK to fetch all NFTs from the KWAMI collection
 */
export async function fetchOwnedKwamis(walletAddress: PublicKey, wallet: any): Promise<any[]> {
  try {
    const connection = getSolanaConnection()
    
    console.log('[Solana] Fetching owned KWAMIs using direct web3.js...')
    const nfts = await fetchOwnedKwamisDirect(connection, walletAddress)
    
    console.log('[Solana] Found', nfts.length, 'KWAMIs')
    return nfts
  } catch (error: any) {
    console.error('[Solana] Error fetching owned KWAMIs:', error)
    return []
  }
}

/**
 * Get total minted count from the collection
 */
export async function getTotalMintedCount(wallet: any): Promise<number> {
  try {
    const connection = getSolanaConnection()
    
    console.log('[Solana] Fetching total minted count using direct web3.js...')
    const total = await getTotalMintedCountDirect(connection)
    
    console.log('[Solana] Total minted:', total)
    return total
  } catch (error: any) {
    console.error('[Solana] Error fetching total minted count:', error)
    return 0
  }
}

/**
 * Burn KWAMI NFT (to change DNA)
 */
export async function burnKwamiNft(
  wallet: any,
  mintAddress: string
): Promise<void> {
  try {
    if (!wallet || !wallet.publicKey) {
      throw new Error('Wallet not connected properly')
    }

    const program = await getKwamiProgram(wallet)
    
    if (!program) {
      console.warn('[Solana] Program not loaded, using mock mode')
      await new Promise(resolve => setTimeout(resolve, 1500))
      console.log('[Solana] KWAMI burned (mock)')
      return
    }

    console.log('[Solana] Burning KWAMI NFT:', mintAddress)

    const mint = new PublicKey(mintAddress)
    const programId = getKwamiProgramId()!

    // Get PDAs
    const [kwamiNft] = PublicKey.findProgramAddressSync(
      [Buffer.from('kwami-nft'), mint.toBuffer()],
      programId
    )

    const [dnaRegistry] = PublicKey.findProgramAddressSync(
      [Buffer.from('dna-registry')],
      programId
    )

    // Call burn_kwami instruction
    const tx = await program.methods
      .burnKwami()
      .accounts({
        kwamiNft,
        mint,
        dnaRegistry,
        owner: wallet.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc()

    console.log('[Solana] KWAMI burned successfully', { transaction: tx })
  } catch (error: any) {
    console.error('[Solana] Error burning KWAMI:', error)
    throw new Error(`Failed to burn KWAMI: ${error.message}`)
  }
}

/**
 * Update KWAMI metadata (Mind/Soul only - DNA stays same)
 */
export async function updateKwamiMetadata(
  wallet: any,
  mintAddress: string,
  newMetadataUri: string
): Promise<void> {
  try {
    if (!wallet || !wallet.publicKey) {
      throw new Error('Wallet not connected properly')
    }

    const program = await getKwamiProgram(wallet)
    
    if (!program) {
      throw new Error('Program not loaded')
    }

    console.log('[Solana] Updating KWAMI metadata:', mintAddress)

    const mint = new PublicKey(mintAddress)
    const programId = getKwamiProgramId()!

    const [kwamiNft] = PublicKey.findProgramAddressSync(
      [Buffer.from('kwami-nft'), mint.toBuffer()],
      programId
    )

    // Call update_metadata instruction
    const tx = await program.methods
      .updateMetadata(newMetadataUri)
      .accounts({
        kwamiNft,
        owner: wallet.publicKey,
      })
      .rpc()

    console.log('[Solana] Metadata updated successfully', { transaction: tx })
  } catch (error: any) {
    console.error('[Solana] Error updating metadata:', error)
    throw new Error(`Failed to update metadata: ${error.message}`)
  }
}
