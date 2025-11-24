# 🚀 Candy Machine Deployment Guide

## Render.com Deployment

### Prerequisites

- GitHub repository connected to Render
- Render account with Web Service plan

### Configuration

The candy machine is configured to deploy on Render using the following settings:

#### Root Directory
```
candy
```

#### Build Command
```bash
npm install && npm run build
```
**Important:** Use `&&` (not `&`) to ensure install completes before build starts.

#### Start Command
```bash
cd candy && node .output/server/index.mjs
```

**Important:** If you set `Root Directory: candy` in Render UI, use:
```bash
node .output/server/index.mjs
```

But if building from repo root, the start command must include `cd candy &&`.

#### Environment Variables

Set these in Render dashboard:

- `NODE_VERSION`: `25.2.1`
- `NUXT_PUBLIC_SOLANA_NETWORK`: `devnet` or `mainnet-beta`
- `NUXT_PUBLIC_SOLANA_RPC_URL`: Your Solana RPC endpoint
- `NUXT_PUBLIC_KWAMI_NFT_PROGRAM_ID`: Your deployed program ID
- `NUXT_PUBLIC_ARWEAVE_GATEWAY`: `https://arweave.net` (default)

### Using render.yaml

Alternatively, you can use the included `render.yaml` file:

1. Connect your GitHub repo to Render
2. Render will automatically detect and use `candy/render.yaml`
3. Update environment variables in Render dashboard

### Common Issues

#### oxc-parser Native Binding Error

If you see errors about `oxc-parser` or native bindings:

✅ **Solution:** The `.npmrc` file in the candy directory handles this automatically by setting:
- `legacy-peer-deps=true`
- `optional=true`

#### Build Command Running Before Install

❌ **Wrong:** `npm install & npm run build` (runs in parallel)
✅ **Correct:** `npm install && npm run build` (runs sequentially)

#### Missing Environment Variables

Ensure all required environment variables are set in Render dashboard under "Environment" tab.

### Deployment Steps

1. **Connect Repository**
   - Go to Render dashboard
   - Click "New +" → "Web Service"
   - Connect your GitHub repository

2. **Configure Service**
   - Name: `kwami-candy-machine`
   - Root Directory: `candy` (or leave empty and use full path in start command)
   - Environment: `Node`
   - Build Command: `npm install && npm run build` (or `npm run build:candy` if root is empty)
   - Start Command: `cd candy && node .output/server/index.mjs` (or just `node .output/server/index.mjs` if root is `candy`)

3. **Set Environment Variables**
   - Add all required environment variables listed above

4. **Deploy**
   - Click "Create Web Service"
   - Render will automatically deploy

5. **Verify**
   - Check build logs for errors
   - Visit the deployed URL
   - Test minting functionality

### Monitoring

- **Build Logs**: Available in Render dashboard
- **Runtime Logs**: Real-time logs in Render dashboard
- **Health Check**: Render automatically monitors service health

### Troubleshooting

#### Build Fails with Dependency Errors

```bash
# Clear cache and rebuild
# In Render dashboard: Settings → Clear build cache & rebuild
```

#### Application Won't Start

```bash
# Check start command
node .output/server/index.mjs

# Verify build output exists
ls -la .output/server/
```

#### Connection to Solana Fails

- Verify `NUXT_PUBLIC_SOLANA_RPC_URL` is correct
- Check RPC endpoint is accessible
- Ensure network (devnet/mainnet) matches your configuration

### Performance Optimization

- **Free Plan**: Good for development/testing
- **Starter Plan**: Recommended for production
- **Custom CDN**: Consider adding Cloudflare for static assets

### Security

- **Environment Variables**: Never commit sensitive data
- **RPC Endpoints**: Use private RPC for production
- **Rate Limiting**: Implement on production
- **CORS**: Configure properly for your domain

### Updates

To update the deployment:

1. Push changes to your GitHub branch
2. Render auto-deploys on push to main
3. Or manually trigger deploy in Render dashboard

### Support

- [Render Documentation](https://render.com/docs)
- [Nuxt 4 Deployment](https://nuxt.com/docs/getting-started/deployment)
- [GitHub Issues](https://github.com/alexcolls/kwami/issues)

