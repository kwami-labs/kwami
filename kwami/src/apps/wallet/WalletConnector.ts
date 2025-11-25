/**
 * Solana Wallet Connector for Kwami
 * 
 * Handles secure Solana wallet connections and blockchain interactions
 * Allows users to:
 * - Connect any Solana wallet (Phantom, Solflare, etc.)
 * - View balances, tokens, and NFTs
 * - Read transaction history
 * - Execute transactions (with user approval)
 */

import { 
  Connection, 
  PublicKey, 
  Transaction, 
  VersionedTransaction,
  LAMPORTS_PER_SOL,
  ParsedAccountData,
  SendOptions,
  Commitment,
} from '@solana/web3.js';
import { logger } from '../../utils/logger';

export interface WalletConfig {
  network?: 'mainnet-beta' | 'devnet' | 'testnet';
  rpcEndpoint?: string;
  commitment?: Commitment;
}

export interface ConnectedWallet {
  publicKey: PublicKey;
  name?: string;
  icon?: string;
}

export interface TokenBalance {
  mint: string;
  amount: number;
  decimals: number;
  uiAmount: number;
  symbol?: string;
  name?: string;
  logoURI?: string;
}

export interface NFTMetadata {
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

export interface TransactionInfo {
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

export interface WalletBalance {
  sol: number;
  tokens: TokenBalance[];
  nfts: NFTMetadata[];
  totalValueUSD?: number;
}

export interface TransactionResult {
  signature: string;
  success: boolean;
  error?: string;
}

/**
 * Solana Wallet Adapter Interface
 * Compatible with Solana Wallet Standard
 */
interface WalletAdapter {
  publicKey: PublicKey | null;
  connected: boolean;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  signTransaction<T extends Transaction | VersionedTransaction>(transaction: T): Promise<T>;
  signAllTransactions<T extends Transaction | VersionedTransaction>(transactions: T[]): Promise<T[]>;
  signMessage?(message: Uint8Array): Promise<Uint8Array>;
}

/**
 * WalletConnector - Handles Solana wallet integration
 */
export class WalletConnector {
  private config: WalletConfig;
  private connection: Connection;
  private wallet: WalletAdapter | null = null;
  private isConnected = false;

  constructor(config: WalletConfig = {}) {
    this.config = {
      network: config.network || 'mainnet-beta',
      rpcEndpoint: config.rpcEndpoint || this.getDefaultRpcEndpoint(config.network || 'mainnet-beta'),
      commitment: config.commitment || 'confirmed',
    };

    this.connection = new Connection(this.config.rpcEndpoint!, this.config.commitment);
  }

  /**
   * Get default RPC endpoint for network
   */
  private getDefaultRpcEndpoint(network: string): string {
    const endpoints: Record<string, string> = {
      'mainnet-beta': 'https://api.mainnet-beta.solana.com',
      'devnet': 'https://api.devnet.solana.com',
      'testnet': 'https://api.testnet.solana.com',
    };
    return endpoints[network] || endpoints['mainnet-beta'];
  }

  /**
   * Detect available wallets in the browser
   */
  async detectWallets(): Promise<Array<{ name: string; adapter: any }>> {
    const wallets: Array<{ name: string; adapter: any }> = [];

    // Check for Phantom
    if ((window as any).phantom?.solana?.isPhantom) {
      wallets.push({
        name: 'Phantom',
        adapter: (window as any).phantom.solana,
      });
    }

    // Check for Solflare
    if ((window as any).solflare?.isSolflare) {
      wallets.push({
        name: 'Solflare',
        adapter: (window as any).solflare,
      });
    }

    // Check for Backpack
    if ((window as any).backpack?.isBackpack) {
      wallets.push({
        name: 'Backpack',
        adapter: (window as any).backpack,
      });
    }

    // Check for Glow
    if ((window as any).glow) {
      wallets.push({
        name: 'Glow',
        adapter: (window as any).glow,
      });
    }

    // Check for Slope
    if ((window as any).Slope) {
      wallets.push({
        name: 'Slope',
        adapter: new (window as any).Slope(),
      });
    }

    return wallets;
  }

