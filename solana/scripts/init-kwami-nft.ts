import * as anchor from '@coral-xyz/anchor'
import { createMint, TOKEN_PROGRAM_ID } from '@solana/spl-token'
import { Connection, Keypair, PublicKey } from '@solana/web3.js'
import { ASSOCIATED_TOKEN_PROGRAM_ID, getAssociatedTokenAddress } from '@solana/spl-token'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { createInterface } from 'node:readline/promises'
import { stdin as input, stdout as output } from 'node:process'

type Cluster = 'localnet' | 'devnet' | 'testnet' | 'mainnet'

function parseArgs(argv: string[]) {
  const args: Record<string, string | boolean> = {}
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i]
    if (!a.startsWith('--')) continue
    const key = a.slice(2)
    const next = argv[i + 1]
    if (!next || next.startsWith('--')) {
      args[key] = true
    } else {
      args[key] = next
      i++
    }
  }
  return args
}

async function prompt(question: string): Promise<string> {
  const rl = createInterface({ input, output })
  try {
    return (await rl.question(question)).trim()
  } finally {
    rl.close()
  }
}

async function resolveCluster(args: Record<string, string | boolean>): Promise<Cluster> {
  const c = args.cluster
  if (typeof c === 'string' && ['localnet', 'devnet', 'testnet', 'mainnet'].includes(c)) {
    return c as Cluster
  }

  // interactive
  console.log('Select cluster to initialize:')
  console.log('  1) localnet')
  console.log('  2) devnet')
  console.log('  3) testnet')
  console.log('  4) mainnet')
  const choice = await prompt('Enter choice [1-4]: ')
  if (choice === '1' || choice === 'localnet') return 'localnet'
  if (choice === '2' || choice === 'devnet') return 'devnet'
  if (choice === '3' || choice === 'testnet') return 'testnet'
  if (choice === '4' || choice === 'mainnet' || choice === 'mainnet-beta') return 'mainnet'
  throw new Error(`Invalid cluster selection: ${choice}`)
}

function defaultRpc(cluster: Cluster): string {
  switch (cluster) {
    case 'localnet':
      return 'http://127.0.0.1:8899'
    case 'devnet':
      return 'https://api.devnet.solana.com'
    case 'testnet':
      return 'https://api.testnet.solana.com'
    case 'mainnet':
      return 'https://api.mainnet-beta.solana.com'
  }
}

function loadKeypair(filePath: string): Keypair {
  const raw = JSON.parse(fs.readFileSync(filePath, 'utf8'))
  return Keypair.fromSecretKey(Uint8Array.from(raw))
}

