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
  Keypair,
} from '@solana/web3.js'
import { 
  TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from '@solana/spl-token'

let _kwamiProgramId: PublicKey | null = null
async function getKwamiProgramId(): Promise<PublicKey> {
  if (_kwamiProgramId) return _kwamiProgramId

  // Prefer the bundled IDL address (this prevents env drift from pointing to a different program).
  try {
    const res = await fetch('/idl/kwami_nft.json')
    if (res.ok) {
      const idl = await res.json()
      const addr = idl?.address ?? idl?.metadata?.address
      if (addr) {
        _kwamiProgramId = new PublicKey(addr)
        return _kwamiProgramId
      }
    }
  } catch (e) {
    console.warn('[Direct] Failed to load /idl/kwami_nft.json (falling back to env):', e)
  }

  const env = import.meta.env.VITE_KWAMI_NFT_PROGRAM_ID
  if (!env) {
    // Last resort fallback matches the IDL currently bundled in this repo.
    _kwamiProgramId = new PublicKey('6W3VGmDkjwswpY8JNNDQH5f1VuCdqrttR6koWPkN7drr')
    return _kwamiProgramId
  }
  _kwamiProgramId = new PublicKey(env)
  return _kwamiProgramId
}

function getCollectionMint(): PublicKey {
  const v = import.meta.env.VITE_COLLECTION_MINT
  if (!v) {
    throw new Error('VITE_COLLECTION_MINT is not set (cannot derive collection authority PDA)')
  }
  return new PublicKey(v)
}

const TOKEN_METADATA_PROGRAM_ID = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s')
const MEMO_PROGRAM_ID = new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr')

// Instruction discriminators (first 8 bytes of SHA256("global:instruction_name"))
const INSTRUCTION_DISCRIMINATORS = {
  mint_kwami: Buffer.from([200, 116, 147, 137, 42, 111, 131, 148]),
  check_dna_exists: Buffer.from([183, 228, 254, 11, 59, 1, 131, 134]),
  purchase_roll: Buffer.from([180, 76, 131, 145, 187, 102, 67, 245]),
  mint_kwami_with_receipt: Buffer.from([211, 53, 40, 156, 118, 241, 212, 117]),
}

/**
 * Derive PDA for collection authority
 */
export function getCollectionAuthorityPDA(collectionMint: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('collection-authority'), collectionMint.toBuffer()],
    // NOTE: This function is kept for backwards compatibility but should only
    // be called after `getKwamiProgramId()` has been resolved.
    _kwamiProgramId ?? new PublicKey('DoAJAykwUrSDjraDegK4AJ1GCoztLYrTvKhUJHaFbSsD')
  )
}

/**
 * Derive PDA for DNA registry
 */
export function getDnaRegistryPDA(collectionMint: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('dna-registry'), collectionMint.toBuffer()],
    _kwamiProgramId ?? new PublicKey('DoAJAykwUrSDjraDegK4AJ1GCoztLYrTvKhUJHaFbSsD')
  )
}

/**
 * Derive PDA for Kwami NFT
 */
export function getKwamiNftPDA(mint: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('kwami-nft'), mint.toBuffer()],
    _kwamiProgramId ?? new PublicKey('DoAJAykwUrSDjraDegK4AJ1GCoztLYrTvKhUJHaFbSsD')
  )
}

/**
 * Derive PDA for treasury
 */
export function getTreasuryPDA(): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('kwami-treasury')],
    _kwamiProgramId ?? new PublicKey('DoAJAykwUrSDjraDegK4AJ1GCoztLYrTvKhUJHaFbSsD')
  )
}

/**
 * Derive PDA for mint receipt (per buyer + roll id)
 */
export function getMintReceiptPDA(buyer: PublicKey, rollId: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('mint-receipt'), buyer.toBuffer(), rollId.toBuffer()],
    _kwamiProgramId ?? new PublicKey('DoAJAykwUrSDjraDegK4AJ1GCoztLYrTvKhUJHaFbSsD')
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
 * Derive Metaplex master edition PDA
 */
