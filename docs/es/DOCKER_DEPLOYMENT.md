# Docker Deployment Guide

Complete guide for deploying KWAMI ecosystem projects using Docker.

## Overview

As of version 1.5.8, all KWAMI ecosystem projects include comprehensive Docker support with three runtime options:
- **Node.js** - Default production runtime (node:20-alpine)
- **Bun** - High-performance JavaScript runtime (oven/bun:1-alpine)
- **Deno** - Secure TypeScript runtime (denoland/deno:alpine-2.1.4)

## Project Structure

Each project contains a `docker/` directory with three Dockerfile variants:

```
project/
├── docker/
│   ├── Dockerfile       # Node.js (default)
│   ├── Dockerfile.bun   # Bun runtime
│   └── Dockerfile.deno  # Deno runtime
└── ...
```

## Quick Start

### Building with Node.js (Default)

```bash
# From project root (app, dao, web, market, candy, or pg)
docker build -f docker/Dockerfile -t kwami-{project}:latest .

# Example: Build the app
cd app
docker build -f docker/Dockerfile -t kwami-app:latest .
```

### Building with Bun

```bash
docker build -f docker/Dockerfile.bun -t kwami-{project}:bun .
```

### Building with Deno

```bash
docker build -f docker/Dockerfile.deno -t kwami-{project}:deno .
```

## Project-Specific Instructions

### Nuxt Applications (app, dao, market, candy)

These projects use Nuxt 4 and build to `.output/server/index.mjs`.

**Ports:** 3000

**Build & Run:**

```bash
# Node.js
docker build -f docker/Dockerfile -t kwami-app .
docker run -p 3000:3000` \
  -e NODE_ENV=production \
  -e HOST=0.0.0.0 \
  kwami-app

# Bun
docker build -f docker/Dockerfile.bun -t kwami-app:bun .
docker run -p 3000:3000` kwami-app:bun

# Deno
docker build -f docker/Dockerfile.deno -t kwami-app:deno .
docker run -p 3000:3000` kwami-app:deno
```

**Environment Variables:**

Common variables for Nuxt apps:
```bash
NODE_ENV=production
HOST=0.0.0.0
PORT=3000
NUXT_PUBLIC_API_URL=https://api.example.com
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_KEY=your-key
```

**App-Specific:**
```bash
# app/
ELEVEN_LABS_API_KEY=your-key

# candy/
SOLANA_RPC_URL=https://api.devnet.solana.com
ARWEAVE_WALLET_KEY=your-key

# dao/
SOLANA_NETWORK=devnet
DAO_PROGRAM_ID=your-program-id

# market/
MARKETPLACE_PROGRAM_ID=your-program-id
```

### Vite Applications (web, pg)

These projects use Vite for building and nginx for serving static files.

**Ports:** 80

**Build & Run:**

```bash
# Node.js
docker build -f docker/Dockerfile -t kwami-web .
docker run -p 8080:80 kwami-web

# Bun
docker build -f docker/Dockerfile.bun -t kwami-web:bun .
docker run -p 8080:80 kwami-web:bun

# Deno
docker build -f docker/Dockerfile.deno -t kwami-web:deno .
docker run -p 8080:80 kwami-web:deno
```

**Custom nginx Configuration:**

Place an `nginx.conf` in your project root to customize nginx:

```nginx
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Enable gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
```

## Docker Compose

### Single Project

Create `docker-compose.yml` in project root:

```yaml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: docker/Dockerfile
    ports:
      - "3000:3000`"
    environment:
      - NODE_ENV=production
      - HOST=0.0.0.0
    restart: unless-stopped
```

### Full Ecosystem

```yaml
version: '3.8'

services:
  web:
    build:
      context: ./web
      dockerfile: docker/Dockerfile
    ports:
      - "80:80"
    restart: unless-stopped

  app:
    build:
      context: ./app
      dockerfile: docker/Dockerfile
    ports:
      - "3000:3000`"
    environment:
      - NODE_ENV=production
    restart: unless-stopped

  candy:
    build:
      context: ./candy
      dockerfile: docker/Dockerfile
    ports:
      - "3001:3000`"
    environment:
      - NODE_ENV=production
      - SOLANA_NETWORK=devnet
    restart: unless-stopped

  market:
    build:
      context: ./market
      dockerfile: docker/Dockerfile
    ports:
      - "3002:3000`"
    restart: unless-stopped

  dao:
    build:
      context: ./dao
      dockerfile: docker/Dockerfile
    ports:
      - "3003:3000`"
    restart: unless-stopped

  pg:
    build:
      context: ./pg
      dockerfile: docker/Dockerfile
    ports:
      - "8080:80"
    restart: unless-stopped
