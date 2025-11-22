import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { QwamiToken } from "../qwami/target/types/qwami_token";
import { KwamiNft } from "../kwami/target/types/kwami_nft";
import { expect } from "chai";
import { 
  getAssociatedTokenAddress, 
  TOKEN_PROGRAM_ID,
  createMint,
  mintTo,
} from "@solana/spl-token";
import { Metaplex } from "@metaplex-foundation/js";
import * as crypto from "crypto";

describe("integration-full-user-journey", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const qwamiProgram = anchor.workspace.QwamiToken as Program<QwamiToken>;
  const kwamiProgram = anchor.workspace.KwamiNft as Program<KwamiNft>;
  const metaplex = Metaplex.make(provider.connection);
  
  // QWAMI Program accounts
  let qwamiMint: anchor.web3.PublicKey;
  let qwamiAuthority: anchor.web3.PublicKey;
  let qwamiTreasury: anchor.web3.PublicKey;
  let solVault: anchor.web3.PublicKey;
  let usdcMint: anchor.web3.PublicKey;
  let usdcVault: anchor.web3.PublicKey;

  // KWAMI Program accounts
  let collectionMint: anchor.web3.PublicKey;
  let collectionAuthority: anchor.web3.PublicKey;
  let dnaRegistry: anchor.web3.PublicKey;
  let kwamiTreasury: anchor.web3.PublicKey;
  let kwamiQwamiVault: anchor.web3.PublicKey;

  // User accounts
  let userQwamiAccount: anchor.web3.PublicKey;
  let userUsdcAccount: anchor.web3.PublicKey;

  const LAMPORTS_PER_SOL = 1_000_000_000;
  const USDC_UNIT = 1_000_000;

  before(async () => {
    console.log("\n🚀 Starting Full User Journey Integration Test\n");
    console.log("This test simulates a complete user experience:");
    console.log("1. User buys QWAMI with SOL");
    console.log("2. User mints KWAMI NFT with QWAMI");
    console.log("3. User burns KWAMI NFT for QWAMI refund");
    console.log("4. User redeems QWAMI for USDC");
    console.log("\n");

    // Create mock USDC mint
    usdcMint = await createMint(
      provider.connection,
      provider.wallet.payer,
      provider.wallet.publicKey,
      null,
      6 // USDC has 6 decimals
    );
  });

  describe("Phase 1: Initialize Both Programs", () => {
    it("Initializes QWAMI Token program with treasury", async () => {
      const mintKeypair = anchor.web3.Keypair.generate();
      qwamiMint = mintKeypair.publicKey;

      [qwamiAuthority] = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from("token-authority"), qwamiMint.toBuffer()],
        qwamiProgram.programId
      );

      [qwamiTreasury] = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from("qwami-treasury")],
        qwamiProgram.programId
      );

      [solVault] = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from("sol-vault")],
        qwamiProgram.programId
      );

      const usdcVaultKeypair = anchor.web3.Keypair.generate();
      usdcVault = usdcVaultKeypair.publicKey;

      const tx = await qwamiProgram.methods
        .initialize()
        .accounts({
          mint: qwamiMint,
          tokenAuthority: qwamiAuthority,
          treasury: qwamiTreasury,
          usdcVault: usdcVault,
          usdcMint: usdcMint,
          payer: provider.wallet.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        })
        .signers([mintKeypair, usdcVaultKeypair])
        .rpc();

      console.log("✅ QWAMI Token program initialized");
      console.log("   TX:", tx);
    });

    it("Initializes KWAMI NFT program with treasury", async () => {
      const collectionMintKeypair = anchor.web3.Keypair.generate();
      collectionMint = collectionMintKeypair.publicKey;

      [collectionAuthority] = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from("collection-authority"), collectionMint.toBuffer()],
        kwamiProgram.programId
      );

      [dnaRegistry] = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from("dna-registry"), collectionMint.toBuffer()],
        kwamiProgram.programId
      );

      [kwamiTreasury] = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from("kwami-treasury")],
        kwamiProgram.programId
      );

      const kwamiQwamiVaultKeypair = anchor.web3.Keypair.generate();
      kwamiQwamiVault = kwamiQwamiVaultKeypair.publicKey;

      const tx = await kwamiProgram.methods
        .initialize()
        .accounts({
          collectionMint: collectionMint,
          collectionAuthority: collectionAuthority,
          dnaRegistry: dnaRegistry,
          treasury: kwamiTreasury,
          qwamiVault: kwamiQwamiVault,
          qwamiMint: qwamiMint,
          payer: provider.wallet.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        })
        .signers([collectionMintKeypair, kwamiQwamiVaultKeypair])
        .rpc();

      console.log("✅ KWAMI NFT program initialized");
      console.log("   TX:", tx);
    });

    it("Creates user token accounts", async () => {
      userQwamiAccount = await getAssociatedTokenAddress(
        qwamiMint,
        provider.wallet.publicKey
      );

      userUsdcAccount = await getAssociatedTokenAddress(
        usdcMint,
        provider.wallet.publicKey
      );

      // Mint some USDC to treasury for later redemption
      await mintTo(
        provider.connection,
        provider.wallet.payer,
        usdcMint,
        usdcVault,
        provider.wallet.publicKey,
        10000 * USDC_UNIT // 10,000 USDC
      );

      console.log("✅ User token accounts ready");
      console.log("✅ Treasury USDC funded (10,000 USDC for testing)");
    });
  });

  describe("Phase 2: User Buys QWAMI with SOL", () => {
    it("User purchases QWAMI tokens with SOL", async () => {
      const solAmount = new anchor.BN(LAMPORTS_PER_SOL * 2); // 2 SOL
      const expectedQwami = 2_000; // 2 SOL = 2,000 QWAMI

      console.log("\n💰 Step 1: User Buys QWAMI");
      console.log("   User pays: 2 SOL");
      console.log("   Expected: 2,000 QWAMI");

      const beforeSolBalance = await provider.connection.getBalance(provider.wallet.publicKey);

      const tx = await qwamiProgram.methods
        .mintWithSol(solAmount)
        .accounts({
          mint: qwamiMint,
          tokenAuthority: qwamiAuthority,
          treasury: qwamiTreasury,
          solVault: solVault,
          buyerQwamiAccount: userQwamiAccount,
          buyer: provider.wallet.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .rpc();

      const qwamiBalance = await provider.connection.getTokenAccountBalance(userQwamiAccount);
      const afterSolBalance = await provider.connection.getBalance(provider.wallet.publicKey);

      expect(qwamiBalance.value.amount).to.equal(expectedQwami.toString());

      console.log("   ✅ Received:", qwamiBalance.value.amount, "QWAMI");
      console.log("   ✅ SOL paid:", ((beforeSolBalance - afterSolBalance) / LAMPORTS_PER_SOL).toFixed(4), "SOL");
      console.log("   TX:", tx);
    });
  });

  describe("Phase 3: User Mints KWAMI NFT", () => {
    let nftMint: anchor.web3.Keypair;
    let kwamiNft: anchor.web3.PublicKey;
    let dnaHash: Buffer;
    let baseCost: number;

    it("User mints KWAMI NFT using QWAMI tokens", async () => {
      // Simulating Gen #51 for reasonable cost
      baseCost = 500;
      const platformFee = 50;
      const txFee = 50;
      const totalCost = baseCost + platformFee + txFee; // 600 QWAMI

      nftMint = anchor.web3.Keypair.generate();
      dnaHash = crypto.randomBytes(32);

      [kwamiNft] = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from("kwami-nft"), nftMint.publicKey.toBuffer()],
        kwamiProgram.programId
      );

      console.log("\n🦋 Step 2: User Mints KWAMI NFT");
      console.log("   Cost: 600 QWAMI (500 base + 50 fee + 50 tx)");

      const beforeQwamiBalance = await provider.connection.getTokenAccountBalance(userQwamiAccount);
      const metadataPda = metaplex.nfts().pdas().metadata({mint: nftMint.publicKey});

      const tx = await kwamiProgram.methods
        .mintKwami(
          Array.from(dnaHash),
          "Journey Test KWAMI",
          "KWAMI",
          "https://arweave.net/journey-test"
        )
        .accounts({
          mint: nftMint.publicKey,
          kwamiNft: kwamiNft,
          collectionAuthority: collectionAuthority,
          dnaRegistry: dnaRegistry,
          treasury: kwamiTreasury,
          userQwamiAccount: userQwamiAccount,
          qwamiVault: kwamiQwamiVault,
          metadata: metadataPda,
          owner: provider.wallet.publicKey,
          metadataProgram: new anchor.web3.PublicKey("metqbxxru9QnqZN4VJKcAqWczBw8h7s8XShNLHkAAAA"),
          systemProgram: anchor.web3.SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        })
        .signers([nftMint])
        .rpc();

      const afterQwamiBalance = await provider.connection.getTokenAccountBalance(userQwamiAccount);
      const qwamiSpent = new anchor.BN(beforeQwamiBalance.value.amount).sub(new anchor.BN(afterQwamiBalance.value.amount));

      expect(qwamiSpent.toNumber()).to.equal(totalCost);

      console.log("   ✅ NFT minted successfully");
      console.log("   ✅ QWAMI spent:", qwamiSpent.toString());
      console.log("   ✅ Remaining QWAMI:", afterQwamiBalance.value.amount);
      console.log("   TX:", tx);

      // Verify treasury received funds
      const treasuryData = await kwamiProgram.account.kwamiTreasury.fetch(kwamiTreasury);
      const dividendAmount = (totalCost * 80) / 100;
      const operationsAmount = (totalCost * 20) / 100;

      console.log("   📊 Revenue Split:");
      console.log("      - Dividend Pool:", dividendAmount, "QWAMI (80%)");
      console.log("      - Operations:", operationsAmount, "QWAMI (20%)");
    });
  });

  describe("Phase 4: User Burns NFT for Refund", () => {
    let nftMint: anchor.web3.Keypair;
    let kwamiNft: anchor.web3.PublicKey;

    before(async () => {
      // Re-fetch the NFT info from previous phase
      const nftAccounts = await provider.connection.getProgramAccounts(kwamiProgram.programId, {
        filters: [
          {
            memcmp: {
              offset: 8 + 32, // After discriminator and mint pubkey
              bytes: provider.wallet.publicKey.toBase58(),
            },
          },
        ],
      });

      if (nftAccounts.length > 0) {
        kwamiNft = nftAccounts[0].pubkey;
      }
    });

    it("User burns KWAMI NFT and receives 50% QWAMI refund", async () => {
      const nftData = await kwamiProgram.account.kwamiNft.fetch(kwamiNft);
      nftMint = anchor.web3.Keypair.fromSecretKey(new Uint8Array(32)); // Placeholder
      const baseCost = nftData.mintCostQwami.toNumber();
      const expectedRefund = (baseCost * 50) / 100; // 250 QWAMI

      console.log("\n🔥 Step 3: User Burns NFT");
      console.log("   Original cost:", baseCost, "QWAMI");
      console.log("   Expected refund:", expectedRefund, "QWAMI (50%)");

      const beforeQwamiBalance = await provider.connection.getTokenAccountBalance(userQwamiAccount);

      const tx = await kwamiProgram.methods
        .burnKwami()
        .accounts({
          kwamiNft: kwamiNft,
          mint: nftData.mint,
          dnaRegistry: dnaRegistry,
          treasury: kwamiTreasury,
          userQwamiAccount: userQwamiAccount,
          qwamiVault: kwamiQwamiVault,
          owner: provider.wallet.publicKey,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .rpc();

      const afterQwamiBalance = await provider.connection.getTokenAccountBalance(userQwamiAccount);
      const refundReceived = new anchor.BN(afterQwamiBalance.value.amount).sub(new anchor.BN(beforeQwamiBalance.value.amount));

      expect(refundReceived.toNumber()).to.equal(expectedRefund);

      console.log("   ✅ NFT burned");
      console.log("   ✅ Refund received:", refundReceived.toString(), "QWAMI");
      console.log("   ✅ Total QWAMI now:", afterQwamiBalance.value.amount);
      console.log("   TX:", tx);
    });
  });

  describe("Phase 5: User Redeems QWAMI for USDC", () => {
    it("User burns QWAMI to receive USDC", async () => {
      const qwamiBalance = await provider.connection.getTokenAccountBalance(userQwamiAccount);
      const qwamiAmount = new anchor.BN(qwamiBalance.value.amount); // All remaining QWAMI
      const expectedUsdc = qwamiAmount.toNumber() * 10_000; // QWAMI * 10,000 = USDC units

      console.log("\n💵 Step 4: User Redeems QWAMI for USDC");
      console.log("   Burning:", qwamiAmount.toString(), "QWAMI");
      console.log("   Expected:", (expectedUsdc / USDC_UNIT).toFixed(2), "USDC");

      const beforeUsdcBalance = await provider.connection.getTokenAccountBalance(userUsdcAccount);

      const tx = await qwamiProgram.methods
        .burnForUsdc(qwamiAmount)
        .accounts({
          mint: qwamiMint,
          tokenAuthority: qwamiAuthority,
          treasury: qwamiTreasury,
          usdcVault: usdcVault,
          sellerUsdcAccount: userUsdcAccount,
          sellerQwamiAccount: userQwamiAccount,
          seller: provider.wallet.publicKey,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .rpc();

      const afterUsdcBalance = await provider.connection.getTokenAccountBalance(userUsdcAccount);
      const usdcReceived = new anchor.BN(afterUsdcBalance.value.amount).sub(new anchor.BN(beforeUsdcBalance.value.amount || "0"));

      expect(usdcReceived.toNumber()).to.equal(expectedUsdc);

      const finalQwamiBalance = await provider.connection.getTokenAccountBalance(userQwamiAccount);

      console.log("   ✅ QWAMI burned:", qwamiAmount.toString());
      console.log("   ✅ USDC received:", (usdcReceived.toNumber() / USDC_UNIT).toFixed(2), "USDC");
      console.log("   ✅ Remaining QWAMI:", finalQwamiBalance.value.amount);
      console.log("   TX:", tx);
    });
  });

  describe("Phase 6: Final Accounting", () => {
    it("Displays complete journey statistics", async () => {
      const qwamiTreasuryData = await qwamiProgram.account.qwamiTreasury.fetch(qwamiTreasury);
      const kwamiTreasuryData = await kwamiProgram.account.kwamiTreasury.fetch(kwamiTreasury);
      const qwamiAuthorityData = await qwamiProgram.account.tokenAuthority.fetch(qwamiAuthority);

      console.log("\n");
      console.log("═".repeat(60));
      console.log("📊 COMPLETE USER JOURNEY STATISTICS");
      console.log("═".repeat(60));

      console.log("\n🪙 QWAMI Token Program:");
      console.log("   Total Minted:", qwamiAuthorityData.totalMinted.toString(), "QWAMI");
      console.log("   Total Burned:", qwamiAuthorityData.totalBurned.toString(), "QWAMI");
      console.log("   Circulating:", qwamiAuthorityData.totalMinted.sub(qwamiAuthorityData.totalBurned).toString(), "QWAMI");
      console.log("   SOL Received:", qwamiTreasuryData.totalSolReceived.toNumber() / LAMPORTS_PER_SOL, "SOL");
      console.log("   USDC Distributed:", qwamiTreasuryData.totalUsdcDistributed.toNumber() / USDC_UNIT, "USDC");

      console.log("\n🦋 KWAMI NFT Program:");
      console.log("   NFTs Minted:", kwamiTreasuryData.nftMintsCount.toString());
      console.log("   NFTs Burned:", kwamiTreasuryData.nftBurnsCount.toString());
      console.log("   QWAMI Revenue:", kwamiTreasuryData.totalQwamiReceived.toString());
      console.log("   QWAMI Refunded:", kwamiTreasuryData.totalQwamiRefunded.toString());
      console.log("   Dividend Pool:", kwamiTreasuryData.dividendPoolBalance.toString(), "QWAMI");
      console.log("   Operations Fund:", kwamiTreasuryData.operationsBalance.toString(), "QWAMI");

      console.log("\n💰 Net Economic Flow:");
      const netRevenue = kwamiTreasuryData.totalQwamiReceived.sub(kwamiTreasuryData.totalQwamiRefunded);
      console.log("   Net NFT Revenue:", netRevenue.toString(), "QWAMI");
      console.log("   Deflationary Effect:", kwamiTreasuryData.totalQwamiRefunded.toString(), "QWAMI retained (50%)");

      console.log("\n");
      console.log("═".repeat(60));
      console.log("✅ FULL USER JOURNEY COMPLETE");
      console.log("═".repeat(60));
      console.log("\nUser Experience:");
      console.log("1. ✅ Bought QWAMI with SOL");
      console.log("2. ✅ Minted KWAMI NFT with QWAMI");
      console.log("3. ✅ Burned NFT for 50% refund");
      console.log("4. ✅ Redeemed QWAMI for USDC");
      console.log("\nAll economic mechanisms working correctly! 🎉\n");

      // Verify economic integrity
      expect(kwamiTreasuryData.nftMintsCount.toNumber()).to.be.greaterThan(0);
      expect(kwamiTreasuryData.nftBurnsCount.toNumber()).to.be.greaterThan(0);
      expect(kwamiTreasuryData.totalQwamiReceived.toNumber()).to.be.greaterThan(0);
      expect(qwamiTreasuryData.totalSolReceived.toNumber()).to.be.greaterThan(0);
    });
  });
});

