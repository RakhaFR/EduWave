#!/bin/sh
set -e

echo "==> Creating storage symlink..."
php artisan storage:link --force

echo "==> Caching config, routes (with runtime environment)..."
php artisan config:cache
php artisan route:cache

if [ "${RUN_MIGRATIONS:-false}" = "true" ]; then
    echo "==> Running migrations..."
    php artisan migrate --force
fi

echo "==> Starting supervisord..."
exec /usr/bin/supervisord -n -c /etc/supervisor/conf.d/supervisord.conf
