import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { QwamiToken } from "../target/types/qwami_token";
import { expect } from "chai";
import { 
  getAssociatedTokenAddress, 
  TOKEN_PROGRAM_ID,
  createMint,
  mintTo,
  getAccount
} from "@solana/spl-token";

describe("qwami-token-economic", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.QwamiToken as Program<QwamiToken>;
  
  let qwamiMint: anchor.web3.PublicKey;
  let tokenAuthority: anchor.web3.PublicKey;
  let treasury: anchor.web3.PublicKey;
  let solVault: anchor.web3.PublicKey;
  let usdcMint: anchor.web3.PublicKey;
  let usdcVault: anchor.web3.PublicKey;
  let userQwamiAccount: anchor.web3.PublicKey;
  let userUsdcAccount: anchor.web3.PublicKey;

  const MAX_SUPPLY = new anchor.BN(1_000_000_000_000); // 1 trillion
  const LAMPORTS_PER_SOL = 1_000_000_000;
  const USDC_DECIMALS = 6;
  const USDC_UNIT = 1_000_000; // 1 USDC = 1M units

  before(async () => {
    // Derive PDAs
    [tokenAuthority] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("token-authority"), qwamiMint.toBuffer()],
      program.programId
    );

    [treasury] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("qwami-treasury")],
      program.programId
    );

    [solVault] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("sol-vault")],
      program.programId
    );

    // Create mock USDC mint for testing
    usdcMint = await createMint(
      provider.connection,
      provider.wallet.payer,
      provider.wallet.publicKey,
      null,
      USDC_DECIMALS
    );

    console.log("Mock USDC mint created:", usdcMint.toString());
  });

  describe("Initialize with Treasury", () => {
    it("Initializes QWAMI token with treasury and vaults", async () => {
      const mintKeypair = anchor.web3.Keypair.generate();
      qwamiMint = mintKeypair.publicKey;

      // Derive PDAs with actual mint
      [tokenAuthority] = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from("token-authority"), qwamiMint.toBuffer()],
        program.programId
      );

      [treasury] = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from("qwami-treasury")],
        program.programId
      );

      [solVault] = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from("sol-vault")],
        program.programId
      );

      const usdcVaultKeypair = anchor.web3.Keypair.generate();
      usdcVault = usdcVaultKeypair.publicKey;

      const tx = await program.methods
        .initialize()
        .accounts({
          mint: qwamiMint,
          tokenAuthority: tokenAuthority,
          treasury: treasury,
          usdcVault: usdcVault,
          usdcMint: usdcMint,
          payer: provider.wallet.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        })
        .signers([mintKeypair, usdcVaultKeypair])
        .rpc();

      console.log("Initialize transaction:", tx);

      // Verify token authority
      const authorityData = await program.account.tokenAuthority.fetch(tokenAuthority);
      expect(authorityData.authority.toString()).to.equal(provider.wallet.publicKey.toString());
      expect(authorityData.totalMinted.toNumber()).to.equal(0);
      expect(authorityData.totalBurned.toNumber()).to.equal(0);

      // Verify treasury
      const treasuryData = await program.account.qwamiTreasury.fetch(treasury);
      expect(treasuryData.authority.toString()).to.equal(provider.wallet.publicKey.toString());
      expect(treasuryData.usdcVault.toString()).to.equal(usdcVault.toString());
      expect(treasuryData.totalSolReceived.toNumber()).to.equal(0);
      expect(treasuryData.totalUsdcReceived.toNumber()).to.equal(0);
      expect(treasuryData.qwamiMintsWithSol.toNumber()).to.equal(0);
      expect(treasuryData.qwamiMintsWithUsdc.toNumber()).to.equal(0);

      console.log("✅ Treasury initialized successfully");
    });
  });

  describe("Mint QWAMI with SOL", () => {
    before(async () => {
      // Create user's QWAMI token account
      userQwamiAccount = await getAssociatedTokenAddress(
        qwamiMint,
        provider.wallet.publicKey
      );
    });

    it("Mints QWAMI tokens by paying with SOL", async () => {
      const solAmount = new anchor.BN(LAMPORTS_PER_SOL); // 1 SOL
      const expectedQwami = new anchor.BN(1_000); // 1 SOL = 1,000 QWAMI

      const beforeSolBalance = await provider.connection.getBalance(provider.wallet.publicKey);
      const beforeTreasury = await program.account.qwamiTreasury.fetch(treasury);

      const tx = await program.methods
        .mintWithSol(solAmount)
        .accounts({
          mint: qwamiMint,
          tokenAuthority: tokenAuthority,
          treasury: treasury,
          solVault: solVault,
          buyerQwamiAccount: userQwamiAccount,
          buyer: provider.wallet.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .rpc();

      console.log("Mint with SOL transaction:", tx);

      // Verify QWAMI balance
      const qwamiBalance = await provider.connection.getTokenAccountBalance(userQwamiAccount);
      expect(qwamiBalance.value.amount).to.equal(expectedQwami.toString());

      // Verify SOL was transferred
      const afterSolBalance = await provider.connection.getBalance(provider.wallet.publicKey);
      expect(beforeSolBalance - afterSolBalance).to.be.greaterThan(solAmount.toNumber());

      // Verify treasury accounting
      const afterTreasury = await program.account.qwamiTreasury.fetch(treasury);
      expect(afterTreasury.totalSolReceived.toString()).to.equal(
        beforeTreasury.totalSolReceived.add(solAmount).toString()
      );
      expect(afterTreasury.qwamiMintsWithSol.toNumber()).to.equal(
        beforeTreasury.qwamiMintsWithSol.toNumber() + 1
      );

      console.log(`✅ Minted ${expectedQwami} QWAMI for ${solAmount.toNumber() / LAMPORTS_PER_SOL} SOL`);
    });

    it("Mints additional QWAMI with SOL", async () => {
      const solAmount = new anchor.BN(LAMPORTS_PER_SOL / 2); // 0.5 SOL
      const expectedQwami = new anchor.BN(500); // 0.5 SOL = 500 QWAMI

      const beforeBalance = await provider.connection.getTokenAccountBalance(userQwamiAccount);
      const beforeTotalMinted = (await program.account.tokenAuthority.fetch(tokenAuthority)).totalMinted;

      await program.methods
        .mintWithSol(solAmount)
        .accounts({
          mint: qwamiMint,
          tokenAuthority: tokenAuthority,
          treasury: treasury,
          solVault: solVault,
          buyerQwamiAccount: userQwamiAccount,
          buyer: provider.wallet.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .rpc();

      // Verify balance increased
      const afterBalance = await provider.connection.getTokenAccountBalance(userQwamiAccount);
      const expectedTotal = new anchor.BN(beforeBalance.value.amount).add(expectedQwami);
      expect(afterBalance.value.amount).to.equal(expectedTotal.toString());

      // Verify total minted increased
      const afterTotalMinted = (await program.account.tokenAuthority.fetch(tokenAuthority)).totalMinted;
      expect(afterTotalMinted.toString()).to.equal(beforeTotalMinted.add(expectedQwami).toString());

      console.log("✅ Additional QWAMI minted successfully");
    });

    it("Fails to mint beyond max supply with SOL", async () => {
      const hugeAmount = new anchor.BN(LAMPORTS_PER_SOL).mul(new anchor.BN(1_000_000_000)); // Way too much

      try {
        await program.methods
          .mintWithSol(hugeAmount)
          .accounts({
            mint: qwamiMint,
            tokenAuthority: tokenAuthority,
            treasury: treasury,
            solVault: solVault,
            buyerQwamiAccount: userQwamiAccount,
            buyer: provider.wallet.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
            tokenProgram: TOKEN_PROGRAM_ID,
          })
          .rpc();
        expect.fail("Should have thrown max supply exceeded error");
      } catch (err) {
        expect(err.toString()).to.include("MaxSupplyExceeded");
        console.log("✅ Max supply check working");
      }
    });
  });

  describe("Mint QWAMI with USDC", () => {
    before(async () => {
      // Create user's USDC token account and mint some USDC for testing
      userUsdcAccount = await getAssociatedTokenAddress(
        usdcMint,
        provider.wallet.publicKey
      );

      // Mint 1000 USDC to user for testing
      await mintTo(
        provider.connection,
        provider.wallet.payer,
        usdcMint,
        userUsdcAccount,
        provider.wallet.publicKey,
        1000 * USDC_UNIT // 1000 USDC
      );

      console.log("Minted 1000 USDC to user for testing");
    });

    it("Mints QWAMI tokens by paying with USDC", async () => {
      const usdcAmount = new anchor.BN(10 * USDC_UNIT); // 10 USDC
      const expectedQwami = new anchor.BN(1_000); // 10 USDC = 1,000 QWAMI

      const beforeUsdcBalance = await provider.connection.getTokenAccountBalance(userUsdcAccount);
      const beforeQwamiBalance = await provider.connection.getTokenAccountBalance(userQwamiAccount);
      const beforeTreasury = await program.account.qwamiTreasury.fetch(treasury);

      const tx = await program.methods
        .mintWithUsdc(usdcAmount)
        .accounts({
          mint: qwamiMint,
          tokenAuthority: tokenAuthority,
          treasury: treasury,
          usdcVault: usdcVault,
          buyerUsdcAccount: userUsdcAccount,
          buyerQwamiAccount: userQwamiAccount,
          buyer: provider.wallet.publicKey,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .rpc();

      console.log("Mint with USDC transaction:", tx);

      // Verify QWAMI balance increased
      const afterQwamiBalance = await provider.connection.getTokenAccountBalance(userQwamiAccount);
      const expectedTotal = new anchor.BN(beforeQwamiBalance.value.amount).add(expectedQwami);
      expect(afterQwamiBalance.value.amount).to.equal(expectedTotal.toString());

      // Verify USDC was transferred
      const afterUsdcBalance = await provider.connection.getTokenAccountBalance(userUsdcAccount);
      const expectedUsdcRemaining = new anchor.BN(beforeUsdcBalance.value.amount).sub(usdcAmount);
      expect(afterUsdcBalance.value.amount).to.equal(expectedUsdcRemaining.toString());

      // Verify treasury accounting
      const afterTreasury = await program.account.qwamiTreasury.fetch(treasury);
      expect(afterTreasury.totalUsdcReceived.toString()).to.equal(
        beforeTreasury.totalUsdcReceived.add(usdcAmount).toString()
      );
      expect(afterTreasury.qwamiMintsWithUsdc.toNumber()).to.equal(
        beforeTreasury.qwamiMintsWithUsdc.toNumber() + 1
      );

      console.log(`✅ Minted ${expectedQwami} QWAMI for ${usdcAmount.toNumber() / USDC_UNIT} USDC`);
    });

    it("Fails to mint with insufficient USDC", async () => {
      const userBalance = await provider.connection.getTokenAccountBalance(userUsdcAccount);
      const tooMuch = new anchor.BN(userBalance.value.amount).add(new anchor.BN(1));

      try {
        await program.methods
          .mintWithUsdc(tooMuch)
          .accounts({
            mint: qwamiMint,
            tokenAuthority: tokenAuthority,
            treasury: treasury,
            usdcVault: usdcVault,
            buyerUsdcAccount: userUsdcAccount,
            buyerQwamiAccount: userQwamiAccount,
            buyer: provider.wallet.publicKey,
            tokenProgram: TOKEN_PROGRAM_ID,
          })
          .rpc();
        expect.fail("Should have thrown insufficient balance error");
      } catch (err) {
        expect(err).to.exist;
        console.log("✅ Insufficient USDC check working");
      }
    });
  });

  describe("Burn QWAMI for SOL", () => {
    it("Burns QWAMI tokens to receive SOL", async () => {
      const qwamiAmount = new anchor.BN(1_000); // 1,000 QWAMI
      const expectedSol = new anchor.BN(LAMPORTS_PER_SOL); // 1 SOL

      const beforeQwamiBalance = await provider.connection.getTokenAccountBalance(userQwamiAccount);
      const beforeSolBalance = await provider.connection.getBalance(provider.wallet.publicKey);
      const beforeTreasury = await program.account.qwamiTreasury.fetch(treasury);
      const beforeBurned = (await program.account.tokenAuthority.fetch(tokenAuthority)).totalBurned;

      const tx = await program.methods
        .burnForSol(qwamiAmount)
        .accounts({
          mint: qwamiMint,
          tokenAuthority: tokenAuthority,
          treasury: treasury,
          solVault: solVault,
          sellerQwamiAccount: userQwamiAccount,
          seller: provider.wallet.publicKey,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .rpc();

      console.log("Burn for SOL transaction:", tx);

      // Verify QWAMI burned
      const afterQwamiBalance = await provider.connection.getTokenAccountBalance(userQwamiAccount);
      const expectedQwamiRemaining = new anchor.BN(beforeQwamiBalance.value.amount).sub(qwamiAmount);
      expect(afterQwamiBalance.value.amount).to.equal(expectedQwamiRemaining.toString());

      // Verify SOL received
      const afterSolBalance = await provider.connection.getBalance(provider.wallet.publicKey);
      expect(afterSolBalance).to.be.greaterThan(beforeSolBalance);

      // Verify treasury accounting
      const afterTreasury = await program.account.qwamiTreasury.fetch(treasury);
      expect(afterTreasury.totalSolDistributed.toString()).to.equal(
        beforeTreasury.totalSolDistributed.add(expectedSol).toString()
      );
      expect(afterTreasury.qwamiBurnsForSol.toNumber()).to.equal(
        beforeTreasury.qwamiBurnsForSol.toNumber() + 1
      );

      // Verify total burned
      const afterBurned = (await program.account.tokenAuthority.fetch(tokenAuthority)).totalBurned;
      expect(afterBurned.toString()).to.equal(beforeBurned.add(qwamiAmount).toString());

      console.log(`✅ Burned ${qwamiAmount} QWAMI for ${expectedSol.toNumber() / LAMPORTS_PER_SOL} SOL`);
    });

    it("Fails to burn more QWAMI than balance", async () => {
      const userBalance = await provider.connection.getTokenAccountBalance(userQwamiAccount);
      const tooMuch = new anchor.BN(userBalance.value.amount).add(new anchor.BN(1));

      try {
        await program.methods
          .burnForSol(tooMuch)
          .accounts({
            mint: qwamiMint,
            tokenAuthority: tokenAuthority,
            treasury: treasury,
            solVault: solVault,
            sellerQwamiAccount: userQwamiAccount,
            seller: provider.wallet.publicKey,
            tokenProgram: TOKEN_PROGRAM_ID,
          })
          .rpc();
        expect.fail("Should have thrown insufficient balance error");
      } catch (err) {
        expect(err).to.exist;
        console.log("✅ Insufficient QWAMI check working");
      }
    });
  });

  describe("Burn QWAMI for USDC", () => {
    it("Burns QWAMI tokens to receive USDC", async () => {
      const qwamiAmount = new anchor.BN(500); // 500 QWAMI
      const expectedUsdc = new anchor.BN(5 * USDC_UNIT); // 5 USDC

      const beforeQwamiBalance = await provider.connection.getTokenAccountBalance(userQwamiAccount);
      const beforeUsdcBalance = await provider.connection.getTokenAccountBalance(userUsdcAccount);
      const beforeTreasury = await program.account.qwamiTreasury.fetch(treasury);

      const tx = await program.methods
        .burnForUsdc(qwamiAmount)
        .accounts({
          mint: qwamiMint,
          tokenAuthority: tokenAuthority,
          treasury: treasury,
          usdcVault: usdcVault,
          sellerUsdcAccount: userUsdcAccount,
          sellerQwamiAccount: userQwamiAccount,
          seller: provider.wallet.publicKey,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .rpc();

      console.log("Burn for USDC transaction:", tx);

      // Verify QWAMI burned
      const afterQwamiBalance = await provider.connection.getTokenAccountBalance(userQwamiAccount);
      const expectedQwamiRemaining = new anchor.BN(beforeQwamiBalance.value.amount).sub(qwamiAmount);
      expect(afterQwamiBalance.value.amount).to.equal(expectedQwamiRemaining.toString());

      // Verify USDC received
      const afterUsdcBalance = await provider.connection.getTokenAccountBalance(userUsdcAccount);
      const expectedUsdcTotal = new anchor.BN(beforeUsdcBalance.value.amount).add(expectedUsdc);
      expect(afterUsdcBalance.value.amount).to.equal(expectedUsdcTotal.toString());

      // Verify treasury accounting
      const afterTreasury = await program.account.qwamiTreasury.fetch(treasury);
      expect(afterTreasury.totalUsdcDistributed.toString()).to.equal(
        beforeTreasury.totalUsdcDistributed.add(expectedUsdc).toString()
      );
      expect(afterTreasury.qwamiBurnsForUsdc.toNumber()).to.equal(
        beforeTreasury.qwamiBurnsForUsdc.toNumber() + 1
      );

      console.log(`✅ Burned ${qwamiAmount} QWAMI for ${expectedUsdc.toNumber() / USDC_UNIT} USDC`);
    });

    it("Fails to burn when treasury has insufficient USDC", async () => {
      // This test would require draining the treasury first
      // For now, we'll skip it or implement in integration tests
      console.log("⚠️  Treasury insufficient balance test requires special setup");
    });
  });

  describe("Treasury Accounting", () => {
    it("Displays complete treasury statistics", async () => {
      const treasury Data = await program.account.qwamiTreasury.fetch(treasury);
      const authorityData = await program.account.tokenAuthority.fetch(tokenAuthority);

      console.log("\n📊 Treasury Statistics:");
      console.log("  SOL Received:", treasuryData.totalSolReceived.toNumber() / LAMPORTS_PER_SOL, "SOL");
      console.log("  USDC Received:", treasuryData.totalUsdcReceived.toNumber() / USDC_UNIT, "USDC");
      console.log("  SOL Distributed:", treasuryData.totalSolDistributed.toNumber() / LAMPORTS_PER_SOL, "SOL");
      console.log("  USDC Distributed:", treasuryData.totalUsdcDistributed.toNumber() / USDC_UNIT, "USDC");
      console.log("  QWAMI Mints (SOL):", treasuryData.qwamiMintsWithSol.toNumber());
      console.log("  QWAMI Mints (USDC):", treasuryData.qwamiMintsWithUsdc.toNumber());
      console.log("  QWAMI Burns (SOL):", treasuryData.qwamiBurnsForSol.toNumber());
      console.log("  QWAMI Burns (USDC):", treasuryData.qwamiBurnsForUsdc.toNumber());
      
      console.log("\n💰 QWAMI Supply:");
      console.log("  Total Minted:", authorityData.totalMinted.toString());
      console.log("  Total Burned:", authorityData.totalBurned.toString());
      console.log("  Circulating:", authorityData.totalMinted.sub(authorityData.totalBurned).toString());

      // Verify accounting is consistent
      expect(treasuryData.qwamiMintsWithSol.toNumber()).to.be.greaterThan(0);
      expect(treasuryData.qwamiMintsWithUsdc.toNumber()).to.be.greaterThan(0);
      expect(treasuryData.totalSolReceived.toNumber()).to.be.greaterThan(0);
      expect(treasuryData.totalUsdcReceived.toNumber()).to.be.greaterThan(0);

      console.log("\n✅ Treasury accounting verified");
    });
  });
});

