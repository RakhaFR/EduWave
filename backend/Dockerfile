# ============================================================
# Stage 1 — Composer dependencies (no dev)
# ============================================================
FROM composer:2.7 AS vendor

WORKDIR /app
COPY composer.json composer.lock ./
RUN composer install \
    --no-dev \
    --no-interaction \
    --no-progress \
    --no-scripts \
    --prefer-dist \
    --optimize-autoloader

# ============================================================
# Stage 2 — Production image
# ============================================================
FROM php:8.2-fpm-alpine

# System deps + PHP extensions
RUN apk add --no-cache \
        nginx \
        supervisor \
        curl \
        libpng-dev \
        libjpeg-turbo-dev \
        libwebp-dev \
        freetype-dev \
        libzip-dev \
        oniguruma-dev \
        icu-dev \
        openssl-dev \
    && docker-php-ext-configure gd \
        --with-freetype \
        --with-jpeg \
        --with-webp \
    && docker-php-ext-install -j$(nproc) \
        pdo_mysql \
        mbstring \
        zip \
        gd \
        intl \
        opcache \
        pcntl \
    && rm -rf /var/cache/apk/*

# PHP config
COPY docker/php/php.ini /usr/local/etc/php/conf.d/app.ini
COPY docker/php/opcache.ini /usr/local/etc/php/conf.d/opcache.ini

# Nginx config
COPY docker/nginx/default.conf /etc/nginx/http.d/default.conf

# Supervisor config
COPY docker/supervisor/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

WORKDIR /var/www/html

# Copy app source
COPY --chown=www-data:www-data . .

# Copy vendor from stage 1
COPY --from=vendor --chown=www-data:www-data /app/vendor ./vendor

# Bundle mascot images into image (static, won't change)
# Files already in storage/app/public/mascots — just ensure permissions
RUN chown -R www-data:www-data storage bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

# Pre-cache views and events at build time (no env dependency)
# config and route cache are done at runtime in entrypoint.sh
RUN php artisan view:cache \
    && php artisan event:cache

# Entrypoint
COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 10000

ENTRYPOINT ["/entrypoint.sh"]
