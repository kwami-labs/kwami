import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from '@/App.vue';
import router from '@/router';
import solanaWalletPlugin from '@/plugins/solana';
import 'solana-wallets-vue/styles.css';
import '@/styles/global.css';
import { Buffer } from 'buffer';

// Polyfills for Solana
globalThis.Buffer = Buffer;
(window as any).global = window;
(window as any).process = { env: {} };

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(solanaWalletPlugin);

app.mount('#app');
