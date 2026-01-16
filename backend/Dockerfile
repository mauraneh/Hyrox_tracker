# =========================
# Stage 1: Builder
# =========================
FROM node:20-alpine3.18 AS builder
WORKDIR /app

# Dépendances natives (bcrypt / prisma)
RUN apk add --no-cache python3 make g++ libc6-compat

# Dépendances + Prisma schema
COPY package*.json ./
COPY prisma ./prisma/

# Install deps (incl. dev) pour build
RUN npm ci

# Code
COPY . .

# Prisma client + build Nest
RUN npx prisma generate
RUN npm run build


# =========================
# Stage 2: Development
# =========================
FROM node:20-alpine3.18 AS development
WORKDIR /app

RUN apk add --no-cache python3 make g++ libc6-compat openssl1.1-compat

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci
RUN npx prisma generate

COPY . .

EXPOSE 3000
CMD ["npm", "run", "start:dev"]


# =========================
# Stage 3: Production
# =========================
FROM node:20-alpine3.18 AS production
WORKDIR /app

# Prisma runtime
RUN apk add --no-cache openssl1.1-compat

# Installer uniquement les deps de prod
COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci --only=production && \
    npx prisma generate && \
    npm cache clean --force

# Copier la dist buildée
COPY --from=builder /app/dist ./dist

# User non-root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

USER nestjs

EXPOSE 3000

CMD ["node", "dist/main.js"]