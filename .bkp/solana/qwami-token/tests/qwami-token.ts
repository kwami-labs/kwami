import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { QwamiToken } from "../target/types/qwami_token";
import { expect } from "chai";
import {
  TOKEN_PROGRAM_ID,
  createMint,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
} from "@solana/spl-token";
import * as fs from "fs";
import * as path from "path";

describe("qwami-token", () => {
  const provider = (() => {
    try {
      return anchor.AnchorProvider.env();
    } catch {
      // Allows running via ts-mocha when ANCHOR_PROVIDER_URL isn't set.
      // Requires a local validator running at http://127.0.0.1:8899.
      return anchor.AnchorProvider.local();
    }
  })();
  anchor.setProvider(provider);

  const program = (() => {
    try {
      return anchor.workspace.QwamiToken as Program<QwamiToken>;
    } catch {
      const idlPath = path.join(__dirname, "../target/idl/qwami_token.json");
      const idl = JSON.parse(fs.readFileSync(idlPath, "utf8"));
      const tomlPath = path.join(__dirname, "../Anchor.toml");
      const toml = fs.readFileSync(tomlPath, "utf8");
      const match = toml.match(/qwami_token\s*=\s*"([^"]+)"/);
      if (!match) throw new Error("Could not find qwami_token program id in Anchor.toml");
      const programId = new anchor.web3.PublicKey(match[1]);
      return new Program(idl, programId, provider) as Program<QwamiToken>;
    }
  })();
  
  let qwamiMint: anchor.web3.PublicKey;
  let tokenAuthority: anchor.web3.PublicKey;
  let treasury: anchor.web3.PublicKey;
  let providerAta: anchor.web3.PublicKey;

  const BASE_PRICE_USD_CENTS = new anchor.BN(1); // $0.01

  async function ensureAta(owner: anchor.web3.PublicKey, mint: anchor.web3.PublicKey) {
    const ata = await getAssociatedTokenAddress(mint, owner);
    const info = await provider.connection.getAccountInfo(ata);
    if (!info) {
      const ix = createAssociatedTokenAccountInstruction(
        provider.wallet.publicKey,
        ata,
        owner,
        mint
      );
      const tx = new anchor.web3.Transaction().add(ix);
      await provider.sendAndConfirm(tx);
    }
    return ata;
  }

  describe("Initialize", () => {
    it("Initializes SOL-only QWAMI program state", async () => {
      const payer = (provider.wallet as any).payer as anchor.web3.Keypair;

      const mintKeypair = anchor.web3.Keypair.generate();
      qwamiMint = mintKeypair.publicKey;

      [tokenAuthority] = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from("token-authority"), qwamiMint.toBuffer()],
        program.programId
      );
      [treasury] = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from("qwami-treasury")],
        program.programId
      );

      await createMint(
        provider.connection,
        payer,
        tokenAuthority,
        null,
        0,
        mintKeypair
      );

      await program.methods
        .initialize()
        .accounts({
          mint: qwamiMint,
          tokenAuthority,
          treasury,
          payer: provider.wallet.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .rpc();

      const authorityAccount = await program.account.tokenAuthority.fetch(tokenAuthority);
      expect(authorityAccount.authority.toString()).to.equal(provider.wallet.publicKey.toString());
      expect(authorityAccount.totalMinted.toString()).to.equal("0");
      expect(authorityAccount.totalBurned.toString()).to.equal("0");
      expect(authorityAccount.basePriceUsdCents.toString()).to.equal(BASE_PRICE_USD_CENTS.toString());

      providerAta = await ensureAta(provider.wallet.publicKey, qwamiMint);
    });
  });

  describe("Mint Tokens", () => {
    it("Mints tokens to user account", async () => {
      const amount = new anchor.BN(1_000_000); // 1M tokens (integer)

      const tx = await program.methods
        .mintTokens(amount)
        .accounts({
          mint: qwamiMint,
          tokenAuthority,
          destination: providerAta,
          authority: provider.wallet.publicKey,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .rpc();

      console.log("Mint tokens transaction signature:", tx);

      // Verify token balance
      const balance = await provider.connection.getTokenAccountBalance(providerAta);
      expect(balance.value.amount).to.equal(amount.toString());

      // Verify total minted tracking
      const authorityAccount = await program.account.tokenAuthority.fetch(tokenAuthority);
      expect(authorityAccount.totalMinted.toString()).to.equal(amount.toString());
    });
  });

  describe("Burn Tokens", () => {
    it("Burns tokens from user account", async () => {
      const burnAmount = new anchor.BN(100_000); // 100K tokens (integer)

      const beforeBalance = await provider.connection.getTokenAccountBalance(providerAta);
      const beforeBurned = (await program.account.tokenAuthority.fetch(tokenAuthority)).totalBurned;

      const tx = await program.methods
        .burnTokens(burnAmount)
        .accounts({
          mint: qwamiMint,
          tokenAuthority,
          source: providerAta,
          owner: provider.wallet.publicKey,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .rpc();

      console.log("Burn tokens transaction signature:", tx);

      // Verify token balance decreased
      const afterBalance = await provider.connection.getTokenAccountBalance(providerAta);
      const expectedBalance = new anchor.BN(beforeBalance.value.amount).sub(burnAmount);
      expect(afterBalance.value.amount).to.equal(expectedBalance.toString());

      // Verify total burned increased
      const afterBurned = (await program.account.tokenAuthority.fetch(tokenAuthority)).totalBurned;
      const expectedBurned = beforeBurned.add(burnAmount);
      expect(afterBurned.toString()).to.equal(expectedBurned.toString());
    });
  });

  describe("Update Base Price", () => {
    it("Updates the base price", async () => {
      const newPrice = new anchor.BN(2); // $0.02

      const tx = await program.methods
        .updateBasePrice(newPrice)
        .accounts({
          tokenAuthority,
          authority: provider.wallet.publicKey,
        })
        .rpc();

      console.log("Update base price transaction signature:", tx);

      // Verify price updated
      const authorityAccount = await program.account.tokenAuthority.fetch(tokenAuthority);
      expect(authorityAccount.basePriceUsdCents.toString()).to.equal(newPrice.toString());
    });

    it("Fails to update price from non-authority", async () => {
      const newPrice = new anchor.BN(3);
      const wrongWallet = anchor.web3.Keypair.generate();

      try {
        await program.methods
          .updateBasePrice(newPrice)
          .accounts({
            tokenAuthority,
            authority: wrongWallet.publicKey,
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
          tokenAuthority,
          authority: provider.wallet.publicKey,
        })
        .rpc();

      console.log("Transfer authority transaction signature:", tx);

      // Verify authority changed
      const authorityAccount = await program.account.tokenAuthority.fetch(tokenAuthority);
      expect(authorityAccount.authority.toString()).to.equal(newAuthority.publicKey.toString());
    });
  });

  describe("Statistics", () => {
    it("Tracks supply statistics correctly", async () => {
      const authorityAccount = await program.account.tokenAuthority.fetch(tokenAuthority);
      
      console.log("Supply Statistics:");
      console.log("  Total Minted:", authorityAccount.totalMinted.toString());
      console.log("  Total Burned:", authorityAccount.totalBurned.toString());
      console.log("  Circulating:", authorityAccount.totalMinted.sub(authorityAccount.totalBurned).toString());
      console.log("  Base Price:", `$0.${authorityAccount.basePriceUsdCents.toString().padStart(2, '0')}`);

      // Verify circulating supply matches on-chain mint supply
      const mintInfo = await provider.connection.getParsedAccountInfo(qwamiMint);
      const supply = (mintInfo.value.data as any).parsed.info.supply;
      const circulating = authorityAccount.totalMinted.sub(authorityAccount.totalBurned);
      expect(supply).to.equal(circulating.toString());
    });
  });
});
