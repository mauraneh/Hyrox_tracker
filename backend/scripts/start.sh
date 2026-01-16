#!/bin/sh
set -e

echo "🔄 Running Prisma migrations..."
echo "📍 Current directory: $(pwd)"
echo "📍 Prisma schema location: $(ls -la prisma/schema.prisma 2>/dev/null || echo 'NOT FOUND')"
echo "📍 DATABASE_URL: ${DATABASE_URL:+Set (hidden)}${DATABASE_URL:-Not set}"

# Run migrations with retry logic
MAX_RETRIES=5
RETRY_DELAY=5
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
  if npx prisma migrate deploy; then
    echo "✅ Migrations completed successfully"
    break
  else
    RETRY_COUNT=$((RETRY_COUNT + 1))
    if [ $RETRY_COUNT -lt $MAX_RETRIES ]; then
      echo "⚠️  Migration failed, retrying in ${RETRY_DELAY}s (attempt ${RETRY_COUNT}/${MAX_RETRIES})..."
      sleep $RETRY_DELAY
    else
      echo "❌ Migration failed after ${MAX_RETRIES} attempts"
      exit 1
    fi
  fi
done

echo "🚀 Starting application..."

# Start the application
exec node dist/main.js
