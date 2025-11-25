# Solana Wallet Connector for Kwami

Secure Solana blockchain integration for Kwami that allows users to:
- Connect any Solana wallet (Phantom, Solflare, Backpack, Glow, Slope)
- View SOL balance, tokens, and NFTs
- Read transaction history
- Execute transactions (with user approval in wallet)
- Sign messages

## Features

✅ **Multi-Wallet Support** - Phantom, Solflare, Backpack, Glow, Slope  
✅ **Balance Tracking** - SOL, SPL tokens, and NFTs  
✅ **Transaction History** - Read past transactions  
✅ **Transaction Execution** - Send transactions with user approval  
✅ **Message Signing** - Sign arbitrary messages  
✅ **Network Selection** - Mainnet, Devnet, Testnet  
✅ **TypeScript Support** - Full type safety  

## Installation

The Solana dependencies are included with Kwami:

```bash
npm install kwami
```

For development:

```bash
npm install @solana/web3.js
```

## Quick Start

```typescript
import { Kwami, getWalletConnector } from 'kwami';

// Initialize wallet connector
const wallet = getWalletConnector({
  network: 'mainnet-beta', // or 'devnet', 'testnet'
});

// Connect wallet (defaults to Phantom if available)
const connected = await wallet.connect();

if (connected) {
  console.log('Connected:', connected.publicKey.toString());
  
  // Get balance
  const balance = await wallet.getWalletBalance();
  console.log('SOL:', balance.sol);
  console.log('Tokens:', balance.tokens.length);
  console.log('NFTs:', balance.nfts.length);
}
```

## Usage

### Detect Available Wallets

```typescript
const availableWallets = await wallet.detectWallets();

availableWallets.forEach(w => {
  console.log(`${w.name} detected`);
});
```

### Connect Specific Wallet

```typescript
// Connect to Phantom
await wallet.connect('Phantom');

// Connect to Solflare
await wallet.connect('Solflare');

// Connect to Backpack
await wallet.connect('Backpack');

// Auto-detect and connect to first available
await wallet.connect();
```

### Get Balances

```typescript
// Get SOL balance
const solBalance = await wallet.getSolBalance();
console.log(`Balance: ${solBalance} SOL`);

// Get all token balances
const tokens = await wallet.getTokenBalances();
tokens.forEach(token => {
  console.log(`${token.symbol}: ${token.uiAmount}`);
});

// Get NFTs
const nfts = await wallet.getNFTs();
console.log(`You own ${nfts.length} NFTs`);

// Get everything at once
const balance = await wallet.getWalletBalance();
console.log('SOL:', balance.sol);
console.log('Tokens:', balance.tokens);
console.log('NFTs:', balance.nfts);
```

### Transaction History

```typescript
// Get last 10 transactions
const history = await wallet.getTransactionHistory(undefined, 10);

history.forEach(tx => {
  console.log('Signature:', tx.signature);
  console.log('Success:', tx.success);
  console.log('Timestamp:', new Date(tx.timestamp! * 1000));
  console.log('---');
});
```

### Send Transaction

```typescript
import { Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';

// Create transaction
const transaction = new Transaction().add(
  SystemProgram.transfer({
    fromPubkey: wallet.getPublicKey()!,
    toPubkey: recipientPublicKey,
    lamports: 0.01 * LAMPORTS_PER_SOL, // 0.01 SOL
  })
);

// Get recent blockhash
const { blockhash } = await wallet.getConnection().getLatestBlockhash();
transaction.recentBlockhash = blockhash;
transaction.feePayer = wallet.getPublicKey()!;

// Send transaction (user will be prompted to approve in wallet)
const result = await wallet.sendTransaction(transaction);

if (result.success) {
  console.log('Transaction successful!');
  console.log('Signature:', result.signature);
} else {
  console.error('Transaction failed:', result.error);
}
```

### Sign Message

```typescript
const message = 'Hello from Kwami!';
const signature = await wallet.signMessage(message);

if (signature) {
  console.log('Message signed successfully');
}
```

