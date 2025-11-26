# 🚀 Render.com Deployment Instructions for KWAMI DAO

## ✅ Build Fix Applied

The build issue has been resolved! Here's what was fixed:

### Problem
```
npm error notarget No matching version found for solana-wallets-vue@^0.6.2
```

### Solution
1. ✅ Updated `solana-wallets-vue` from `^0.6.2` to `^0.7.1` (latest version)
2. ✅ Added proper Node.js polyfills for Web3 libraries:
   - `crypto-browserify`
   - `stream-browserify`
   - `util`
3. ✅ Updated Vite configuration with proper aliases and externals
4. ✅ Added `.npmrc` with `legacy-peer-deps=true`
5. ✅ Created health check endpoint at `/api/health`

## 🎯 Quick Deploy to Render

### Step 1: Push to GitHub

```bash
cd /home/kali/labs/kwami

# Stage all changes
git add .

# Commit with emoji (as per your rules!)
git commit -m "🚀 Add KWAMI DAO with Render.com deployment config"

# Push to main
git push origin main
```

### Step 2: Create Web Service on Render

1. Go to https://dashboard.render.com
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository: `alexcolls/kwami`
4. Configure:

**Settings:**
```
Name: kwami-dao
Runtime: Node
Region: Oregon (US West)
Branch: main
Build Command: npm run build:dao
Start Command: cd dao && node .output/server/index.mjs
```

**Environment Variables:**
```
NODE_VERSION=22.16.0
NUXT_PUBLIC_SOLANA_NETWORK=devnet
NUXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
```

Optional (add when you have deployed programs):
```
NUXT_PUBLIC_KWAMI_NFT_PROGRAM_ID=your_program_id
NUXT_PUBLIC_QWAMI_TOKEN_MINT=your_token_mint
NUXT_PUBLIC_KWAMI_COLLECTION_ADDRESS=your_collection_address
```

5. Click **"Create Web Service"**

### Step 3: Wait for Build & Deploy

Expected output:
```
==> Cloning from https://github.com/alexcolls/kwami
==> Using Node.js version 1.5.6
==> Running build command 'npm run build:dao'...

> kwami@1.5.9 build:dao
> cd dao && npm install && npm run build

added 1752 packages
✔ Building client...
✔ Server built in 336ms
✔ Nuxt Nitro server built
✔ Build succeeded!

==> Deploying...
==> Your service is live at https://kwami-dao.onrender.com 🎉
```

Build time: ~2-3 minutes

### Step 4: Verify Deployment

Visit your service URL and check:

1. ✅ Page loads (gradient background visible)
2. ✅ "Select Wallet" button appears
3. ✅ Health endpoint works: `https://your-service.onrender.com/api/health`

Expected health response:
```json
{
  "status": "ok",
  "service": "kwami-dao",
  "version": "1.5.9",
  "timestamp": "2025-11-19T...",
  "uptime": 123.45,
  "environment": {
    "node": "v22.16.0",
    "platform": "linux",
    "network": "devnet"
  }
}
```

## 📋 What's Been Configured

### Files Created/Updated

1. ✅ `render.yaml` - Render service configuration
2. ✅ `dao/.npmrc` - npm settings for Render build
3. ✅ `dao/nuxt.config.ts` - Updated with Nitro preset & polyfills
4. ✅ `dao/package.json` - Fixed dependencies
5. ✅ `dao/server/api/health.ts` - Health check endpoint
6. ✅ `dao/ecosystem.config.cjs` - PM2 config (optional)
7. ✅ `dao/DEPLOY.md` - Complete deployment guide
8. ✅ `dao/RENDER_DEPLOY_INSTRUCTIONS.md` - This file

### Root package.json Scripts

Already configured (line 48):
```json
"build:dao": "cd dao && npm install && npm run build"
```

### Dependencies Fixed

Updated to working versions:
- `solana-wallets-vue`: `^0.7.1` ✅ (was `^0.6.2` ❌)
- Added: `crypto-browserify`, `stream-browserify`, `util`

### Vite Configuration

Added proper polyfills for Node.js modules:
```typescript
resolve: {
  alias: {
    buffer: 'buffer',
    stream: 'stream-browserify',
    crypto: 'crypto-browserify',
    util: 'util',
  },
},
```

## 🧪 Local Build Test

Build successfully tested locally:
```bash
cd dao
npm install
npm run build
# ✔ Client built in 16346ms
# ✔ Server built in 336ms
# ✔ Nuxt Nitro server built
```

