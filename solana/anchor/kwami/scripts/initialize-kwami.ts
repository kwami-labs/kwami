import * as anchor from "@coral-xyz/anchor";
import { Program, AnchorProvider } from "@coral-xyz/anchor";
import type { KwamiNft } from "../target/types/kwami_nft";
import {
  TOKEN_PROGRAM_ID,
  createMint,
  createAccount,
} from "@solana/spl-token";
import * as fs from "fs";

/**
 * Initialize KWAMI NFT Program on Devnet
 * 
 * This script:
 * 1. Creates collection mint
 * 2. Creates collection authority PDA
 * 3. Creates DNA registry PDA
 * 4. Creates treasury PDA
 * 5. Creates QWAMI vault
 * 6. Initializes the program
 * 
 * IMPORTANT: Update QWAMI_MINT_ADDRESS before running!
 */

// 🚨 UPDATE THIS WITH YOUR QWAMI MINT ADDRESS FROM PREVIOUS STEP
const QWAMI_MINT_ADDRESS = "PASTE_YOUR_QWAMI_MINT_HERE";

async function main() {
  console.log("\n🚀 Initializing KWAMI NFT Program on Devnet...\n");

  // Check if QWAMI mint is set
  if (QWAMI_MINT_ADDRESS === "PASTE_YOUR_QWAMI_MINT_HERE") {
    console.error("❌ ERROR: Please update QWAMI_MINT_ADDRESS in this script!");
    console.error("You can find it in: ../qwami/devnet-addresses.json");
    process.exit(1);
  }

  // Configure provider
  const provider = AnchorProvider.env();
  anchor.setProvider(provider);
  
  // Load program from IDL file
  const path = require('path');
  const idlPath = path.join(__dirname, '../target/idl/kwami_nft.json');
  const idl = JSON.parse(require('fs').readFileSync(idlPath, 'utf8'));
  const programId = new anchor.web3.PublicKey("BTpKTZUyyAgiKsLrJfzFCYAyAFVx1Jd8xsbE11dTTswL");
  const program = new Program(idl, programId, provider) as any;
  
  console.log("Program ID:", program.programId.toString());
  console.log("Wallet:", provider.wallet.publicKey.toString());
  console.log("Cluster:", provider.connection.rpcEndpoint);
  
  const payer = (provider.wallet as any).payer as anchor.web3.Keypair;

  // QWAMI mint from previous initialization
  const qwamiMint = new anchor.web3.PublicKey(QWAMI_MINT_ADDRESS);
  console.log("QWAMI Mint:", qwamiMint.toString());
  
  // Create collection mint keypair
  const collectionMintKeypair = anchor.web3.Keypair.generate();
  console.log("\n📝 Generated Addresses:");
  console.log("Collection Mint:", collectionMintKeypair.publicKey.toString());
  
  // Derive PDAs
  const [collectionAuthority, collectionAuthorityBump] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("collection-authority"), collectionMintKeypair.publicKey.toBuffer()],
    program.programId
  );
  console.log("Collection Authority:", collectionAuthority.toString());
  
  const [dnaRegistry, dnaRegistryBump] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("dna-registry"), collectionMintKeypair.publicKey.toBuffer()],
    program.programId
  );
  console.log("DNA Registry:", dnaRegistry.toString());
  
  const [treasury, treasuryBump] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("kwami-treasury")],
    program.programId
  );
  console.log("Treasury:", treasury.toString());
  
  // Create QWAMI vault keypair
  const qwamiVaultKeypair = anchor.web3.Keypair.generate();
  console.log("QWAMI Vault:", qwamiVaultKeypair.publicKey.toString());

  // Create collection mint + QWAMI vault off-chain (program Initialize no longer `init`s them)
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

  console.log("🏗️  Creating QWAMI vault token account off-chain...");
  await createAccount(
    provider.connection,
    payer,
    qwamiMint,
    treasury, // owner/authority (PDA)
    qwamiVaultKeypair,
    undefined,
    TOKEN_PROGRAM_ID
  );
  
  // Initialize program
  console.log("\n⏳ Sending initialization transaction...");
  
  try {
    const tx = await program.methods
      .initialize()
      .accounts({
        collectionMint: collectionMintKeypair.publicKey,
        collectionAuthority: collectionAuthority,
        dnaRegistry: dnaRegistry,
        treasury: treasury,
        qwamiVault: qwamiVaultKeypair.publicKey,
        qwamiMint: qwamiMint,
        payer: provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc();
    
    console.log("\n✅ KWAMI NFT Program Initialized!");
    console.log("\nTransaction Signature:", tx);
    console.log("Explorer:", `https://explorer.solana.com/tx/${tx}?cluster=devnet`);
    
    // Verify initialization
    console.log("\n🔍 Verifying initialization...");
    
    const authorityData = await program.account.collectionAuthority.fetch(collectionAuthority) as any;
    console.log("\n📊 Collection Authority Data:");
    console.log("  Authority:", authorityData.authority.toString());
    console.log("  Collection Mint:", authorityData.collectionMint.toString());
    console.log("  Total Minted:", authorityData.totalMinted.toString());
    
    const registryData = await program.account.dnaRegistry.fetch(dnaRegistry) as any;
    console.log("\n🧬 DNA Registry Data:");
    console.log("  Authority:", registryData.authority.toString());
    console.log("  Collection:", registryData.collection.toString());
    console.log("  DNA Count:", registryData.dnaCount.toString());
    
    const treasuryData = await program.account.kwamiTreasury.fetch(treasury) as any;
    console.log("\n💰 Treasury Data:");
    console.log("  Authority:", treasuryData.authority.toString());
    console.log("  QWAMI Vault:", treasuryData.qwamiVault.toString());
    console.log("  Total QWAMI Received:", treasuryData.totalQwamiReceived.toString());
    console.log("  NFT Mints Count:", treasuryData.nftMintsCount.toString());
    console.log("  Dividend Pool:", treasuryData.dividendPoolBalance.toString());
    console.log("  Operations Balance:", treasuryData.operationsBalance.toString());
    
    // Save addresses to file
    const addresses = {
      programId: program.programId.toString(),
      collectionMint: collectionMintKeypair.publicKey.toString(),
      collectionAuthority: collectionAuthority.toString(),
      dnaRegistry: dnaRegistry.toString(),
      treasury: treasury.toString(),
      qwamiVault: qwamiVaultKeypair.publicKey.toString(),
      qwamiMint: qwamiMint.toString(),
      wallet: provider.wallet.publicKey.toString(),
      cluster: "devnet",
      timestamp: new Date().toISOString(),
      transaction: tx,
    };
    
    fs.writeFileSync(
      'devnet-addresses.json',
      JSON.stringify(addresses, null, 2)
    );
    
    console.log("\n💾 Addresses saved to: devnet-addresses.json");
    
    console.log("\n" + "=".repeat(70));
    console.log("✨ KWAMI NFT Program Ready for Use!");
    console.log("=".repeat(70));
    
    console.log("\n📝 Important: Save these addresses!");
    console.log("Collection Mint:", collectionMintKeypair.publicKey.toString());
    console.log("\n🔗 View on Explorer:");
    console.log(`https://explorer.solana.com/address/${collectionMintKeypair.publicKey.toString()}?cluster=devnet`);
    
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
    
    process.exit(1);
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

