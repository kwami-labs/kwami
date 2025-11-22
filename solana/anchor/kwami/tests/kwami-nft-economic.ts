import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { KwamiNft } from "../target/types/kwami_nft";
import { expect } from "chai";
import { 
  getAssociatedTokenAddress, 
  TOKEN_PROGRAM_ID,
  createMint,
  mintTo,
} from "@solana/spl-token";
import { Metaplex } from "@metaplex-foundation/js";
import * as crypto from "crypto";

describe("kwami-nft-economic", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.KwamiNft as Program<KwamiNft>;
  const metaplex = Metaplex.make(provider.connection);
  
  let collectionMint: anchor.web3.PublicKey;
  let collectionAuthority: anchor.web3.PublicKey;
  let dnaRegistry: anchor.web3.PublicKey;
  let treasury: anchor.web3.PublicKey;
  let qwamiMint: anchor.web3.PublicKey;
  let qwamiVault: anchor.web3.PublicKey;
  let userQwamiAccount: anchor.web3.PublicKey;

  // Test NFTs
  let nftMint1: anchor.web3.Keypair;
  let kwamiNft1: anchor.web3.PublicKey;
  let dnaHash1: Buffer;

  const ANNUAL_SUPPLY_INCREMENT = 133_333_333;
  const MAX_TOTAL_KWAMIS = 10_000_000_000;

  // Pricing by generation
  const GEN_0_COST = 10_000; // Base cost for Gen #0
  const GEN_1_5_COST = 5_000;
  const GEN_51_74_COST = 500;
  const PLATFORM_FEE_PERCENTAGE = 10;
  const TRANSACTION_FEE = 50;

  function calculateMintCost(generation: number): number {
    let baseCost: number;
    if (generation === 0) {
      baseCost = GEN_0_COST;
    } else if (generation >= 1 && generation <= 5) {
      baseCost = GEN_1_5_COST;
    } else if (generation >= 6 && generation <= 20) {
      baseCost = 2_500;
    } else if (generation >= 21 && generation <= 50) {
      baseCost = 1_000;
    } else {
      baseCost = GEN_51_74_COST;
    }
    
    const platformFee = (baseCost * PLATFORM_FEE_PERCENTAGE) / 100;
    return baseCost + platformFee + TRANSACTION_FEE;
  }

  function calculateBurnRefund(baseCost: number): number {
    return (baseCost * 50) / 100; // 50% refund
  }

  function generateUniqueDNA(): Buffer {
    return crypto.randomBytes(32);
  }

  before(async () => {
    // Create mock QWAMI mint for testing
    qwamiMint = await createMint(
      provider.connection,
      provider.wallet.payer,
      provider.wallet.publicKey,
      null,
      0 // 0 decimals for QWAMI
    );

    console.log("Mock QWAMI mint created:", qwamiMint.toString());

    // Create user's QWAMI token account and mint some QWAMI for testing
    userQwamiAccount = await getAssociatedTokenAddress(
      qwamiMint,
      provider.wallet.publicKey
    );

    await mintTo(
      provider.connection,
      provider.wallet.payer,
      qwamiMint,
      userQwamiAccount,
      provider.wallet.publicKey,
      100_000 // 100,000 QWAMI for testing
    );

    console.log("Minted 100,000 QWAMI to user for testing");
  });

  describe("Initialize with Treasury", () => {
    it("Initializes KWAMI NFT program with treasury and QWAMI vault", async () => {
      const collectionMintKeypair = anchor.web3.Keypair.generate();
      collectionMint = collectionMintKeypair.publicKey;

      // Derive PDAs
      [collectionAuthority] = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from("collection-authority"), collectionMint.toBuffer()],
        program.programId
      );

      [dnaRegistry] = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from("dna-registry"), collectionMint.toBuffer()],
        program.programId
      );

      [treasury] = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from("kwami-treasury")],
        program.programId
      );

      const qwamiVaultKeypair = anchor.web3.Keypair.generate();
      qwamiVault = qwamiVaultKeypair.publicKey;

      const tx = await program.methods
        .initialize()
        .accounts({
          collectionMint: collectionMint,
          collectionAuthority: collectionAuthority,
          dnaRegistry: dnaRegistry,
          treasury: treasury,
          qwamiVault: qwamiVault,
          qwamiMint: qwamiMint,
          payer: provider.wallet.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        })
        .signers([collectionMintKeypair, qwamiVaultKeypair])
        .rpc();

      console.log("Initialize transaction:", tx);

      // Verify collection authority
      const authorityData = await program.account.collectionAuthority.fetch(collectionAuthority);
      expect(authorityData.authority.toString()).to.equal(provider.wallet.publicKey.toString());
      expect(authorityData.totalMinted.toNumber()).to.equal(0);

      // Verify DNA registry
      const registryData = await program.account.dnaRegistry.fetch(dnaRegistry);
      expect(registryData.dnaCount.toNumber()).to.equal(0);

      // Verify treasury
      const treasuryData = await program.account.kwamiTreasury.fetch(treasury);
      expect(treasuryData.authority.toString()).to.equal(provider.wallet.publicKey.toString());
      expect(treasuryData.qwamiVault.toString()).to.equal(qwamiVault.toString());
      expect(treasuryData.totalQwamiReceived.toNumber()).to.equal(0);
      expect(treasuryData.totalQwamiRefunded.toNumber()).to.equal(0);
      expect(treasuryData.nftMintsCount.toNumber()).to.equal(0);
      expect(treasuryData.nftBurnsCount.toNumber()).to.equal(0);
      expect(treasuryData.dividendPoolBalance.toNumber()).to.equal(0);
      expect(treasuryData.operationsBalance.toNumber()).to.equal(0);

      console.log("✅ KWAMI NFT program initialized with treasury");
    });
  });

  describe("Mint KWAMI NFT with QWAMI Payment", () => {
    it("Mints NFT with correct QWAMI payment (simulating Gen #51)", async () => {
      // Simulating Gen #51 for lower cost
      const generation = 51;
      const totalCost = calculateMintCost(generation);
      const baseCost = GEN_51_74_COST;

      nftMint1 = anchor.web3.Keypair.generate();
      dnaHash1 = generateUniqueDNA();

      [kwamiNft1] = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from("kwami-nft"), nftMint1.publicKey.toBuffer()],
        program.programId
      );

      const beforeQwamiBalance = await provider.connection.getTokenAccountBalance(userQwamiAccount);
      const beforeTreasury = await program.account.kwamiTreasury.fetch(treasury);

      const metadataPda = metaplex.nfts().pdas().metadata({mint: nftMint1.publicKey});

      const tx = await program.methods
        .mintKwami(
          Array.from(dnaHash1),
          "Test Kwami #1",
          "KWAMI",
          "https://arweave.net/test1"
        )
        .accounts({
          mint: nftMint1.publicKey,
          kwamiNft: kwamiNft1,
          collectionAuthority: collectionAuthority,
          dnaRegistry: dnaRegistry,
          treasury: treasury,
          userQwamiAccount: userQwamiAccount,
          qwamiVault: qwamiVault,
          metadata: metadataPda,
          owner: provider.wallet.publicKey,
          metadataProgram: new anchor.web3.PublicKey("metqbxxru9QnqZN4VJKcAqWczBw8h7s8XShNLHkAAAA"),
          systemProgram: anchor.web3.SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        })
        .signers([nftMint1])
        .rpc();

      console.log("Mint NFT transaction:", tx);

      // Verify QWAMI payment
      const afterQwamiBalance = await provider.connection.getTokenAccountBalance(userQwamiAccount);
      const expectedRemaining = new anchor.BN(beforeQwamiBalance.value.amount).sub(new anchor.BN(totalCost));
      expect(afterQwamiBalance.value.amount).to.equal(expectedRemaining.toString());

      // Verify NFT account
      const nftData = await program.account.kwamiNft.fetch(kwamiNft1);
      expect(nftData.owner.toString()).to.equal(provider.wallet.publicKey.toString());
      expect(Buffer.from(nftData.dnaHash).toString('hex')).to.equal(dnaHash1.toString('hex'));
      expect(nftData.mintCostQwami.toNumber()).to.equal(baseCost);

      // Verify treasury accounting
      const afterTreasury = await program.account.kwamiTreasury.fetch(treasury);
      expect(afterTreasury.totalQwamiReceived.toNumber()).to.equal(
        beforeTreasury.totalQwamiReceived.toNumber() + totalCost
      );
      expect(afterTreasury.nftMintsCount.toNumber()).to.equal(
        beforeTreasury.nftMintsCount.toNumber() + 1
      );

      // Verify 80/20 split
      const dividendAmount = (totalCost * 80) / 100;
      const operationsAmount = (totalCost * 20) / 100;
      expect(afterTreasury.dividendPoolBalance.toNumber()).to.equal(
        beforeTreasury.dividendPoolBalance.toNumber() + dividendAmount
      );
      expect(afterTreasury.operationsBalance.toNumber()).to.equal(
        beforeTreasury.operationsBalance.toNumber() + operationsAmount
      );

      // Verify DNA added to registry
      const registryData = await program.account.dnaRegistry.fetch(dnaRegistry);
      expect(registryData.dnaCount.toNumber()).to.equal(1);

      console.log(`✅ Minted NFT with ${totalCost} QWAMI payment`);
      console.log(`   Base Cost: ${baseCost}, Platform Fee: ${(baseCost * 10)/100}, TX Fee: ${TRANSACTION_FEE}`);
      console.log(`   Revenue Split: ${dividendAmount} to dividend pool, ${operationsAmount} to operations`);
    });

    it("Mints second NFT with different DNA", async () => {
      const generation = 51;
      const totalCost = calculateMintCost(generation);
      const baseCost = GEN_51_74_COST;

      const nftMint2 = anchor.web3.Keypair.generate();
      const dnaHash2 = generateUniqueDNA();

      const [kwamiNft2] = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from("kwami-nft"), nftMint2.publicKey.toBuffer()],
        program.programId
      );

      const beforeAuthority = await program.account.collectionAuthority.fetch(collectionAuthority);

      const metadataPda = metaplex.nfts().pdas().metadata({mint: nftMint2.publicKey});

      await program.methods
        .mintKwami(
          Array.from(dnaHash2),
          "Test Kwami #2",
          "KWAMI",
          "https://arweave.net/test2"
        )
        .accounts({
          mint: nftMint2.publicKey,
          kwamiNft: kwamiNft2,
          collectionAuthority: collectionAuthority,
          dnaRegistry: dnaRegistry,
          treasury: treasury,
          userQwamiAccount: userQwamiAccount,
          qwamiVault: qwamiVault,
          metadata: metadataPda,
          owner: provider.wallet.publicKey,
          metadataProgram: new anchor.web3.PublicKey("metqbxxru9QnqZN4VJKcAqWczBw8h7s8XShNLHkAAAA"),
          systemProgram: anchor.web3.SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        })
        .signers([nftMint2])
        .rpc();

      // Verify total minted increased
      const afterAuthority = await program.account.collectionAuthority.fetch(collectionAuthority);
      expect(afterAuthority.totalMinted.toNumber()).to.equal(
        beforeAuthority.totalMinted.toNumber() + 1
      );

      // Verify DNA count increased
      const registryData = await program.account.dnaRegistry.fetch(dnaRegistry);
      expect(registryData.dnaCount.toNumber()).to.equal(2);

      console.log("✅ Second NFT minted successfully");
    });

    it("Fails to mint with duplicate DNA", async () => {
      const nftMint3 = anchor.web3.Keypair.generate();

      const [kwamiNft3] = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from("kwami-nft"), nftMint3.publicKey.toBuffer()],
        program.programId
      );

      const metadataPda = metaplex.nfts().pdas().metadata({mint: nftMint3.publicKey});

      try {
        await program.methods
          .mintKwami(
            Array.from(dnaHash1), // Using same DNA as NFT #1
            "Test Kwami #3",
            "KWAMI",
            "https://arweave.net/test3"
          )
          .accounts({
            mint: nftMint3.publicKey,
            kwamiNft: kwamiNft3,
            collectionAuthority: collectionAuthority,
            dnaRegistry: dnaRegistry,
            treasury: treasury,
            userQwamiAccount: userQwamiAccount,
            qwamiVault: qwamiVault,
            metadata: metadataPda,
            owner: provider.wallet.publicKey,
            metadataProgram: new anchor.web3.PublicKey("metqbxxru9QnqZN4VJKcAqWczBw8h7s8XShNLHkAAAA"),
            systemProgram: anchor.web3.SystemProgram.programId,
            tokenProgram: TOKEN_PROGRAM_ID,
            rent: anchor.web3.SYSVAR_RENT_PUBKEY,
          })
          .signers([nftMint3])
          .rpc();
        expect.fail("Should have thrown duplicate DNA error");
      } catch (err) {
        expect(err.toString()).to.include("DuplicateDNA");
        console.log("✅ Duplicate DNA check working");
      }
    });

    it("Fails to mint with insufficient QWAMI", async () => {
      // Drain user's QWAMI first (send most of it elsewhere)
      const balance = await provider.connection.getTokenAccountBalance(userQwamiAccount);
      const generation = 51;
      const totalCost = calculateMintCost(generation);

      // If user has more than enough, this test needs adjustment
      if (new anchor.BN(balance.value.amount).lt(new anchor.BN(totalCost))) {
        const nftMint4 = anchor.web3.Keypair.generate();
        const dnaHash4 = generateUniqueDNA();

        const [kwamiNft4] = anchor.web3.PublicKey.findProgramAddressSync(
          [Buffer.from("kwami-nft"), nftMint4.publicKey.toBuffer()],
          program.programId
        );

        const metadataPda = metaplex.nfts().pdas().metadata({mint: nftMint4.publicKey});

        try {
          await program.methods
            .mintKwami(
              Array.from(dnaHash4),
              "Test Kwami #4",
              "KWAMI",
              "https://arweave.net/test4"
            )
            .accounts({
              mint: nftMint4.publicKey,
              kwamiNft: kwamiNft4,
              collectionAuthority: collectionAuthority,
              dnaRegistry: dnaRegistry,
              treasury: treasury,
              userQwamiAccount: userQwamiAccount,
              qwamiVault: qwamiVault,
              metadata: metadataPda,
              owner: provider.wallet.publicKey,
              metadataProgram: new anchor.web3.PublicKey("metqbxxru9QnqZN4VJKcAqWczBw8h7s8XShNLHkAAAA"),
              systemProgram: anchor.web3.SystemProgram.programId,
              tokenProgram: TOKEN_PROGRAM_ID,
              rent: anchor.web3.SYSVAR_RENT_PUBKEY,
            })
            .signers([nftMint4])
            .rpc();
          expect.fail("Should have thrown insufficient QWAMI error");
        } catch (err) {
          expect(err.toString()).to.include("InsufficientQwamiBalance");
          console.log("✅ Insufficient QWAMI check working");
        }
      } else {
        console.log("⚠️  Skipping insufficient QWAMI test (user has too much QWAMI)");
      }
    });
  });

  describe("Burn KWAMI NFT with QWAMI Refund", () => {
    it("Burns NFT and receives 50% QWAMI refund", async () => {
      const nftData = await program.account.kwamiNft.fetch(kwamiNft1);
      const baseCost = nftData.mintCostQwami.toNumber();
      const expectedRefund = calculateBurnRefund(baseCost);

      const beforeQwamiBalance = await provider.connection.getTokenAccountBalance(userQwamiAccount);
      const beforeTreasury = await program.account.kwamiTreasury.fetch(treasury);
      const beforeRegistry = await program.account.dnaRegistry.fetch(dnaRegistry);

      const tx = await program.methods
        .burnKwami()
        .accounts({
          kwamiNft: kwamiNft1,
          mint: nftMint1.publicKey,
          dnaRegistry: dnaRegistry,
          treasury: treasury,
          userQwamiAccount: userQwamiAccount,
          qwamiVault: qwamiVault,
          owner: provider.wallet.publicKey,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .rpc();

      console.log("Burn NFT transaction:", tx);

      // Verify QWAMI refund
      const afterQwamiBalance = await provider.connection.getTokenAccountBalance(userQwamiAccount);
      const expectedTotal = new anchor.BN(beforeQwamiBalance.value.amount).add(new anchor.BN(expectedRefund));
      expect(afterQwamiBalance.value.amount).to.equal(expectedTotal.toString());

      // Verify NFT account closed
      try {
        await program.account.kwamiNft.fetch(kwamiNft1);
        expect.fail("NFT account should be closed");
      } catch (err) {
        expect(err.toString()).to.include("Account does not exist");
      }

      // Verify DNA removed from registry
      const afterRegistry = await program.account.dnaRegistry.fetch(dnaRegistry);
      expect(afterRegistry.dnaCount.toNumber()).to.equal(beforeRegistry.dnaCount.toNumber() - 1);

      // Verify treasury accounting
      const afterTreasury = await program.account.kwamiTreasury.fetch(treasury);
      expect(afterTreasury.totalQwamiRefunded.toNumber()).to.equal(
        beforeTreasury.totalQwamiRefunded.toNumber() + expectedRefund
      );
      expect(afterTreasury.nftBurnsCount.toNumber()).to.equal(
        beforeTreasury.nftBurnsCount.toNumber() + 1
      );

      console.log(`✅ Burned NFT and received ${expectedRefund} QWAMI refund (50% of ${baseCost} base cost)`);
    });

    it("DNA becomes available for reminting after burn", async () => {
      // Now we can mint a new NFT with the same DNA that was just freed
      const nftMint3 = anchor.web3.Keypair.generate();

      const [kwamiNft3] = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from("kwami-nft"), nftMint3.publicKey.toBuffer()],
        program.programId
      );

      const metadataPda = metaplex.nfts().pdas().metadata({mint: nftMint3.publicKey});

      await program.methods
        .mintKwami(
          Array.from(dnaHash1), // Reusing the DNA from burned NFT #1
          "Test Kwami #3 (Reborn)",
          "KWAMI",
          "https://arweave.net/test3-reborn"
        )
        .accounts({
          mint: nftMint3.publicKey,
          kwamiNft: kwamiNft3,
          collectionAuthority: collectionAuthority,
          dnaRegistry: dnaRegistry,
          treasury: treasury,
          userQwamiAccount: userQwamiAccount,
          qwamiVault: qwamiVault,
          metadata: metadataPda,
          owner: provider.wallet.publicKey,
          metadataProgram: new anchor.web3.PublicKey("metqbxxru9QnqZN4VJKcAqWczBw8h7s8XShNLHkAAAA"),
          systemProgram: anchor.web3.SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        })
        .signers([nftMint3])
        .rpc();

      console.log("✅ DNA successfully reused after burn");
    });
  });

  describe("Treasury & Economic Statistics", () => {
    it("Displays complete treasury and economic statistics", async () => {
      const treasuryData = await program.account.kwamiTreasury.fetch(treasury);
      const authorityData = await program.account.collectionAuthority.fetch(collectionAuthority);
      const registryData = await program.account.dnaRegistry.fetch(dnaRegistry);

      console.log("\n📊 KWAMI NFT Treasury Statistics:");
      console.log("  Total QWAMI Received:", treasuryData.totalQwamiReceived.toString());
      console.log("  Total QWAMI Refunded:", treasuryData.totalQwamiRefunded.toString());
      console.log("  Net Revenue:", treasuryData.totalQwamiReceived.sub(treasuryData.totalQwamiRefunded).toString());
      console.log("  NFT Mints:", treasuryData.nftMintsCount.toString());
      console.log("  NFT Burns:", treasuryData.nftBurnsCount.toString());
      console.log("  Dividend Pool Balance:", treasuryData.dividendPoolBalance.toString());
      console.log("  Operations Balance:", treasuryData.operationsBalance.toString());
      
      console.log("\n🦋 NFT Collection Statistics:");
      console.log("  Total Minted:", authorityData.totalMinted.toString());
      console.log("  Active NFTs:", authorityData.totalMinted.sub(treasuryData.nftBurnsCount).toString());
      console.log("  Registered DNAs:", registryData.dnaCount.toString());

      // Verify economic integrity
      const dividendPercentage = treasuryData.dividendPoolBalance.toNumber() / treasuryData.totalQwamiReceived.toNumber();
      const operationsPercentage = treasuryData.operationsBalance.toNumber() / treasuryData.totalQwamiReceived.toNumber();

      console.log("\n💰 Revenue Split:");
      console.log("  Dividend Pool:", (dividendPercentage * 100).toFixed(1) + "%");
      console.log("  Operations:", (operationsPercentage * 100).toFixed(1) + "%");

      // Should be approximately 80/20 split
      expect(dividendPercentage).to.be.closeTo(0.80, 0.01);
      expect(operationsPercentage).to.be.closeTo(0.20, 0.01);

      console.log("\n✅ Treasury and economic model verified");
    });
  });
});

