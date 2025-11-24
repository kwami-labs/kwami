# 🚀 KWAMI Marketplace Deployment Guide

This guide covers deploying the KWAMI Marketplace to various platforms.

## 📋 Pre-Deployment Checklist

- [ ] Anchor program deployed to Solana (devnet/mainnet)
- [ ] Collection initialized with DNA registry
- [ ] Environment variables configured
- [ ] Test all functionality locally
- [ ] Assets uploaded to Arweave
- [ ] Domain name registered (optional)
- [ ] SSL certificate (handled by platform)

## 🐳 Docker Deployment

The marketplace includes Docker support for containerized deployment.

### Available Dockerfiles

- `market/docker/Dockerfile` - Standard Node.js deployment
- `market/docker/Dockerfile.bun` - Bun runtime deployment (faster)
- `market/docker/Dockerfile.deno` - Deno runtime deployment

### Build Docker Image

```bash
# Using Node.js (default)
docker build -t kwami-market -f market/docker/Dockerfile market/

# Using Bun (recommended for faster builds)
docker build -t kwami-market -f market/docker/Dockerfile.bun market/

# Using Deno
docker build -t kwami-market -f market/docker/Dockerfile.deno market/
```

### Run Docker Container

```bash
docker run -p 3000:3000 \
  -e NUXT_PUBLIC_SOLANA_NETWORK=devnet \
  -e NUXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com \
  -e NUXT_PUBLIC_KWAMI_COLLECTION_ID=your_collection_id \
  kwami-market
```

### Docker Compose

Create a `docker-compose.yml` file:

```yaml
version: '3.8'

services:
  market:
    build:
      context: ./market
      dockerfile: docker/Dockerfile.bun
    ports:
      - "3000:3000"
    environment:
      - NUXT_PUBLIC_SOLANA_NETWORK=devnet
      - NUXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
      - NUXT_PUBLIC_KWAMI_COLLECTION_ID=${KWAMI_COLLECTION_ID}
    restart: unless-stopped
```

Run with:
```bash
docker-compose up -d
```

---

## 🌐 Deployment Options

### 1. Vercel (Recommended)

**Why Vercel?**
- Zero-config deployment
- Automatic HTTPS
- Global CDN
- Serverless functions
- Great for Nuxt apps

**Steps:**

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Set environment variables
vercel env add NUXT_PUBLIC_SOLANA_NETWORK
vercel env add NUXT_PUBLIC_SOLANA_RPC_URL
vercel env add NUXT_PUBLIC_KWAMI_NFT_PROGRAM_ID
vercel env add NUXT_PUBLIC_KWAMI_COLLECTION_MINT
vercel env add NUXT_PUBLIC_KWAMI_COLLECTION_AUTHORITY
vercel env add NUXT_PUBLIC_KWAMI_DNA_REGISTRY

# Deploy to production
vercel --prod
```

**Project Settings (vercel.json):**

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".output/public",
  "framework": "nuxtjs"
}
```

### 2. Netlify

**Steps:**

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Initialize
netlify init

# Build
npm run build

# Deploy
netlify deploy --prod
```

**netlify.toml:**

```toml
[build]
  command = "npm run build"
  publish = ".output/public"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  NODE_VERSION = "18"
```

### 3. Cloudflare Pages

**Steps:**

1. Connect your GitHub repository
2. Configure build settings:
   - **Build command**: `npm run build`
   - **Build output**: `.output/public`
   - **Node version**: 18
3. Add environment variables in dashboard
4. Deploy

### 4. AWS Amplify

**Steps:**

1. Connect repository
2. Build settings:
```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm install
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: .output/public
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
```
3. Add environment variables
4. Deploy

### 5. Self-Hosted (VPS)

**Requirements:**
- Ubuntu 22.04 or similar
- Node.js 18+
- Nginx
- PM2
- SSL certificate (Let's Encrypt)

**Steps:**

```bash
# On your server
cd /var/www
git clone your-repo
cd kwami/market

# Install dependencies
npm install

# Build for production
npm run build

# Install PM2
npm install -g pm2

# Start with PM2
pm2 start npm --name "kwami-marketplace" -- start

# Save PM2 configuration
pm2 save
pm2 startup
```

**Nginx Configuration:**

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**SSL with Let's Encrypt:**

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## 🔐 Environment Variables

**Required for all deployments:**

```env
NUXT_PUBLIC_SOLANA_NETWORK=mainnet-beta
NUXT_PUBLIC_SOLANA_RPC_URL=https://your-rpc-url.com
NUXT_PUBLIC_KWAMI_NFT_PROGRAM_ID=YourProgramID
NUXT_PUBLIC_KWAMI_COLLECTION_MINT=YourCollectionMint
NUXT_PUBLIC_KWAMI_COLLECTION_AUTHORITY=YourAuthorityPDA
NUXT_PUBLIC_KWAMI_DNA_REGISTRY=YourDnaRegistry
```

**Optional:**

```env
NUXT_PUBLIC_AUCTION_HOUSE_ADDRESS=YourAuctionHouseAddress
NUXT_PUBLIC_GOOGLE_ANALYTICS_ID=UA-XXXXXXXXX-X
```

## 🎯 Production Checklist

### Before Mainnet Launch

- [ ] **Smart Contract Audit** - Audit Anchor program
- [ ] **Security Review** - Review all marketplace transactions
- [ ] **Performance Testing** - Load test with simulated users
- [ ] **Error Monitoring** - Set up Sentry or similar
- [ ] **Analytics** - Add Google Analytics or Plausible
- [ ] **SEO Optimization** - Add meta tags, sitemap, robots.txt
- [ ] **Social Preview** - Add Open Graph images
- [ ] **Legal** - Terms of service, privacy policy
- [ ] **Backup Strategy** - Database backup plan
- [ ] **Monitoring** - Uptime monitoring (UptimeRobot, etc.)

### Performance Optimization

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  // Enable compression
  nitro: {
    compressPublicAssets: true,
  },

  // Optimize builds
  vite: {
    build: {
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true,
        },
      },
    },
  },

  // Image optimization
  image: {
    domains: ['arweave.net'],
  },
})
```

