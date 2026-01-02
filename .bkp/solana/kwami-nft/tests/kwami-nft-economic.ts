import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { KwamiNft } from "../target/types/kwami_nft";
import { expect } from "chai";
import { createMint, getAssociatedTokenAddress, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { Metaplex } from "@metaplex-foundation/js";
import * as crypto from "crypto";
import * as fs from "fs";
import * as path from "path";

describe("kwami-nft (SOL-paid schedule)", () => {
  const provider = (() => {
    try {
      return anchor.AnchorProvider.env();
    } catch {
      return anchor.AnchorProvider.local();
    }
  })();
  anchor.setProvider(provider);

  const program = (() => {
    try {
      return anchor.workspace.KwamiNft as Program<KwamiNft>;
    } catch {
      const idlPath = path.join(__dirname, "../target/idl/kwami_nft.json");
      const idl = JSON.parse(fs.readFileSync(idlPath, "utf8"));
      const tomlPath = path.join(__dirname, "../Anchor.toml");
      const toml = fs.readFileSync(tomlPath, "utf8");
      const match = toml.match(/kwami_nft\s*=\s*"([^"]+)"/);
      if (!match) throw new Error("Could not find kwami_nft program id in Anchor.toml");
      const programId = new anchor.web3.PublicKey(match[1]);
      return new Program(idl, programId, provider) as Program<KwamiNft>;
    }
  })();

  const metaplex = Metaplex.make(provider.connection);
  const payer = (provider.wallet as any).payer as anchor.web3.Keypair;

  const LAMPORTS_PER_SOL = 1_000_000_000;
  const GEN0_COST_LAMPORTS = 100_000_000; // 0.1 SOL

  it("initializes and mints a KWAMI (Gen #0 cost = 0.1 SOL before Jan 1 2026)", async () => {
    // Create collection mint off-chain with mint authority = collectionAuthority PDA
    const collectionMintKeypair = anchor.web3.Keypair.generate();
    const collectionMint = collectionMintKeypair.publicKey;

    const [collectionAuthority] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("collection-authority"), collectionMint.toBuffer()],
      program.programId
    );
    const [dnaRegistry] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("dna-registry"), collectionMint.toBuffer()],
      program.programId
    );
    const [treasury] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("kwami-treasury")],
      program.programId
    );

    await createMint(
      provider.connection,
      payer,
      collectionAuthority,
      null,
      0,
      collectionMintKeypair
    );

    await program.methods
      .initialize()
      .accounts({
        collectionMint,
        collectionAuthority,
        dnaRegistry,
        treasury,
        payer: provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    // Fund a buyer to mint
    const buyer = anchor.web3.Keypair.generate();
    const sig = await provider.connection.requestAirdrop(buyer.publicKey, 2 * LAMPORTS_PER_SOL);
    await provider.connection.confirmTransaction(sig, "confirmed");

    const nftMint = anchor.web3.Keypair.generate();
    const dnaHash = crypto.randomBytes(32);

    const [kwamiNft] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("kwami-nft"), nftMint.publicKey.toBuffer()],
      program.programId
    );

    const metadataPda = metaplex.nfts().pdas().metadata({ mint: nftMint.publicKey });
    const ownerTokenAccount = await getAssociatedTokenAddress(nftMint.publicKey, buyer.publicKey);

    const beforeTreasury = await program.account.kwamiTreasury.fetch(treasury);

    await program.methods
      .mintKwami(
        Array.from(dnaHash),
        "Test KWAMI",
        "KWAMI",
        "https://arweave.net/test-kwami"
      )
      .accounts({
        mint: nftMint.publicKey,
        kwamiNft,
        collectionAuthority,
        dnaRegistry,
        treasury,
        treasuryAuthority: provider.wallet.publicKey,
        metadata: metadataPda,
        ownerTokenAccount,
        owner: buyer.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: anchor.utils.token.ASSOCIATED_PROGRAM_ID,
        tokenMetadataProgram: new anchor.web3.PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"),
      })
      .signers([buyer, nftMint])
      .rpc();

    const afterTreasury = await program.account.kwamiTreasury.fetch(treasury);
    expect(afterTreasury.totalSolReceived.toNumber()).to.equal(
      beforeTreasury.totalSolReceived.toNumber() + GEN0_COST_LAMPORTS
    );
    expect(afterTreasury.nftMintsCount.toNumber()).to.equal(beforeTreasury.nftMintsCount.toNumber() + 1);

    const nftData = await program.account.kwamiNft.fetch(kwamiNft);
    expect(nftData.mintCostLamports.toNumber()).to.equal(GEN0_COST_LAMPORTS);
    expect(nftData.owner.toString()).to.equal(buyer.publicKey.toString());
  });
});

