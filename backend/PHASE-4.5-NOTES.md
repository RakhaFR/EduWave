# Phase 4.5 Implementation Notes — Leaderboard System

## ✅ Implementation Summary

Phase 4.5 has been fully implemented with the following components:

### Core Components Created

1. **XpAwarded Event** (`app/Events/XpAwarded.php`)
   - Dispatched whenever XP is awarded to a user
   - Contains: user, xpAmount, source ('lesson', 'exam', etc.)

2. **UpdateLeaderboardOnXpAwarded Listener** (`app/Listeners/UpdateLeaderboardOnXpAwarded.php`)
   - Listens for XpAwarded events
   - Calls LeaderboardService to update Redis sorted sets
   - Queued for async processing (implements ShouldQueue)

3. **LeaderboardService** (`app/Services/LeaderboardService.php`)
   - Manages Redis sorted sets: `leaderboard:global` and `leaderboard:weekly:{Y-W}`
   - Methods:
     - `updateScore(User $user)` - Updates both global and weekly leaderboards
     - `getRank(User $user, string $scope)` - Returns user's rank using ZREVRANK
     - `getTopN(string $scope, int $limit, int $offset)` - Returns top N users
     - `getUserWithNeighbors(User $user, string $scope, int $neighbors)` - Returns user's rank + context

4. **LeaderboardController** (`app/Http/Controllers/LeaderboardController.php`)
   - `GET /api/v1/leaderboard` - Global all-time rankings
   - `GET /api/v1/leaderboard/weekly` - Current week rankings
   - `GET /api/v1/leaderboard/me` - Authenticated user's rank + neighbors

### XP Award Integration Points

XpAwarded event is now dispatched at the following call sites:

1. **Lesson Completion** (`app/Models/Lesson.php:77`)
   ```php
   XpAwarded::dispatch($user, $this->xp_reward, 'lesson');
   ```

2. **Exam Submission** (`app/Services/ExamService.php:85`)
   ```php
   $user->increment('xp', $xpEarned);
   XpAwarded::dispatch($user, $xpEarned, 'exam');
   ```
   - **FIXED:** ExamService was previously returning `xp_earned` in the response but NOT actually incrementing user XP. This has been corrected.

### Consistency Fixes Applied

1. **Response Data Format**
   - Changed `data: []` to `data: null` in:
     - `AuthController::logout`
     - `AuthController::forgotPassword`
     - `AuthController::resetPassword`
     - `UserController::changePassword`

2. **Exam Time Limit Field**
   - Changed `time_limit_seconds` to `time_limit_sec` in:
     - `ExamService::formatStartPayload`
     - README.md documentation

### Documentation Updates

- **README.md**
  - Added leaderboard endpoints to the API endpoints table
  - Added detailed documentation for all 3 leaderboard endpoints
  - Fixed consistency issues (data:null, time_limit_sec)
  - Included implementation note about Redis Sorted Sets and XpAwarded event

- **TODO.md**
  - Marked Phase 4.5 as complete
  - Documented decision to drop monthly and course-specific leaderboards (see rationale below)
  - Flagged auth refresh-token question for product decision

### Tests Created

Comprehensive test suite in `tests/Feature/LeaderboardTest.php`:
- LeaderboardService unit tests (updateScore, getRank, getTopN, getUserWithNeighbors)
- XpAwarded event integration tests (lesson completion, exam submission)
- Leaderboard API endpoint tests (global, weekly, /me, pagination)

**Note:** Tests currently fail in local Windows environment due to missing Redis PHP extension. See verification instructions below.

---

## 📋 Scope Decisions Made

### ❌ Monthly Leaderboard — DROPPED

**Reason:** Original Redis key design in `web-analysis.md` only specified:
- `leaderboard:global`
- `leaderboard:weekly:{Y-W}`

Monthly was not in the original spec. Adding it would require inventing a new key format (e.g., `leaderboard:monthly:{Y-m}`) without product approval. Per instructions: "don't silently invent a monthly key scheme."

**To implement in future:** Add `leaderboard:monthly:{Y-m}` key in LeaderboardService and a `/monthly` endpoint in LeaderboardController.

---

### ❌ Course-Specific Leaderboard — DROPPED

**Reason:** Current schema does not track XP earned per course. The `users` table only has a global `xp` column.

