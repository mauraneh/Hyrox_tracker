#!/bin/sh
set -e

echo "📦 Installing dependencies..."
npm install

echo "🔨 Rebuilding native modules..."
npm rebuild bcrypt --build-from-source

echo "🔧 Generating Prisma Client..."
npx prisma generate

echo "🚀 Starting NestJS application..."
exec "$@"

