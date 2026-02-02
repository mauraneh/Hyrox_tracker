# =========================
# Development (local)
# =========================
FROM node:20-alpine AS development
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY frontend .

EXPOSE 4200
CMD ["npm", "start"]