```

Run the full stack:

```bash
docker-compose up -d
```

## Production Deployment

### Multi-Stage Build Benefits

All Dockerfiles use multi-stage builds:

1. **Builder Stage**: Installs dependencies and builds the app
2. **Runner Stage**: Copies only the built artifacts (smaller image)

### Image Optimization

**Nuxt Apps:**
- Base: `node:20-alpine` (~40MB)
- With app: ~150-300MB (depending on dependencies)

**Vite Apps:**
- Base: `nginx:1.27-alpine` (~40MB)
- With static files: ~60-100MB

### Security Best Practices

1. **Use specific versions** in production:
   ```dockerfile
   FROM node:20.10.0-alpine
   ```

2. **Run as non-root user** (add to Dockerfile):
   ```dockerfile
   RUN addgroup -g 1001 -S nodejs
   RUN adduser -S nodejs -u 1001
   USER nodejs
   ```

3. **Scan for vulnerabilities**:
   ```bash
   docker scan kwami-app:latest
   ```

### Cloud Deployment

#### Render.com

1. Connect your GitHub repository
2. Create new **Web Service**
3. Set **Docker** as environment
4. Configure:
   - **Dockerfile Path**: `docker/Dockerfile`
   - **Docker Build Context**: `.`
   - **Port**: 3000 (Nuxt) or 80 (Vite)

#### Railway

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login and link project
railway login
railway link

# Deploy specific project
cd app
railway up --dockerfile docker/Dockerfile
```

#### DigitalOcean App Platform

1. Create new app from GitHub
2. Select repository and branch
3. Choose **Dockerfile** as source
4. Set **Dockerfile Location**: `docker/Dockerfile`
5. Configure environment variables

#### AWS ECS/Fargate

```bash
# Build and tag
docker build -f docker/Dockerfile -t kwami-app:latest .
docker tag kwami-app:latest {account}.dkr.ecr.{region}.amazonaws.com/kwami-app:latest

# Push to ECR
aws ecr get-login-password | docker login --username AWS --password-stdin {account}.dkr.ecr.{region}.amazonaws.com
docker push {account}.dkr.ecr.{region}.amazonaws.com/kwami-app:latest

# Create task definition and service (use AWS Console or CLI)
```

#### Google Cloud Run

```bash
# Build and push to GCR
gcloud builds submit --tag gcr.io/{project-id}/kwami-app \
  --dockerfile docker/Dockerfile

# Deploy
gcloud run deploy kwami-app \
  --image gcr.io/{project-id}/kwami-app \
  --platform managed \
  --port 3000 \
  --allow-unauthenticated
```

## Runtime Comparison

| Runtime | Build Time | Image Size | Performance | Compatibility |
|---------|-----------|------------|-------------|---------------|
| **Node.js** | ⭐⭐⭐ | ~200MB | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Bun** | ⭐⭐⭐⭐⭐ | ~180MB | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Deno** | ⭐⭐⭐⭐ | ~190MB | ⭐⭐⭐⭐ | ⭐⭐⭐ |

**Recommendations:**
- **Production**: Node.js (most stable, best compatibility)
- **Development**: Bun (fastest builds, great DX)
- **Experimental**: Deno (secure, TypeScript-first)

## Troubleshooting

### Build Fails with Native Modules

For apps using sharp, canvas, or other native modules:

```dockerfile
# Add build dependencies
RUN apk add --no-cache python3 make g++ cairo-dev jpeg-dev pango-dev giflib-dev
```

### Port Already in Use

```bash
# Find process using port 3000
lsof -i :3000`

# Kill process
kill -9 <PID>

# Or use different port
docker run -p 3001:3000` kwami-app
```

### Permission Denied

```bash
# Run with sudo
sudo docker build -f docker/Dockerfile -t kwami-app .

# Or add user to docker group
sudo usermod -aG docker $USER
```

### Build Cache Issues

```bash
# Build without cache
docker build --no-cache -f docker/Dockerfile -t kwami-app .
```

### Memory Issues

```bash
# Increase Docker memory limit
# Docker Desktop: Settings → Resources → Memory

# Or build with memory limits
docker build -f docker/Dockerfile -t kwami-app . --memory=4g
```

## CI/CD Integration

### GitHub Actions

```yaml
name: Build and Push Docker Image

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Build Docker image
        run: |
          cd app
          docker build -f docker/Dockerfile -t kwami-app:${{ github.sha }} .
      
      - name: Push to registry
        run: |
          echo "${{ secrets.DOCKER_PASSWORD }}" | docker login -u "${{ secrets.DOCKER_USERNAME }}" --password-stdin
          docker push kwami-app:${{ github.sha }}
```

## Next Steps

- [Deployment Guides by Project](#project-specific-deployment)
- Environment Configuration
- Production Checklist
- Monitoring & Logging

---

**Version**: 1.5.12  
**Last Updated**: November 22, 2025  
**Made with ❤️ by the KWAMI team**

