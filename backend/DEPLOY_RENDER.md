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
| `REDIS_URL` | Upstash **Redis Connect** URL beginning with `rediss://` |

Do not change `DB_PORT`; `render.yaml` sets it to `4000`.

## 4. Configure Redis and seed the production database (no Render Shell required)

The Render deployment automatically runs migrations on each deploy. If a deployment stops during migration, fix the failing migration and redeploy; Laravel resumes from the first migration that was not recorded in the `migrations` table.

Before seeding, create the Upstash database described in `SETUP_REDIS.md`, then add its native Redis `rediss://` URL as `REDIS_URL` in Render. Do not use the Upstash REST URL or REST token; Laravel's Redis client requires the Redis Connect URL.

To populate the initial demo data without Render Shell:

1. Open the service's **Environment** page in Render.
2. Set `RUN_SEEDERS` to `true` and save the change.
3. Trigger **Manual Deploy** then select **Deploy latest commit**.
4. Confirm the deploy log contains `==> Seeding database...` and finishes successfully.
5. Immediately set `RUN_SEEDERS` back to `false` and save it.

The seeder uses the production `APP_URL`, so stored mascot URLs use the Render domain. `RUN_SEEDERS` defaults to `false` in `render.yaml`.

If a prior deployment already completed the general seeders but failed at `LeaderboardSeeder`, leave `RUN_SEEDERS=false`. Set `RUN_LEADERBOARD_SEEDER=true`, deploy once, then set it back to `false`. This runs only the leaderboard bootstrap and does not create duplicate demo data.

Do not leave `RUN_SEEDERS=true`: the current demo seeders create sample accounts, courses, lessons, and attempts and must only run against an empty database.

Never run `php artisan migrate:fresh` against this service. It drops all tables and user data. For a genuinely clean demo database, create a new TiDB database/cluster, update the Render database variables, then deploy once with `RUN_SEEDERS=true`.

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
- Each normal deploy runs `php artisan migrate --force` but does not seed or delete data. Initial data is only seeded when `RUN_SEEDERS=true`.