async function main() {
  const args = parseArgs(process.argv)

  const cluster = await resolveCluster(args)
  const rpcUrl = (typeof args.rpc === 'string' ? args.rpc : undefined) ?? defaultRpc(cluster)
  const keypairPath =
    (typeof args.keypair === 'string' ? args.keypair : undefined) ??
    path.join(os.homedir(), '.config/solana/id.json')
  console.log(`\nUsing cluster: ${cluster}`)

  const solanaRoot = path.resolve(process.cwd())
  const idlPath =
    (typeof args.idl === 'string' ? args.idl : undefined) ??
    path.join(solanaRoot, 'target', 'idl', 'kwami_nft.json')

  if (!fs.existsSync(idlPath)) {
    throw new Error(`IDL not found at ${idlPath}. Run "anchor build" in solana/ first.`)
  }

  const idl = JSON.parse(fs.readFileSync(idlPath, 'utf8'))
  const programIdStr: string | undefined = idl?.address ?? idl?.metadata?.address
  if (!programIdStr) throw new Error('IDL missing program address')
  // Ensure the IDL has a top-level address for Anchor Program construction.
  idl.address = programIdStr
  const programId = new PublicKey(programIdStr)

  const payer = loadKeypair(keypairPath)
  const connection = new Connection(rpcUrl, 'confirmed')
  const provider = new anchor.AnchorProvider(connection, new anchor.Wallet(payer), {
    commitment: 'confirmed',
  })
  anchor.setProvider(provider)

  console.log('\n=== KWAMI NFT Init ===')
  console.log('Cluster:', cluster)
  console.log('RPC:', rpcUrl)
  console.log('Program:', programId.toBase58())
  console.log('Wallet:', payer.publicKey.toBase58())
  console.log('IDL:', idlPath)

  const bal = await connection.getBalance(payer.publicKey, 'confirmed')
  console.log('Balance:', (bal / 1e9).toFixed(4), 'SOL')

  const [treasury] = PublicKey.findProgramAddressSync([Buffer.from('kwami-treasury')], programId)
  const program = new anchor.Program(idl as anchor.Idl, provider)

  const TOKEN_METADATA_PROGRAM_ID = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s')
  const getMetadataPda = (mint: PublicKey) =>
    PublicKey.findProgramAddressSync(
      [Buffer.from('metadata'), TOKEN_METADATA_PROGRAM_ID.toBuffer(), mint.toBuffer()],
      TOKEN_METADATA_PROGRAM_ID
    )[0]
  const getMasterEditionPda = (mint: PublicKey) =>
    PublicKey.findProgramAddressSync(
      [Buffer.from('metadata'), TOKEN_METADATA_PROGRAM_ID.toBuffer(), mint.toBuffer(), Buffer.from('edition')],
      TOKEN_METADATA_PROGRAM_ID
    )[0]

  // If treasury already exists, don't try to initialize again. Instead, discover the existing
  // collection mint via the CollectionAuthority account(s) and print/write them.
  const treasuryInfo = await connection.getAccountInfo(treasury, 'confirmed')
  if (treasuryInfo) {
    console.log('\nTreasury already initialized on-chain. Skipping initialize.')

    const treasuryState = await (program as any).account.kwamiTreasury.fetch(treasury)
    const treasuryAuthorityPk = new PublicKey(treasuryState.authority)

    const collectionAuthorities = await (program as any).account.collectionAuthority.all()
    const matching = collectionAuthorities.filter(
      (a: any) => new PublicKey(a.account.authority).equals(treasuryAuthorityPk)
    )

    if (matching.length === 0) {
      throw new Error(
        `Treasury exists (${treasury.toBase58()}) but no CollectionAuthority found for authority ${treasuryAuthorityPk.toBase58()}.`
      )
    }
    if (matching.length > 1) {
      console.warn(
        `Warning: found ${matching.length} CollectionAuthority accounts for authority ${treasuryAuthorityPk.toBase58()}; using the first: ${matching[0].publicKey.toBase58()}`
      )
    }

    const collectionAuthorityPk: PublicKey = matching[0].publicKey
    const collectionMint = new PublicKey(matching[0].account.collectionMint)
    const [dnaRegistry] = PublicKey.findProgramAddressSync(
      [Buffer.from('dna-registry'), collectionMint.toBuffer()],
      programId
    )

    console.log('\nExisting on-chain config:')
    console.log('Collection Mint:', collectionMint.toBase58())
    console.log('Collection Authority PDA:', collectionAuthorityPk.toBase58())
    console.log('DNA Registry PDA:', dnaRegistry.toBase58())
    console.log('Treasury PDA:', treasury.toBase58())
    console.log('Treasury Authority Wallet:', treasuryAuthorityPk.toBase58())

    const outPath =
      (typeof args.out === 'string' ? args.out : undefined) ??
      path.join(solanaRoot, `kwami-nft-${cluster}-addresses.json`)

    const out = {
      cluster,
      rpcUrl,
      programId: programId.toBase58(),
      wallet: payer.publicKey.toBase58(),
      collectionMint: collectionMint.toBase58(),
      collectionAuthority: collectionAuthorityPk.toBase58(),
      dnaRegistry: dnaRegistry.toBase58(),
      treasury: treasury.toBase58(),
      treasuryAuthorityWallet: treasuryAuthorityPk.toBase58(),
      timestamp: new Date().toISOString(),
      note: 'Treasury already existed; init skipped and existing addresses were discovered.',
    }

    fs.writeFileSync(outPath, JSON.stringify(out, null, 2))
    console.log('\nSaved:', outPath)

    console.log('\nSet this in candy/.env.dev:')
    console.log(`VITE_COLLECTION_MINT=${collectionMint.toBase58()}`)

    // Optional: create the collection NFT (metadata + master edition) so wallets can group verified items.
    const collectionUri = typeof args['collection-uri'] === 'string' ? (args['collection-uri'] as string) : undefined
    if (collectionUri) {
      const collectionMetadata = getMetadataPda(collectionMint)
      const collectionMasterEdition = getMasterEditionPda(collectionMint)
      const authorityTokenAccount = await getAssociatedTokenAddress(collectionMint, payer.publicKey)

      const metaInfo = await connection.getAccountInfo(collectionMetadata, 'confirmed')
      const editionInfo = await connection.getAccountInfo(collectionMasterEdition, 'confirmed')

      if (metaInfo && editionInfo) {
        console.log('\nCollection NFT already exists (metadata + master edition).')
      } else {
        console.log('\nCreating Collection NFT (for wallet grouping)...')
        console.log('Collection metadata PDA:', collectionMetadata.toBase58())
        console.log('Collection master edition PDA:', collectionMasterEdition.toBase58())
        console.log('Authority ATA:', authorityTokenAccount.toBase58())
        const sig2 = await program.methods
          .createCollectionNft('KWAMI Collection', 'KWAMI', collectionUri)
          .accounts({
            collectionMint,
            collectionAuthority: collectionAuthorityPk,
            collectionMetadata,
            collectionMasterEdition,
            authorityTokenAccount,
            authority: payer.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
            tokenProgram: TOKEN_PROGRAM_ID,
            associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
            tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
          })
          .rpc()
        console.log('✅ Collection NFT created. Tx:', sig2)
      }
    } else {
      console.log(
        '\n(Optional) To create the collection NFT for wallet grouping, rerun with:\n  --collection-uri <https://.../collection.json>'
      )
    }
    return
  }

  // Fresh init path: create a new collection mint and initialize program state.
  const collectionMintKeypair = Keypair.generate()
  const collectionMint = collectionMintKeypair.publicKey

  const [collectionAuthority] = PublicKey.findProgramAddressSync(
    [Buffer.from('collection-authority'), collectionMint.toBuffer()],
    programId
  )
  const [dnaRegistry] = PublicKey.findProgramAddressSync(
    [Buffer.from('dna-registry'), collectionMint.toBuffer()],
    programId
  )

  console.log('\nGenerated:')
  console.log('Collection Mint:', collectionMint.toBase58())
  console.log('Collection Authority PDA:', collectionAuthority.toBase58())
  console.log('DNA Registry PDA:', dnaRegistry.toBase58())
  console.log('Treasury PDA:', treasury.toBase58())

  // Create collection mint off-chain (decimals=0, mintAuthority=PDA)
  console.log('\nCreating collection mint (decimals=0, mintAuthority=PDA)...')
  await createMint(
    connection,
    payer,
    collectionAuthority,
    null,
    0,
    collectionMintKeypair,
    undefined,
    TOKEN_PROGRAM_ID
  )

  console.log('Sending kwami_nft.initialize...')
  const sig = await program.methods
    .initialize()
    .accounts({
      collectionMint,
      collectionAuthority,
      dnaRegistry,
      treasury,
      payer: payer.publicKey,
      systemProgram: anchor.web3.SystemProgram.programId,
    })
    .rpc()

  console.log('\n✅ Initialized!')
  console.log('Tx:', sig)

  const outPath =
    (typeof args.out === 'string' ? args.out : undefined) ??
    path.join(solanaRoot, `kwami-nft-${cluster}-addresses.json`)

  const out = {
    cluster,
    rpcUrl,
    programId: programId.toBase58(),
    wallet: payer.publicKey.toBase58(),
    collectionMint: collectionMint.toBase58(),
    collectionAuthority: collectionAuthority.toBase58(),
    dnaRegistry: dnaRegistry.toBase58(),
    treasury: treasury.toBase58(),
    transaction: sig,
    timestamp: new Date().toISOString(),
  }

  fs.writeFileSync(outPath, JSON.stringify(out, null, 2))
  console.log('\nSaved:', outPath)

  console.log('\nSet this in candy/.env.dev:')
  console.log(`VITE_COLLECTION_MINT=${collectionMint.toBase58()}`)

  // Optional: create collection NFT right after initialize.
  const collectionUri = typeof args['collection-uri'] === 'string' ? (args['collection-uri'] as string) : undefined
  if (collectionUri) {
    const collectionMetadata = getMetadataPda(collectionMint)
    const collectionMasterEdition = getMasterEditionPda(collectionMint)
    const authorityTokenAccount = await getAssociatedTokenAddress(collectionMint, payer.publicKey)
    console.log('\nCreating Collection NFT (for wallet grouping)...')
    const sig2 = await program.methods
      .createCollectionNft('KWAMI Collection', 'KWAMI', collectionUri)
      .accounts({
        collectionMint,
        collectionAuthority,
        collectionMetadata,
        collectionMasterEdition,
        authorityTokenAccount,
        authority: payer.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
      })
      .rpc()
    console.log('✅ Collection NFT created. Tx:', sig2)
  } else {
    console.log(
      '\n(Optional) To create the collection NFT for wallet grouping, rerun with:\n  --collection-uri <https://.../collection.json>'
    )
  }
}

main().catch((e) => {
  console.error('\n❌ Init failed:', e?.message ?? e)
  process.exit(1)
})




