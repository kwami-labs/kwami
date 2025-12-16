// CRITICAL: Import polyfills FIRST before anything else
import '@/polyfills';

// Now import everything else AFTER polyfills are set up
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from '@/App.vue';
import router from '@/router';
import solanaWalletPlugin from '@/plugins/solana';
import 'solana-wallets-vue/styles.css';
import '@/styles/global.css';

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(solanaWalletPlugin);

app.mount('#app');