### Disconnect

```typescript
await wallet.disconnect();
console.log('Wallet disconnected');
```

## Integration with Kwami

### Display Wallet Info in UI

```typescript
import { Kwami, getWalletConnector } from 'kwami';

const canvas = document.querySelector('canvas');
const kwami = new Kwami(canvas);

const wallet = getWalletConnector();

// Connect wallet button
document.getElementById('connect-wallet')?.addEventListener('click', async () => {
  const connected = await wallet.connect();
  
  if (connected) {
    // Update UI with wallet info
    const balance = await wallet.getWalletBalance();
    
    // Display in Kwami's UI or custom UI
    console.log(`Connected: ${connected.publicKey.toString()}`);
    console.log(`Balance: ${balance.sol} SOL`);
    
    // You can use Kwami's speak function to announce connection
    if (kwami.mind) {
      await kwami.mind.speak(`Wallet connected. Your balance is ${balance.sol.toFixed(2)} SOL`);
    }
  }
});
```

### Create Wallet Dashboard

```typescript
async function createWalletDashboard() {
  const wallet = getWalletConnector();
  
  if (!wallet.isWalletConnected()) {
    await wallet.connect();
  }
  
  const [balance, history] = await Promise.all([
    wallet.getWalletBalance(),
    wallet.getTransactionHistory(undefined, 20),
  ]);
  
  // Display in UI
  document.getElementById('sol-balance')!.textContent = `${balance.sol} SOL`;
  document.getElementById('token-count')!.textContent = `${balance.tokens.length} tokens`;
  document.getElementById('nft-count')!.textContent = `${balance.nfts.length} NFTs`;
  
  // List tokens
  const tokenList = document.getElementById('token-list')!;
  balance.tokens.forEach(token => {
    const li = document.createElement('li');
    li.textContent = `${token.symbol || 'Unknown'}: ${token.uiAmount}`;
    tokenList.appendChild(li);
  });
  
  // List transactions
  const txList = document.getElementById('transaction-list')!;
  history.forEach(tx => {
    const li = document.createElement('li');
    li.textContent = `${tx.signature.slice(0, 8)}... - ${tx.success ? '✓' : '✗'}`;
    txList.appendChild(li);
  });
}
```

## API Reference

### `WalletConnector`

#### Methods

##### `detectWallets(): Promise<Array<{ name: string; adapter: any }>>`
Detect all available Solana wallets in the browser.

##### `connect(walletName?: string): Promise<ConnectedWallet | null>`
Connect to a wallet. If no wallet name specified, connects to first available.

##### `disconnect(): Promise<boolean>`
Disconnect the current wallet.

##### `isWalletConnected(): boolean`
Check if a wallet is currently connected.

##### `getPublicKey(): PublicKey | null`
Get the connected wallet's public key.

##### `getSolBalance(publicKey?: PublicKey): Promise<number>`
Get SOL balance for address (defaults to connected wallet).

##### `getTokenBalances(publicKey?: PublicKey): Promise<TokenBalance[]>`
Get all SPL token balances.

##### `getNFTs(publicKey?: PublicKey): Promise<NFTMetadata[]>`
Get all NFTs owned by the wallet.

##### `getWalletBalance(publicKey?: PublicKey): Promise<WalletBalance>`
Get complete balance (SOL + tokens + NFTs).

##### `getTransactionHistory(publicKey?: PublicKey, limit?: number): Promise<TransactionInfo[]>`
Get transaction history for the wallet.

##### `sendTransaction(transaction: Transaction, options?: SendOptions): Promise<TransactionResult>`
Sign and send a transaction. User must approve in wallet.

##### `signMessage(message: string): Promise<Uint8Array | null>`
Sign an arbitrary message. User must approve in wallet.

##### `getConnection(): Connection`
Get the Solana connection object.

##### `getNetwork(): string`
Get current network (mainnet-beta, devnet, testnet).

### Types

