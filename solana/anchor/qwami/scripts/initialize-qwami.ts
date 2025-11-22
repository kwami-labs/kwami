import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { QwamiToken } from "../target/types/qwami_token";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";

/**
 * Initialize QWAMI Token Program on Devnet
 * 
 * This script:
 * 1. Creates QWAMI mint
 * 2. Creates token authority PDA
 * 3. Creates treasury PDA
 * 4. Creates USDC vault
 * 5. Initializes the program
 */

async function main() {
  console.log("\n🚀 Initializing QWAMI Token Program on Devnet...\n");

  // Configure provider
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  
  const program = anchor.workspace.QwamiToken as Program<QwamiToken>;
  
  console.log("Program ID:", program.programId.toString());
  console.log("Wallet:", provider.wallet.publicKey.toString());
  console.log("Cluster:", provider.connection.rpcEndpoint);
  
  // Create mint keypair
  const mintKeypair = anchor.web3.Keypair.generate();
  console.log("\n📝 Generated Addresses:");
  console.log("QWAMI Mint:", mintKeypair.publicKey.toString());
  
  // Derive PDAs
  const [tokenAuthority, tokenAuthorityBump] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("token-authority"), mintKeypair.publicKey.toBuffer()],
    program.programId
  );
  console.log("Token Authority:", tokenAuthority.toString());
  
  const [treasury, treasuryBump] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("qwami-treasury")],
    program.programId
  );
  console.log("Treasury:", treasury.toString());
  
  // Devnet USDC mint
  const usdcMint = new anchor.web3.PublicKey("4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU");
  console.log("USDC Mint (devnet):", usdcMint.toString());
  
  // Create USDC vault keypair
  const usdcVaultKeypair = anchor.web3.Keypair.generate();
  console.log("USDC Vault:", usdcVaultKeypair.publicKey.toString());
  
  // Initialize program
  console.log("\n⏳ Sending initialization transaction...");
  
  try {
    const tx = await program.methods
      .initialize()
      .accounts({
        mint: mintKeypair.publicKey,
        tokenAuthority: tokenAuthority,
        treasury: treasury,
        usdcVault: usdcVaultKeypair.publicKey,
        usdcMint: usdcMint,
        payer: provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      })
      .signers([mintKeypair, usdcVaultKeypair])
      .rpc();
    
    console.log("\n✅ QWAMI Token Program Initialized!");
    console.log("\nTransaction Signature:", tx);
    console.log("Explorer:", `https://explorer.solana.com/tx/${tx}?cluster=devnet`);
    
    // Verify initialization
    console.log("\n🔍 Verifying initialization...");
    
    const authorityData = await program.account.tokenAuthority.fetch(tokenAuthority);
    console.log("\n📊 Token Authority Data:");
    console.log("  Authority:", authorityData.authority.toString());
    console.log("  Mint:", authorityData.mint.toString());
    console.log("  Total Minted:", authorityData.totalMinted.toString());
    console.log("  Total Burned:", authorityData.totalBurned.toString());
    console.log("  Base Price (USD cents):", authorityData.basePriceUsdCents.toString());
    
    const treasuryData = await program.account.qwamiTreasury.fetch(treasury);
    console.log("\n💰 Treasury Data:");
    console.log("  Authority:", treasuryData.authority.toString());
    console.log("  USDC Vault:", treasuryData.usdcVault.toString());
    console.log("  Total SOL Received:", treasuryData.totalSolReceived.toString());
    console.log("  Total USDC Received:", treasuryData.totalUsdcReceived.toString());
    
    // Save addresses to file
    const fs = require('fs');
    const addresses = {
      programId: program.programId.toString(),
      qwamiMint: mintKeypair.publicKey.toString(),
      tokenAuthority: tokenAuthority.toString(),
      treasury: treasury.toString(),
      usdcVault: usdcVaultKeypair.publicKey.toString(),
      usdcMint: usdcMint.toString(),
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
    console.log("✨ QWAMI Token Program Ready for Use!");
    console.log("=".repeat(70));
    
    console.log("\n📝 Important: Save these addresses!");
    console.log("QWAMI Mint:", mintKeypair.publicKey.toString());
    console.log("\n🔗 View on Explorer:");
    console.log(`https://explorer.solana.com/address/${mintKeypair.publicKey.toString()}?cluster=devnet`);
    
  } catch (error) {
    console.error("\n❌ Initialization failed!");
    console.error("Error:", error);
    
    if (error.logs) {
      console.error("\nProgram Logs:");
      error.logs.forEach(log => console.error(log));
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

