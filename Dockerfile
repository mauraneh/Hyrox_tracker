# =========================
# Stage 1: Build
# =========================
FROM node:20-alpine3.18 AS builder
WORKDIR /app

# Dépendances natives (bcrypt / prisma)
RUN apk add --no-cache python3 make g++ libc6-compat

# Déps backend
COPY backend/package*.json ./
COPY backend/prisma ./prisma/

RUN npm ci

# Code backend
COPY backend/ .

# Prisma client + build Nest
RUN npx prisma generate
RUN npm run build

# =========================
# Stage 2: Production
# =========================
FROM node:20-alpine3.18 AS production
WORKDIR /app

# OpenSSL requis par Prisma
RUN apk add --no-cache openssl1.1-compat

# Déps prod uniquement
COPY backend/package*.json ./
COPY backend/prisma ./prisma/

RUN npm ci --only=production && \
    npx prisma generate && \
    npm cache clean --force

# App buildée
COPY --from=builder /app/dist ./dist

# User non-root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

USER nestjs

EXPOSE 3000

# Démarrage simple (comme en CI / staging)
CMD ["node", "dist/main.js"]
