# Stage 1: Build
FROM node:20-alpine3.18 AS builder
WORKDIR /app

## Necessaire pour le BCRYPT côté Backend
RUN apk add --no-cache python3 make g++ libc6-compat

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci

COPY . .
RUN npx prisma generate
RUN npm run build

# Stage 2: Development
FROM node:20-alpine3.18 AS development

# Install build dependencies for native modules and OpenSSL 1.1 for Prisma
RUN apk add --no-cache python3 make g++ openssl1.1-compat

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm install

# Generate Prisma Client
RUN npx prisma generate

# Copy source code
COPY . .

# Expose port
EXPOSE 3000

# Start the application in dev mode
CMD ["npm", "run", "start:dev"]

# Stage 3: Production
FROM node:20-alpine3.18 AS production

WORKDIR /app

# Prisma a besoin d'OpenSSL 1.1 dans l'image de prod
RUN apk add --no-cache openssl1.1-compat

# Install only production dependencies
COPY package*.json ./
COPY prisma ./prisma/

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

# Start the application
CMD ["node", "dist/main.js"]


