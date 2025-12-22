/**
 * Solana Blockchain Helpers
 * Utilities for interacting with Solana and the KWAMI NFT program using Anchor
 */

import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL, Keypair } from '@solana/web3.js'
import { TOKEN_PROGRAM_ID } from '@solana/spl-token'
import { AnchorProvider, Program, web3 } from '@coral-xyz/anchor'
import type { KwamiNft } from '../types/kwami_nft'
import type { QwamiToken } from '../types/qwami_token'

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
    const program = await getKwamiProgram(wallet)
    
    if (!program) {
      console.warn('[Solana] Program not loaded, using mock mode')
      // In development/mock mode, simulate check
      await new Promise(resolve => setTimeout(resolve, 500))
      return false
    }

    // Convert DNA string to bytes array
    const dnaBytes = Buffer.from(dna, 'hex')
    if (dnaBytes.length !== 32) {
      throw new Error('Invalid DNA hash - must be 32 bytes')
    }

    // Get collection authority and DNA registry PDAs
    const programId = getKwamiProgramId()!
    const [collectionAuthority] = PublicKey.findProgramAddressSync(
      [Buffer.from('collection-authority')],
      programId
    )

    const [dnaRegistry] = PublicKey.findProgramAddressSync(
      [Buffer.from('dna-registry')],
      programId
    )

    console.log('[Solana] Checking DNA existence on-chain...', { dna: dna.substring(0, 16) + '...' })

    // Call check_dna_exists instruction
    const exists = await program.methods
      .checkDnaExists(Array.from(dnaBytes))
      .accounts({
        dnaRegistry,
      })
      .view()

    console.log('[Solana] DNA exists:', exists)
    return exists
  } catch (error: any) {
    console.error('[Solana] Error checking DNA:', error)
    // In case of error, be safe and assume it might exist
    // This prevents duplicate minting attempts
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

    const program = await getKwamiProgram(wallet)
    
    if (!program) {
      console.warn('[Solana] Program not loaded, using mock mode')
      await new Promise(resolve => setTimeout(resolve, 2000))
      const mockMintAddress = `mock_mint_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      console.log('[Solana] KWAMI minted (mock):', mockMintAddress)
      return mockMintAddress
    }

    console.log('[Solana] Minting KWAMI NFT...', {
      wallet: wallet.publicKey.toBase58(),
      name,
      metadataUri: metadataUri.substring(0, 50) + '...'
    })

    // Convert DNA string to bytes array
    const dnaBytes = Buffer.from(dna, 'hex')
    if (dnaBytes.length !== 32) {
      throw new Error('Invalid DNA hash - must be 32 bytes')
    }

    // Generate new mint keypair
    const mintKeypair = Keypair.generate()
    const mint = mintKeypair.publicKey

    // Get PDAs
    const programId = getKwamiProgramId()!
    
    const [collectionAuthority] = PublicKey.findProgramAddressSync(
      [Buffer.from('collection-authority')],
      programId
    )

    const [dnaRegistry] = PublicKey.findProgramAddressSync(
      [Buffer.from('dna-registry')],
      programId
    )

    const [kwamiNft] = PublicKey.findProgramAddressSync(
      [Buffer.from('kwami-nft'), mint.toBuffer()],
      programId
    )

    // Get metadata PDA (Metaplex)
    const TOKEN_METADATA_PROGRAM_ID = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s')
    const [metadata] = PublicKey.findProgramAddressSync(
      [
        Buffer.from('metadata'),
        TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        mint.toBuffer(),
      ],
      TOKEN_METADATA_PROGRAM_ID
    )

    // Call mint_kwami instruction
    const tx = await program.methods
      .mintKwami(
        Array.from(dnaBytes),
        name,
        'KWAMI',
        metadataUri
      )
      .accounts({
        mint,
        kwamiNft,
        collectionAuthority,
        dnaRegistry,
        metadata,
        owner: wallet.publicKey,
        metadataProgram: TOKEN_METADATA_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        rent: web3.SYSVAR_RENT_PUBKEY,
      })
      .signers([mintKeypair])
      .rpc()

    console.log('[Solana] KWAMI minted successfully!', {
      mint: mint.toBase58(),
      transaction: tx
    })

    return mint.toBase58()
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
    const program = await getKwamiProgram(wallet)
    
    console.log('[Solana] Fetching owned KWAMIs for:', walletAddress.toBase58())
    
    if (!program) {
      console.warn('[Solana] Program not loaded, returning empty array')
      return []
    }

    const programId = getKwamiProgramId()!

    // Fetch all KWAMI NFT accounts owned by this wallet
    const accounts = await program.account.kwamiNft.all([
      {
        memcmp: {
          offset: 8 + 32, // After discriminator and mint pubkey
          bytes: walletAddress.toBase58(),
        },
      },
    ])

    console.log('[Solana] Found', accounts.length, 'KWAMIs')

    // Transform to simpler format
    const nfts = accounts.map((account) => ({
      mint: account.account.mint.toBase58(),
      owner: account.account.owner.toBase58(),
      dnaHash: Buffer.from(account.account.dnaHash).toString('hex'),
      metadataUri: account.account.metadataUri,
      mintedAt: new Date(account.account.mintedAt.toNumber() * 1000).toISOString(),
      updatedAt: new Date(account.account.updatedAt.toNumber() * 1000).toISOString(),
    }))

    return nfts
  } catch (error: any) {
    console.error('[Solana] Error fetching owned KWAMIs:', error)
    // Return empty array on error to not break the UI
    return []
  }
}

/**
 * Get total minted count from the collection
 */
export async function getTotalMintedCount(wallet: any): Promise<number> {
  try {
    const program = await getKwamiProgram(wallet)
    
    if (!program) {
      console.warn('[Solana] Program not loaded, returning 0')
      return 0
    }

    console.log('[Solana] Fetching total minted count...')

    const programId = getKwamiProgramId()!
    const [collectionAuthority] = PublicKey.findProgramAddressSync(
      [Buffer.from('collection-authority')],
      programId
    )

    // Fetch collection authority account
    const account = await program.account.collectionAuthority.fetch(collectionAuthority)
    
    const totalMinted = account.totalMinted.toNumber()
    console.log('[Solana] Total minted:', totalMinted)

    return totalMinted
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