```typescript
interface WalletConfig {
  network?: 'mainnet-beta' | 'devnet' | 'testnet';
  rpcEndpoint?: string;
  commitment?: Commitment;
}

interface ConnectedWallet {
  publicKey: PublicKey;
  name?: string;
  icon?: string;
}

interface TokenBalance {
  mint: string;
  amount: number;
  decimals: number;
  uiAmount: number;
  symbol?: string;
  name?: string;
  logoURI?: string;
}

interface NFTMetadata {
  mint: string;
  name: string;
  symbol: string;
  uri: string;
  image?: string;
  description?: string;
  attributes?: Array<{
    trait_type: string;
    value: string | number;
  }>;
}

interface TransactionInfo {
  signature: string;
  slot: number;
  timestamp?: number;
  success: boolean;
  fee: number;
  type?: string;
  from?: string;
  to?: string;
  amount?: number;
}

interface WalletBalance {
  sol: number;
  tokens: TokenBalance[];
  nfts: NFTMetadata[];
  totalValueUSD?: number;
}

interface TransactionResult {
  signature: string;
  success: boolean;
  error?: string;
}
```

## Supported Wallets

| Wallet | Install Link |
|--------|-------------|
| **Phantom** | [phantom.app](https://phantom.app) |
| **Solflare** | [solflare.com](https://solflare.com) |
| **Backpack** | [backpack.app](https://backpack.app) |
| **Glow** | [glow.app](https://glow.app) |
| **Slope** | [slope.finance](https://slope.finance) |

## Network Configuration

### Mainnet (Production)

```typescript
const wallet = getWalletConnector({
  network: 'mainnet-beta',
});
```

### Devnet (Development)

```typescript
const wallet = getWalletConnector({
  network: 'devnet',
});
```

### Custom RPC Endpoint

```typescript
const wallet = getWalletConnector({
  network: 'mainnet-beta',
  rpcEndpoint: 'https://your-custom-rpc.com',
  commitment: 'confirmed',
});
```

## Security Notes

⚠️ **Important Security Practices:**

1. **User Approval Required** - All transactions must be approved by user in wallet
2. **Never Request Private Keys** - Wallet adapter handles keys securely
3. **Validate Transactions** - Always validate transaction details before sending
4. **Use Secure RPC** - Use trusted RPC endpoints
5. **Handle Errors** - Implement proper error handling for all wallet operations

## Troubleshooting

### "No Solana wallets detected"
- Ensure user has a Solana wallet extension installed
- Refresh the page after installing wallet
- Check browser console for wallet detection logs

### "Failed to connect wallet"
- User may have rejected connection request
- Check wallet is unlocked
- Try different wallet if available

### "Transaction failed"
- Check wallet has sufficient SOL for transaction + fees
- Verify transaction parameters are correct
- Check network status

### NFT metadata not loading
- Some NFTs may have off-chain metadata
- Consider integrating with Metaplex for full NFT support

## Advanced Usage

### Custom Transaction Building

```typescript
import { Transaction, ComputeBudgetProgram } from '@solana/web3.js';

const transaction = new Transaction();

// Add compute budget instruction (optional, for priority fees)
transaction.add(
  ComputeBudgetProgram.setComputeUnitPrice({
    microLamports: 1000,
  })
);

// Add your program instructions here
transaction.add(/* your instructions */);

// Send
const result = await wallet.sendTransaction(transaction);
```

### Listen for Wallet Events

```typescript
// Note: Event listening depends on wallet adapter
const walletAdapter = (window as any).phantom?.solana;

if (walletAdapter) {
  walletAdapter.on('connect', (publicKey: PublicKey) => {
    console.log('Wallet connected:', publicKey.toString());
  });
  
  walletAdapter.on('disconnect', () => {
    console.log('Wallet disconnected');
  });
  
  walletAdapter.on('accountChanged', (publicKey: PublicKey) => {
    console.log('Account changed:', publicKey.toString());
  });
}
```

## License

MIT

