import "solana-wallets-vue/styles.css";
import SolanaWallets from "solana-wallets-vue";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  SolletWalletAdapter,
  TorusWalletAdapter,
  LedgerWalletAdapter,
  SlopeWalletAdapter,
  BackpackWalletAdapter,
} from "@solana/wallet-adapter-wallets";

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig();
  const network = (config.public.solanaNetwork || 'devnet') as WalletAdapterNetwork;

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

  nuxtApp.vueApp.use(SolanaWallets, walletOptions);
});

