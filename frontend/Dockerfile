# =========================
# Stage 1: Development
# =========================
FROM node:20-alpine AS development
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

EXPOSE 4200
CMD ["npm", "start"]


# =========================
# Stage 2: Builder
# =========================
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Build Angular en prod
RUN npm run build:prod


# =========================
# Stage 3: Production (Nginx)
# =========================
FROM nginx:alpine AS production

# Config nginx (tu dois avoir frontend/nginx.conf)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Angular build output (adapte si ton dist est différent)
COPY --from=builder /app/dist/frontend/browser /usr/share/nginx/html

EXPOSE 80

# Healthcheck simple
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost/health || exit 1

CMD ["nginx", "-g", "daemon off;"]