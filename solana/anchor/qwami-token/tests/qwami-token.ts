import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { QwamiToken } from "../target/types/qwami_token";
import { expect } from "chai";
import { getAssociatedTokenAddress, TOKEN_PROGRAM_ID } from "@solana/spl-token";

describe("qwami-token", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.QwamiToken as Program<QwamiToken>;
  
  let mint: anchor.web3.PublicKey;
  let authority: anchor.web3.PublicKey;
  let tokenAccount: anchor.web3.PublicKey;

  const MAX_SUPPLY = new anchor.BN(1_000_000_000_000).mul(new anchor.BN(1_000_000_000)); // 1T tokens * 10^9 decimals
  const DECIMALS = 9;
  const BASE_PRICE_USD_CENTS = new anchor.BN(1); // $0.01

  before(async () => {
    // Derive PDAs
    [authority] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("authority")],
      program.programId
    );

    [mint] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("mint")],
      program.programId
    );

    // Get associated token account for provider
    tokenAccount = await getAssociatedTokenAddress(
      mint,
      provider.wallet.publicKey
    );
  });

  describe("Initialize", () => {
    it("Initializes the QWAMI token", async () => {
      const tx = await program.methods
        .initialize()
        .accounts({
          authority: authority,
          mint: mint,
          payer: provider.wallet.publicKey,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();

      console.log("Initialize transaction signature:", tx);

      // Verify authority account
      const authorityAccount = await program.account.qwamiTokenAuthority.fetch(authority);
      expect(authorityAccount.authority.toString()).to.equal(provider.wallet.publicKey.toString());
      expect(authorityAccount.totalMinted.toString()).to.equal("0");
      expect(authorityAccount.totalBurned.toString()).to.equal("0");
      expect(authorityAccount.basePriceUsdCents.toString()).to.equal(BASE_PRICE_USD_CENTS.toString());

      // Verify mint account
      const mintInfo = await provider.connection.getParsedAccountInfo(mint);
      const mintData = (mintInfo.value.data as any).parsed.info;
      expect(mintData.decimals).to.equal(DECIMALS);
      expect(mintData.supply).to.equal("0");
      expect(mintData.mintAuthority).to.equal(authority.toString());
    });

    it("Fails to initialize twice", async () => {
      try {
        await program.methods
          .initialize()
          .accounts({
            authority: authority,
            mint: mint,
            payer: provider.wallet.publicKey,
            tokenProgram: TOKEN_PROGRAM_ID,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .rpc();
        expect.fail("Should have thrown an error");
      } catch (err) {
        expect(err).to.exist;
      }
    });
  });

  describe("Mint Tokens", () => {
    it("Mints tokens to user account", async () => {
      const amount = new anchor.BN(1_000_000).mul(new anchor.BN(1_000_000_000)); // 1M tokens

      const tx = await program.methods
        .mintTokens(amount)
        .accounts({
          authority: authority,
          mint: mint,
          destination: tokenAccount,
          payer: provider.wallet.publicKey,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: anchor.utils.token.ASSOCIATED_PROGRAM_ID,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();

      console.log("Mint tokens transaction signature:", tx);

      // Verify token balance
      const balance = await provider.connection.getTokenAccountBalance(tokenAccount);
      expect(balance.value.amount).to.equal(amount.toString());

      // Verify total minted tracking
      const authorityAccount = await program.account.qwamiTokenAuthority.fetch(authority);
      expect(authorityAccount.totalMinted.toString()).to.equal(amount.toString());
    });

    it("Mints additional tokens", async () => {
      const amount = new anchor.BN(500_000).mul(new anchor.BN(1_000_000_000)); // 500K tokens

      const beforeBalance = await provider.connection.getTokenAccountBalance(tokenAccount);
      const beforeMinted = (await program.account.qwamiTokenAuthority.fetch(authority)).totalMinted;

      await program.methods
        .mintTokens(amount)
        .accounts({
          authority: authority,
          mint: mint,
          destination: tokenAccount,
          payer: provider.wallet.publicKey,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: anchor.utils.token.ASSOCIATED_PROGRAM_ID,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();

      // Verify token balance increased
      const afterBalance = await provider.connection.getTokenAccountBalance(tokenAccount);
      const expectedBalance = new anchor.BN(beforeBalance.value.amount).add(amount);
      expect(afterBalance.value.amount).to.equal(expectedBalance.toString());

      // Verify total minted increased
      const afterMinted = (await program.account.qwamiTokenAuthority.fetch(authority)).totalMinted;
      const expectedMinted = beforeMinted.add(amount);
      expect(afterMinted.toString()).to.equal(expectedMinted.toString());
    });

    it("Fails to mint beyond max supply", async () => {
      // Try to mint more than max supply
      const amount = MAX_SUPPLY.add(new anchor.BN(1));

      try {
        await program.methods
          .mintTokens(amount)
          .accounts({
            authority: authority,
            mint: mint,
            destination: tokenAccount,
            payer: provider.wallet.publicKey,
            tokenProgram: TOKEN_PROGRAM_ID,
            associatedTokenProgram: anchor.utils.token.ASSOCIATED_PROGRAM_ID,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .rpc();
        expect.fail("Should have thrown max supply exceeded error");
      } catch (err) {
        expect(err.toString()).to.include("MaxSupplyExceeded");
      }
    });
  });

  describe("Burn Tokens", () => {
    it("Burns tokens from user account", async () => {
      const burnAmount = new anchor.BN(100_000).mul(new anchor.BN(1_000_000_000)); // 100K tokens

      const beforeBalance = await provider.connection.getTokenAccountBalance(tokenAccount);
      const beforeBurned = (await program.account.qwamiTokenAuthority.fetch(authority)).totalBurned;

      const tx = await program.methods
        .burnTokens(burnAmount)
        .accounts({
          authority: authority,
          mint: mint,
          from: tokenAccount,
          owner: provider.wallet.publicKey,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .rpc();

      console.log("Burn tokens transaction signature:", tx);

      // Verify token balance decreased
      const afterBalance = await provider.connection.getTokenAccountBalance(tokenAccount);
      const expectedBalance = new anchor.BN(beforeBalance.value.amount).sub(burnAmount);
      expect(afterBalance.value.amount).to.equal(expectedBalance.toString());

      // Verify total burned increased
      const afterBurned = (await program.account.qwamiTokenAuthority.fetch(authority)).totalBurned;
      const expectedBurned = beforeBurned.add(burnAmount);
      expect(afterBurned.toString()).to.equal(expectedBurned.toString());
    });

    it("Fails to burn more than balance", async () => {
      const balance = await provider.connection.getTokenAccountBalance(tokenAccount);
      const burnAmount = new anchor.BN(balance.value.amount).add(new anchor.BN(1));

      try {
        await program.methods
          .burnTokens(burnAmount)
          .accounts({
            authority: authority,
            mint: mint,
            from: tokenAccount,
            owner: provider.wallet.publicKey,
            tokenProgram: TOKEN_PROGRAM_ID,
          })
          .rpc();
        expect.fail("Should have thrown insufficient balance error");
      } catch (err) {
        expect(err).to.exist;
      }
    });
  });

  describe("Update Base Price", () => {
    it("Updates the base price", async () => {
      const newPrice = new anchor.BN(2); // $0.02

      const tx = await program.methods
        .updateBasePrice(newPrice)
        .accounts({
          authority: authority,
          owner: provider.wallet.publicKey,
        })
        .rpc();

      console.log("Update base price transaction signature:", tx);

      // Verify price updated
      const authorityAccount = await program.account.qwamiTokenAuthority.fetch(authority);
      expect(authorityAccount.basePriceUsdCents.toString()).to.equal(newPrice.toString());
    });

    it("Fails to update price from non-authority", async () => {
      const newPrice = new anchor.BN(3);
      const wrongWallet = anchor.web3.Keypair.generate();

      try {
        await program.methods
          .updateBasePrice(newPrice)
          .accounts({
            authority: authority,
            owner: wrongWallet.publicKey,
          })
          .signers([wrongWallet])
          .rpc();
        expect.fail("Should have thrown unauthorized error");
      } catch (err) {
        expect(err).to.exist;
      }
    });
  });

  describe("Transfer Authority", () => {
    it("Transfers authority to new wallet", async () => {
      const newAuthority = anchor.web3.Keypair.generate();

      const tx = await program.methods
        .transferAuthority(newAuthority.publicKey)
        .accounts({
          authority: authority,
          currentAuthority: provider.wallet.publicKey,
        })
        .rpc();

      console.log("Transfer authority transaction signature:", tx);

      // Verify authority changed
      const authorityAccount = await program.account.qwamiTokenAuthority.fetch(authority);
      expect(authorityAccount.authority.toString()).to.equal(newAuthority.publicKey.toString());
    });
  });

  describe("Statistics", () => {
    it("Tracks supply statistics correctly", async () => {
      const authorityAccount = await program.account.qwamiTokenAuthority.fetch(authority);
      
      console.log("Supply Statistics:");
      console.log("  Total Minted:", authorityAccount.totalMinted.toString());
      console.log("  Total Burned:", authorityAccount.totalBurned.toString());
      console.log("  Circulating:", authorityAccount.totalMinted.sub(authorityAccount.totalBurned).toString());
      console.log("  Base Price:", `$0.${authorityAccount.basePriceUsdCents.toString().padStart(2, '0')}`);

      // Verify circulating supply matches on-chain mint supply
      const mintInfo = await provider.connection.getParsedAccountInfo(mint);
      const supply = (mintInfo.value.data as any).parsed.info.supply;
      const circulating = authorityAccount.totalMinted.sub(authorityAccount.totalBurned);
      expect(supply).to.equal(circulating.toString());
    });
  });
});
