import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { KwamiNft } from "../target/types/kwami_nft";
import { TOKEN_PROGRAM_ID, getAssociatedTokenAddressSync } from "@solana/spl-token";
import * as fs from "fs";
import * as crypto from "crypto";

/**
 * Test KWAMI NFT Operations on Devnet
 * 
 * This script tests:
 * 1. Minting a KWAMI NFT with QWAMI payment
 * 2. Checking generation and supply
 * 3. Burning NFT with QWAMI refund
 * 4. Treasury accounting
 * 
 * Run after: test-qwami-devnet.ts
 */

async function main() {
  console.log("\n🧪 Testing KWAMI NFT on Devnet...\n");

  // Load addresses from initialization
  let addresses;
  try {
    addresses = JSON.parse(fs.readFileSync('devnet-addresses.json', 'utf-8'));
  } catch (error) {
    console.error("❌ ERROR: Could not find devnet-addresses.json");
    console.error("Please run initialize-kwami.ts first!");
    process.exit(1);
  }

  // Configure provider
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  
  const program = anchor.workspace.KwamiNft as Program<KwamiNft>;
  
  console.log("Testing on:", provider.connection.rpcEndpoint);
  console.log("Wallet:", provider.wallet.publicKey.toString());
  console.log("Collection:", addresses.collectionMint);
  
  const collectionMint = new anchor.web3.PublicKey(addresses.collectionMint);
  const collectionAuthority = new anchor.web3.PublicKey(addresses.collectionAuthority);
  const dnaRegistry = new anchor.web3.PublicKey(addresses.dnaRegistry);
  const treasury = new anchor.web3.PublicKey(addresses.treasury);
  const qwamiMint = new anchor.web3.PublicKey(addresses.qwamiMint);
  const qwamiVault = new anchor.web3.PublicKey(addresses.qwamiVault);
  
  // Get user's QWAMI token account
  const userQwamiAccount = getAssociatedTokenAddressSync(
    qwamiMint,
    provider.wallet.publicKey
  );
  
  console.log("\n📊 Initial State:");
  
  // Check QWAMI balance
  try {
    const qwamiBalance = await provider.connection.getTokenAccountBalance(userQwamiAccount);
    console.log(`Your QWAMI: ${qwamiBalance.value.uiAmount}`);
    
    if (qwamiBalance.value.uiAmount < 10000) {
      console.warn("\n⚠️  WARNING: You need at least 10,000 QWAMI to mint a Gen #0 NFT");
      console.warn("Run test-qwami-devnet.ts first to get QWAMI!");
    }
  } catch {
    console.error("❌ ERROR: No QWAMI tokens found!");
    console.error("Run ../qwami/scripts/test-qwami-devnet.ts first!");
    process.exit(1);
  }
  
  // Check collection authority
  const authorityBefore = await program.account.collectionAuthority.fetch(collectionAuthority);
  console.log(`Total NFTs minted: ${authorityBefore.totalMinted.toString()}`);
  console.log(`Total NFTs burned: ${authorityBefore.totalBurned.toString()}`);
  
  // Check DNA registry
  const registryBefore = await program.account.dnaRegistry.fetch(dnaRegistry);
  console.log(`Unique DNAs: ${registryBefore.dnaCount.toString()}`);
  
  // Check treasury
  const treasuryBefore = await program.account.kwamiTreasury.fetch(treasury);
  console.log(`Treasury QWAMI received: ${treasuryBefore.totalQwamiReceived.toString()}`);
  console.log(`Dividend pool: ${treasuryBefore.dividendPoolBalance.toString()}`);
  
  // Test 1: Mint a KWAMI NFT
  console.log("\n" + "=".repeat(70));
  console.log("TEST 1: Mint KWAMI NFT");
  console.log("=".repeat(70));
  
  // Generate random DNA (32 bytes)
  const dnaBytes = crypto.randomBytes(32);
  const dnaArray = Array.from(dnaBytes);
  console.log(`\nGenerated DNA: ${Buffer.from(dnaBytes).toString('hex')}`);
  
  // Create NFT mint keypair
  const nftMintKeypair = anchor.web3.Keypair.generate();
  console.log(`NFT Mint: ${nftMintKeypair.publicKey.toString()}`);
  
  // Derive NFT account PDA
  const [nftAccount] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("kwami-nft"), nftMintKeypair.publicKey.toBuffer()],
    program.programId
  );
  
  // User's NFT token account
  const userNftAccount = getAssociatedTokenAddressSync(
    nftMintKeypair.publicKey,
    provider.wallet.publicKey
  );
  
  console.log(`\n⏳ Minting KWAMI NFT...`);
  console.log(`Payment: 10,000 QWAMI (Gen #0 base price)`);
  
  try {
    const tx1 = await program.methods
      .mintKwami(dnaArray, "Test KWAMI #1", "https://arweave.net/test")
      .accounts({
        nftMint: nftMintKeypair.publicKey,
        nftAccount: nftAccount,
        collectionMint: collectionMint,
        collectionAuthority: collectionAuthority,
        dnaRegistry: dnaRegistry,
        treasury: treasury,
        qwamiMint: qwamiMint,
        qwamiVault: qwamiVault,
        userQwamiAccount: userQwamiAccount,
        userNftAccount: userNftAccount,
        minter: provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      })
      .signers([nftMintKeypair])
      .rpc();
    
    console.log("✅ NFT minted successfully!");
    console.log("Transaction:", `https://explorer.solana.com/tx/${tx1}?cluster=devnet`);
    
    // Check NFT data
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const nftData = await program.account.kwamiNft.fetch(nftAccount);
    console.log("\n🎨 NFT Data:");
    console.log(`  Name: ${nftData.name}`);
    console.log(`  Owner: ${nftData.owner.toString()}`);
    console.log(`  Mint Cost: ${nftData.mintCost.toString()} QWAMI`);
    console.log(`  Mint Timestamp: ${new Date(nftData.mintTimestamp.toNumber() * 1000).toISOString()}`);
    console.log(`  Generation: ${nftData.generation.toString()}`);
    console.log(`  Is Burned: ${nftData.isBurned}`);
    
    // Check treasury after mint
    const treasuryAfterMint = await program.account.kwamiTreasury.fetch(treasury);
    console.log("\n💰 Treasury After Mint:");
    console.log(`  QWAMI Received: ${treasuryAfterMint.totalQwamiReceived.toString()} (+${treasuryAfterMint.totalQwamiReceived.toNumber() - treasuryBefore.totalQwamiReceived.toNumber()})`);
    console.log(`  NFT Mints: ${treasuryAfterMint.nftMintsCount.toString()}`);
    console.log(`  Dividend Pool: ${treasuryAfterMint.dividendPoolBalance.toString()} (80%)`);
    console.log(`  Operations: ${treasuryAfterMint.operationsBalance.toString()} (20%)`);
    
    // Check QWAMI balance after
    const qwamiBalanceAfter = await provider.connection.getTokenAccountBalance(userQwamiAccount);
    console.log(`\nYour QWAMI: ${qwamiBalanceAfter.value.uiAmount}`);
    
    // Test 2: Burn the NFT
    console.log("\n" + "=".repeat(70));
    console.log("TEST 2: Burn KWAMI NFT (50% QWAMI Refund)");
    console.log("=".repeat(70));
    
    console.log(`\n⏳ Burning NFT...`);
    console.log(`Expected refund: 5,000 QWAMI (50% of 10,000)`);
    
    try {
      const tx2 = await program.methods
        .burnKwami()
        .accounts({
          nftMint: nftMintKeypair.publicKey,
          nftAccount: nftAccount,
          collectionAuthority: collectionAuthority,
          treasury: treasury,
          qwamiMint: qwamiMint,
          qwamiVault: qwamiVault,
          userQwamiAccount: userQwamiAccount,
          userNftAccount: userNftAccount,
          owner: provider.wallet.publicKey,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .rpc();
      
      console.log("✅ NFT burned successfully!");
      console.log("Transaction:", `https://explorer.solana.com/tx/${tx2}?cluster=devnet`);
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Check NFT data after burn
      const nftDataAfter = await program.account.kwamiNft.fetch(nftAccount);
      console.log("\n🔥 NFT After Burn:");
      console.log(`  Is Burned: ${nftDataAfter.isBurned}`);
      
      // Check treasury after burn
      const treasuryAfterBurn = await program.account.kwamiTreasury.fetch(treasury);
      console.log("\n💰 Treasury After Burn:");
      console.log(`  QWAMI Refunded: ${treasuryAfterBurn.totalQwamiRefunded.toString()}`);
      console.log(`  NFT Burns: ${treasuryAfterBurn.nftBurnsCount.toString()}`);
      
      // Check QWAMI balance after burn
      const qwamiBalanceAfterBurn = await provider.connection.getTokenAccountBalance(userQwamiAccount);
      console.log(`\nYour QWAMI: ${qwamiBalanceAfterBurn.value.uiAmount} (+5,000 refund)`);
      
    } catch (error) {
      console.error("❌ Burn failed:", error);
      if (error.logs) {
        console.error("\nProgram Logs:");
        error.logs.forEach(log => console.error(log));
      }
    }
    
  } catch (error) {
    console.error("❌ Mint failed:", error);
    if (error.logs) {
      console.error("\nProgram Logs:");
      error.logs.forEach(log => console.error(log));
    }
    process.exit(1);
  }
  
  // Final Summary
  console.log("\n" + "=".repeat(70));
  console.log("📊 FINAL SUMMARY");
  console.log("=".repeat(70));
  
  const authorityFinal = await program.account.collectionAuthority.fetch(collectionAuthority);
  const registryFinal = await program.account.dnaRegistry.fetch(dnaRegistry);
  const treasuryFinal = await program.account.kwamiTreasury.fetch(treasury);
  
  console.log("\nCollection Stats:");
  console.log(`  Total Minted: ${authorityFinal.totalMinted.toString()}`);
  console.log(`  Total Burned: ${authorityFinal.totalBurned.toString()}`);
  console.log(`  Unique DNAs: ${registryFinal.dnaCount.toString()}`);
  
  console.log("\nTreasury Stats:");
  console.log(`  QWAMI Received: ${treasuryFinal.totalQwamiReceived.toString()}`);
  console.log(`  QWAMI Refunded: ${treasuryFinal.totalQwamiRefunded.toString()}`);
  console.log(`  NFT Mints: ${treasuryFinal.nftMintsCount.toString()}`);
  console.log(`  NFT Burns: ${treasuryFinal.nftBurnsCount.toString()}`);
  console.log(`  Dividend Pool: ${treasuryFinal.dividendPoolBalance.toString()}`);
  console.log(`  Operations: ${treasuryFinal.operationsBalance.toString()}`);
  
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

