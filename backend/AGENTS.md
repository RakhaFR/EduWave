# AGENTS.md

## Commands

Run dev environment (starts server, queue worker, log tail, and Vite concurrently):
```bash
composer dev
```

Run tests:
```bash
composer test
# or
php artisan test
```

Code formatting (Laravel Pint):
```bash
vendor/bin/pint
```

## Architecture

- **Framework:** Laravel 12, PHP 8.2+
- **Auth:** Sanctum token-based (Bearer)
- **Database:** SQLite (local/test), MariaDB/MySQL (prod)
- **Testing:** PHPUnit, in-memory SQLite
- **Queue:** Database driver (not sync in dev)
- **Frontend Assets:** Vite + Tailwind CSS 4

## Key Patterns

- **API Response Format:** All responses use `App\Http\Resources\ApiResponse` with `success`, `data`, `error`, `meta` structure
- **Route Prefix:** `/api/v1`
- **Role Middleware:** `role:admin,instructor` for management endpoints
- **UUIDs:** All models use UUID primary keys
- **Policies:** Authorization via Laravel Policies (e.g., `ExamAttemptPolicy`)
- **Events/Listeners:** XP/pearl awards trigger leaderboard updates via `XpAwarded` event
- **Gamification:** Pearls, XP, levels, streak tracking built into User model
- **Leaderboard:** Redis sorted sets for global/weekly rankings

## Testing Notes

- Tests run in-memory SQLite (see `phpunit.xml`)
- Feature tests in `tests/Feature/`
- Run full suite: `composer test` or `php artisan test`

## Local Dev Setup

```bash
composer setup  # installs deps, copies .env, generates key, migrates, builds frontend
```

## Skills

This repo has Laravel Boost configured with:
- `infer-conventions` — analyze and document Laravel patterns
- `laravel-best-practices` — apply Laravel coding standards
- `tailwindcss-development` — Tailwind utility class work
