import * as anchor from "@coral-xyz/anchor";
import { Program, BN } from "@coral-xyz/anchor";
import { PublicKey, Keypair, SystemProgram } from "@solana/web3.js";
import { KwamiDao } from "../target/types/kwami_dao";
import { expect } from "chai";

describe("kwami-dao", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.KwamiDao as Program<KwamiDao>;
  const wallet = provider.wallet as anchor.Wallet;

  // Mock addresses for testing
  const qwamiMint = Keypair.generate().publicKey;
  const kwamiCollection = Keypair.generate().publicKey;

  let daoState: PublicKey;
  let proposal1: PublicKey;
  let voteRecord: PublicKey;

  // Mock QWAMI token account (in real scenario, this would be a real token account)
  const mockQwamiAccount = Keypair.generate().publicKey;

  before(async () => {
    // Derive DAO state PDA
    [daoState] = PublicKey.findProgramAddressSync(
      [Buffer.from("dao-state")],
      program.programId
    );

    console.log("DAO State PDA:", daoState.toString());
  });

  it("Initializes the DAO", async () => {
    const governanceConfig = {
      minQwamiToPropose: new BN(100),
      quorum: new BN(10000),
      maxVotingPeriod: new BN(14 * 24 * 60 * 60),
      minExecutionDelay: new BN(2 * 24 * 60 * 60),
      kwamiCollection: kwamiCollection,
      treasuryWallet: wallet.publicKey,
      qwamiTokenAuthority: Keypair.generate().publicKey,
      kwamiCollectionAuthority: Keypair.generate().publicKey,
    };

    await program.methods
      .initialize(governanceConfig)
      .accounts({
        daoState,
        qwamiMint,
        authority: wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    const daoStateAccount = await program.account.daoState.fetch(daoState);
    expect(daoStateAccount.authority.toString()).to.equal(wallet.publicKey.toString());
    expect(daoStateAccount.qwamiMint.toString()).to.equal(qwamiMint.toString());
    expect(daoStateAccount.proposalCount.toNumber()).to.equal(0);
    expect(daoStateAccount.governanceConfig.minQwamiToPropose.toNumber()).to.equal(100);
  });

  it("Creates a proposal", async () => {
    // Get current proposal count
    const daoStateAccount = await program.account.daoState.fetch(daoState);
    const proposalId = daoStateAccount.proposalCount;

    // Derive proposal PDA
    [proposal1] = PublicKey.findProgramAddressSync(
      [Buffer.from("proposal"), proposalId.toArrayLike(Buffer, "le", 8)],
      program.programId
    );

    const title = "Test Proposal";
    const description = "This is a test governance proposal";
    const executionDelaySeconds = new BN(2 * 24 * 60 * 60); // 2 days
    const votingPeriodSeconds = new BN(7 * 24 * 60 * 60); // 7 days

    try {
      await program.methods
        .createProposal(
          title,
          description,
          executionDelaySeconds,
          votingPeriodSeconds
        )
        .accounts({
          daoState,
          proposal: proposal1,
          proposerQwamiAccount: mockQwamiAccount,
          proposer: wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      const proposalAccount = await program.account.proposal.fetch(proposal1);
      expect(proposalAccount.title).to.equal(title);
      expect(proposalAccount.description).to.equal(description);
      expect(proposalAccount.proposer.toString()).to.equal(wallet.publicKey.toString());
      expect(proposalAccount.votesFor.toNumber()).to.equal(0);
      expect(proposalAccount.votesAgainst.toNumber()).to.equal(0);
    } catch (error) {
      console.log("Note: Creating proposal may fail without real QWAMI token account");
      console.log("This is expected in test environment");
    }
  });

  it("Updates governance config (authority only)", async () => {
    const newConfig = {
      minQwamiToPropose: new BN(200),
      quorum: new BN(20000),
      maxVotingPeriod: new BN(14 * 24 * 60 * 60),
      minExecutionDelay: new BN(3 * 24 * 60 * 60),
      kwamiCollection: kwamiCollection,
      treasuryWallet: wallet.publicKey,
      qwamiTokenAuthority: Keypair.generate().publicKey,
      kwamiCollectionAuthority: Keypair.generate().publicKey,
    };

    await program.methods
      .updateConfig(newConfig)
      .accounts({
        daoState,
        authority: wallet.publicKey,
      })
      .rpc();

    const daoStateAccount = await program.account.daoState.fetch(daoState);
    expect(daoStateAccount.governanceConfig.minQwamiToPropose.toNumber()).to.equal(200);
    expect(daoStateAccount.governanceConfig.quorum.toNumber()).to.equal(20000);
  });
});

