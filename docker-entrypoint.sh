#!/bin/sh
set -e

echo "[entrypoint] Checking database migrations..."
if [ -n "$DATABASE_URL" ]; then
  echo "[entrypoint] Deploying Prisma migrations..."
  prisma migrate deploy --schema=./prisma/schema.prisma || {
    echo "[entrypoint] Migration failed on first attempt. Retrying in 3 seconds..."
    sleep 3
    prisma migrate deploy --schema=./prisma/schema.prisma
  }
  echo "[entrypoint] Migrations deployed successfully."
fi

echo "[entrypoint] Starting application server..."
exec "$@"
