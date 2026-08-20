#!/bin/sh
set -e

echo "==> Creating storage symlink..."
php artisan storage:link --force

echo "==> Caching config, routes (with runtime env vars)..."
php artisan config:cache
php artisan route:cache

echo "==> Running migrations..."
php artisan migrate --force

echo "==> Starting supervisord..."
exec /usr/bin/supervisord -n -c /etc/supervisor/conf.d/supervisord.conf
