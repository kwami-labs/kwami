# Solana Wallet Connector

The Solana Wallet Connector enables Kwami to integrate with Solana blockchain, allowing users to:
- Connect multiple wallet types (Phantom, Solflare, Backpack, Glow, Slope)
- View balances (SOL, tokens, NFTs)
- Read transaction history
- Execute blockchain transactions with user approval
- Sign messages securely

## Quick Start

```typescript
import { Kwami, getWalletConnector } from 'kwami';

// Initialize wallet connector
const wallet = getWalletConnector({
  network: 'mainnet-beta',
});

// Connect wallet
const connected = await wallet.connect();

if (connected) {
  console.log('Connected:', connected.publicKey.toString());
  
  // Get balance
  const balance = await wallet.getWalletBalance();
  console.log(`${balance.sol} SOL`);
  console.log(`${balance.tokens.length} tokens`);
  console.log(`${balance.nfts.length} NFTs`);
}
```

## Features

### Multi-Wallet Support
Automatically detects and connects to available Solana wallets:
- **Phantom** - Most popular Solana wallet
- **Solflare** - Feature-rich wallet
- **Backpack** - xNFT-enabled wallet  
- **Glow** - Mobile-friendly wallet
- **Slope** - Multi-chain wallet

### Balance Management
- **SOL Balance** - Native Solana token
- **SPL Tokens** - All SPL token balances
- **NFTs** - View owned NFTs with metadata

### Transaction Features
- **Send Transactions** - Execute blockchain transactions
- **Transaction History** - Read past transactions
- **Message Signing** - Sign arbitrary messages
- **User Approval** - All actions require wallet confirmation

### Network Options
- **Mainnet** - Production network
- **Devnet** - Development network
- **Testnet** - Testing network
- **Custom RPC** - Use your own RPC endpoint

## Usage Examples

### Connect and Display Balance

```typescript
const wallet = getWalletConnector();

// Detect available wallets
const wallets = await wallet.detectWallets();
console.log('Available wallets:', wallets.map(w => w.name));

// Connect
const connected = await wallet.connect('Phantom');

if (connected) {
  // Get complete balance
  const balance = await wallet.getWalletBalance();
  
  console.log(`SOL: ${balance.sol}`);
  
  // List tokens
  balance.tokens.forEach(token => {
    console.log(`${token.symbol}: ${token.uiAmount}`);
  });
  
  // List NFTs
  console.log(`You own ${balance.nfts.length} NFTs`);
}
```

### Send Transaction

```typescript
import { Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';

// Create transfer transaction
const transaction = new Transaction().add(
  SystemProgram.transfer({
    fromPubkey: wallet.getPublicKey()!,
    toPubkey: recipientPublicKey,
    lamports: 0.01 * LAMPORTS_PER_SOL,
  })
);

// Set recent blockhash
const { blockhash } = await wallet.getConnection().getLatestBlockhash();
transaction.recentBlockhash = blockhash;
transaction.feePayer = wallet.getPublicKey()!;

// Send (user will approve in wallet)
const result = await wallet.sendTransaction(transaction);

if (result.success) {
  console.log('Transaction sent:', result.signature);
}
```

### Transaction History

```typescript
// Get last 20 transactions
const history = await wallet.getTransactionHistory(undefined, 20);

history.forEach(tx => {
  const date = new Date(tx.timestamp! * 1000);
  console.log(`${tx.signature.slice(0, 8)}... - ${tx.success ? '✓' : '✗'} - ${date.toLocaleString()}`);
});
```

### Integration with Kwami

```typescript
import { Kwami, getWalletConnector } from 'kwami';

const canvas = document.querySelector('canvas');
const kwami = new Kwami(canvas);
const wallet = getWalletConnector();

// Connect wallet and announce with Kwami
document.getElementById('connect')?.addEventListener('click', async () => {
  const connected = await wallet.connect();
  
  if (connected) {
    const balance = await wallet.getSolBalance();
    
    // Use Kwami to speak the balance
    if (kwami.mind) {
      await kwami.mind.speak(
        `Wallet connected. Your balance is ${balance.toFixed(2)} SOL`
      );
    }
    
    // Animate blob to celebrate connection
    kwami.body.blob.setSpikes(0.5, 0.5, 0.5);
    kwami.setState('listening');
  }
});
```

## API Reference

### WalletConnector Class

#### Configuration

```typescript
interface WalletConfig {
  network?: 'mainnet-beta' | 'devnet' | 'testnet';
  rpcEndpoint?: string;
  commitment?: Commitment;
}
```

#### Methods

**`detectWallets()`**
- Returns: `Promise<Array<{ name: string; adapter: any }>>`
- Detects all available Solana wallets

**`connect(walletName?)`**
- Returns: `Promise<ConnectedWallet | null>`
- Connects to specified wallet or first available

**`disconnect()`**
- Returns: `Promise<boolean>`
- Disconnects current wallet

**`isWalletConnected()`**
- Returns: `boolean`
- Checks if wallet is connected

**`getPublicKey()`**
- Returns: `PublicKey | null`
- Gets connected wallet's public key

**`getSolBalance(publicKey?)`**
- Returns: `Promise<number>`
- Gets SOL balance

**`getTokenBalances(publicKey?)`**
- Returns: `Promise<TokenBalance[]>`
- Gets all SPL token balances

**`getNFTs(publicKey?)`**
- Returns: `Promise<NFTMetadata[]>`
- Gets all owned NFTs

**`getWalletBalance(publicKey?)`**
- Returns: `Promise<WalletBalance>`
- Gets complete balance (SOL + tokens + NFTs)

**`getTransactionHistory(publicKey?, limit?)`**
- Returns: `Promise<TransactionInfo[]>`
- Gets transaction history

**`sendTransaction(transaction, options?)`**
- Returns: `Promise<TransactionResult>`
- Sends transaction (requires user approval)

**`signMessage(message)`**
- Returns: `Promise<Uint8Array | null>`
- Signs arbitrary message (requires user approval)

**`getConnection()`**
- Returns: `Connection`
- Gets Solana connection object

**`getNetwork()`**
- Returns: `string`
- Gets current network name

### Helper Function

**`getWalletConnector(config?)`**
- Returns: `WalletConnector`
- Gets or creates wallet connector singleton

## Security

⚠️ **Important Security Practices:**

1. **Never Request Private Keys** - Wallet handles keys securely
2. **User Approval Required** - All transactions need user confirmation
3. **Validate Transactions** - Check details before sending
4. **Use Secure RPC** - Connect to trusted RPC endpoints
5. **Handle Errors** - Implement proper error handling

## Troubleshooting

### No wallets detected
- User needs to install a Solana wallet extension
- Refresh page after installation
- Check browser console for errors

### Connection failed
- User may have rejected connection
- Check wallet is unlocked
- Try a different wallet

### Transaction failed
- Insufficient SOL for transaction + fees
- Invalid transaction parameters
- Network issues

## Related Documentation

- [YouTube Connector](./youtube.md)
- [Kwami Body API](../core/body.md)
- [Kwami Mind API](../core/mind.md)
- [Solana Web3.js Docs](https://solana-labs.github.io/solana-web3.js/)

## Examples

See the [complete README](../../kwami/src/apps/wallet/README.md) for more detailed examples and advanced usage.

