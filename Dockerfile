# Dockerfile à la racine pour Railway
# Utilise le backend comme contexte de build

FROM node:20-alpine3.18 AS builder
WORKDIR /app

## Necessaire pour le BCRYPT côté Backend
RUN apk add --no-cache python3 make g++ libc6-compat

# Copier les fichiers du backend
COPY backend/package*.json ./
COPY backend/prisma ./prisma/

RUN npm ci

COPY backend/ .

RUN npx prisma generate
RUN npm run build

# Stage 2: Production
FROM node:20-alpine3.18 AS production

WORKDIR /app

# Prisma a besoin d'OpenSSL 1.1 dans l'image de prod
RUN apk add --no-cache openssl1.1-compat

# Install only production dependencies
COPY backend/package*.json ./
COPY backend/prisma ./prisma/

RUN npm ci --only=production && \
    npx prisma generate && \
    npm cache clean --force

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist

# Copy startup script
COPY backend/scripts/start.sh ./scripts/start.sh
RUN chmod +x ./scripts/start.sh

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

# Change ownership of app directory
RUN chown -R nestjs:nodejs /app

USER nestjs

# Expose port (Railway injecte le PORT dynamiquement)
EXPOSE 3000

# Note: Railway gère le healthcheck via railway.toml (healthcheckPath)
# Pas besoin de HEALTHCHECK Docker ici

# Start the application with migrations
CMD ["./scripts/start.sh"]
