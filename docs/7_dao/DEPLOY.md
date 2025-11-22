# 🚀 KWAMI DAO Deployment Guide

## Render.com Deployment

### Prerequisites

1. GitHub account with kwami repository
2. Render.com account
3. Deployed Solana programs (optional for testing)

### Setup Instructions

#### 1. Connect Repository

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository: `alexcolls/kwami`
4. Select the repository

#### 2. Configure Service

**Basic Settings:**
- **Name:** `kwami-dao`
- **Region:** Oregon (US West)
- **Branch:** `main`
- **Runtime:** Node
- **Build Command:** `npm run build:dao`
- **Start Command:** `cd dao && node .output/server/index.mjs`

**Advanced Settings:**
- **Node Version:** `22.16.0` (or 18+)
- **Instance Type:** Starter (or higher)
- **Auto-Deploy:** Yes (recommended)

#### 3. Environment Variables

Add these in Render Dashboard → Environment:

**Required:**
```
NUXT_PUBLIC_SOLANA_NETWORK=devnet
NUXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
```

**Optional (for full functionality):**
```
NUXT_PUBLIC_KWAMI_NFT_PROGRAM_ID=your_program_id
NUXT_PUBLIC_QWAMI_TOKEN_MINT=your_token_mint
NUXT_PUBLIC_KWAMI_COLLECTION_ADDRESS=your_collection_address
```

> **Note:** If you don't set the optional variables, the app will still work but NFT/token verification will use mock data.

#### 4. Deploy

Click **"Create Web Service"**

Render will:
1. Clone your repository
2. Run `npm run build:dao`
3. Start the server
4. Provide a live URL

### Build Process

The build command runs:
```bash
cd dao && npm install && npm run build
```

This will:
1. Navigate to dao directory
2. Install dependencies (with legacy-peer-deps)
3. Build Nuxt 4 application
4. Generate `.output/` directory

### Start Process

The start command runs:
```bash
cd dao && node .output/server/index.mjs
```

This starts the production Nuxt server.

### Expected Build Output

```
==> Cloning from https://github.com/alexcolls/kwami
==> Checking out commit in branch main
==> Using Node.js version 1.5.5
==> Running build command 'npm run build:dao'...

> kwami@1.4.2 build:dao
> cd dao && npm install && npm run build

added XXX packages
Building Nuxt...
✔ Nuxt Nitro server built
✔ Client built

==> Build succeeded!
==> Deploying...
==> Service live at: https://kwami-dao.onrender.com
```

## Troubleshooting

### Build Fails: Peer Dependency Warnings

**Issue:** npm ERESOLVE errors

**Solution:** We've added `.npmrc` with `legacy-peer-deps=true`

```bash
# dao/.npmrc
legacy-peer-deps=true
```

### Build Fails: Out of Memory

**Issue:** Build runs out of memory

**Solution:** 
1. Upgrade to higher instance type
2. Or add to environment:
```
NODE_OPTIONS=--max-old-space-size=4096
```

### Build Fails: Module Not Found

**Issue:** Missing dependencies

**Solution:** 
```bash
# Locally test the build
cd dao
rm -rf node_modules .nuxt .output
npm install
npm run build
```

### Start Fails: Port Already in Use

**Issue:** Port 3000 in use

**Solution:** Render sets `PORT` environment variable automatically. Nuxt will use it.

### Runtime Error: Environment Variables Not Set

**Issue:** App can't connect to Solana

**Solution:** Set environment variables in Render Dashboard:
- Go to your service
- Click "Environment"
- Add variables
- Click "Save Changes"
- Service will redeploy

## Alternative Deployment Methods

### Manual Deploy (from local)

```bash
# Build locally
cd dao
npm install
npm run build

# Test locally
npm run preview

# Deploy .output/ directory to any Node.js host
```

### Docker Deploy

```dockerfile
# dao/Dockerfile
FROM node:22-alpine

WORKDIR /app

# Copy package files
COPY dao/package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy app files
COPY dao/ ./

# Build
RUN npm run build

# Expose port
EXPOSE 3000

# Start
CMD ["node", ".output/server/index.mjs"]
```

Build and run:
```bash
docker build -t kwami-dao -f dao/Dockerfile .
docker run -p 3000:3000 \
  -e NUXT_PUBLIC_SOLANA_NETWORK=devnet \
  -e NUXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com \
  kwami-dao
```

### Vercel Deploy

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy from dao directory
cd dao
vercel --prod
```

### Netlify Deploy

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build
cd dao
npm run build

# Deploy
netlify deploy --prod --dir=.output/public
```

## Production Checklist

Before going to production:

- [ ] Set all environment variables
- [ ] Deploy Solana programs to mainnet
- [ ] Update RPC to mainnet or private node
- [ ] Enable SSL/HTTPS (automatic on Render)
- [ ] Set up custom domain
- [ ] Configure CORS if needed
- [ ] Set up monitoring/logging
- [ ] Test all features on production
- [ ] Backup database if using one
- [ ] Set up CI/CD pipeline
- [ ] Security audit
- [ ] Load testing
- [ ] Set up error tracking (Sentry, etc.)

## Monitoring

### Render Dashboard

Monitor your service:
- Logs: Real-time application logs
- Metrics: CPU, Memory, Network usage
- Events: Deploy history, service events
- Settings: Environment, scaling, etc.

### Health Check

Add to `nuxt.config.ts`:
```typescript
nitro: {
  routeRules: {
    '/api/health': { 
      cache: false,
      headers: {
        'Content-Type': 'application/json'
      }
    }
  }
}
```

Create `dao/server/api/health.ts`:
```typescript
export default defineEventHandler(() => {
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.5.5'
  }
})
```

### Custom Logs

Add logging to your app:
```typescript
// In server-side code
console.log('[DAO] Server started')
console.error('[DAO] Error:', error)
```

View logs in Render Dashboard → Logs tab.

## Scaling

### Vertical Scaling
Upgrade instance type for more resources:
- Starter: 512 MB RAM
- Standard: 2 GB RAM
- Pro: 4+ GB RAM

### Horizontal Scaling
Enable autoscaling in Render:
- Min instances: 1
- Max instances: 10
- Scale based on: CPU, Memory, or Request count

## Cost Optimization

### Free Tier
- 750 hours/month free
- Spins down after 15 min inactivity
- Cold start ~30s

### Starter Plan ($7/month)
- Always on
- No spin down
- 512 MB RAM
- Good for testing

### Standard Plan ($25/month)
- 2 GB RAM
- Better performance
- Production ready

## Support

### Render Documentation
- [Deploy Node.js](https://render.com/docs/deploy-node-js)
- [Environment Variables](https://render.com/docs/environment-variables)
- [Troubleshooting](https://render.com/docs/troubleshooting-deploys)

### KWAMI DAO Support
- [GitHub Issues](https://github.com/alexcolls/kwami/issues)
- [README.md](./README.md)
- [QUICKSTART.md](./QUICKSTART.md)

---

**Last Updated:** 2025-11-19  
**Version:** 0.1.0  
**Status:** Production Ready