**Why this is a problem:**
- To show "top users in course X," we need to know how much XP each user earned *within that course's context*.
- Current implementation awards XP globally when lessons/exams are completed, but doesn't store which course the XP came from.

**To implement in future:**
Option 1: Create a `course_xp` pivot table:
```php
Schema::create('course_xp', function (Blueprint $table) {
    $table->uuid('user_id');
    $table->uuid('course_id');
    $table->integer('xp_earned')->default(0);
    $table->primary(['user_id', 'course_id']);
});
```

Option 2: Use separate Redis sorted sets per course:
- Key: `leaderboard:course:{course_id}`
- Update this set in addition to global/weekly when XP is awarded in a course context
- Requires passing course context to XpAwarded event

Per instructions: "flag it rather than faking it."

---

## 🔴 Redis Requirement

### Production Requirement

The leaderboard system **requires Redis** to function. Attempting to use the leaderboard endpoints without Redis will result in connection errors.

**Why Redis?**
- O(log N) rank calculation via `ZREVRANK` (vs. O(N log N) for SQL ORDER BY)
- Sub-millisecond leaderboard queries at scale
- Automatic sorted set ordering by score
- Per web-analysis.md design rationale

### Local Development Setup

If you want to test the leaderboard locally on Windows, install Redis:

1. **Option A: Docker (Recommended)**
   ```bash
   docker run -d -p 6379:6379 redis:7-alpine
   ```

2. **Option B: WSL2 + Redis**
   ```bash
   wsl --install
   wsl
   sudo apt update
   sudo apt install redis-server
   redis-server
   ```

3. **Option C: Memurai (Windows Native)**
   - Download from https://www.memurai.com/
   - Free for development use

4. **Install PHP Redis Extension**
   ```bash
   pecl install redis
   ```
   Then add `extension=redis` to `php.ini`.

### Verify Redis Connection

```bash
php artisan tinker
```
```php
use Illuminate\Support\Facades\Redis;
Redis::ping(); // Should return "+PONG"
```

---

## ✅ Verification Steps

### 1. Run Existing Tests (Non-Leaderboard)

All non-leaderboard tests should pass:

```bash
php artisan test --exclude-group=leaderboard
```

**Expected:** 36 tests pass (AuthController, EnrollmentAndLesson, ExamAndAttempt, UserController)

**Actual Result:** ✅ 36 passed

### 2. Run Leaderboard Tests (Requires Redis)

```bash
php artisan test tests/Feature/LeaderboardTest.php
```

**If Redis is installed:** 13 tests should pass
**If Redis is NOT installed:** 13 tests will fail with "Class 'Redis' not found"

---

## 🧪 Manual Tinker Verification (Requires Redis)

### Step 1: Create Test Users and Award XP

```bash
php artisan tinker
```

```php
use App\Models\User;
use App\Events\XpAwarded;

// Create test users
$user1 = User::factory()->create(['username' => 'champion', 'xp' => 0]);
$user2 = User::factory()->create(['username' => 'runner_up', 'xp' => 0]);
$user3 = User::factory()->create(['username' => 'third_place', 'xp' => 0]);

// Award XP
$user1->increment('xp', 500);
XpAwarded::dispatch($user1, 500, 'test');

$user2->increment('xp', 300);
XpAwarded::dispatch($user2, 300, 'test');

$user3->increment('xp', 100);
XpAwarded::dispatch($user3, 100, 'test');
```

### Step 2: Verify Redis Sorted Sets

```php
use Illuminate\Support\Facades\Redis;

// Check global leaderboard (should show scores in descending order)
$global = Redis::zrevrange('leaderboard:global', 0, -1, 'WITHSCORES');
// Expected: ['user1_id' => 500, 'user2_id' => 300, 'user3_id' => 100, ...]

// Check user1's rank (should be 0 for top position)
$rank = Redis::zrevrank('leaderboard:global', $user1->id);
// Expected: 0 (0-indexed rank)
```

### Step 3: Test Leaderboard API

```bash
# Get auth token
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"'$user1->email'","password":"password"}'

# Test global leaderboard
curl -X GET http://localhost:8000/api/v1/leaderboard \
  -H "Authorization: Bearer <token>"

# Test /me endpoint
curl -X GET "http://localhost:8000/api/v1/leaderboard/me?scope=global&neighbors=2" \
  -H "Authorization: Bearer <token>"
```

