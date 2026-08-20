# Deploy EduWave API with Render and TiDB Cloud

This deployment uses only free tiers and does not require a payment card:

- **Render Free Web Service** runs the Laravel API, Nginx, and the database queue worker.
- **TiDB Cloud Serverless** provides MySQL-compatible storage.
- **Vercel** continues to host the Next.js frontend.

Static mascot files are included in the Docker image. No separate file-storage service is needed.

## 1. Create a TiDB Cloud Serverless cluster

1. Create an account at [TiDB Cloud](https://tidbcloud.com/).
2. Create a free Serverless cluster in an AWS Singapore region when available.
3. In the cluster's **Connect** dialog, choose a general connection and record these values:
   - host
   - port (normally `4000`)
   - username
   - password
   - database name (normally `test`, unless you create another database)

TiDB requires TLS. The provided Docker image uses the system CA bundle through `MYSQL_ATTR_SSL_CA=/etc/ssl/certs/ca-certificates.crt`.

## 2. Push the backend to GitHub

Commit and push the backend deployment files, including `Dockerfile`, `docker/`, and `render.yaml`.

Do **not** commit `.env`. It remains ignored by Git.

## 3. Create the Render service

1. Sign in at [Render](https://dashboard.render.com/) with GitHub.
2. Select **New** then **Blueprint**.
3. Select the repository that contains this backend.
4. If this is a monorepo, set the Blueprint path to `backend/render.yaml`.
5. Confirm the `eduwave-backend` service on the Free plan.

Render asks for each variable marked as a secret. Enter:

| Variable | Value |
| --- | --- |
| `APP_URL` | The public `https://<service-name>.onrender.com` URL supplied by Render |
| `APP_KEY` | Output from `php artisan key:generate --show` |
| `DB_HOST` | TiDB host from its Connect dialog |
| `DB_DATABASE` | TiDB database name, normally `test` |
| `DB_USERNAME` | TiDB username from its Connect dialog |
| `DB_PASSWORD` | TiDB password from its Connect dialog |

Do not change `DB_PORT`; `render.yaml` sets it to `4000`.

## 4. Seed the production database once

The Render deployment automatically runs migrations on each deploy. If a deployment stops during migration, fix the failing migration and redeploy; Laravel resumes from the first migration that was not recorded in the `migrations` table. Seed only once after the first successful deploy:

1. Open the Render service dashboard.
2. Open **Shell**.
3. Run:

```sh
php artisan db:seed --force
```

This uses the production `APP_URL`, so the stored mascot URLs use the Render domain.

For later seed updates, run a specific seeder instead of `migrate:fresh`:

```sh
php artisan db:seed --class=MascotSeeder --force
```

Never run `php artisan migrate:fresh` against production because it drops all tables and user data.

## 5. Verify API and mascot storage

Open these URLs in a browser:

```text
https://<service-name>.onrender.com/up
https://<service-name>.onrender.com/storage/mascots/biru/level-1.webp
```

The health endpoint must return HTTP 200 and the second URL must return the mascot image.

## 6. Configure Vercel

In the frontend Vercel project, set this Production environment variable and redeploy:

```text
NEXT_PUBLIC_API_URL=https://<service-name>.onrender.com
```

The existing backend CORS configuration must permit the Vercel frontend origin. Test login, the mascot API, and displayed mascot images after redeployment.

## Operating the Free Service

- Render Free services sleep after inactivity. The first request after sleep can take around a minute.
- Before the 6 September demo, open `/up` and the Vercel frontend a few minutes early to wake the API.
- Render automatically redeploys after each push to the linked branch (`autoDeployTrigger: commit`).
- Monitor failures from the Render dashboard's **Logs** tab.
- Each normal deploy runs `php artisan migrate --force` but does not seed or delete data.
