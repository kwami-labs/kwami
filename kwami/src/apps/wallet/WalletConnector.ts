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
  connected?: boolean;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  signTransaction?<T extends Transaction | VersionedTransaction>(transaction: T): Promise<T>;
  signAllTransactions?<T extends Transaction | VersionedTransaction>(transactions: T[]): Promise<T[]>;
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
   * Detect available wallets in the browser.
   *
   * Returns a ranked list (Phantom first) including installed + not-detected wallets,
   * so UIs can show "Connect" vs "Install" consistently.
   */
  async detectWallets(): Promise<
    Array<{
      name: string;
      adapter?: any;
      installed: boolean;
      url?: string;
      kind: 'browser' | 'hardware';
      readyState: 'installed' | 'loadable' | 'not detected' | 'unsupported';
      icon?: string;
    }>
  > {
    if (typeof window === 'undefined') {
      return [];
    }

    // Full catalog aligned with @solana/wallet-adapter-wallets (names), without importing adapter code.
    // We merge this with Wallet Standard discovery for robust, up-to-date wallet detection.

    const catalog: Array<{ name: string; kind: 'browser' | 'hardware'; url?: string }> = [
      // Common
      { name: 'Phantom', kind: 'browser', url: 'https://phantom.app' },
      { name: 'Solflare', kind: 'browser', url: 'https://solflare.com' },
      { name: 'Backpack', kind: 'browser', url: 'https://backpack.app' },
      { name: 'Glow', kind: 'browser', url: 'https://glow.app' },
      { name: 'MetaMask', kind: 'browser', url: 'https://metamask.io' },
      { name: 'Coinbase Wallet', kind: 'browser', url: 'https://wallet.coinbase.com' },
      { name: 'Trust Wallet', kind: 'browser', url: 'https://trustwallet.com/browser-extension' },
      { name: 'Coin98', kind: 'browser', url: 'https://chrome.coin98.com' },
      { name: 'TokenPocket', kind: 'browser', url: 'https://tokenpocket.pro' },
      { name: 'MathWallet', kind: 'browser', url: 'https://mathwallet.org' },
      { name: 'SafePal', kind: 'browser', url: 'https://www.safepal.com/extension' },
      { name: 'XDEFI', kind: 'browser' },

      // Hardware
      { name: 'Ledger', kind: 'hardware', url: 'https://www.ledger.com' },
      { name: 'Trezor', kind: 'hardware', url: 'https://trezor.io' },
      { name: 'Keystone', kind: 'hardware', url: 'https://keyst.one' },

      // Wallet adapter catalog
      { name: 'Alpha', kind: 'browser' },
      { name: 'Avana', kind: 'browser' },
      { name: 'Bitget', kind: 'browser' },
      { name: 'BitKeep', kind: 'browser' },
      { name: 'Bitpie', kind: 'browser' },
      { name: 'Clover', kind: 'browser' },
      { name: 'Coinhub', kind: 'browser' },
      { name: 'Fractal', kind: 'browser' },
      { name: 'Huobi', kind: 'browser' },
      { name: 'HyperPay', kind: 'browser' },
      { name: 'Krystal', kind: 'browser' },
      { name: 'Neko', kind: 'browser' },
      { name: 'Nightly', kind: 'browser' },
      { name: 'Nufi', kind: 'browser' },
      { name: 'Onto', kind: 'browser' },
      { name: 'Saifu', kind: 'browser' },
      { name: 'Salmon', kind: 'browser' },
      { name: 'Sky', kind: 'browser' },
      { name: 'Solong', kind: 'browser' },
      { name: 'Spot', kind: 'browser' },
      { name: 'Tokenary', kind: 'browser' },
      { name: 'Torus', kind: 'browser' },
      { name: 'Unsafe Burner', kind: 'browser' },
      { name: 'WalletConnect', kind: 'browser' },

      // Legacy
      { name: 'Slope', kind: 'browser', url: 'https://slope.finance' },
    ];

    const win = window as any;
    const solana = win.solana;

    const detectLegacyProvider = (name: string): any | null => {
      const n = name.toLowerCase();

      // Explicit globals first
      if (n === 'phantom') return win.phantom?.solana ?? (solana?.isPhantom ? solana : null);
      if (n === 'solflare') return win.solflare ?? (solana?.isSolflare ? solana : null);
      if (n === 'backpack') return win.backpack ?? null;
      if (n === 'glow') return win.glow ?? (solana?.isGlow ? solana : null);
      if (n === 'coin98') return win.coin98?.solana ?? (solana?.isCoin98 ? solana : null);
      if (n === 'trust wallet')
        return win.trustwallet?.solana ?? (solana?.isTrustWallet || solana?.isTrust ? solana : null);
      if (n === 'coinbase wallet')
        return win.coinbaseSolana ?? (solana?.isCoinbaseWallet || solana?.isCoinbase ? solana : null);
      if (n === 'tokenpocket') return win.tokenpocket?.solana ?? (solana?.isTokenPocket ? solana : null);
      if (n === 'mathwallet' || n === 'math wallet') return solana?.isMathWallet ? solana : null;
      if (n === 'safepal') return win.safepal?.solana ?? (solana?.isSafePal ? solana : null);
      if (n === 'nightly') return solana?.isNightly ? solana : null;
      if (n === 'nufi') return solana?.isNufi ? solana : null;
      if (n === 'xdeffi' || n === 'xdefi') return solana?.isXDEFI ? solana : null;

      // Legacy Slope pattern
      if (n === 'slope' && win.Slope) {
        try {
          return new win.Slope();
        } catch {
          return null;
        }
      }

      return null;
    };

    // Wallet Standard discovery (supports MetaMask Solana, etc.)
    type DetectedWallet = {
      name: string;
      adapter?: any;
      installed: boolean;
      url?: string;
      kind: 'browser' | 'hardware';
      readyState: 'installed' | 'loadable' | 'not detected' | 'unsupported';
      icon?: string;
    };

    const normalizeWalletKey = (name: string) =>
      name
        .toLowerCase()
        .replace(/wallet/g, '')
        .replace(/\s+/g, '')
        .replace(/[^a-z0-9]/g, '');

    const standardWallets: DetectedWallet[] = [];

    try {
      const [{ getWallets }, { StandardWalletAdapter }, { WalletReadyState }] = await Promise.all([
        import('@wallet-standard/app'),
        import('@solana/wallet-standard-wallet-adapter-base'),
        import('@solana/wallet-adapter-base'),
      ]);

      const wallets = getWallets().get();

      for (const wallet of wallets) {
        // Wrap Standard Wallet as a Solana wallet-adapter compatible adapter.
        const adapter = new (StandardWalletAdapter as any)({ wallet });

        const rs = adapter.readyState;
        const readyState: 'installed' | 'loadable' | 'not detected' | 'unsupported' =
          rs === WalletReadyState.Installed
            ? 'installed'
            : rs === WalletReadyState.Loadable
              ? 'loadable'
              : rs === WalletReadyState.NotDetected
                ? 'not detected'
                : 'unsupported';

        const name = String(wallet.name);
        standardWallets.push({
          name,
          adapter,
          installed: readyState !== 'not detected',
          // Prefer wallet-provided URL; fall back to our catalog URL map when missing/empty.
          url: adapter.url || (catalog.find((c) => normalizeWalletKey(c.name) === normalizeWalletKey(name))?.url ?? undefined),
          kind: /ledger|trezor|keystone/i.test(name) ? 'hardware' : 'browser',
          readyState,
          // Wallet Standard icon is a data URI (preferred by UI if present)
          icon: wallet.icon,
        });
      }
    } catch (error) {
      // Wallet Standard is optional. If unavailable, fall back to legacy provider detection.
      logger.debug?.('[WalletConnector] Wallet Standard discovery unavailable', error as any);
    }

    // Map catalog into baseline rows.
    const baseRows: DetectedWallet[] = catalog.map((w) => {
      const adapter = detectLegacyProvider(w.name);
      const installed = Boolean(adapter);

      const readyState: DetectedWallet['readyState'] = installed ? 'installed' : 'not detected';

      return {
        name: w.name,
        adapter: adapter ?? undefined,
        installed,
        url: w.url,
        kind: w.kind,
        readyState,
        icon: undefined,
      };
    });

    // Merge: prefer Wallet Standard adapters when available.
    // Use normalized keys to avoid duplicates like "Coinbase" vs "Coinbase Wallet".
    const merged = new Map<string, DetectedWallet>();
    for (const row of baseRows) {
      merged.set(normalizeWalletKey(row.name), row);
    }
    for (const row of standardWallets) {
      merged.set(normalizeWalletKey(row.name), row);
    }

    // Sort: common wallets first, then installed, then alpha.
    const rank = [
      'Phantom',
      'Solflare',
      'Backpack',
      'Glow',
      'MetaMask',
      'Coinbase Wallet',
      'Trust Wallet',
      'Coin98',
      'TokenPocket',
      'MathWallet',
      'SafePal',
      'Nightly',
      'Nufi',
      'XDEFI',
      'Ledger',
      'Trezor',
      'Keystone',
      'WalletConnect',
    ];

    const rankIndex = (name: string) => {
      const i = rank.findIndex((r) => r.toLowerCase() === name.toLowerCase());
      return i === -1 ? 999 : i;
    };

    return Array.from(merged.values()).sort((a, b) => {
      const ra = rankIndex(a.name);
      const rb = rankIndex(b.name);
      if (ra !== rb) return ra - rb;

      const ai = a.installed ? 0 : 1;
      const bi = b.installed ? 0 : 1;
      if (ai !== bi) return ai - bi;

      return a.name.localeCompare(b.name);
    });
  }

  /**
   * Connect to wallet
   */
  async connect(walletName?: string): Promise<ConnectedWallet | null> {
    try {
      const availableWallets = await this.detectWallets();

      const installedWallets = availableWallets.filter((w) => w.installed && w.adapter);
      if (installedWallets.length === 0) {
        logger.error('No Solana wallets detected. Please install Phantom, Solflare, or another Solana wallet.');
        return null;
      }

      // Use specified wallet or default to first installed wallet
      let selectedWallet = installedWallets[0];
      if (walletName) {
        const foundInstalled = installedWallets.find(
          (w) => w.name.toLowerCase() === walletName.toLowerCase(),
        );
        if (foundInstalled) {
          selectedWallet = foundInstalled;
        } else {
          const knownButMissing = availableWallets.find(
            (w) => w.name.toLowerCase() === walletName.toLowerCase(),
          );
          if (knownButMissing && !knownButMissing.installed) {
            logger.error(`${knownButMissing.name} wallet not detected. Please install it first.`);
            return null;
          }
        }
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
    const connectedFlag = this.wallet?.connected;
    const inferredConnected = Boolean(this.wallet?.publicKey);
    return this.isConnected && (connectedFlag === true || (connectedFlag === undefined && inferredConnected));
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
      const wallet = this.wallet as any;

      // Prefer wallet-adapter style sendTransaction if available.
      if (typeof wallet.sendTransaction === 'function') {
        const signature = await wallet.sendTransaction(transaction, this.connection, options);
        const confirmation = await this.connection.confirmTransaction(signature, this.config.commitment);
        return {
          signature,
          success: confirmation.value.err === null,
          error: confirmation.value.err ? JSON.stringify(confirmation.value.err) : undefined,
        };
      }

      // Otherwise sign + send.
      if (typeof wallet.signTransaction !== 'function') {
        throw new Error('Wallet does not support transaction signing');
      }

      const signedTransaction = await wallet.signTransaction(transaction);

      const signature = await this.connection.sendRawTransaction(signedTransaction.serialize(), options);

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

