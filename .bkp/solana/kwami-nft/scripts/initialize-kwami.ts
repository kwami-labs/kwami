import * as anchor from "@coral-xyz/anchor";
import {
  TOKEN_PROGRAM_ID,
  createMint,
} from "@solana/spl-token";
import * as fs from "fs";

/**
 * Simplified KWAMI NFT Initialization
 * Uses raw transaction building to avoid IDL parsing issues
 */

async function main() {
  console.log("\n🚀 Initializing KWAMI NFT Program on Devnet...\n");

  // Configure provider
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  
  const payer = (provider.wallet as any).payer as anchor.web3.Keypair;
  
  // Load program ID from IDL
  const path = require('path');
  const idlPath = path.join(__dirname, '../target/idl/kwami_nft.json');
  const idl = JSON.parse(fs.readFileSync(idlPath, 'utf8'));
  const programId = new anchor.web3.PublicKey(idl.address || idl.metadata.address);
  
  console.log("Program ID:", programId.toString());
  console.log("Wallet:", provider.wallet.publicKey.toString());
  console.log("Cluster:", provider.connection.rpcEndpoint);
  
  // Create collection mint keypair
  const collectionMintKeypair = anchor.web3.Keypair.generate();
  console.log("\n📝 Generated Addresses:");
  console.log("Collection Mint:", collectionMintKeypair.publicKey.toString());
  
  // Derive PDAs
  const [collectionAuthority] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("collection-authority"), collectionMintKeypair.publicKey.toBuffer()],
    programId
  );
  console.log("Collection Authority:", collectionAuthority.toString());
  
  const [dnaRegistry] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("dna-registry"), collectionMintKeypair.publicKey.toBuffer()],
    programId
  );
  console.log("DNA Registry:", dnaRegistry.toString());
  
  const [treasury] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("kwami-treasury")],
    programId
  );
  console.log("Treasury:", treasury.toString());

  // Create collection mint off-chain
  console.log("\n🏗️  Creating collection mint off-chain...");
  await createMint(
    provider.connection,
    payer,
    collectionAuthority, // mint authority (PDA)
    null,
    0,
    collectionMintKeypair,
    undefined,
    TOKEN_PROGRAM_ID
  );
  
  // Build initialize instruction manually
  console.log("\n⏳ Sending initialization transaction...");
  
  // Get initialize discriminator from IDL
  const initializeInstruction = idl.instructions.find((ix: any) => ix.name === "initialize");
  if (!initializeInstruction) {
    throw new Error("Initialize instruction not found in IDL");
  }
  
  const discriminator = Buffer.from(initializeInstruction.discriminator);
  
  // Build accounts
  const keys = [
    { pubkey: collectionMintKeypair.publicKey, isSigner: false, isWritable: true },
    { pubkey: collectionAuthority, isSigner: false, isWritable: true },
    { pubkey: dnaRegistry, isSigner: false, isWritable: true },
    { pubkey: treasury, isSigner: false, isWritable: true },
    { pubkey: provider.wallet.publicKey, isSigner: true, isWritable: true },
    { pubkey: anchor.web3.SystemProgram.programId, isSigner: false, isWritable: false },
  ];
  
  const instruction = new anchor.web3.TransactionInstruction({
    keys,
    programId,
    data: discriminator, // No additional data for initialize
  });
  
  const tx = new anchor.web3.Transaction().add(instruction);
  
  try {
    const signature = await provider.sendAndConfirm(tx);
    
    console.log("\n✅ KWAMI NFT Program Initialized!");
    console.log("\nTransaction Signature:", signature);
    
    const rpc = provider.connection.rpcEndpoint;
    const cluster =
      rpc.includes("localhost") || rpc.includes("127.0.0.1") ? "localnet"
      : rpc.includes("devnet") ? "devnet"
      : rpc.includes("testnet") ? "testnet"
      : rpc.includes("mainnet") ? "mainnet"
      : "unknown";
    
    console.log("Explorer:", `https://explorer.solana.com/tx/${signature}?cluster=${cluster}`);
    
    // Save addresses to file
    const addresses = {
      programId: programId.toString(),
      collectionMint: collectionMintKeypair.publicKey.toString(),
      collectionAuthority: collectionAuthority.toString(),
      dnaRegistry: dnaRegistry.toString(),
      treasury: treasury.toString(),
      wallet: provider.wallet.publicKey.toString(),
      cluster,
      timestamp: new Date().toISOString(),
      transaction: signature,
    };
    
    const addressesFilename = `${cluster}-addresses.json`;
    fs.writeFileSync(
      addressesFilename,
      JSON.stringify(addresses, null, 2)
    );
    
    console.log(`\n💾 Addresses saved to: ${addressesFilename}`);
    
    console.log("\n" + "=".repeat(70));
    console.log("✨ KWAMI NFT Program Ready for Use!");
    console.log("=".repeat(70));
    
    console.log("\n📝 Important: Save these addresses!");
    console.log("Collection Mint:", collectionMintKeypair.publicKey.toString());
    console.log("\n🔗 View on Explorer:");
    console.log(`https://explorer.solana.com/address/${collectionMintKeypair.publicKey.toString()}?cluster=${cluster}`);
    
    console.log("\n📊 Supply Schedule:");
    console.log("  Launch: January 1, 2026 (Gen #0)");
    console.log("  Max Supply by 2100: 10,000,000,000 NFTs");
    console.log("  Annual Increment: 133,333,333 NFTs");
    console.log("  Current Gen #0 Cap: 133,333,333 NFTs");
    
  } catch (error) {
    console.error("\n❌ Initialization failed!");
    console.error("Error:", error);
    
    if (error && typeof error === 'object' && 'logs' in error) {
      console.error("\nProgram Logs:");
      const logs = (error as any).logs;
      if (Array.isArray(logs)) {
        logs.forEach((log: string) => console.error(log));
      }
    }
    
    throw error;
  }
}

main()
  .then(() => {
    console.log("\n✅ Script completed successfully\n");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Script failed with error:");
    console.error(error);
    process.exit(1);
  });