### CDN Configuration

Use a CDN for assets:
- **Images**: Cloudflare, Cloudinary
- **Metadata**: IPFS gateway, Arweave
- **Static files**: Platform CDN

## 📊 Monitoring

### 1. Application Monitoring (Sentry)

```bash
npm install @sentry/vue
```

```typescript
// plugins/sentry.client.ts
import * as Sentry from '@sentry/vue'

export default defineNuxtPlugin((nuxtApp) => {
  Sentry.init({
    app: nuxtApp.vueApp,
    dsn: 'YOUR_SENTRY_DSN',
    environment: process.env.NODE_ENV,
    integrations: [
      new Sentry.BrowserTracing(),
      new Sentry.Replay(),
    ],
    tracesSampleRate: 1.0,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
  })
})
```

### 2. Analytics (Google Analytics)

```bash
npm install @nuxtjs/google-analytics
```

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@nuxtjs/google-analytics'],
  googleAnalytics: {
    id: 'UA-XXX-X',
  },
})
```

### 3. Uptime Monitoring

Use services like:
- UptimeRobot (free)
- Pingdom
- Better Uptime
- StatusCake

## 🔄 CI/CD Pipeline

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: cd market && npm install
      
      - name: Build
        run: cd market && npm run build
        env:
          NUXT_PUBLIC_SOLANA_NETWORK: ${{ secrets.SOLANA_NETWORK }}
          NUXT_PUBLIC_SOLANA_RPC_URL: ${{ secrets.SOLANA_RPC_URL }}
          NUXT_PUBLIC_KWAMI_NFT_PROGRAM_ID: ${{ secrets.PROGRAM_ID }}
          NUXT_PUBLIC_KWAMI_COLLECTION_MINT: ${{ secrets.COLLECTION_MINT }}
          NUXT_PUBLIC_KWAMI_COLLECTION_AUTHORITY: ${{ secrets.COLLECTION_AUTHORITY }}
          NUXT_PUBLIC_KWAMI_DNA_REGISTRY: ${{ secrets.DNA_REGISTRY }}
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
          working-directory: ./market
```

## 🌍 Custom Domain

### Vercel

```bash
# Add domain
vercel domains add your-domain.com

# Configure DNS
# Add A record: @ → 76.76.21.21
# Add CNAME: www → cname.vercel-dns.com
```

### Netlify

1. Go to Domain Settings
2. Add custom domain
3. Configure DNS:
   - A record: @ → 75.2.60.5
   - CNAME: www → your-site.netlify.app

## 🔒 Security

### CORS Headers

```typescript
// server/middleware/cors.ts
export default defineEventHandler((event) => {
  setResponseHeaders(event, {
    'Access-Control-Allow-Origin': 'https://your-domain.com',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  })
})
```

### Rate Limiting

```typescript
// server/middleware/rateLimit.ts
import { RateLimiter } from 'limiter'

const limiter = new RateLimiter({
  tokensPerInterval: 100,
  interval: 'minute',
})

export default defineEventHandler(async (event) => {
  const remaining = await limiter.removeTokens(1)
  if (remaining < 0) {
    throw createError({
      statusCode: 429,
      message: 'Too many requests',
    })
  }
})
```

## 📝 Post-Deployment

1. **Test Everything**
   - Wallet connection
   - NFT browsing
   - Buying/Selling
   - Mobile responsiveness

2. **Monitor Metrics**
   - Page load times
   - Error rates
   - Transaction success rates
   - User engagement

3. **Gather Feedback**
   - User testing
   - Community feedback
   - Bug reports

4. **Iterate**
   - Fix issues
   - Add features
   - Improve performance

## 🆘 Troubleshooting

### Build Failures

```bash
# Clear cache
rm -rf .nuxt .output node_modules
npm install
npm run build
```

### Environment Variables Not Working

- Check variable names (must start with `NUXT_PUBLIC_`)
- Restart dev server after changes
- Verify on deployment platform

### Performance Issues

- Enable compression
- Use CDN for assets
- Optimize images
- Implement caching
- Use dedicated RPC endpoint

## 📚 Resources

- [Nuxt Deployment Docs](https://nuxt.com/docs/getting-started/deployment)
- [Vercel Docs](https://vercel.com/docs)
- [Netlify Docs](https://docs.netlify.com/)
- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)

---

**Ready to Deploy?** Follow the steps above for your chosen platform and launch your marketplace!