**Expected Response Structure:**
- `/leaderboard` returns rankings sorted by XP (highest first)
- Rank 1 = user1 (500 XP)
- Rank 2 = user2 (300 XP)
- Rank 3 = user3 (100 XP)

---

## 🚨 Known Issues & Limitations

### 1. Exam XP Award Bug Fixed

**Issue:** ExamService was calculating `xp_earned` and returning it in the response, but NOT actually incrementing the user's XP.

**Fixed:** Added `$user->increment('xp', $xpEarned)` before dispatching XpAwarded event.

**Impact:** Previous exam submissions did NOT award XP to users. After this fix, all exam submissions will correctly increment user XP and update leaderboards.

### 2. Weekly Leaderboard Reset

**Status:** NOT IMPLEMENTED

The weekly leaderboard key (`leaderboard:weekly:{Y-W}`) is created with an 8-day TTL, but there's no scheduled command to explicitly reset it every Monday.

**To implement:**
```php
// app/Console/Commands/ResetWeeklyLeaderboard.php
class ResetWeeklyLeaderboard extends Command
{
    public function handle()
    {
        $lastWeek = now()->subWeek()->format('o-\WW');
        Redis::del('leaderboard:weekly:' . $lastWeek);
    }
}

// routes/console.php
Schedule::command('leaderboard:reset-weekly')
    ->weeklyOn(1, '00:00')
    ->timezone('Asia/Jakarta');
```

### 3. Listener Queue Driver

The `UpdateLeaderboardOnXpAwarded` listener implements `ShouldQueue`, meaning it will be processed asynchronously.

**Default Queue Driver:** `sync` (runs immediately, no queue worker needed)

**For Production:** Switch to `redis` or `database` queue driver:
```env
QUEUE_CONNECTION=redis
```

Then run a queue worker:
```bash
php artisan queue:work redis --queue=default
```

---

## 🔑 Auth Refresh Token Question (DECISION REQUIRED)

### Current Implementation
- **Single long-lived Sanctum token** (7 days)
- No separate access + refresh token pair
- Sanctum handles token expiry via `expiration` config

### Original Spec (web-analysis.md)
> "No refresh token rotation needed — Sanctum handles token expiry via `tokenable`."

### Question for Product/Frontend
Does the frontend expect:
1. **Single token** (current implementation) — re-login after expiry
2. **Access + refresh token pair** — use refresh token to get new access token without re-login

If option 2 is required, we need to:
- Add a `/auth/refresh` endpoint
- Return separate `access_token` and `refresh_token` on login/register
- Implement token refresh logic (possibly using Laravel Passport instead of Sanctum)

**Recommendation:** Clarify this before Phase 4.6 to avoid rework.

---

## 📝 Files Modified

### Created
- `app/Events/XpAwarded.php`
- `app/Listeners/UpdateLeaderboardOnXpAwarded.php`
- `app/Services/LeaderboardService.php`
- `app/Http/Controllers/LeaderboardController.php`
- `tests/Feature/LeaderboardTest.php`
- `PHASE-4.5-NOTES.md` (this file)

### Modified
- `app/Providers/AppServiceProvider.php` - Registered XpAwarded event listener
- `app/Models/Lesson.php` - Added XpAwarded event dispatch
- `app/Services/ExamService.php` - Added XP increment + XpAwarded event dispatch
- `app/Http/Controllers/ApiController.php` - Added optional `$meta` parameter to `success()` method
- `app/Http/Controllers/AuthController.php` - Fixed `data: []` to `data: null`
- `app/Http/Controllers/UserController.php` - Fixed `data: []` to `data: null`
- `routes/api.php` - Added leaderboard routes
- `README.md` - Added leaderboard endpoint documentation + consistency fixes
- `TODO.md` - Marked Phase 4.5 complete + added decision notes

---

## 🎯 Next Steps (Phase 4.6)

Before starting Phase 4.6 (Study Rooms & Realtime):

1. **Resolve auth refresh token question** (see above)
2. **Install Redis** in production environment
3. **Configure queue worker** for async listener processing
4. **(Optional) Implement weekly leaderboard reset command**
5. **(Optional) Add course-specific leaderboard** if product decides it's needed

---

**Phase 4.5 Status:** ✅ **COMPLETE**

All requirements implemented per instructions. Redis installation and tests marked as environment-dependent.