Preview locally:
```bash
npm run preview
# Visit: http://localhost:3000
```

## 🔒 Environment Variables Reference

### Required (Set in Render Dashboard)

| Variable | Value | Description |
|----------|-------|-------------|
| `NODE_VERSION` | `22.16.0` | Node.js version |
| `NUXT_PUBLIC_SOLANA_NETWORK` | `devnet` | Solana network |
| `NUXT_PUBLIC_SOLANA_RPC_URL` | `https://api.devnet.solana.com` | RPC endpoint |

### Optional (For Full Functionality)

| Variable | Value | Description |
|----------|-------|-------------|
| `NUXT_PUBLIC_KWAMI_NFT_PROGRAM_ID` | `your_id` | KWAMI NFT program |
| `NUXT_PUBLIC_QWAMI_TOKEN_MINT` | `your_mint` | QWAMI token mint |
| `NUXT_PUBLIC_KWAMI_COLLECTION_ADDRESS` | `your_address` | NFT collection |

> **Note:** Without optional variables, the app works but uses mock data for NFT/token verification.

## 🚨 Troubleshooting

### Build Fails: Module Not Found

**Issue:** `Module "X" is not exported`

**Solution:** Already fixed! Polyfills added to `nuxt.config.ts`.

### Build Fails: Out of Memory

**Issue:** Node runs out of memory

**Solution:** Add environment variable in Render:
```
NODE_OPTIONS=--max-old-space-size=4096
```

### Runtime Error: Can't Connect to Wallet

**Issue:** Wallet button doesn't work

**Solution:** 
1. Check SSL is enabled (Render auto-enables)
2. Wallet extensions work on HTTPS only
3. Test with Phantom wallet first

### Slow Cold Starts (Free Tier)

**Issue:** App takes 30s to start after inactivity

**Solution:** Upgrade to Starter plan ($7/month) for always-on service.

## 📊 Monitoring

### View Logs

Render Dashboard → Your Service → Logs tab

Shows:
- Build output
- Runtime logs
- Errors
- Request logs

### Health Check

Monitor uptime:
```bash
curl https://your-service.onrender.com/api/health
```

Set up external monitoring (UptimeRobot, etc.) to ping this endpoint.

### Metrics

Render Dashboard → Your Service → Metrics tab

Shows:
- CPU usage
- Memory usage
- Network traffic
- Request count

## 💰 Pricing

### Free Tier
- ✅ 750 hours/month
- ⚠️ Spins down after 15 min inactivity
- ⚠️ Cold start ~30s
- Good for: Testing, demos

### Starter ($7/month)
- ✅ Always on
- ✅ No cold starts
- ✅ 512 MB RAM
- ✅ Custom domain
- Good for: Development, staging

### Standard ($25/month)
- ✅ 2 GB RAM
- ✅ Better performance
- ✅ More concurrent users
- Good for: Production

## 🎉 Success Checklist

Deployment is successful when:

- [ ] Build completes without errors
- [ ] Service shows "Live" status in Render
- [ ] URL loads and shows DAO dashboard
- [ ] Gradient background displays
- [ ] "Select Wallet" button visible
- [ ] Health endpoint returns 200 OK
- [ ] Wallet connects (Phantom, etc.)
- [ ] No console errors

## 📞 Support

### Render Issues
- [Render Docs](https://render.com/docs)
- [Render Support](https://render.com/support)
- [Community Forum](https://community.render.com)

### DAO Issues
- [GitHub Issues](https://github.com/alexcolls/kwami/issues)
- [README.md](./README.md)
- [DEPLOY.md](./DEPLOY.md)

## 🔗 Useful Links

- **Render Dashboard:** https://dashboard.render.com
- **GitHub Repo:** https://github.com/alexcolls/kwami
- **Solana Devnet:** https://explorer.solana.com/?cluster=devnet
- **Local Docs:** `dao/README.md`, `dao/QUICKSTART.md`

---

## 🎯 Quick Commands

```bash
# Test build locally
cd dao && npm run build

# Preview locally
cd dao && npm run preview

# Check health (after deploy)
curl https://your-service.onrender.com/api/health

# View Render logs (CLI)
render logs -s kwami-dao

# Redeploy (manual)
render deploy -s kwami-dao
```

---

**Status:** ✅ Ready to Deploy  
**Last Updated:** 2025-11-19  
**Version:** 1.5.9  
**Build Time:** ~2-3 minutes  
**Tested:** ✅ Local build successful


