/**
 * Direct Solana Web3.js Helpers
 * Bypasses Anchor client to avoid IDL parsing issues
 */

import { 
  Connection, 
  PublicKey, 
  Transaction, 
  TransactionInstruction,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
  Keypair,
} from '@solana/web3.js'
import { TOKEN_PROGRAM_ID } from '@solana/spl-token'
import * as borsh from 'borsh'

// Program ID
const KWAMI_PROGRAM_ID = new PublicKey('DoAJAykwUrSDjraDegK4AJ1GCoztLYrTvKhUJHaFbSsD')

// Instruction discriminators (first 8 bytes of SHA256("global:instruction_name"))
const INSTRUCTION_DISCRIMINATORS = {
  mint_kwami: Buffer.from([200, 116, 147, 137, 42, 111, 131, 148]),
  check_dna_exists: Buffer.from([/* we'll compute this */]),
}

/**
 * Derive PDA for collection authority
 */
export function getCollectionAuthorityPDA(collectionMint: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('collection-authority'), collectionMint.toBuffer()],
    KWAMI_PROGRAM_ID
  )
}

/**
 * Derive PDA for DNA registry
 */
export function getDnaRegistryPDA(collectionMint: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('dna-registry'), collectionMint.toBuffer()],
    KWAMI_PROGRAM_ID
  )
}

/**
 * Derive PDA for Kwami NFT
 */
export function getKwamiNftPDA(mint: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('kwami-nft'), mint.toBuffer()],
    KWAMI_PROGRAM_ID
  )
}

/**
 * Derive PDA for treasury
 */
export function getTreasuryPDA(): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('kwami-treasury')],
    KWAMI_PROGRAM_ID
  )
}

/**
 * Check if DNA exists on-chain using view call
 */
export async function checkDnaExistsDirect(
  connection: Connection,
  dna: string
): Promise<boolean> {
  try {
    // For now, return false (mock check)
    // TODO: Implement actual view call or account fetch
    console.log('[Direct] Checking DNA (mock):', dna.substring(0, 16))
    return false
  } catch (error) {
    console.error('[Direct] Error checking DNA:', error)
    return false
  }
}

/**
 * Mint Kwami NFT using direct instruction
 */
export async function mintKwamiDirect(
  connection: Connection,
  wallet: any,
  dna: string,
  metadataUri: string,
  name: string
): Promise<string> {
  try {
    if (!wallet.publicKey || !wallet.signTransaction) {
      throw new Error('Wallet not connected')
    }

    console.log('[Direct] Minting KWAMI NFT...')
    console.log('[Direct] DNA:', dna.substring(0, 16) + '...')
    console.log('[Direct] Name:', name)

    // Generate new mint keypair
    const mintKeypair = Keypair.generate()
    console.log('[Direct] Mint:', mintKeypair.publicKey.toBase58())

    // Get PDAs (we need collection mint - using a placeholder for now)
    // TODO: Get actual collection mint from on-chain data or config
    const collectionMint = new PublicKey('11111111111111111111111111111111') // Placeholder
    
    const [collectionAuthority] = getCollectionAuthorityPDA(collectionMint)
    const [dnaRegistry] = getDnaRegistryPDA(collectionMint)
    const [kwamiNft] = getKwamiNftPDA(mintKeypair.publicKey)
    const [treasury] = getTreasuryPDA()

    console.log('[Direct] Collection Authority:', collectionAuthority.toBase58())
    console.log('[Direct] DNA Registry:', dnaRegistry.toBase58())
    console.log('[Direct] Kwami NFT PDA:', kwamiNft.toBase58())
    console.log('[Direct] Treasury:', treasury.toBase58())

    // For now, return mock result until we have all the required accounts
    // TODO: Build actual transaction with proper accounts and instruction data
    console.log('[Direct] Mock minting (need QWAMI token accounts and collection setup)')
    
    await new Promise(resolve => setTimeout(resolve, 2000))
    const mockMint = `direct_mint_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    console.log('[Direct] KWAMI minted (mock):', mockMint)
    return mockMint

  } catch (error: any) {
    console.error('[Direct] Error minting:', error)
    throw new Error(`Failed to mint KWAMI: ${error.message}`)
  }
}

/**
 * Fetch owned Kwamis (simplified version)
 */
export async function fetchOwnedKwamisDirect(
  connection: Connection,
  walletAddress: PublicKey
): Promise<any[]> {
  try {
    console.log('[Direct] Fetching owned KWAMIs for:', walletAddress.toBase58())
    
    // For now, return empty array
    // TODO: Use getProgramAccounts to fetch Kwami NFT accounts owned by wallet
    return []
  } catch (error) {
    console.error('[Direct] Error fetching owned KWAMIs:', error)
    return []
  }
}

/**
 * Get total minted count (simplified version)
 */
export async function getTotalMintedCountDirect(
  connection: Connection
): Promise<number> {
  try {
    console.log('[Direct] Fetching total minted count...')
    
    // For now, return 0
    // TODO: Fetch collection authority account and read total_minted field
    return 0
  } catch (error) {
    console.error('[Direct] Error fetching total minted:', error)
    return 0
  }
}
