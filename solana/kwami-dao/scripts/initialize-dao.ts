import * as anchor from "@coral-xyz/anchor";
import { Program, BN } from "@coral-xyz/anchor";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { KwamiDao } from "../target/types/kwami_dao";
import fs from "fs";
import path from "path";

async function main() {
  // Configure the client to use the desired cluster
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.KwamiDao as Program<KwamiDao>;
  const wallet = provider.wallet as anchor.Wallet;
  
  const rpc = provider.connection.rpcEndpoint;
  const cluster =
    rpc.includes("localhost") || rpc.includes("127.0.0.1") ? "localnet"
    : rpc.includes("devnet") ? "devnet"
    : rpc.includes("testnet") ? "testnet"
    : rpc.includes("mainnet") ? "mainnet"
    : (process.argv[2] || "unknown");

  console.log("\n🚀 KWAMI DAO - Initialization Script");
  console.log("=====================================\n");
  console.log(`Program ID: ${program.programId.toString()}`);
  console.log(`Cluster: ${cluster}`);
  console.log(`Wallet: ${wallet.publicKey.toString()}\n`);

  // Load QWAMI mint address from qwami-token <cluster>-addresses.json
  const qwamiAddressesPath = path.join(__dirname, `../../qwami-token/${cluster}-addresses.json`);
  let qwamiMint: PublicKey;
  let qwamiTokenAuthority: PublicKey;
  
  if (fs.existsSync(qwamiAddressesPath)) {
    const qwamiAddresses = JSON.parse(fs.readFileSync(qwamiAddressesPath, "utf-8"));
    qwamiMint = new PublicKey(qwamiAddresses.qwamiMint);
    qwamiTokenAuthority = new PublicKey(qwamiAddresses.tokenAuthority);
    console.log(`✅ Loaded QWAMI Mint: ${qwamiMint.toString()}`);
    console.log(`✅ Loaded QWAMI TokenAuthority: ${qwamiTokenAuthority.toString()}`);
  } else {
    console.error("❌ QWAMI addresses file not found. Please deploy qwami-token first.");
    process.exit(1);
  }

  // Load KWAMI collection address from kwami-nft <cluster>-addresses.json
  const kwamiAddressesPath = path.join(__dirname, `../../kwami-nft/${cluster}-addresses.json`);
  let kwamiCollection: PublicKey;
  let kwamiCollectionAuthority: PublicKey;
  
  if (fs.existsSync(kwamiAddressesPath)) {
    const kwamiAddresses = JSON.parse(fs.readFileSync(kwamiAddressesPath, "utf-8"));
    kwamiCollection = new PublicKey(kwamiAddresses.collectionMint);
    kwamiCollectionAuthority = new PublicKey(kwamiAddresses.collectionAuthority);
    console.log(`✅ Loaded KWAMI Collection: ${kwamiCollection.toString()}`);
    console.log(`✅ Loaded KWAMI CollectionAuthority: ${kwamiCollectionAuthority.toString()}`);
  } else {
    console.error("❌ KWAMI addresses file not found. Please deploy kwami-nft first.");
    process.exit(1);
  }

  // Derive DAO state PDA
  const [daoState] = PublicKey.findProgramAddressSync(
    [Buffer.from("dao-state")],
    program.programId
  );

  console.log(`\n📋 Derived Accounts:`);
  console.log(`DAO State PDA: ${daoState.toString()}`);

  // Check if already initialized
  try {
    const existingState = await program.account.daoState.fetch(daoState);
    console.log("\n⚠️  DAO already initialized!");
    console.log(`Authority: ${existingState.authority.toString()}`);
    console.log(`Proposal Count: ${existingState.proposalCount.toString()}`);
    console.log(`Min QWAMI to Propose: ${existingState.governanceConfig.minQwamiToPropose.toString()}`);
    console.log(`Quorum: ${existingState.governanceConfig.quorum.toString()}`);
    
    // Save addresses
    saveAddresses(cluster, daoState, qwamiMint, kwamiCollection, wallet.publicKey, qwamiTokenAuthority, kwamiCollectionAuthority);
    return;
  } catch (e) {
    console.log("\n✨ Initializing DAO for the first time...");
  }

  // Governance configuration
  const governanceConfig = {
    minQwamiToPropose: new BN(100),      // 100 QWAMI minimum to create proposals
    quorum: new BN(10000),                // 10,000 QWAMI minimum for quorum
    maxVotingPeriod: new BN(14 * 24 * 60 * 60), // 14 days max voting period
    minExecutionDelay: new BN(2 * 24 * 60 * 60), // 2 days minimum execution delay
    kwamiCollection: kwamiCollection,
    treasuryWallet: wallet.publicKey,
    qwamiTokenAuthority: qwamiTokenAuthority,
    kwamiCollectionAuthority: kwamiCollectionAuthority,
  };

  console.log("\n⚙️  Governance Configuration:");
  console.log(`- Min QWAMI to Propose: ${governanceConfig.minQwamiToPropose.toString()}`);
  console.log(`- Quorum: ${governanceConfig.quorum.toString()}`);
  console.log(`- Max Voting Period: ${governanceConfig.maxVotingPeriod.toNumber() / 86400} days`);
  console.log(`- Min Execution Delay: ${governanceConfig.minExecutionDelay.toNumber() / 86400} days`);

  try {
    // Initialize DAO
    console.log("\n🔄 Sending initialization transaction...");
    const tx = await program.methods
      .initialize(governanceConfig)
      .accounts({
        daoState,
        qwamiMint,
        authority: wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    console.log(`✅ DAO initialized successfully!`);
    console.log(`Transaction: ${tx}`);
    console.log(`Explorer: https://explorer.solana.com/tx/${tx}?cluster=${cluster}`);

    // Verify initialization
    const daoStateAccount = await program.account.daoState.fetch(daoState);
    console.log("\n✅ Verification:");
    console.log(`Authority: ${daoStateAccount.authority.toString()}`);
    console.log(`QWAMI Mint: ${daoStateAccount.qwamiMint.toString()}`);
    console.log(`KWAMI Collection: ${daoStateAccount.kwamiCollection.toString()}`);
    console.log(`Proposal Count: ${daoStateAccount.proposalCount.toString()}`);

    // Save addresses
    saveAddresses(cluster, daoState, qwamiMint, kwamiCollection, wallet.publicKey, qwamiTokenAuthority, kwamiCollectionAuthority);

    console.log("\n🎉 KWAMI DAO initialization complete!\n");
  } catch (error) {
    console.error("\n❌ Initialization failed:");
    console.error(error);
    process.exit(1);
  }
}

function saveAddresses(
  cluster: string,
  daoState: PublicKey,
  qwamiMint: PublicKey,
  kwamiCollection: PublicKey,
  treasuryWallet: PublicKey,
  qwamiTokenAuthority: PublicKey,
  kwamiCollectionAuthority: PublicKey
) {
  const addresses = {
    daoState: daoState.toString(),
    qwamiMint: qwamiMint.toString(),
    kwamiCollection: kwamiCollection.toString(),
    treasuryWallet: treasuryWallet.toString(),
    qwamiTokenAuthority: qwamiTokenAuthority.toString(),
    kwamiCollectionAuthority: kwamiCollectionAuthority.toString(),
  };

  const filePath = path.join(__dirname, `../${cluster}-addresses.json`);
  fs.writeFileSync(filePath, JSON.stringify(addresses, null, 2));
  console.log(`\n💾 Addresses saved to ${filePath}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

