# Deploy EduWave to Fly.io

This deployment runs two Fly.io apps in the Singapore region:

- `eduwave-mysql`: MySQL 8.4 with a persistent Fly volume.
- `eduwave-backend`: Laravel API, Nginx, PHP-FPM, and its database queue worker.

Mascot images are static and are included in the Laravel Docker image. No object-storage service is required.

## 1. Install and authenticate Fly CLI

```powershell
winget install Fly-io.flyctl
fly auth signup
```

Close and reopen PowerShell after installing `flyctl` if the command is not found.

## 2. Create the MySQL app and volume

Run from the `backend` directory:

```powershell
fly apps create eduwave-mysql
fly volumes create mysql_data --app eduwave-mysql --region sin --size 1
fly secrets set --app eduwave-mysql MYSQL_PASSWORD="choose-a-strong-password" MYSQL_ROOT_PASSWORD="choose-another-strong-password"
fly deploy --app eduwave-mysql --config fly.mysql.toml
```

Keep the value used for `MYSQL_PASSWORD`. It is the Laravel database password.

Check that MySQL is healthy:

```powershell
fly status --app eduwave-mysql
fly logs --app eduwave-mysql
```

## 3. Create the Laravel API app

```powershell
fly apps create eduwave-backend
php artisan key:generate --show
```

Copy the generated `base64:...` key. Set it together with the MySQL user credentials:

```powershell
fly secrets set --app eduwave-backend APP_KEY="base64:paste-the-generated-key" DB_USERNAME="eduwave" DB_PASSWORD="paste-the-MYSQL_PASSWORD-from-step-2"
```

`fly.toml` already points the backend to `eduwave-mysql.internal`, the private Fly network hostname. Do not expose MySQL publicly.

Deploy the API:

```powershell
fly deploy
```

## 4. Seed the production database

The normal startup only runs migrations, so deployment does not unexpectedly replace data. Run the initial seed explicitly:

```powershell
fly ssh console --app eduwave-backend
php artisan db:seed --force
exit
```

`APP_URL` must be the Fly app's HTTPS URL before seeding so mascot URLs are written with the production domain:

```powershell
fly secrets set --app eduwave-backend APP_URL="https://eduwave-backend.fly.dev"
fly deploy
fly ssh console --app eduwave-backend
php artisan db:seed --force
exit
```

If the app name was changed, use its actual URL instead of `eduwave-backend.fly.dev`.

## 5. Verify the deployment

```powershell
fly status --app eduwave-backend
fly logs --app eduwave-backend
curl https://eduwave-backend.fly.dev/up
```

Expected health response is HTTP `200`. Then test a mascot image in a browser:

```text
https://eduwave-backend.fly.dev/storage/mascots/biru/level-1.webp
```

## 6. Connect Vercel frontend

In Vercel, add this Production environment variable and redeploy the frontend:

```text
NEXT_PUBLIC_API_URL=https://eduwave-backend.fly.dev
```

Replace the URL if your Fly API app has another name.

## Operations

```powershell
# Application logs
fly logs --app eduwave-backend

# Redeploy after backend changes
fly deploy

# Open a Laravel shell
fly ssh console --app eduwave-backend

# View MySQL logs
fly logs --app eduwave-mysql
```

## Important Limits

The MySQL data persists on a single 1 GB Fly volume in Singapore. Do not delete `eduwave-mysql` or its `mysql_data` volume. This is suitable for the qualifier and demo, but it is a single-instance setup rather than a managed, highly available database.
