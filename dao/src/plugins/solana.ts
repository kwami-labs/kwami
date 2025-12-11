import type { App } from 'vue';
import SolanaWallets from 'solana-wallets-vue';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  SolletWalletAdapter,
  TorusWalletAdapter,
  LedgerWalletAdapter,
  SlopeWalletAdapter,
  BackpackWalletAdapter,
} from '@solana/wallet-adapter-wallets';

export default {
  install(app: App) {
    const network = (import.meta.env.VITE_SOLANA_NETWORK || 'devnet') as WalletAdapterNetwork;

    const walletOptions = {
      wallets: [
        new PhantomWalletAdapter(),
        new SolflareWalletAdapter({ network }),
        new BackpackWalletAdapter(),
        new SlopeWalletAdapter(),
        new SolletWalletAdapter({ network }),
        new TorusWalletAdapter(),
        new LedgerWalletAdapter(),
      ],
      autoConnect: true,
    };

    app.use(SolanaWallets, walletOptions);
  },
};
