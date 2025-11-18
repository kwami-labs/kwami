import * as anchor from '@coral-xyz/anchor';
import { Program, AnchorProvider } from '@coral-xyz/anchor';
import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import fs from 'fs';
import path from 'path';

/**
 * Configuration for creating Kwami NFT collection
 */
export interface CollectionConfig {
  rpcUrl: string;
  walletPath: string;
  programId: string;
  collectionMintPath?: string;
}

/**
 * Result of collection creation
 */
export interface CollectionResult {
  success: boolean;
  collectionMint?: string;
  collectionAuthority?: string;
  dnaRegistry?: string;
  signature?: string;
  error?: string;
}

/**
 * Load keypair from file
 */
function loadKeypair(filepath: string): Keypair {
  const keypairData = JSON.parse(fs.readFileSync(filepath, 'utf-8'));
  return Keypair.fromSecretKey(new Uint8Array(keypairData));
}

/**
 * Initialize Kwami NFT collection on-chain
 * 
 * @param config - Collection configuration
 * @returns Collection creation result
 */
export async function createKwamiCollection(
  config: CollectionConfig
): Promise<CollectionResult> {
  try {
    console.log('🚀 Initializing Kwami NFT Collection...');
    console.log(`   RPC: ${config.rpcUrl}`);
    console.log(`   Program ID: ${config.programId}`);
    
    // Set up connection and provider
    const connection = new Connection(config.rpcUrl, 'confirmed');
    const wallet = loadKeypair(config.walletPath);
    
    const provider = new AnchorProvider(
      connection,
      new anchor.Wallet(wallet),
      { commitment: 'confirmed' }
    );
    anchor.setProvider(provider);
    
    console.log(`   Wallet: ${wallet.publicKey.toBase58()}`);
    
    // Check wallet balance
    const balance = await connection.getBalance(wallet.publicKey);
    console.log(`   Balance: ${balance / 1e9} SOL`);
    
    if (balance < 0.5 * 1e9) {
      throw new Error('Insufficient balance. Need at least 0.5 SOL');
    }
    
    // Load program IDL
    const programId = new PublicKey(config.programId);
    const idlPath = path.join(__dirname, '../../anchor/kwami-nft/target/idl/kwami_nft.json');
    
    if (!fs.existsSync(idlPath)) {
      throw new Error(`IDL not found at ${idlPath}. Run 'anchor build' first.`);
    }
    
    const idl = JSON.parse(fs.readFileSync(idlPath, 'utf-8'));
    const program = new Program(idl, programId, provider);
    
    // Generate or load collection mint
    let collectionMint: Keypair;
    if (config.collectionMintPath && fs.existsSync(config.collectionMintPath)) {
      console.log('📝 Loading existing collection mint...');
      collectionMint = loadKeypair(config.collectionMintPath);
    } else {
      console.log('🔑 Generating new collection mint...');
      collectionMint = Keypair.generate();
      
      // Save keypair
      const savePath = config.collectionMintPath || './kwami-collection.json';
      fs.writeFileSync(
        savePath,
        JSON.stringify(Array.from(collectionMint.secretKey))
      );
      console.log(`   Saved to: ${savePath}`);
    }
    
    console.log(`   Collection Mint: ${collectionMint.publicKey.toBase58()}`);
    
    // Find PDAs
    const [collectionAuthority, colBump] = await PublicKey.findProgramAddress(
      [Buffer.from('collection-authority'), collectionMint.publicKey.toBuffer()],
      programId
    );
    
    const [dnaRegistry] = await PublicKey.findProgramAddress(
      [Buffer.from('dna-registry'), collectionMint.publicKey.toBuffer()],
      programId
    );
    
    console.log(`   Collection Authority: ${collectionAuthority.toBase58()}`);
    console.log(`   DNA Registry: ${dnaRegistry.toBase58()}`);
    
    // Initialize collection
    console.log('📤 Sending initialize transaction...');
    
    const signature = await program.methods
      .initialize(colBump)
      .accounts({
        collectionMint: collectionMint.publicKey,
        collectionAuthority,
        dnaRegistry,
        payer: wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      })
      .signers([collectionMint])
      .rpc();
    
    console.log(`   Transaction: ${signature}`);
    
    // Wait for confirmation
    console.log('⏳ Waiting for confirmation...');
    await connection.confirmTransaction(signature, 'confirmed');
    
    console.log('✅ Collection initialized successfully!');
    console.log('');
    console.log('📋 Collection Details:');
    console.log(`   Collection Mint: ${collectionMint.publicKey.toBase58()}`);
    console.log(`   Authority PDA: ${collectionAuthority.toBase58()}`);
    console.log(`   DNA Registry PDA: ${dnaRegistry.toBase58()}`);
    console.log(`   Transaction: ${signature}`);
    
    return {
      success: true,
      collectionMint: collectionMint.publicKey.toBase58(),
      collectionAuthority: collectionAuthority.toBase58(),
      dnaRegistry: dnaRegistry.toBase58(),
      signature,
    };
  } catch (error: any) {
    console.error('❌ Collection initialization failed:', error.message);
    if (error.logs) {
      console.error('   Program logs:');
      error.logs.forEach((log: string) => console.error(`   ${log}`));
    }
    
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * CLI entry point
 */
async function main() {
  // Parse command line arguments
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.log('Usage: ts-node createCollection.ts <RPC_URL> <PROGRAM_ID> [WALLET_PATH] [COLLECTION_MINT_PATH]');
    console.log('');
    console.log('Example:');
    console.log('  ts-node createCollection.ts \\');
    console.log('    https://api.devnet.solana.com \\');
    console.log('    YourProgramID \\');
    console.log('    ~/.config/solana/id.json \\');
    console.log('    ./kwami-collection.json');
    process.exit(1);
  }
  
  const config: CollectionConfig = {
    rpcUrl: args[0],
    programId: args[1],
    walletPath: args[2] || `${process.env.HOME}/.config/solana/id.json`,
    collectionMintPath: args[3],
  };
  
  const result = await createKwamiCollection(config);
  
  if (!result.success) {
    process.exit(1);
  }
  
  // Print environment variables
  console.log('');
  console.log('🔐 Add these to your .env file:');
  console.log(`NUXT_PUBLIC_KWAMI_COLLECTION_MINT=${result.collectionMint}`);
  console.log(`NUXT_PUBLIC_KWAMI_COLLECTION_AUTHORITY=${result.collectionAuthority}`);
  console.log(`NUXT_PUBLIC_KWAMI_DNA_REGISTRY=${result.dnaRegistry}`);
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}
