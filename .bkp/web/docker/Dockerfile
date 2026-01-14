# syntax=docker/dockerfile:1

##
## Build Vite website with Node
##
FROM node:20-alpine AS builder
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build

##
## Serve static build via nginx
##
FROM nginx:1.27-alpine AS runner
WORKDIR /usr/share/nginx/html

# Copy built static files
COPY --from=builder /app/dist ./

# Copy nginx configuration if exists
COPY --from=builder /app/nginx.conf /etc/nginx/conf.d/default.conf 2>/dev/null || true

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