  /**
   * Connect to wallet
   */
  async connect(walletName?: string): Promise<ConnectedWallet | null> {
    try {
      const availableWallets = await this.detectWallets();

      if (availableWallets.length === 0) {
        logger.error('No Solana wallets detected. Please install Phantom, Solflare, or another Solana wallet.');
        return null;
      }

      // Use specified wallet or default to first available
      let selectedWallet = availableWallets[0];
      if (walletName) {
        const found = availableWallets.find(w => w.name.toLowerCase() === walletName.toLowerCase());
        if (found) selectedWallet = found;
      }

      this.wallet = selectedWallet.adapter;

      // Connect to wallet
      await this.wallet!.connect();

      if (!this.wallet!.publicKey) {
        throw new Error('Failed to get wallet public key');
      }

      this.isConnected = true;

      logger.info(`Connected to ${selectedWallet.name} wallet:`, this.wallet!.publicKey.toString());

      return {
        publicKey: this.wallet!.publicKey,
        name: selectedWallet.name,
      };
    } catch (error) {
      logger.error('Failed to connect wallet:', error);
      return null;
    }
  }

  /**
   * Disconnect wallet
   */
  async disconnect(): Promise<boolean> {
    if (!this.wallet) {
      return true;
    }

    try {
      await this.wallet.disconnect();
      this.wallet = null;
      this.isConnected = false;
      logger.info('Wallet disconnected');
      return true;
    } catch (error) {
      logger.error('Failed to disconnect wallet:', error);
      return false;
    }
  }

  /**
   * Check if wallet is connected
   */
  isWalletConnected(): boolean {
    return this.isConnected && this.wallet?.connected === true;
  }

  /**
   * Get connected wallet public key
   */
  getPublicKey(): PublicKey | null {
    return this.wallet?.publicKey || null;
  }

  /**
   * Get SOL balance
   */
  async getSolBalance(publicKey?: PublicKey): Promise<number> {
    const address = publicKey || this.wallet?.publicKey;
    if (!address) {
      throw new Error('No wallet connected');
    }

    try {
      const balance = await this.connection.getBalance(address);
      return balance / LAMPORTS_PER_SOL;
    } catch (error) {
      logger.error('Failed to get SOL balance:', error);
      throw error;
    }
  }

