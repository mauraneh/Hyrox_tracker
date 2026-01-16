# Stage 1: Build
FROM node:20-alpine3.18 AS builder
WORKDIR /app

RUN apk add --no-cache python3 make g++ libc6-compat

COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci

COPY . .
RUN npx prisma generate
RUN npm run build

# Stage 2: Production
FROM node:20-alpine3.18 AS production
WORKDIR /app

RUN apk add --no-cache openssl1.1-compat

COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci --only=production && npx prisma generate && npm cache clean --force

COPY --from=builder /app/dist ./dist

RUN addgroup -g 1001 -S nodejs && adduser -S nestjs -u 1001
USER nestjs

EXPOSE 3000

CMD ["node", "dist/main.js"]
