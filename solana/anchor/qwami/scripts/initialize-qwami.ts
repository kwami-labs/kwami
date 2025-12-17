import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import {
  TOKEN_PROGRAM_ID,
  createMint,
  createAccount,
} from "@solana/spl-token";

/**
 * Simplified QWAMI Token Initialization
 * Uses raw transaction building to avoid IDL parsing issues
 */

async function main() {
  console.log("\n🚀 Initializing QWAMI Token Program on Devnet...\n");

  // Configure provider
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  
  const payer = (provider.wallet as any).payer as anchor.web3.Keypair;
  
  // Load program ID from IDL
  const fs = require('fs');
  const path = require('path');
  const idlPath = path.join(__dirname, '../target/idl/qwami_token.json');
  const idl = JSON.parse(fs.readFileSync(idlPath, 'utf8'));
  const programId = new anchor.web3.PublicKey(idl.address || idl.metadata.address);
  
  console.log("Program ID:", programId.toString());
  console.log("Wallet:", provider.wallet.publicKey.toString());
  console.log("Cluster:", provider.connection.rpcEndpoint);
  
  // Create mint keypair
  const mintKeypair = anchor.web3.Keypair.generate();
  console.log("\n📝 Generated Addresses:");
  console.log("QWAMI Mint:", mintKeypair.publicKey.toString());
  
  // Derive PDAs
  const [tokenAuthority] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("token-authority"), mintKeypair.publicKey.toBuffer()],
    programId
  );
  console.log("Token Authority:", tokenAuthority.toString());
  
  const [treasury] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("qwami-treasury")],
    programId
  );
  console.log("Treasury:", treasury.toString());
  
  // Devnet USDC mint
  const usdcMint = new anchor.web3.PublicKey("4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU");
  console.log("USDC Mint (devnet):", usdcMint.toString());
  
  // Create USDC vault keypair
  const usdcVaultKeypair = anchor.web3.Keypair.generate();
  console.log("USDC Vault:", usdcVaultKeypair.publicKey.toString());

  // Create the mint off-chain
  console.log("\n🏗️  Creating QWAMI mint off-chain...");
  await createMint(
    provider.connection,
    payer,
    tokenAuthority, // mint authority (PDA)
    null,
    0,
    mintKeypair,
    undefined,
    TOKEN_PROGRAM_ID
  );

  console.log("🏗️  Creating USDC vault token account off-chain...");
  await createAccount(
    provider.connection,
    payer,
    usdcMint,
    treasury, // owner/authority (PDA)
    usdcVaultKeypair,
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
    { pubkey: mintKeypair.publicKey, isSigner: false, isWritable: true },
    { pubkey: tokenAuthority, isSigner: false, isWritable: true },
    { pubkey: treasury, isSigner: false, isWritable: true },
    { pubkey: usdcVaultKeypair.publicKey, isSigner: false, isWritable: true }, // Must be writable
    { pubkey: usdcMint, isSigner: false, isWritable: false },
    { pubkey: provider.wallet.publicKey, isSigner: true, isWritable: true },
    { pubkey: anchor.web3.SystemProgram.programId, isSigner: false, isWritable: false },
    { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
  ];
  
  const instruction = new anchor.web3.TransactionInstruction({
    keys,
    programId,
    data: discriminator, // No additional data for initialize
  });
  
  const tx = new anchor.web3.Transaction().add(instruction);
  
  try {
    const signature = await provider.sendAndConfirm(tx);
    
    console.log("\n✅ QWAMI Token Program Initialized!");
    console.log("\nTransaction Signature:", signature);
    console.log("Explorer:", `https://explorer.solana.com/tx/${signature}?cluster=devnet`);
    
    // Save addresses to file
    const addresses = {
      programId: programId.toString(),
      qwamiMint: mintKeypair.publicKey.toString(),
      tokenAuthority: tokenAuthority.toString(),
      treasury: treasury.toString(),
      usdcVault: usdcVaultKeypair.publicKey.toString(),
      usdcMint: usdcMint.toString(),
      wallet: provider.wallet.publicKey.toString(),
      cluster: "devnet",
      timestamp: new Date().toISOString(),
      transaction: signature,
    };
    
    fs.writeFileSync(
      'devnet-addresses.json',
      JSON.stringify(addresses, null, 2)
    );
    
    console.log("\n💾 Addresses saved to: devnet-addresses.json");
    
    console.log("\n" + "=".repeat(70));
    console.log("✨ QWAMI Token Program Ready for Use!");
    console.log("=".repeat(70));
    
    console.log("\n📝 Important: Save these addresses!");
    console.log("QWAMI Mint:", mintKeypair.publicKey.toString());
    console.log("\n🔗 View on Explorer:");
    console.log(`https://explorer.solana.com/address/${mintKeypair.publicKey.toString()}?cluster=devnet`);
    
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
