# Deployment Guide

This guide covers various options for deploying the Kwami website.

## Prerequisites

Before deploying, make sure to build the project:

```bash
npm run build
```

This creates an optimized production build in the `dist/` directory.

## Deployment Options

### 1. Vercel (Recommended)

[Vercel](https://vercel.com) offers automatic deployments with zero configuration.

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd web
vercel
```

Or connect your GitHub repository to Vercel for automatic deployments on push.

### 2. Netlify

[Netlify](https://netlify.com) provides easy deployment with drag-and-drop.

**Option A: Drag and Drop**
1. Build the project: `npm run build`
2. Drag the `dist/` folder to Netlify's deploy page

**Option B: CLI**
```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
cd web
netlify deploy --prod --dir=dist
```

### 3. GitHub Pages

Deploy directly from your repository:

1. Create a GitHub Actions workflow (`.github/workflows/deploy.yml`):

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install and Build
        run: |
          cd web
          npm install
          npm run build
      
      - name: Deploy
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./web/dist
```

2. Enable GitHub Pages in your repository settings
3. Push to main branch

### 4. Static File Hosting

The `dist/` folder contains static files that can be served by any web server:

**Apache**: Upload contents to your `public_html` or `www` directory

**Nginx**: 
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/web/dist;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### 5. Docker

Create a `Dockerfile` in the `web/` directory:

```dockerfile
FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Build and run:
```bash
docker build -t kwami-website .
docker run -p 8080:80 kwami-website
```

### 6. AWS S3 + CloudFront

1. Create an S3 bucket
2. Enable static website hosting
3. Build the project: `npm run build`
4. Upload the `dist/` folder contents to S3
5. (Optional) Set up CloudFront for CDN

```bash
# Using AWS CLI
aws s3 sync dist/ s3://your-bucket-name --delete
```

### 7. Cloudflare Pages

1. Connect your GitHub repository to Cloudflare Pages
2. Set build command: `npm run build`
3. Set build output directory: `dist`
4. Deploy

## Custom Domain

Most hosting providers offer custom domain setup:

1. Add your domain in the hosting provider's dashboard
2. Update your DNS records to point to the hosting service
3. Enable HTTPS (usually automatic)

## Environment Variables

If you need to add environment variables in the future:

1. Create a `.env` file (don't commit this!)
2. Use Vite's `import.meta.env` to access them
3. Configure them in your hosting provider's dashboard

Example `.env`:
```
VITE_API_URL=https://api.example.com
VITE_ANALYTICS_ID=your-id
```

## Performance Optimization

The build is already optimized, but you can further improve:

1. **Enable compression** (gzip/brotli) on your server
2. **Set cache headers** for static assets
3. **Use a CDN** for global distribution
4. **Enable HTTP/2** or HTTP/3

## Monitoring

Consider adding:

- Google Analytics or Plausible for visitor tracking
- Sentry for error tracking
- Lighthouse CI for performance monitoring

## Troubleshooting

**Build fails locally but works in CI:**
- Ensure you have the same Node.js version
- Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`

**404 on routes (SPA issue):**
- Configure your server to always serve `index.html` for non-file requests
- Most static hosts have this enabled by default

**Assets not loading:**
- Check that paths are relative (no leading `/` if not at root)
- Verify base URL in `vite.config.js` if hosting in a subdirectory

## Updates

To update the deployed site:

1. Make changes to your code
2. Test locally: `npm run dev`
3. Build: `npm run build`
4. Deploy using your chosen method above

Most modern hosting platforms (Vercel, Netlify, etc.) auto-deploy when you push to your repository.


