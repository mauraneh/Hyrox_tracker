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

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

USER nestjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the application
CMD ["node", "dist/main.js"]
