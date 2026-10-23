#!/bin/sh
set -eu

if [ -z "${ADMIN_USER:-}" ] || [ -z "${ADMIN_PASSWORD:-}" ]; then
  echo "Defina ADMIN_USER e ADMIN_PASSWORD no arquivo .env antes de subir o container." >&2
  exit 1
fi

secret="${ADMIN_SESSION_SECRET:-}"
if [ "${#secret}" -lt 32 ]; then
  echo "ADMIN_SESSION_SECRET precisa ter pelo menos 32 caracteres em produção." >&2
  exit 1
fi

mkdir -p /app/src/data /app/public/uploads
chown -R nextjs:nodejs /app/src/data /app/public/uploads

exec su-exec nextjs "$@"
