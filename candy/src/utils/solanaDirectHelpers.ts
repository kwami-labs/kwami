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
  TransactionMessage,
  VersionedTransaction,
} from '@solana/web3.js'
import { 
  TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from '@solana/spl-token'

// Program ID
const KWAMI_PROGRAM_ID = new PublicKey('DoAJAykwUrSDjraDegK4AJ1GCoztLYrTvKhUJHaFbSsD')

// Known addresses from devnet deployment
const COLLECTION_MINT = new PublicKey(import.meta.env.VITE_COLLECTION_MINT)
const QWAMI_MINT = new PublicKey(import.meta.env.VITE_QWAMI_MINT)
const QWAMI_VAULT = new PublicKey('7BQkRbZ9Htqhvn2Z2Zeh3bktuwYE8CrkCZSivB7sp4j3')
const TOKEN_METADATA_PROGRAM_ID = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s')

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
 * Derive Metaplex metadata PDA
 */
export function getMetadataPDA(mint: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from('metadata'),
      TOKEN_METADATA_PROGRAM_ID.toBuffer(),
      mint.toBuffer(),
    ],
    TOKEN_METADATA_PROGRAM_ID
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
 * Serialize instruction arguments using Borsh
 */
function serializeMintKwamiArgs(
  dnaHash: Uint8Array,
  name: string,
  symbol: string,
  uri: string
): Buffer {
  // Borsh serialization for Rust struct:
  // pub fn mint_kwami(dna_hash: [u8; 32], name: String, symbol: String, uri: String)
  const writer = new Uint8Array(1024) // Allocate enough space
  let offset = 0

  // Write DNA hash (32 bytes fixed)
  writer.set(dnaHash, offset)
  offset += 32

  // Write name (String = u32 length + bytes)
  const nameBytes = new TextEncoder().encode(name)
  new DataView(writer.buffer).setUint32(offset, nameBytes.length, true)
  offset += 4
  writer.set(nameBytes, offset)
  offset += nameBytes.length

  // Write symbol (String = u32 length + bytes)
  const symbolBytes = new TextEncoder().encode(symbol)
  new DataView(writer.buffer).setUint32(offset, symbolBytes.length, true)
  offset += 4
  writer.set(symbolBytes, offset)
  offset += symbolBytes.length

  // Write uri (String = u32 length + bytes)
  const uriBytes = new TextEncoder().encode(uri)
  new DataView(writer.buffer).setUint32(offset, uriBytes.length, true)
  offset += 4
  writer.set(uriBytes, offset)
  offset += uriBytes.length

  return Buffer.from(writer.slice(0, offset))
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
    console.log('[Direct] Metadata URI:', metadataUri)

    // Generate new mint keypair
    const mintKeypair = Keypair.generate()
    console.log('[Direct] Mint:', mintKeypair.publicKey.toBase58())

    // Get PDAs
    const [collectionAuthority] = getCollectionAuthorityPDA(COLLECTION_MINT)
    const [dnaRegistry] = getDnaRegistryPDA(COLLECTION_MINT)
    const [kwamiNft] = getKwamiNftPDA(mintKeypair.publicKey)
    const [treasury] = getTreasuryPDA()
    const [metadata] = getMetadataPDA(mintKeypair.publicKey)

    console.log('[Direct] Collection Authority:', collectionAuthority.toBase58())
    console.log('[Direct] DNA Registry:', dnaRegistry.toBase58())
    console.log('[Direct] Kwami NFT PDA:', kwamiNft.toBase58())
    console.log('[Direct] Treasury:', treasury.toBase58())
    console.log('[Direct] Metadata:', metadata.toBase58())

    // Get user's QWAMI token account
    const userQwamiAccount = await getAssociatedTokenAddress(
      QWAMI_MINT,
      wallet.publicKey
    )
    console.log('[Direct] User QWAMI Account:', userQwamiAccount.toBase58())

    // Get owner's token account for the NFT (where the NFT will be sent)
    const ownerTokenAccount = await getAssociatedTokenAddress(
      mintKeypair.publicKey,
      wallet.publicKey
    )
    console.log('[Direct] Owner Token Account:', ownerTokenAccount.toBase58())

    // Check if user QWAMI account exists, create if not
    const accountInfo = await connection.getAccountInfo(userQwamiAccount)
    const transaction = new Transaction()
    
    if (!accountInfo) {
      console.log('[Direct] Creating user QWAMI account...')
      transaction.add(
        createAssociatedTokenAccountInstruction(
          wallet.publicKey,
          userQwamiAccount,
          wallet.publicKey,
          QWAMI_MINT
        )
      )
    }

    // Convert DNA string to 32-byte hash
    // The DNA is already a hex string, pad it to 32 bytes
    const dnaBytes = new Uint8Array(32)
    const dnaHex = dna.padEnd(64, '0') // Pad to 64 hex chars = 32 bytes
    for (let i = 0; i < 32; i++) {
      dnaBytes[i] = parseInt(dnaHex.substr(i * 2, 2), 16)
    }

    // Serialize instruction arguments
    const symbol = 'KWAMI'
    const argsData = serializeMintKwamiArgs(dnaBytes, name, symbol, metadataUri)

    // Build instruction data: discriminator + args
    const instructionData = Buffer.concat([
      INSTRUCTION_DISCRIMINATORS.mint_kwami,
      argsData,
    ])

    console.log('[Direct] Instruction data length:', instructionData.length)

    // Build mint instruction
    // Account order matches the Rust struct MintKwami:
    const keys = [
      { pubkey: mintKeypair.publicKey, isSigner: false, isWritable: true },      // mint (init)
      { pubkey: kwamiNft, isSigner: false, isWritable: true },                   // kwami_nft (init)
      { pubkey: collectionAuthority, isSigner: false, isWritable: true },        // collection_authority
      { pubkey: dnaRegistry, isSigner: false, isWritable: true },                // dna_registry (realloc)
      { pubkey: treasury, isSigner: false, isWritable: true },                   // treasury
      { pubkey: userQwamiAccount, isSigner: false, isWritable: true },           // user_qwami_account
      { pubkey: QWAMI_VAULT, isSigner: false, isWritable: true },                // qwami_vault
      { pubkey: metadata, isSigner: false, isWritable: true },                   // metadata (Metaplex)
      { pubkey: ownerTokenAccount, isSigner: false, isWritable: true },          // owner_token_account (init)
      { pubkey: wallet.publicKey, isSigner: true, isWritable: true },            // owner (signer, payer)
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },   // system_program
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },          // token_program
      { pubkey: ASSOCIATED_TOKEN_PROGRAM_ID, isSigner: false, isWritable: false }, // associated_token_program
      { pubkey: TOKEN_METADATA_PROGRAM_ID, isSigner: false, isWritable: false }, // token_metadata_program
    ]

    const mintInstruction = new TransactionInstruction({
      keys,
      programId: KWAMI_PROGRAM_ID,
      data: instructionData,
    })

    transaction.add(mintInstruction)

    // Get recent blockhash
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash()
    transaction.recentBlockhash = blockhash
    transaction.feePayer = wallet.publicKey

    console.log('[Direct] Transaction requires signatures:')
    console.log('  - Wallet (fee payer):', wallet.publicKey.toBase58())
    console.log('  - Mint keypair:', mintKeypair.publicKey.toBase58())

    // Sign with mint keypair first using Transaction.sign() to properly register it
    console.log('[Direct] Signing with mint keypair...')
    transaction.sign(mintKeypair)
    
    // Now the transaction has one partial signature. We need the wallet to complete it.
    // However, most wallet adapters' signTransaction() overwrites existing signatures.
    // So we need to use a different approach: get wallet signature separately.
    
    console.log('[Direct] Requesting wallet signature...')
    const signedTx = await wallet.signTransaction(transaction)

    console.log('[Direct] Sending transaction...')
    const signature = await connection.sendRawTransaction(signedTx.serialize(), {
      skipPreflight: false,
      preflightCommitment: 'confirmed',
    })

    console.log('[Direct] Transaction sent:', signature)
    console.log('[Direct] Confirming...')

    // Confirm transaction
    const confirmation = await connection.confirmTransaction(signature, 'confirmed')
    
    if (confirmation.value.err) {
      throw new Error(`Transaction failed: ${JSON.stringify(confirmation.value.err)}`)
    }

    console.log('[Direct] ✅ KWAMI NFT minted successfully!')
    console.log('[Direct] Signature:', signature)
    console.log('[Direct] Mint:', mintKeypair.publicKey.toBase58())
    console.log('[Direct] View on Solana Explorer:')
    console.log(`https://explorer.solana.com/tx/${signature}?cluster=devnet`)
    
    return mintKeypair.publicKey.toBase58()

  } catch (error: any) {
    console.error('[Direct] Error minting:', error)
    if (error.logs) {
      console.error('[Direct] Program logs:', error.logs)
    }
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
