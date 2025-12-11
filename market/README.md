# KWAMI Marketplace

A decentralized NFT marketplace for KWAMI AI companion NFTs built on Solana using Vue 3 + Vite + TypeScript.

## Features

- 🎨 Browse and discover KWAMI NFTs
- 💰 Buy and sell NFTs on the marketplace
- 👛 Phantom wallet integration
- 🔍 Advanced filtering and search
- 📊 Real-time marketplace statistics
- 🎮 Create new KWAMI NFTs
- 📱 Responsive design with Tailwind CSS

## Tech Stack

- **Framework**: Vue 3 with Composition API
- **Build Tool**: Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS + SCSS
- **State Management**: Pinia
- **Routing**: Vue Router
- **Blockchain**: Solana Web3.js
- **NFT Standards**: Metaplex

## Prerequisites

- Node.js >= 18.0.0
- npm >= 10.0.0
- Phantom Wallet (browser extension)

## Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment**:
   ```bash
   cp .env.sample .env
   ```
   
   Edit `.env` and configure your Solana network settings:
   - `VITE_SOLANA_NETWORK`: Network to use (devnet, testnet, mainnet-beta)
   - `VITE_SOLANA_RPC_URL`: RPC endpoint URL
   - `VITE_KWAMI_NFT_PROGRAM_ID`: Your KWAMI NFT program ID
   - `VITE_KWAMI_COLLECTION_MINT`: Collection mint address
   - `VITE_KWAMI_COLLECTION_AUTHORITY`: Collection authority address
   - `VITE_KWAMI_DNA_REGISTRY`: DNA registry address

3. **Start development server**:
   ```bash
   npm run dev
   ```
   
   Open [http://localhost:5173](http://localhost:5173) in your browser.

## Development Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run type-check` - Run TypeScript type checking

## Project Structure

```
market/
├── src/
│   ├── assets/          # Static assets (styles, images)
│   ├── components/      # Reusable Vue components
│   ├── composables/     # Vue composables (hooks)
│   ├── layouts/         # Layout components
│   ├── router/          # Vue Router configuration
│   ├── stores/          # Pinia stores
│   ├── types/           # TypeScript type definitions
│   ├── views/           # Page components
│   ├── App.vue          # Root component
│   └── main.ts          # Application entry point
├── public/              # Static public assets
├── index.html           # HTML entry point
├── vite.config.ts       # Vite configuration
├── tailwind.config.ts   # Tailwind CSS configuration
└── tsconfig.json        # TypeScript configuration
```

## Wallet Connection

The marketplace uses Phantom wallet for authentication and transactions. Make sure you have the Phantom browser extension installed:

- [Download Phantom](https://phantom.app)

For development on devnet, you can request an airdrop of SOL from the wallet interface.

## Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory, ready to be deployed to any static hosting service.

## Migration from market2/

This project is a migration from the Nuxt 3-based market2/ application to a standard Vite + Vue 3 setup. Key differences:

- **No SSR**: Client-side only application (vs Nuxt's SSR)
- **Manual routing**: Vue Router with explicit route definitions (vs Nuxt's file-based routing)
- **Environment variables**: `import.meta.env.VITE_*` (vs Nuxt's `useRuntimeConfig()`)
- **Imports**: `@/` alias for absolute imports (vs `~/`)
- **Components**: `<RouterLink>` (vs `<NuxtLink>`)

## License

See LICENSE file in the repository root.
