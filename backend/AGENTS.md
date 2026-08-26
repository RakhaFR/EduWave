# Backend Agent Guide

## Commands

- Bootstrap dependencies, `.env`, key, migrations, and Vite assets: `composer setup`
- Run the API server, database queue listener, Pail logs, and Vite together: `composer dev`
- Run all tests (clears config first): `composer test`
- Run one test file or test method: `php artisan test tests/Feature/CourseVisibilityTest.php` or `php artisan test --filter=test_guest_sees_only_published_courses`
- Format PHP: `vendor/bin/pint`

## Runtime And Tests

- PHP 8.2, Laravel 12, Sanctum, and PHPUnit 11 are the backend baseline.
- `.env.example` targets MySQL/TiDB. The test suite overrides this with in-memory SQLite, array cache/session, null broadcasting, synchronous queues, and runs `migrate` during every test's setup. Do not require external services for feature tests.
- The normal development queue driver is `database`; `composer dev` already starts its listener.
- Chat attachment uploads use `CLOUDINARY_URL`. Realtime rooms and private chats use Laravel broadcasting/Reverb; channel authorization is registered in `routes/channels.php` and exposed under authenticated `/api` routes.

## API Conventions

- `routes/api.php` owns the API; all routes are grouped below `/api/v1`.
- Controllers return the established `ApiController` envelope (`success`, `data`, `error`, `meta`), not an `Http\Resources\ApiResponse` resource.
- Put request validation in the existing `app/Http/Requests` classes, inheriting `BaseRequest` to preserve the API's validation messages.
- Protect authenticated endpoints with `auth:sanctum`; use `role:admin`, `role:instructor`, `role:student`, or `role:admin,instructor` as routes require. Use registered policies for model ownership/access decisions.
- UUID primary keys are the model default. Preserve `HasUuids`, non-incrementing string keys, and UUID-aware schema relationships in new domain models.

## Domain Wiring

- `AppServiceProvider` explicitly registers policies, `UserObserver`, and the `XpAwarded` to `UpdateLeaderboardOnXpAwarded` listener. Update this wiring when adding related policies, observers, or listeners.
- XP changes feed Redis sorted-set leaderboard state through `LeaderboardService`; keep XP-award flows event-driven rather than adding independent leaderboard writes.
