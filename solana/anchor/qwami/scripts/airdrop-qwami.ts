import * as anchor from "@coral-xyz/anchor";
import { getAssociatedTokenAddress, createAssociatedTokenAccountInstruction, TOKEN_PROGRAM_ID } from "@solana/spl-token";

/**
 * Airdrop QWAMI tokens to a wallet for testing
 * Usage: npx ts-node scripts/airdrop-qwami.ts <recipient_wallet> <amount>
 */

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.error("❌ Usage: npx ts-node scripts/airdrop-qwami.ts <recipient_wallet> <amount>");
    console.error("Example: npx ts-node scripts/airdrop-qwami.ts ArrZM...E3LE 10000");
    process.exit(1);
  }

  const recipientWallet = new anchor.web3.PublicKey(args[0]);
  const amount = parseInt(args[1]);

  if (isNaN(amount) || amount <= 0) {
    console.error("❌ Amount must be a positive number");
    process.exit(1);
  }

  console.log("\n🪂 Airdropping QWAMI tokens...\n");
  console.log("Recipient:", recipientWallet.toString());
  console.log("Amount:", amount.toLocaleString(), "QWAMI");

  // Configure provider
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  // Load QWAMI addresses
  const fs = require('fs');
  const path = require('path');
  const addressesPath = path.join(__dirname, '../devnet-addresses.json');
  const addresses = JSON.parse(fs.readFileSync(addressesPath, 'utf8'));

  const programId = new anchor.web3.PublicKey(addresses.programId);
  const qwamiMint = new anchor.web3.PublicKey(addresses.qwamiMint);

  console.log("\nQWAMI Mint:", qwamiMint.toString());
  console.log("Program ID:", programId.toString());

  // Derive token authority PDA
  const [tokenAuthority] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("token-authority"), qwamiMint.toBuffer()],
    programId
  );

  console.log("Token Authority:", tokenAuthority.toString());

  // Get or create recipient's QWAMI token account
  const recipientTokenAccount = await getAssociatedTokenAddress(
    qwamiMint,
    recipientWallet
  );

  console.log("Recipient Token Account:", recipientTokenAccount.toString());

  // Check if token account exists
  const accountInfo = await provider.connection.getAccountInfo(recipientTokenAccount);
  const transaction = new anchor.web3.Transaction();

  if (!accountInfo) {
    console.log("\n📦 Creating token account for recipient...");
    transaction.add(
      createAssociatedTokenAccountInstruction(
        provider.wallet.publicKey,
        recipientTokenAccount,
        recipientWallet,
        qwamiMint
      )
    );
  } else {
    console.log("\n✅ Token account already exists");
  }

  // Load IDL to get mint_tokens discriminator
  const idlPath = path.join(__dirname, '../target/idl/qwami_token.json');
  const idl = JSON.parse(fs.readFileSync(idlPath, 'utf8'));
  const mintInstruction = idl.instructions.find((ix: any) => ix.name === "mint_tokens");
  
  if (!mintInstruction) {
    throw new Error("mint_tokens instruction not found in IDL");
  }

  const discriminator = Buffer.from(mintInstruction.discriminator);

  // Serialize amount (u64, 8 bytes, little endian)
  const amountBuffer = Buffer.allocUnsafe(8);
  amountBuffer.writeBigUInt64LE(BigInt(amount));

  const instructionData = Buffer.concat([discriminator, amountBuffer]);

  // Build mint_tokens instruction
  // Account order: mint, token_authority, destination, authority, token_program
  const keys = [
    { pubkey: qwamiMint, isSigner: false, isWritable: true },
    { pubkey: tokenAuthority, isSigner: false, isWritable: true },
    { pubkey: recipientTokenAccount, isSigner: false, isWritable: true },
    { pubkey: provider.wallet.publicKey, isSigner: true, isWritable: false },
    { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
  ];

  const instruction = new anchor.web3.TransactionInstruction({
    keys,
    programId,
    data: instructionData,
  });

  transaction.add(instruction);

  console.log("\n⏳ Sending transaction...");

  try {
    const signature = await provider.sendAndConfirm(transaction);

    console.log("\n✅ QWAMI tokens airdropped successfully!");
    console.log("\nTransaction:", signature);
    console.log("Explorer:", `https://explorer.solana.com/tx/${signature}?cluster=devnet`);
    console.log("\n🎉 Recipient now has", amount.toLocaleString(), "QWAMI tokens!");
  } catch (error) {
    console.error("\n❌ Airdrop failed!");
    console.error("Error:", error);

    if (error && typeof error === 'object' && 'logs' in error) {
      console.error("\nProgram Logs:");
      const logs = (error as any).logs;
      if (Array.isArray(logs)) {
        logs.forEach((log: string) => console.error(log));
      }
    }

    throw error;
  }
}

main()
  .then(() => {
    console.log("\n✅ Script completed successfully\n");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Script failed with error:");
    console.error(error);
    process.exit(1);
  });