  /**
   * Get all token balances
   */
  async getTokenBalances(publicKey?: PublicKey): Promise<TokenBalance[]> {
    const address = publicKey || this.wallet?.publicKey;
    if (!address) {
      throw new Error('No wallet connected');
    }

    try {
      const tokenAccounts = await this.connection.getParsedTokenAccountsByOwner(
        address,
        { programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA') }
      );

      return tokenAccounts.value.map(accountInfo => {
        const data = accountInfo.account.data as ParsedAccountData;
        const parsedInfo = data.parsed.info;
        
        return {
          mint: parsedInfo.mint,
          amount: parsedInfo.tokenAmount.amount,
          decimals: parsedInfo.tokenAmount.decimals,
          uiAmount: parsedInfo.tokenAmount.uiAmount,
        };
      }).filter(token => token.uiAmount > 0);
    } catch (error) {
      logger.error('Failed to get token balances:', error);
      throw error;
    }
  }

  /**
   * Get NFTs owned by wallet
   */
  async getNFTs(publicKey?: PublicKey): Promise<NFTMetadata[]> {
    const address = publicKey || this.wallet?.publicKey;
    if (!address) {
      throw new Error('No wallet connected');
    }

    try {
      const tokenAccounts = await this.connection.getParsedTokenAccountsByOwner(
        address,
        { programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA') }
      );

      // Filter for NFTs (amount = 1, decimals = 0)
      const nftAccounts = tokenAccounts.value.filter(accountInfo => {
        const data = accountInfo.account.data as ParsedAccountData;
        const parsedInfo = data.parsed.info;
        return parsedInfo.tokenAmount.amount === '1' && parsedInfo.tokenAmount.decimals === 0;
      });

      // Fetch metadata for each NFT
      const nfts: NFTMetadata[] = [];
      for (const accountInfo of nftAccounts) {
        const data = accountInfo.account.data as ParsedAccountData;
        const mint = data.parsed.info.mint;

        try {
          // Note: In production, you'd fetch actual metadata from Metaplex or similar
          nfts.push({
            mint,
            name: 'NFT',
            symbol: '',
            uri: '',
          });
        } catch (error) {
          logger.warn(`Failed to fetch metadata for NFT ${mint}:`, error);
        }
      }

      return nfts;
    } catch (error) {
      logger.error('Failed to get NFTs:', error);
      throw error;
    }
  }

  /**
   * Get complete wallet balance (SOL + tokens + NFTs)
   */
  async getWalletBalance(publicKey?: PublicKey): Promise<WalletBalance> {
    const [sol, tokens, nfts] = await Promise.all([
      this.getSolBalance(publicKey),
      this.getTokenBalances(publicKey),
      this.getNFTs(publicKey),
    ]);

    return {
      sol,
      tokens,
      nfts,
    };
  }

  /**
   * Get transaction history
   */
  async getTransactionHistory(publicKey?: PublicKey, limit = 10): Promise<TransactionInfo[]> {
    const address = publicKey || this.wallet?.publicKey;
    if (!address) {
      throw new Error('No wallet connected');
    }

    try {
      const signatures = await this.connection.getSignaturesForAddress(address, { limit });
      
      const transactions: TransactionInfo[] = [];
      for (const sig of signatures) {
        transactions.push({
          signature: sig.signature,
          slot: sig.slot,
          timestamp: sig.blockTime || undefined,
          success: sig.err === null,
          fee: 0, // Would need to fetch full transaction for fee
        });
      }

      return transactions;
    } catch (error) {
      logger.error('Failed to get transaction history:', error);
      throw error;
    }
  }

  /**
   * Sign and send transaction
   * User must approve in their wallet
   */
  async sendTransaction(
    transaction: Transaction | VersionedTransaction,
    options?: SendOptions
  ): Promise<TransactionResult> {
    if (!this.wallet || !this.isWalletConnected()) {
      throw new Error('No wallet connected');
    }

    try {
      // Sign transaction with wallet
      const signedTransaction = await this.wallet.signTransaction(transaction);

      // Send signed transaction
      const signature = await this.connection.sendRawTransaction(
        signedTransaction.serialize(),
        options
      );

      // Confirm transaction
      const confirmation = await this.connection.confirmTransaction(signature, this.config.commitment);

      logger.info('Transaction sent:', signature);

      return {
        signature,
        success: confirmation.value.err === null,
        error: confirmation.value.err ? JSON.stringify(confirmation.value.err) : undefined,
      };
    } catch (error) {
      logger.error('Failed to send transaction:', error);
      return {
        signature: '',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Sign message with wallet
   */
  async signMessage(message: string): Promise<Uint8Array | null> {
    if (!this.wallet || !this.isWalletConnected()) {
      throw new Error('No wallet connected');
    }

    if (!this.wallet.signMessage) {
      throw new Error('Wallet does not support message signing');
    }

    try {
      const encodedMessage = new TextEncoder().encode(message);
      const signature = await this.wallet.signMessage(encodedMessage);
      logger.info('Message signed successfully');
      return signature;
    } catch (error) {
      logger.error('Failed to sign message:', error);
      return null;
    }
  }

  /**
   * Get Solana connection
   */
  getConnection(): Connection {
    return this.connection;
  }

  /**
   * Get network
   */
  getNetwork(): string {
    return this.config.network!;
  }
}

// Singleton instance
let walletConnector: WalletConnector | null = null;

/**
 * Get or create wallet connector instance
 */
export function getWalletConnector(config?: WalletConfig): WalletConnector {
  if (!walletConnector) {
    walletConnector = new WalletConnector(config);
  }
  return walletConnector;
}

