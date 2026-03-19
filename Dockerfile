# =======================================================
# Stage 1: Build
# Vite bakes VITE_* env vars at compile time.
# Pass VITE_API_URL as a build arg in Coolify/Docker.
# =======================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies first (cache layer)
COPY package.json package-lock.json* ./
RUN npm ci

# Copy source
COPY . .

# VITE_API_URL and VITE_WHATSAPP_NUMBER are required at build time.
# Coolify: add them as Build Variables before deploying.
# Docker manual: --build-arg VITE_API_URL=https://api.example.com --build-arg VITE_WHATSAPP_NUMBER=59898018085
ARG VITE_API_URL
ARG VITE_WHATSAPP_NUMBER
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_WHATSAPP_NUMBER=$VITE_WHATSAPP_NUMBER

RUN npm run build

# =======================================================
# Stage 2: Serve (nginx:alpine — no Node in runtime)
# =======================================================
FROM nginx:alpine

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy our nginx config (gzip + cache-control + SPA fallback)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

# Coolify / Docker Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --spider http://localhost/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
