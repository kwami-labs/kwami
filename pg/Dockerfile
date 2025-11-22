# syntax=docker/dockerfile:1

##
## Build playground with Vite
##
FROM node:20-alpine AS builder
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy source and build the playground app
COPY . .
RUN npm run build:playground

##
## Serve static build via nginx
##
FROM nginx:1.27-alpine AS runner
WORKDIR /usr/share/nginx/html

COPY --from=builder /app/pg/dist ./

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]


