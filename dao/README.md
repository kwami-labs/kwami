# KWAMI DAO

> Decentralized governance platform for KWAMI NFT holders

KWAMI DAO enables KWAMI NFT holders to participate in community governance using QWAMI tokens. Built on Solana with Vue 3, TypeScript, and Vite.

## ✨ Features

- **🔐 Wallet Integration** - Connect with Phantom, Solflare, Backpack, and more
- **🎨 NFT Verification** - Automatic KWAMI NFT ownership verification
- **💰 Token Balance** - Real-time QWAMI governance token tracking
- **📋 Proposals** - Create, view, and manage governance proposals
- **🗳️ Voting** - Vote on proposals using QWAMI tokens
- **📊 Live Stats** - Real-time voting statistics and proposal status

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18.0.0
- npm

### Installation

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.sample .env

# Start development server
npm run dev
```

Visit `http://localhost:5173` to see the app.

### Environment Configuration

Edit `.env` with your Solana configuration:

```env
VITE_SOLANA_NETWORK=devnet
VITE_SOLANA_RPC_URL=https://api.devnet.solana.com
VITE_KWAMI_NFT_PROGRAM_ID=
VITE_QWAMI_TOKEN_MINT=
VITE_KWAMI_COLLECTION_ADDRESS=
```

## 📦 Project Structure

```
src/
├── components/          # Reusable Vue components
│   ├── Base*.vue       # UI primitives (Button, Badge, Icon)
│   ├── NFTVerification.vue
│   ├── QwamiBalance.vue
│   ├── ProposalCard.vue
│   └── WalletButton.vue
├── composables/        # Vue composition functions
│   └── useAuth.ts
├── layouts/            # Layout components
│   └── DefaultLayout.vue
├── plugins/            # Vue plugins
│   └── solana.ts
├── router/             # Vue Router config
│   └── index.ts
├── stores/             # Pinia state management
│   ├── wallet.ts
│   ├── nft.ts
│   ├── qwami.ts
│   └── governance.ts
├── styles/             # Global styles
│   └── global.css
├── views/              # Page components
│   ├── HomeView.vue
│   ├── ProposalsView.vue
│   ├── ProposalDetailView.vue
│   └── CreateView.vue
├── App.vue
└── main.ts
```

## 🛠️ Tech Stack

- **Vue 3** - Progressive JavaScript framework
- **TypeScript** - Type safety and developer experience
- **Vite** - Fast build tool and dev server
- **Pinia** - Vue state management
- **Vue Router** - Client-side routing
- **Solana Web3.js** - Solana blockchain interaction
- **solana-wallets-vue** - Wallet adapter for Vue
- **Metaplex JS** - NFT metadata and utilities

## 📜 Available Scripts

```bash
# Development
npm run dev              # Start dev server

# Production
npm run build            # Build for production
npm run preview          # Preview production build

# Quality
npm run typecheck        # Run TypeScript checks
npm run lint             # Run ESLint
npm run lint:fix         # Fix linting issues
```

## 🔑 Governance Requirements

| Action | Requirements |
|--------|-------------|
| View Dashboard | Wallet connected |
| View Proposals | Wallet connected |
| Create Proposal | KWAMI NFT + 100+ QWAMI |
| Vote on Proposal | KWAMI NFT + 100+ QWAMI |

## 🏗️ How It Works

### Authentication Flow

1. User connects Solana wallet via wallet adapter
2. App verifies KWAMI NFT ownership using Metaplex
3. App checks QWAMI token balance
4. User gains governance access if requirements met

### State Management (Pinia Stores)

- **wallet** - Solana connection and RPC management
- **nft** - KWAMI NFT verification and selection
- **qwami** - QWAMI token balance tracking
- **governance** - Proposals, votes, and governance state

### Routing

```
/                     # Dashboard
/proposals            # All proposals list
/proposals/:id        # Proposal detail and voting
/create               # Create new proposal
```

## 🔄 Migration from Nuxt

This project was migrated from Nuxt 3 to standard Vite + Vue 3:

| Before (Nuxt) | After (Vite) |
|---------------|--------------|
| File-based routing | Explicit Vue Router |
| `@nuxt/ui` components | Custom base components |
| Auto-imports | Explicit imports |
| `useRuntimeConfig()` | `import.meta.env` |
| `nuxt.config.ts` | `vite.config.ts` |
| `<NuxtLink>` | `<RouterLink>` |

## 🤝 Contributing

Refer to the main KWAMI repository's `CONTRIBUTING.md` for guidelines.

## 📄 License

See the LICENSE file in the main KWAMI repository.

## 🐛 Known Issues

- Some wallet adapters (e.g., Keystone) depend on React libraries but are excluded from optimization
- Icons use placeholder SVG paths - implement full Heroicons if needed

## 🔮 Future Enhancements

- On-chain proposal storage and voting
- Proposal execution mechanisms
- Advanced voting strategies (quadratic, delegated)
- Proposal discussion threads
- DAO treasury management
