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

describe("qwami-token-economic (SOL-only)", () => {
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

  const LAMPORTS_PER_SOL = 1_000_000_000;

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

  it("initializes and mints QWAMI by paying SOL (SOL goes to treasury authority wallet)", async () => {
    const payer = (provider.wallet as any).payer as anchor.web3.Keypair;

    // Create mint + PDAs
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

    // Mint must exist off-chain with mint_authority = tokenAuthority PDA
    await createMint(
      provider.connection,
      payer,
      tokenAuthority,
      null,
      0,
      mintKeypair
    );

    // Initialize program state
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

    const treasuryData = await program.account.qwamiTreasury.fetch(treasury);
    expect(treasuryData.authority.toString()).to.equal(provider.wallet.publicKey.toString());
    expect(treasuryData.totalSolReceived.toNumber()).to.equal(0);

    // Fund a separate buyer and mint with SOL
    const buyer = anchor.web3.Keypair.generate();
    const sig = await provider.connection.requestAirdrop(buyer.publicKey, 2 * LAMPORTS_PER_SOL);
    await provider.connection.confirmTransaction(sig, "confirmed");

    const buyerAta = await ensureAta(buyer.publicKey, qwamiMint);

    const solAmount = new anchor.BN(LAMPORTS_PER_SOL); // 1 SOL
    const expectedQwami = "1000";

    const beforeTreasury = await program.account.qwamiTreasury.fetch(treasury);

    await program.methods
      .mintWithSol(solAmount)
      .accounts({
        mint: qwamiMint,
        tokenAuthority,
        treasury,
        treasuryAuthority: provider.wallet.publicKey,
        buyerQwamiAccount: buyerAta,
        buyer: buyer.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .signers([buyer])
      .rpc();

    const bal = await provider.connection.getTokenAccountBalance(buyerAta);
    expect(bal.value.amount).to.equal(expectedQwami);

    const afterTreasury = await program.account.qwamiTreasury.fetch(treasury);
    expect(afterTreasury.totalSolReceived.toString()).to.equal(
      beforeTreasury.totalSolReceived.add(solAmount).toString()
    );
    expect(afterTreasury.qwamiMintsWithSol.toNumber()).to.equal(
      beforeTreasury.qwamiMintsWithSol.toNumber() + 1
    );
  });
});

