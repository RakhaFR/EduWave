# Upstash Redis Setup

EduWave uses Redis sorted sets for global and weekly leaderboard rankings. Render Free does not include Redis, so create an Upstash Redis database and connect it through `REDIS_URL`.

## Create the database

1. Sign in at [Upstash Console](https://console.upstash.com/).
2. Select **Create Database** and choose **Regional**.
3. Name it `eduwave-leaderboard`.
4. Choose an AWS Singapore region when available.
5. Create the database.

## Copy the native Redis URL

1. Open the new database in Upstash.
2. In **Connect**, copy the connection string labeled **Redis Connect** or **Redis CLI**.
3. It must begin with `rediss://`, for example:

```text
rediss://default:<password>@<host>:6379
```

Do not use the REST URL (`https://...`) or REST token. They are for Upstash's HTTP API and cannot be used by Laravel's Redis driver.

## Add it to Render

1. In the Render service, open **Environment**.
2. Set `REDIS_URL` to the full `rediss://` value copied from Upstash.
3. Save changes.
4. Leave `REDIS_CLIENT=predis`, as set by `render.yaml`.

## Complete the current deployment

The earlier deployment seeded all demo data through `EnrollmentAndActivitySeeder`, then failed only while populating Redis. Do not run the full seed again.

1. Set `RUN_SEEDERS=false`.
2. Set `RUN_LEADERBOARD_SEEDER=true`.
3. Deploy the commit containing this setup.
4. Check for `==> Seeding leaderboard...` and a successful deploy.
5. Set `RUN_LEADERBOARD_SEEDER=false` immediately afterward.

The existing users are then loaded into the global and current-week Redis leaderboards.

## Verify

Open:

```text
https://<service-name>.onrender.com/api/v1/leaderboard
https://<service-name>.onrender.com/api/v1/leaderboard/weekly
```

Each response should include ranked users.