export function getMasterEditionPDA(mint: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from('metadata'),
      TOKEN_METADATA_PROGRAM_ID.toBuffer(),
      mint.toBuffer(),
      Buffer.from('edition'),
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
    const KWAMI_PROGRAM_ID = await getKwamiProgramId()
    const COLLECTION_MINT = getCollectionMint()
    _kwamiProgramId = KWAMI_PROGRAM_ID

    const [dnaRegistry] = getDnaRegistryPDA(COLLECTION_MINT)

    // Convert DNA hex string to 32 bytes
    const dnaBytes = new Uint8Array(32)
    const dnaHex = dna.padEnd(64, '0')
    for (let i = 0; i < 32; i++) {
      dnaBytes[i] = parseInt(dnaHex.substr(i * 2, 2), 16)
    }

    console.log('[Direct] Checking DNA on-chain:', dna.substring(0, 16) + '...')
    console.log('[Direct] DNA Registry:', dnaRegistry.toBase58())

    const info = await connection.getAccountInfo(dnaRegistry, 'confirmed')
    if (!info?.data) {
      // If registry isn't initialized yet, DNA cannot exist.
      return false
    }

    const data = info.data
    if (data.length < 8 + 32 + 32 + 4) {
      // Not enough bytes to contain discriminator + authority + collection + vec len.
      return false
    }

    // Borsh layout:
    // 8   discriminator
    // 32  authority
    // 32  collection
    // 4   vec length (u32 LE)
    // N*32 dna hashes
    // 8   dna_count (u64 LE)  (not required for the check)
    let offset = 8 + 32 + 32
    const len = new DataView(data.buffer, data.byteOffset + offset, 4).getUint32(0, true)
    offset += 4

    const bytesEq32 = (a: Uint8Array, b: Uint8Array, bOffset: number) => {
      for (let i = 0; i < 32; i++) if (a[i] !== b[bOffset + i]) return false
      return true
    }

    for (let i = 0; i < len; i++) {
      if (offset + 32 > data.length) break
      if (bytesEq32(dnaBytes, data, offset)) return true
      offset += 32
    }

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

function serializePurchaseRollArgs(rollId: PublicKey): Buffer {
  // Args: roll_id: Pubkey (32 bytes)
  return Buffer.from(rollId.toBytes())
}

function serializeMintKwamiWithReceiptArgs(
  rollId: PublicKey,
  dnaHash: Uint8Array,
  name: string,
  symbol: string,
  uri: string
): Buffer {
  // Args: roll_id (Pubkey) + dna_hash ([u8;32]) + name + symbol + uri
  const writer = new Uint8Array(1400)
  let offset = 0

  writer.set(rollId.toBytes(), offset)
  offset += 32

  writer.set(dnaHash, offset)
  offset += 32

  const nameBytes = new TextEncoder().encode(name)
  new DataView(writer.buffer).setUint32(offset, nameBytes.length, true)
  offset += 4
  writer.set(nameBytes, offset)
  offset += nameBytes.length

  const symbolBytes = new TextEncoder().encode(symbol)
  new DataView(writer.buffer).setUint32(offset, symbolBytes.length, true)
  offset += 4
  writer.set(symbolBytes, offset)
  offset += symbolBytes.length

  const uriBytes = new TextEncoder().encode(uri)
  new DataView(writer.buffer).setUint32(offset, uriBytes.length, true)
  offset += 4
  writer.set(uriBytes, offset)
  offset += uriBytes.length

  return Buffer.from(writer.slice(0, offset))
}

/**
 * Purchase a roll (SOL payment) - wallet tx should appear immediately.
 */
export async function purchaseRollDirect(
  connection: Connection,
  wallet: any,
  opts?: {
    onSigned?: () => void | Promise<void>
  }
): Promise<{ rollId: string; signature: string }> {
  if (!wallet.publicKey || !wallet.signTransaction) {
    throw new Error('Wallet not connected')
  }

  const KWAMI_PROGRAM_ID = await getKwamiProgramId()
  _kwamiProgramId = KWAMI_PROGRAM_ID

  const rollKeypair = Keypair.generate()
  const rollId = rollKeypair.publicKey

  const [treasury] = getTreasuryPDA()

  // Resolve treasury authority wallet from on-chain treasury
  const treasuryInfo = await connection.getAccountInfo(treasury)
  if (!treasuryInfo?.data || treasuryInfo.data.length < 8 + 32) {
    throw new Error('KWAMI treasury account is not initialized on this cluster.')
  }
  const treasuryAuthority = new PublicKey(treasuryInfo.data.slice(8, 8 + 32))

  const [mintReceipt] = getMintReceiptPDA(wallet.publicKey, rollId)

  console.log('[Direct] Purchasing roll...')
  console.log('[Direct] Roll ID:', rollId.toBase58())
  console.log('[Direct] Mint Receipt PDA:', mintReceipt.toBase58())
  console.log('[Direct] Treasury:', treasury.toBase58())
  console.log('[Direct] Treasury Authority:', treasuryAuthority.toBase58())

  const instructionData = Buffer.concat([
    INSTRUCTION_DISCRIMINATORS.purchase_roll,
    serializePurchaseRollArgs(rollId),
  ])

  const keys = [
    { pubkey: mintReceipt, isSigner: false, isWritable: true }, // mint_receipt (init)
    { pubkey: treasury, isSigner: false, isWritable: true }, // treasury (mut)
    { pubkey: treasuryAuthority, isSigner: false, isWritable: true }, // treasury_authority (mut)
    { pubkey: wallet.publicKey, isSigner: true, isWritable: true }, // buyer (signer, payer)
    { pubkey: SystemProgram.programId, isSigner: false, isWritable: false }, // system_program
  ]

  const ix = new TransactionInstruction({
    keys,
    programId: KWAMI_PROGRAM_ID,
    data: instructionData,
  })

  const memoIx = new TransactionInstruction({
    programId: MEMO_PROGRAM_ID,
    keys: [],
    data: Buffer.from('KWAMI: Pay mint cost (purchase roll)', 'utf8'),
  })

  const tx = new Transaction().add(memoIx, ix)
  const { blockhash } = await connection.getLatestBlockhash()
  tx.recentBlockhash = blockhash
  tx.feePayer = wallet.publicKey

  console.log('[Direct] Requesting wallet signature for purchase...')
  const signed = await wallet.signTransaction(tx)
  if (opts?.onSigned) await opts.onSigned()

  console.log('[Direct] Sending purchase transaction...')
  const signature = await connection.sendRawTransaction(signed.serialize(), {
    skipPreflight: false,
    preflightCommitment: 'confirmed',
  })
  console.log('[Direct] Purchase tx:', signature)

  const conf = await connection.confirmTransaction(signature, 'confirmed')
  if (conf.value.err) throw new Error(`Purchase failed: ${JSON.stringify(conf.value.err)}`)

  return { rollId: rollId.toBase58(), signature }
}

/**
 * Finalize mint using a previously purchased roll receipt.
 */
export async function mintKwamiWithReceiptDirect(
  connection: Connection,
  wallet: any,
  rollId: string,
  dna: string,
  metadataUri: string,
  name: string,
  opts?: {
    onSigned?: () => void | Promise<void>
  }
): Promise<string> {
  if (!wallet.publicKey || !wallet.signTransaction) {
    throw new Error('Wallet not connected')
  }

  const KWAMI_PROGRAM_ID = await getKwamiProgramId()
  const COLLECTION_MINT = getCollectionMint()
  _kwamiProgramId = KWAMI_PROGRAM_ID

  const rollPk = new PublicKey(rollId)

  // Generate new mint keypair
  const mintKeypair = Keypair.generate()

  const [mintReceipt] = getMintReceiptPDA(wallet.publicKey, rollPk)
  const [collectionAuthority] = getCollectionAuthorityPDA(COLLECTION_MINT)
  const [dnaRegistry] = getDnaRegistryPDA(COLLECTION_MINT)
  const [kwamiNft] = getKwamiNftPDA(mintKeypair.publicKey)
  const [treasury] = getTreasuryPDA()
  const [metadata] = getMetadataPDA(mintKeypair.publicKey)
  const [collectionMetadata] = getMetadataPDA(COLLECTION_MINT)
  const [collectionMasterEdition] = getMasterEditionPDA(COLLECTION_MINT)

  const ownerTokenAccount = await getAssociatedTokenAddress(mintKeypair.publicKey, wallet.publicKey)

  // Convert DNA string to 32-byte hash
  const dnaBytes = new Uint8Array(32)
  const dnaHex = dna.padEnd(64, '0')
  for (let i = 0; i < 32; i++) dnaBytes[i] = parseInt(dnaHex.substr(i * 2, 2), 16)

  const symbol = 'KWAMI'
  const argsData = serializeMintKwamiWithReceiptArgs(rollPk, dnaBytes, name, symbol, metadataUri)
  const instructionData = Buffer.concat([
    INSTRUCTION_DISCRIMINATORS.mint_kwami_with_receipt,
    argsData,
  ])

  const keys = [
    { pubkey: mintReceipt, isSigner: false, isWritable: true }, // mint_receipt (mut, close)
    { pubkey: mintKeypair.publicKey, isSigner: true, isWritable: true }, // mint (init, signer)
    { pubkey: kwamiNft, isSigner: false, isWritable: true }, // kwami_nft (init)
    { pubkey: collectionAuthority, isSigner: false, isWritable: true }, // collection_authority (mut)
    { pubkey: dnaRegistry, isSigner: false, isWritable: true }, // dna_registry (realloc)
    { pubkey: treasury, isSigner: false, isWritable: true }, // treasury (mut)
    { pubkey: metadata, isSigner: false, isWritable: true }, // metadata (metaplex)
    { pubkey: ownerTokenAccount, isSigner: false, isWritable: true }, // owner_token_account (init)
    { pubkey: wallet.publicKey, isSigner: true, isWritable: true }, // owner (signer, payer)
    { pubkey: SystemProgram.programId, isSigner: false, isWritable: false }, // system_program
    { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false }, // token_program
    { pubkey: ASSOCIATED_TOKEN_PROGRAM_ID, isSigner: false, isWritable: false }, // associated_token_program
    { pubkey: TOKEN_METADATA_PROGRAM_ID, isSigner: false, isWritable: false }, // token_metadata_program
    // Remaining accounts for collection verification (wallet grouping):
    { pubkey: COLLECTION_MINT, isSigner: false, isWritable: false }, // collection_mint
    { pubkey: collectionMetadata, isSigner: false, isWritable: true }, // collection_metadata PDA
    { pubkey: collectionMasterEdition, isSigner: false, isWritable: false }, // collection_master_edition PDA
  ]

  const ix = new TransactionInstruction({ keys, programId: KWAMI_PROGRAM_ID, data: instructionData })
  const memoIx = new TransactionInstruction({
    programId: MEMO_PROGRAM_ID,
    keys: [],
    data: Buffer.from(`KWAMI: Mint NFT (${name})`, 'utf8'),
  })
  const tx = new Transaction().add(memoIx, ix)
  const { blockhash } = await connection.getLatestBlockhash()
  tx.recentBlockhash = blockhash
  tx.feePayer = wallet.publicKey

  // Partial sign with mint keypair then ask wallet to sign.
  tx.sign(mintKeypair)

  console.log('[Direct] Requesting wallet signature for finalize mint...')
  const signed = await wallet.signTransaction(tx)
  if (opts?.onSigned) await opts.onSigned()

  console.log('[Direct] Sending finalize mint transaction...')
  const signature = await connection.sendRawTransaction(signed.serialize(), {
    skipPreflight: false,
    preflightCommitment: 'confirmed',
  })
  console.log('[Direct] Finalize tx:', signature)

  const conf = await connection.confirmTransaction(signature, 'confirmed')
  if (conf.value.err) throw new Error(`Mint failed: ${JSON.stringify(conf.value.err)}`)

  return mintKeypair.publicKey.toBase58()
}

/**
 * Mint Kwami NFT using direct instruction
 */
export async function mintKwamiDirect(
  connection: Connection,
  wallet: any,
  dna: string,
  metadataUri: string,
  name: string,
  opts?: {
    /**
     * Called after the wallet has signed the mint transaction (i.e. user approved SOL payment),
     * but before the transaction is submitted to the cluster.
     */
    onSigned?: () => void | Promise<void>
  }
): Promise<string> {
  try {
    if (!wallet.publicKey || !wallet.signTransaction) {
      throw new Error('Wallet not connected')
    }

    // Resolve runtime config up-front so PDAs are derived against the correct program id.
    const KWAMI_PROGRAM_ID = await getKwamiProgramId()
    const COLLECTION_MINT = getCollectionMint()

    console.log('[Direct] Minting KWAMI NFT...')
    console.log('[Direct] DNA:', dna.substring(0, 16) + '...')
    console.log('[Direct] Name:', name)
    console.log('[Direct] Metadata URI:', metadataUri)

    // Generate new mint keypair
    const mintKeypair = Keypair.generate()
    console.log('[Direct] Mint:', mintKeypair.publicKey.toBase58())

    // Get PDAs
    _kwamiProgramId = KWAMI_PROGRAM_ID
    const [collectionAuthority] = getCollectionAuthorityPDA(COLLECTION_MINT)
    const [dnaRegistry] = getDnaRegistryPDA(COLLECTION_MINT)
    const [kwamiNft] = getKwamiNftPDA(mintKeypair.publicKey)
    const [treasury] = getTreasuryPDA()
    const [metadata] = getMetadataPDA(mintKeypair.publicKey)

    // Resolve the SOL proceeds destination (treasury_authority) from the on-chain KwamiTreasury account.
    // Layout: 8-byte discriminator + 32-byte authority + ...
    const treasuryInfo = await connection.getAccountInfo(treasury)
    if (!treasuryInfo?.data || treasuryInfo.data.length < 8 + 32) {
      throw new Error(
        'KWAMI treasury account is not initialized on this cluster (cannot resolve treasury_authority).'
      )
    }
    const treasuryAuthority = new PublicKey(treasuryInfo.data.slice(8, 8 + 32))

    console.log('[Direct] Collection Authority:', collectionAuthority.toBase58())
    console.log('[Direct] DNA Registry:', dnaRegistry.toBase58())
    console.log('[Direct] Kwami NFT PDA:', kwamiNft.toBase58())
    console.log('[Direct] Treasury:', treasury.toBase58())
    console.log('[Direct] Treasury Authority:', treasuryAuthority.toBase58())
    console.log('[Direct] Metadata:', metadata.toBase58())

    // Get owner's token account for the NFT (where the NFT will be sent)
    const ownerTokenAccount = await getAssociatedTokenAddress(
      mintKeypair.publicKey,
      wallet.publicKey
    )
    console.log('[Direct] Owner Token Account:', ownerTokenAccount.toBase58())

    const transaction = new Transaction()

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
      { pubkey: mintKeypair.publicKey, isSigner: true, isWritable: true },       // mint (init, signer)
      { pubkey: kwamiNft, isSigner: false, isWritable: true },                   // kwami_nft (init)
      { pubkey: collectionAuthority, isSigner: false, isWritable: true },        // collection_authority
      { pubkey: dnaRegistry, isSigner: false, isWritable: true },                // dna_registry (realloc)
      { pubkey: treasury, isSigner: false, isWritable: true },                   // treasury
      { pubkey: treasuryAuthority, isSigner: false, isWritable: true },          // treasury_authority (SOL proceeds destination)
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

    // UX hook: at this point the user has approved paying the mint cost.
    if (opts?.onSigned) {
      try {
        await opts.onSigned()
      } catch (e) {
        console.warn('[Direct] onSigned hook failed (continuing):', e)
      }
    }

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

    const KWAMI_PROGRAM_ID = await getKwamiProgramId()
    const COLLECTION_MINT = getCollectionMint()
    _kwamiProgramId = KWAMI_PROGRAM_ID

    const [collectionAuthority] = getCollectionAuthorityPDA(COLLECTION_MINT)
    const accountInfo = await connection.getAccountInfo(collectionAuthority, 'confirmed')

    if (!accountInfo?.data) {
      throw new Error(
        `Collection authority account not found: ${collectionAuthority.toBase58()}. ` +
          `This usually means KWAMI collection was not initialized on this cluster (run kwami-nft initialize on the same RPC), ` +
          `or VITE_COLLECTION_MINT points to a different collection.`
      )
    }

    // Anchor account layout for CollectionAuthority:
    // 8   discriminator
    // 32  authority
    // 32  collection_mint
    // 8   total_minted (u64 LE)
    // 1   bump
    const data = Buffer.from(accountInfo.data)
    const TOTAL_MINTED_OFFSET = 8 + 32 + 32
    const totalMinted = Number(data.readBigUInt64LE(TOTAL_MINTED_OFFSET))

    return totalMinted
  } catch (error) {
    console.error('[Direct] Error fetching total minted:', error)
    return 0
  }
}
