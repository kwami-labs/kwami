# Marketplace Changelog

All notable changes to the KWAMI NFT Marketplace will be documented in this file.

## [1.5.8] - 2025-11-22

### 🐳 Docker Support

#### Added
- **docker/** directory with 3 Dockerfile variants:
  - `Dockerfile` - Node.js 20 Alpine (default, production-ready)
  - `Dockerfile.bun` - Bun runtime (v1.0+ Alpine)
  - `Dockerfile.deno` - Deno runtime (v2.1.4 Alpine)
- Multi-stage builds for optimized production images
- Native module support for build dependencies
- Runtime compatibility layers for Bun/Deno
- Production-ready deployment on port 3000

## [1.0.0] - 2025-11-22

### Added
- Complete marketplace functionality
- Browse and search NFT listings
- Buy NFTs with SOL
- List NFTs for sale
- User profiles and collections
- Wallet integration (Phantom)
- Real-time marketplace data
- Mobile responsive design
- NFT detail pages
- Activity feed
- Marketplace statistics

### Features
- Metaplex NFT standard integration
- Solana blockchain integration
- Search and filter functionality
- Price discovery system
- Transaction history
- Collection browser
- User profiles

### UI/UX
- Modern, responsive design with Tailwind CSS
- Intuitive navigation
- Real-time updates
- Loading states and animations
- Error handling
- Toast notifications

### Technical
- Nuxt 4 application structure
- Pinia state management
- Composable-based architecture
- TypeScript support
- Optimized performance
- SEO ready

## Version History

For the complete KWAMI project version history, see the [main CHANGELOG](../CHANGELOG.md).

---

**Current Version**: 1.0.0  
**Last Updated**: 2025-11-22

