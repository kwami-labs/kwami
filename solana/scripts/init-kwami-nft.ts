import * as anchor from '@coral-xyz/anchor'
import { createMint, TOKEN_PROGRAM_ID } from '@solana/spl-token'
import { Connection, Keypair, PublicKey } from '@solana/web3.js'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

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

function prompt(question: string): string {
  process.stdout.write(question)
  const buf = fs.readFileSync(0, 'utf8')
  return buf.toString().trim()
}

function resolveCluster(args: Record<string, string | boolean>): Cluster {
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
  const choice = prompt('Enter choice [1-4]: ')
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

  const cluster = resolveCluster(args)
  const rpcUrl = (typeof args.rpc === 'string' ? args.rpc : undefined) ?? defaultRpc(cluster)
  const keypairPath =
    (typeof args.keypair === 'string' ? args.keypair : undefined) ??
    path.join(os.homedir(), '.config/solana/id.json')

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

  const program = new anchor.Program(idl, programId, provider)

  // Create a new collection mint each init (program id change => PDAs change).
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
  const [treasury] = PublicKey.findProgramAddressSync([Buffer.from('kwami-treasury')], programId)

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
}

main().catch((e) => {
  console.error('\n❌ Init failed:', e?.message ?? e)
  process.exit(1)
})



