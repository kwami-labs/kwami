import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { QwamiToken } from "../target/types/qwami_token";
import { TOKEN_PROGRAM_ID, getAssociatedTokenAddressSync } from "@solana/spl-token";
import * as fs from "fs";

/**
 * Test QWAMI Token Operations on Devnet
 * 
 * This script tests:
 * 1. Minting QWAMI with SOL
 * 2. Burning QWAMI for SOL back
 * 3. Treasury accounting
 * 
 * Run after: initialize-qwami.ts
 */

async function main() {
  console.log("\n🧪 Testing QWAMI Token on Devnet...\n");

  // Load addresses from initialization
  let addresses;
  try {
    addresses = JSON.parse(fs.readFileSync('devnet-addresses.json', 'utf-8'));
  } catch (error) {
    console.error("❌ ERROR: Could not find devnet-addresses.json");
    console.error("Please run initialize-qwami.ts first!");
    process.exit(1);
  }

  // Configure provider
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  
  const program = anchor.workspace.QwamiToken as Program<QwamiToken>;
  
  console.log("Testing on:", provider.connection.rpcEndpoint);
  console.log("Wallet:", provider.wallet.publicKey.toString());
  console.log("QWAMI Mint:", addresses.qwamiMint);
  
  const qwamiMint = new anchor.web3.PublicKey(addresses.qwamiMint);
  const tokenAuthority = new anchor.web3.PublicKey(addresses.tokenAuthority);
  const treasury = new anchor.web3.PublicKey(addresses.treasury);
  
  // Get user's token account
  const userTokenAccount = getAssociatedTokenAddressSync(
    qwamiMint,
    provider.wallet.publicKey
  );
  
  console.log("\n📊 Initial State:");
  
  // Check wallet SOL balance
  const initialSolBalance = await provider.connection.getBalance(provider.wallet.publicKey);
  console.log(`Wallet SOL: ${initialSolBalance / anchor.web3.LAMPORTS_PER_SOL} SOL`);
  
  // Check treasury before
  const treasuryBefore = await program.account.qwamiTreasury.fetch(treasury);
  console.log(`Treasury SOL received: ${treasuryBefore.totalSolReceived.toString()} lamports`);
  console.log(`Treasury QWAMI minted: ${treasuryBefore.totalQwamiMintedViaExchange.toString()}`);
  
  // Test 1: Mint QWAMI with SOL
  console.log("\n" + "=".repeat(70));
  console.log("TEST 1: Mint QWAMI with SOL");
  console.log("=".repeat(70));
  
  const solToSpend = 0.1 * anchor.web3.LAMPORTS_PER_SOL; // 0.1 SOL
  console.log(`\n⏳ Minting QWAMI with ${solToSpend / anchor.web3.LAMPORTS_PER_SOL} SOL...`);
  
  try {
    const tx1 = await program.methods
      .mintWithSol(new anchor.BN(solToSpend))
      .accounts({
        mint: qwamiMint,
        tokenAuthority: tokenAuthority,
        treasury: treasury,
        userTokenAccount: userTokenAccount,
        user: provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc();
    
    console.log("✅ Mint successful!");
    console.log("Transaction:", `https://explorer.solana.com/tx/${tx1}?cluster=devnet`);
    
    // Check balance
    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for confirmation
    
    const tokenAccount = await provider.connection.getTokenAccountBalance(userTokenAccount);
    console.log(`\nYour QWAMI balance: ${tokenAccount.value.uiAmount} QWAMI`);
    
    // Check treasury after
    const treasuryAfterMint = await program.account.qwamiTreasury.fetch(treasury);
    console.log(`Treasury SOL received: ${treasuryAfterMint.totalSolReceived.toString()} lamports (+${treasuryAfterMint.totalSolReceived.toNumber() - treasuryBefore.totalSolReceived.toNumber()})`);
    console.log(`Treasury QWAMI minted: ${treasuryAfterMint.totalQwamiMintedViaExchange.toString()} (+${treasuryAfterMint.totalQwamiMintedViaExchange.toNumber() - treasuryBefore.totalQwamiMintedViaExchange.toNumber()})`);
    
  } catch (error) {
    console.error("❌ Mint failed:", error);
    if (error.logs) {
      console.error("\nProgram Logs:");
      error.logs.forEach(log => console.error(log));
    }
  }
  
  // Test 2: Burn QWAMI for SOL
  console.log("\n" + "=".repeat(70));
  console.log("TEST 2: Burn QWAMI for SOL");
  console.log("=".repeat(70));
  
  const qwamiBurn = 100; // Burn 100 QWAMI
  console.log(`\n⏳ Burning ${qwamiBurn} QWAMI for SOL back...`);
  
  try {
    const tx2 = await program.methods
      .burnForSol(new anchor.BN(qwamiBurn))
      .accounts({
        mint: qwamiMint,
        tokenAuthority: tokenAuthority,
        treasury: treasury,
        userTokenAccount: userTokenAccount,
        user: provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc();
    
    console.log("✅ Burn successful!");
    console.log("Transaction:", `https://explorer.solana.com/tx/${tx2}?cluster=devnet`);
    
    // Check balance
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const tokenAccount = await provider.connection.getTokenAccountBalance(userTokenAccount);
    console.log(`\nYour QWAMI balance: ${tokenAccount.value.uiAmount} QWAMI`);
    
    const finalSolBalance = await provider.connection.getBalance(provider.wallet.publicKey);
    console.log(`Wallet SOL: ${finalSolBalance / anchor.web3.LAMPORTS_PER_SOL} SOL`);
    
    // Check treasury final
    const treasuryFinal = await program.account.qwamiTreasury.fetch(treasury);
    console.log(`\nTreasury SOL distributed: ${treasuryFinal.totalSolDistributed.toString()} lamports`);
    console.log(`Treasury QWAMI burned: ${treasuryFinal.totalQwamiBurnedViaExchange.toString()}`);
    
  } catch (error) {
    console.error("❌ Burn failed:", error);
    if (error.logs) {
      console.error("\nProgram Logs:");
      error.logs.forEach(log => console.error(log));
    }
  }
  
  // Final Summary
  console.log("\n" + "=".repeat(70));
  console.log("📊 FINAL SUMMARY");
  console.log("=".repeat(70));
  
  const treasuryFinal = await program.account.qwamiTreasury.fetch(treasury);
  console.log("\nTreasury Accounting:");
  console.log(`  SOL Received: ${treasuryFinal.totalSolReceived.toNumber() / anchor.web3.LAMPORTS_PER_SOL} SOL`);
  console.log(`  SOL Distributed: ${treasuryFinal.totalSolDistributed.toNumber() / anchor.web3.LAMPORTS_PER_SOL} SOL`);
  console.log(`  QWAMI Minted: ${treasuryFinal.totalQwamiMintedViaExchange.toString()}`);
  console.log(`  QWAMI Burned: ${treasuryFinal.totalQwamiBurnedViaExchange.toString()}`);
  
  console.log("\n✨ All tests completed!");
  console.log("\n🔗 View Treasury:");
  console.log(`https://explorer.solana.com/address/${addresses.treasury}?cluster=devnet`);
}

main()
  .then(() => {
    console.log("\n✅ Test script completed\n");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Test script failed:");
    console.error(error);
    process.exit(1);
  });

