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

if [ "${RUN_SEEDERS:-false}" = "true" ]; then
    echo "==> Seeding database..."
    php artisan db:seed --force
fi

if [ "${RUN_LEADERBOARD_SEEDER:-false}" = "true" ]; then
    echo "==> Seeding leaderboard..."
    php artisan db:seed --class=LeaderboardSeeder --force
fi

echo "==> Starting supervisord..."
exec /usr/bin/supervisord -n -c /etc/supervisor/conf.d/supervisord.conf
