# EduWave — Laravel Backend Blueprint
> Platform: **EduWave** — *"Selami Samudra Pengetahuan"* (Dive into the Ocean of Knowledge)
> Type: **LMS** with ocean/underwater gamification theme
> Backend Framework: **Laravel 11 (PHP 8.3)**
> Frontend: React + Vite (SPA) — consumes this API
> Analysis Date: 2026-08-13

---

## 📌 Platform Overview

| Feature | Detail |
|---|---|
| Pearl Gamification (`mutiara`) | XP + pearl reward economy |
| AI Study Assistant | OpenAI GPT integrated into lessons & study rooms |
| Real-Time Study Rooms | WebSocket-based multi-user collaboration |
| Mascot Customization | Unlockable avatars & accessories |
| Course Categories | Technology, Design, Marine Science, Language |
| User Roles | `student`, `instructor`, `admin` |

---

## 🗺️ Frontend Route → API Map

| Frontend Route | Backend Module | Access |
|---|---|---|
| `/` | — (public landing) | Public |
| `/login` | `AuthController@login` | Guest |
| `/register` | `AuthController@register` | Guest |
| `/dashboard` | `DashboardController` | Auth |
| `/course/:id` | `CourseController`, `LessonController` | Auth |
| `/exam/:id` | `ExamController`, `AttemptController` | Auth |
| `/leaderboard` | `LeaderboardController` | Auth |
| `/study-room` | `StudyRoomController` + Reverb WS | Auth |
| `/profile` | `UserController` | Auth |
| `/mascot-customize` | `MascotController` | Auth |
| `/admin` | `Admin/*` controllers | Admin |

---

## 1. 📡 API Routes & Contract

### Base URL
```
https://api.eduwave.id/v1
http://localhost:8000/v1
```

### Standard Request Headers
```http
Content-Type: application/json
Accept: application/json
Authorization: Bearer <sanctum_token>
X-Request-ID: <uuid>
Accept-Language: id
```

---

### 🔐 Auth — `routes/api.php`

```php
// routes/api.php
Route::prefix('v1')->group(function () {

    // Public auth routes
    Route::prefix('auth')->group(function () {
        Route::post('register',        [AuthController::class, 'register']);
        Route::post('login',           [AuthController::class, 'login']);
        Route::post('forgot-password', [AuthController::class, 'forgotPassword']);
        Route::post('reset-password',  [AuthController::class, 'resetPassword']);
    });

    // Authenticated auth routes
    Route::middleware('auth:sanctum')->prefix('auth')->group(function () {
        Route::post('logout', [AuthController::class, 'logout']);
        Route::get('me',      [AuthController::class, 'me']);
    });

});
```

| Method | Endpoint | Controller Method | Auth |
|---|---|---|---|
| `POST` | `/auth/register` | `AuthController@register` | No |
| `POST` | `/auth/login` | `AuthController@login` | No |
| `POST` | `/auth/logout` | `AuthController@logout` | Sanctum |
| `POST` | `/auth/forgot-password` | `AuthController@forgotPassword` | No |
| `POST` | `/auth/reset-password` | `AuthController@resetPassword` | No |
| `GET` | `/auth/me` | `AuthController@me` | Sanctum |

**Register Request → `App\Http\Requests\Auth\RegisterRequest`**
```json
{
  "username":         "string|required|unique:users",
  "email":            "string|required|email|unique:users",
  "password":         "string|required|min:8|confirmed",
  "password_confirmation": "string|required",
  "full_name":        "string|required"
}
```

**Register Response**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "username": "penjelajah_baru",
      "email": "user@email.com",
      "full_name": "Budi Santoso",
      "role": "student",
      "avatar_url": null,
      "pearls": 0,
      "xp": 0,
      "level": 1,
      "created_at": "2026-08-13T00:00:00Z"
    },
    "token": "1|sanctum_plain_text_token",
    "token_type": "Bearer"
  },
  "error": null,
  "meta": null
}
```

> **Auth Driver**: **Laravel Sanctum** (Personal Access Tokens for SPA/mobile).
> Tokens stored in `personal_access_tokens` table. No refresh token rotation needed — Sanctum handles token expiry via `tokenable`.

---

### 👤 User Routes

```php
Route::middleware('auth:sanctum')->prefix('v1')->group(function () {

    Route::get ('users/me',              [UserController::class, 'me']);
    Route::put ('users/me',              [UserController::class, 'updateProfile']);
    Route::put ('users/me/password',     [UserController::class, 'changePassword']);
    Route::get ('users/me/stats',        [UserController::class, 'stats']);
    Route::get ('users/me/mascot',       [MascotController::class, 'userMascot']);
    Route::put ('users/me/mascot',       [MascotController::class, 'setMascot']);
    Route::get ('users/me/achievements', [AchievementController::class, 'userAchievements']);
    Route::get ('users/{user}',          [UserController::class, 'show']);

    // Admin only
    Route::middleware('role:admin')->group(function () {
        Route::get   ('users',               [UserController::class, 'index']);
        Route::put   ('users/{user}/role',   [UserController::class, 'updateRole']);
        Route::delete('users/{user}',        [UserController::class, 'destroy']);
    });

});
```

---

### 📚 Course Routes

```php
// Public
Route::prefix('v1')->group(function () {
    Route::get('courses',      [CourseController::class, 'index']);
    Route::get('courses/{course}', [CourseController::class, 'show']);
});

// Authenticated
Route::middleware('auth:sanctum')->prefix('v1')->group(function () {
    Route::get   ('courses/{course}/lessons',  [LessonController::class, 'index']);
    Route::post  ('courses/{course}/enroll',   [EnrollmentController::class, 'enroll']);
    Route::delete('courses/{course}/enroll',   [EnrollmentController::class, 'unenroll']);
    Route::get   ('courses/{course}/progress', [EnrollmentController::class, 'progress']);

    Route::middleware('role:admin,instructor')->group(function () {
        Route::post  ('courses',                    [CourseController::class, 'store']);
        Route::put   ('courses/{course}',           [CourseController::class, 'update']);
        Route::delete('courses/{course}',           [CourseController::class, 'destroy']);
    });
});
```

**GET /v1/courses — Query Parameters**
```
?page=1
&per_page=12
&category=technology|design|marine|language|science|business
&difficulty=beginner|intermediate|advanced
&sort=newest|popular|rating
&search=string
```

**Course Resource — `App\Http\Resources\CourseResource`**
```json
{
  "id": "uuid",
  "title": "string",
  "description": "string",
  "instructor": { "id": "uuid", "full_name": "string", "avatar_url": "string" },
  "category": "technology",
  "difficulty": "beginner",
  "thumbnail_url": "string",
  "trailer_url": "string",
  "duration_minutes": 240,
  "lesson_count": 12,
  "enrolled_count": 1450,
  "rating": 4.8,
  "rating_count": 320,
  "tags": ["javascript", "web"],
  "status": "published",
  "pearls_reward": 50,
  "created_at": "2026-08-13T00:00:00Z",
  "updated_at": "2026-08-13T00:00:00Z"
}
```

---

### 🎓 Lesson Routes

```php
Route::middleware('auth:sanctum')->prefix('v1')->group(function () {
    Route::get ('lessons/{lesson}',          [LessonController::class, 'show']);
    Route::post('lessons/{lesson}/complete', [LessonController::class, 'complete']);

    Route::middleware('role:admin,instructor')->group(function () {
        Route::post  ('lessons',           [LessonController::class, 'store']);
        Route::put   ('lessons/{lesson}',  [LessonController::class, 'update']);
        Route::delete('lessons/{lesson}',  [LessonController::class, 'destroy']);
    });
});
```

---

### 📝 Exam Routes

```php
Route::middleware('auth:sanctum')->prefix('v1')->group(function () {
    Route::get ('exams/{exam}',                               [ExamController::class, 'show']);
    Route::post('exams/{exam}/attempts',                      [AttemptController::class, 'start']);
    Route::post('exams/{exam}/attempts/{attempt}/submit',     [AttemptController::class, 'submit']);
    Route::get ('exams/{exam}/attempts',                      [AttemptController::class, 'index']);
    Route::get ('exams/{exam}/attempts/{attempt}',            [AttemptController::class, 'show']);

    Route::middleware('role:admin,instructor')->group(function () {
        Route::post  ('exams',          [ExamController::class, 'store']);
        Route::put   ('exams/{exam}',   [ExamController::class, 'update']);
        Route::delete('exams/{exam}',   [ExamController::class, 'destroy']);
    });
});
```

**Start Attempt Response**
```json
{
  "success": true,
  "data": {
    "attempt_id": "uuid",
    "exam": {
      "id": "uuid",
      "title": "Ujian Akhir: JavaScript Dasar",
      "time_limit_seconds": 3600,
      "question_count": 20,
      "passing_score": 70
    },
    "questions": [
      {
        "id": "uuid",
        "text": "Apa output dari console.log(typeof null)?",
        "type": "multiple_choice",
        "options": [
          { "key": "A", "value": "null" },
          { "key": "B", "value": "object" },
          { "key": "C", "value": "undefined" },
          { "key": "D", "value": "string" }
        ],
        "points": 5
      }
    ],
    "started_at": "2026-08-13T00:00:00Z",
    "expires_at": "2026-08-13T01:00:00Z"
  },
  "error": null,
  "meta": null
}
```

**Submit Request → `App\Http\Requests\Exam\SubmitAttemptRequest`**
```json
{
  "answers": [
    { "question_id": "uuid", "selected_key": "B" },
    { "question_id": "uuid", "selected_key": "A" }
  ]
}
```

**Submit Response**
```json
{
  "success": true,
  "data": {
    "attempt_id": "uuid",
    "score": 85,
    "passed": true,
    "passing_score": 70,
    "pearls_earned": 30,
    "xp_earned": 150,
    "correct_count": 17,
    "total_count": 20,
    "time_taken_seconds": 2400,
    "results": [
      {
        "question_id": "uuid",
        "is_correct": true,
        "your_answer": "B",
        "correct_answer": "B",
        "explanation": "typeof null mengembalikan 'object' karena bug historis di JavaScript."
      }
    ]
  },
  "error": null,
  "meta": null
}
```

---

### 🏆 Leaderboard Routes

```php
Route::middleware('auth:sanctum')->prefix('v1')->group(function () {
    Route::get('leaderboard',                        [LeaderboardController::class, 'global']);
    Route::get('leaderboard/weekly',                 [LeaderboardController::class, 'weekly']);
    Route::get('leaderboard/monthly',                [LeaderboardController::class, 'monthly']);
    Route::get('leaderboard/course/{course}',        [LeaderboardController::class, 'byCourse']);
});
```

**Leaderboard Response**
```json
{
  "success": true,
  "data": {
    "current_user_rank": 42,
    "rankings": [
      {
        "rank": 1,
        "user": {
          "id": "uuid",
          "username": "coral_explorer",
          "full_name": "Rina Kartika",
          "avatar_url": "string",
          "level": 18
        },
        "pearls": 4800,
        "xp": 25000,
        "courses_completed": 12
      }
    ]
  },
  "error": null,
  "meta": { "period": "all-time", "current_page": 1, "total": 500 }
}
```

> **Implementation**: Leaderboard ranking cached in **Redis Sorted Sets** via `Cache::store('redis')`.
> Laravel scheduled command resets weekly set every Monday (`app/Console/Commands/ResetWeeklyLeaderboard.php`).

---

### 🌊 Study Room Routes

```php
Route::middleware('auth:sanctum')->prefix('v1')->group(function () {
    Route::get   ('study-rooms',              [StudyRoomController::class, 'index']);
    Route::post  ('study-rooms',              [StudyRoomController::class, 'store']);
    Route::get   ('study-rooms/{room}',       [StudyRoomController::class, 'show']);
    Route::post  ('study-rooms/{room}/join',  [StudyRoomController::class, 'join']);
    Route::delete('study-rooms/{room}/leave', [StudyRoomController::class, 'leave']);
    Route::delete('study-rooms/{room}',       [StudyRoomController::class, 'destroy']);
    Route::get   ('study-rooms/{room}/messages', [RoomMessageController::class, 'index']);
});
```

**WebSocket — Laravel Reverb**
```
wss://api.eduwave.id/app/<REVERB_APP_KEY>
Channel: private-study-room.{room_id}
```

**Broadcasting Events (`app/Events/`)**
```php
// Server → Client (broadcast via Reverb)
StudyRoomMessageSent::class   // event: 'message'
StudyRoomUserJoined::class    // event: 'user_joined'
StudyRoomUserLeft::class      // event: 'user_left'
StudyRoomAiResponse::class    // event: 'ai_response'
StudyRoomClosed::class        // event: 'room_closed'
```

**Client → Server (via Reverb client-side)**
```json
{ "event": "client-send-message", "data": { "content": "string" } }
{ "event": "client-ask-ai",       "data": { "prompt": "string", "context": "string" } }
```

---

### 🐠 Mascot & Gamification Routes

```php
Route::middleware('auth:sanctum')->prefix('v1')->group(function () {
    Route::get('mascots',            [MascotController::class, 'index']);
    Route::get('achievements',       [AchievementController::class, 'index']);
});
```

**Mascot Customize Request**
```json
PUT /v1/users/me/mascot
{
  "mascot_id": "uuid",
  "accessories": {
    "hat":        "accessory_id | null",
    "glasses":    "accessory_id | null",
    "outfit":     "accessory_id | null",
    "background": "accessory_id | null"
  }
}
```

---

### 🤖 AI Study Assistant Routes

```php
Route::middleware('auth:sanctum')->prefix('v1')->group(function () {
    Route::post  ('ai/chat',         [AiController::class, 'chat']);
    Route::get   ('ai/chat/history', [AiController::class, 'history']);
    Route::delete('ai/chat/history', [AiController::class, 'clearHistory']);
    Route::get   ('ai/recommendations', [AiController::class, 'recommendations']);
});
```

**AI Chat Request**
```json
POST /v1/ai/chat
{
  "message":            "Jelaskan perbedaan antara let, const, dan var di JavaScript",
  "course_context_id":  "uuid | null",
  "lesson_context_id":  "uuid | null",
  "conversation_id":    "uuid | null"
}
```

> **Implementation**: `App\Services\AiService` wraps the `openai-php/laravel` client. Long responses dispatched as `ProcessAiResponse` Job on the `ai` queue.

---

### 🛡️ Admin Routes

```php
Route::middleware(['auth:sanctum', 'role:admin'])->prefix('v1/admin')->group(function () {
    Route::get('stats',                  [AdminController::class, 'stats']);
    Route::get('users',                  [AdminController::class, 'users']);
    Route::put('users/{user}/role',      [AdminController::class, 'updateRole']);
    Route::delete('users/{user}',        [AdminController::class, 'destroyUser']);
    Route::get('courses',                [AdminController::class, 'courses']);
    Route::post('courses',               [AdminController::class, 'storeCourse']);
    Route::put('courses/{course}/status',[AdminController::class, 'updateCourseStatus']);
    Route::delete('courses/{course}',    [AdminController::class, 'destroyCourse']);
    Route::get('reports',                [AdminController::class, 'reports']);
});
```

---

## 2. 🗃️ Database & Migrations Blueprint

### Recommended Stack

| Layer | Technology | Laravel Integration |
|---|---|---|
| **Primary DB** | **MariaDB 10.4** | Eloquent ORM, `DB_CONNECTION=mariadb` |
| **Cache / Queue** | **Redis 7** | `CACHE_DRIVER=redis`, `QUEUE_CONNECTION=redis` |
| **File Storage** | **Cloudflare R2 / S3** | `Storage::disk('s3')` via `AWS_*` env vars |
| **WebSocket** | **Laravel Reverb** | Native first-party WS server |
| **Email** | **Laravel Mail** | `Mail::to()->send(new WelcomeMail())` |

---

### Migrations (`database/migrations/`)

```php
// 0001_create_users_table.php
Schema::create('users', function (Blueprint $table) {
    $table->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));
    $table->string('username', 50)->unique();
    $table->string('email', 255)->unique();
    $table->string('password');
    $table->string('full_name', 100)->nullable();
    $table->text('bio')->nullable();
    $table->text('avatar_url')->nullable();
    $table->enum('role', ['student', 'instructor', 'admin'])->default('student');
    $table->integer('pearls')->default(0);
    $table->integer('xp')->default(0);
    $table->integer('level')->default(1);
    $table->integer('streak_days')->default(0);
    $table->timestamp('last_active')->nullable();
    $table->boolean('is_active')->default(true);
    $table->rememberToken();
    $table->timestamps();
    $table->softDeletes();
});

// 0002_create_mascots_table.php
Schema::create('mascots', function (Blueprint $table) {
    $table->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));
    $table->string('name', 100);
    $table->text('avatar_url');
    $table->text('description')->nullable();
    $table->integer('unlock_cost')->default(0);
    $table->enum('rarity', ['common', 'rare', 'epic', 'legendary'])->default('common');
    $table->string('category', 50)->nullable();
    $table->timestamps();
});

// 0003_create_user_mascots_table.php
Schema::create('user_mascots', function (Blueprint $table) {
    $table->uuid('user_id');
    $table->uuid('mascot_id');
    $table->boolean('is_active')->default(false);
    $table->json('accessories')->default('{}');
    $table->timestamp('unlocked_at')->useCurrent();
    $table->primary(['user_id', 'mascot_id']);
    $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
    $table->foreign('mascot_id')->references('id')->on('mascots')->cascadeOnDelete();
});

// 0004_create_courses_table.php
Schema::create('courses', function (Blueprint $table) {
    $table->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));
    $table->string('title', 255);
    $table->text('description')->nullable();
    $table->uuid('instructor_id')->nullable();
    $table->enum('category', ['technology','design','marine','language','science','business'])->nullable();
    $table->enum('difficulty', ['beginner', 'intermediate', 'advanced'])->nullable();
    $table->text('thumbnail_url')->nullable();
    $table->text('trailer_url')->nullable();
    $table->enum('status', ['draft', 'published', 'archived'])->default('draft');
    $table->integer('pearls_reward')->default(0);
    $table->integer('duration_minutes')->default(0);
    $table->foreign('instructor_id')->references('id')->on('users')->nullOnDelete();
    $table->timestamps();
    $table->softDeletes();
});

// 0005_create_lessons_table.php
Schema::create('lessons', function (Blueprint $table) {
    $table->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));
    $table->uuid('course_id');
    $table->string('title', 255);
    $table->enum('type', ['video', 'text', 'quiz'])->default('video');
    $table->longText('content')->nullable();
    $table->text('video_url')->nullable();
    $table->integer('duration_minutes')->default(0);
    $table->integer('order');
    $table->integer('xp_reward')->default(10);
    $table->boolean('is_preview')->default(false);
    $table->foreign('course_id')->references('id')->on('courses')->cascadeOnDelete();
    $table->timestamps();
});

// 0006_create_enrollments_table.php
Schema::create('enrollments', function (Blueprint $table) {
    $table->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));
    $table->uuid('user_id');
    $table->uuid('course_id');
    $table->decimal('progress_pct', 5, 2)->default(0);
    $table->enum('status', ['enrolled', 'completed', 'dropped'])->default('enrolled');
    $table->timestamp('enrolled_at')->useCurrent();
    $table->timestamp('completed_at')->nullable();
    $table->unique(['user_id', 'course_id']);
    $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
    $table->foreign('course_id')->references('id')->on('courses')->cascadeOnDelete();
});

// 0007_create_lesson_progress_table.php
Schema::create('lesson_progress', function (Blueprint $table) {
    $table->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));
    $table->uuid('user_id');
    $table->uuid('lesson_id');
    $table->integer('watch_seconds')->default(0);
    $table->timestamp('completed_at')->useCurrent();
    $table->unique(['user_id', 'lesson_id']);
    $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
    $table->foreign('lesson_id')->references('id')->on('lessons')->cascadeOnDelete();
});

// 0008_create_exams_table.php
Schema::create('exams', function (Blueprint $table) {
    $table->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));
    $table->uuid('course_id');
    $table->uuid('lesson_id')->nullable();
    $table->string('title', 255);
    $table->integer('time_limit_sec')->default(3600);
    $table->integer('passing_score')->default(70);
    $table->integer('max_attempts')->default(3);
    $table->integer('pearls_reward')->default(30);
    $table->foreign('course_id')->references('id')->on('courses')->cascadeOnDelete();
    $table->foreign('lesson_id')->references('id')->on('lessons')->nullOnDelete();
    $table->timestamps();
});

// 0009_create_exam_questions_table.php
Schema::create('exam_questions', function (Blueprint $table) {
    $table->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));
    $table->uuid('exam_id');
    $table->text('question_text');
    $table->string('type', 20)->default('multiple_choice');
    $table->json('options')->nullable();
    $table->string('correct_answer', 10);
    $table->text('explanation')->nullable();
    $table->integer('points')->default(5);
    $table->integer('order');
    $table->foreign('exam_id')->references('id')->on('exams')->cascadeOnDelete();
});

// 0010_create_exam_attempts_table.php
Schema::create('exam_attempts', function (Blueprint $table) {
    $table->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));
    $table->uuid('user_id');
    $table->uuid('exam_id');
    $table->decimal('score', 5, 2)->nullable();
    $table->boolean('passed')->default(false);
    $table->json('answers')->default('[]');
    $table->timestamp('started_at')->useCurrent();
    $table->timestamp('submitted_at')->nullable();
    $table->timestamp('expires_at')->nullable();
    $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
    $table->foreign('exam_id')->references('id')->on('exams')->cascadeOnDelete();
});

// 0011_create_study_rooms_table.php
Schema::create('study_rooms', function (Blueprint $table) {
    $table->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));
    $table->string('name', 100);
    $table->text('topic')->nullable();
    $table->uuid('host_user_id')->nullable();
    $table->integer('max_capacity')->default(20);
    $table->boolean('is_public')->default(true);
    $table->enum('status', ['active', 'closed'])->default('active');
    $table->foreign('host_user_id')->references('id')->on('users')->nullOnDelete();
    $table->timestamps();
});

// 0012_create_room_messages_table.php
Schema::create('room_messages', function (Blueprint $table) {
    $table->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));
    $table->uuid('room_id');
    $table->uuid('user_id')->nullable();
    $table->text('content');
    $table->enum('type', ['text', 'file', 'ai'])->default('text');
    $table->timestamp('sent_at')->useCurrent();
    $table->foreign('room_id')->references('id')->on('study_rooms')->cascadeOnDelete();
    $table->foreign('user_id')->references('id')->on('users')->nullOnDelete();
});

// 0013_create_achievements_table.php
Schema::create('achievements', function (Blueprint $table) {
    $table->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));
    $table->string('name', 100);
    $table->text('description')->nullable();
    $table->text('icon_url')->nullable();
    $table->string('condition_type', 50)->nullable();
    $table->integer('condition_value')->nullable();
    $table->integer('pearls_reward')->default(0);
    $table->timestamps();
});

// 0014_create_user_achievements_table.php
Schema::create('user_achievements', function (Blueprint $table) {
    $table->uuid('user_id');
    $table->uuid('achievement_id');
    $table->timestamp('earned_at')->useCurrent();
    $table->primary(['user_id', 'achievement_id']);
    $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
    $table->foreign('achievement_id')->references('id')->on('achievements')->cascadeOnDelete();
});
```

---

### Eloquent Models (`app/Models/`)

```
app/Models/
├── User.php              → HasMany: enrollments, attempts, mascots, achievements
├── Course.php            → BelongsTo: instructor; HasMany: lessons, exams, enrollments
├── Lesson.php            → BelongsTo: course; HasMany: lessonProgress
├── Enrollment.php        → BelongsTo: user, course
├── LessonProgress.php    → BelongsTo: user, lesson
├── Exam.php              → BelongsTo: course, lesson; HasMany: questions, attempts
├── ExamQuestion.php      → BelongsTo: exam
├── ExamAttempt.php       → BelongsTo: user, exam
├── StudyRoom.php         → BelongsTo: host (User); HasMany: messages
├── RoomMessage.php       → BelongsTo: room, user
├── Mascot.php            → BelongsToMany: users (via user_mascots)
├── Achievement.php       → BelongsToMany: users (via user_achievements)
└── PersonalAccessToken.php → (Sanctum default)
```

**User Model (key traits)**
```php
class User extends Authenticatable
{
    use HasApiTokens, HasFactory, SoftDeletes;

    protected $keyType   = 'string';
    public    $incrementing = false;

    protected $casts = [
        'id'         => 'string',
        'is_active'  => 'boolean',
        'last_active'=> 'datetime',
    ];

    protected $hidden = ['password', 'remember_token'];
}
```

---

### Database Indexes

```php
// In migration or separate index migration
Schema::table('users',         fn($t) => $t->index(['email']));
Schema::table('users',         fn($t) => $t->index(['xp']));           // leaderboard sort
Schema::table('courses',       fn($t) => $t->index(['category', 'status']));
Schema::table('courses',       fn($t) => $t->index(['instructor_id']));
Schema::table('courses',       fn($t) => $t->index(['created_at']));
Schema::table('enrollments',   fn($t) => $t->index(['user_id']));
Schema::table('enrollments',   fn($t) => $t->index(['course_id']));
Schema::table('lessons',       fn($t) => $t->index(['course_id', 'order']));
Schema::table('exam_attempts', fn($t) => $t->index(['user_id', 'exam_id']));
Schema::table('room_messages', fn($t) => $t->index(['room_id', 'sent_at']));
```

**Redis Leaderboard (via `Cache::store('redis')`)**
```php
// Increment user score
Redis::zadd('leaderboard:global',   $user->xp, $user->id);
Redis::zadd('leaderboard:weekly:' . now()->format('Y-W'), $xpEarned, $user->id);

// Fetch top 50
Redis::zrevrange('leaderboard:global', 0, 49, 'WITHSCORES');
```

---

## 3. 🔐 Authentication & Authorization Strategy

### Auth Driver: **Laravel Sanctum** (Personal Access Tokens)

```php
// config/sanctum.php
'expiration' => 60 * 24 * 7, // 7 days in minutes

// Creating token on login
$token = $user->createToken('eduwave-spa', ['*'], now()->addDays(7));
return response()->json(['token' => $token->plainTextToken]);
```

> Sanctum is the recommended choice over Passport for token-based SPA APIs. No refresh token rotation complexity — just re-issue a new token if expired.

---

### Role Middleware — `app/Http/Middleware/RoleMiddleware.php`

```php
class RoleMiddleware
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        if (!in_array($request->user()?->role, $roles)) {
            return response()->json([
                'success' => false,
                'error'   => ['code' => 'AUTH_FORBIDDEN', 'message' => 'Access denied.'],
            ], 403);
        }
        return $next($request);
    }
}

// Register in bootstrap/app.php (Laravel 11)
->withMiddleware(function (Middleware $middleware) {
    $middleware->alias(['role' => RoleMiddleware::class]);
})
```

---

### Permission Matrix (RBAC)

| Endpoint Group | Guest | Student | Instructor | Admin |
|---|---|---|---|---|
| `GET /courses` | ✅ | ✅ | ✅ | ✅ |
| `POST /courses/:id/enroll` | ❌ | ✅ | ✅ | ✅ |
| `POST /exams/:id/attempts` | ❌ | ✅ (enrolled) | ✅ | ✅ |
| `POST /courses` | ❌ | ❌ | ✅ | ✅ |
| `PUT /courses/:id` | ❌ | ❌ | ✅ (own) | ✅ |
| `GET /admin/*` | ❌ | ❌ | ❌ | ✅ |
| `DELETE /users/:id` | ❌ | ❌ | ❌ | ✅ |
| `GET /leaderboard` | ❌ | ✅ | ✅ | ✅ |
| `POST /study-rooms` | ❌ | ✅ | ✅ | ✅ |
| `PUT /users/me/mascot` | ❌ | ✅ | ✅ | ✅ |
| `POST /ai/chat` | ❌ | ✅ | ✅ | ✅ |

### Laravel Policies (`app/Policies/`)

```php
// CoursePolicy.php
public function update(User $user, Course $course): bool
{
    return $user->role === 'admin' || $course->instructor_id === $user->id;
}

// ExamAttemptPolicy.php
public function create(User $user, Exam $exam): bool
{
    $attemptCount = ExamAttempt::where('user_id', $user->id)
                               ->where('exam_id', $exam->id)
                               ->count();
    return $attemptCount < $exam->max_attempts;
}
```

---

### Security Middleware Stack

```
Request → CORS → Throttle → Sanctum Auth → Role → Form Request Validate → Controller → Response
```

| Concern | Laravel Implementation |
|---|---|
| **CORS** | `config/cors.php` — `allowed_origins: ['https://eduwave.id', 'http://localhost:5173']` |
| **Rate Limiting** | `RateLimiter::for('api', ...)` in `RouteServiceProvider` — Auth: 10/min, AI: 20/min |
| **Security Headers** | `fruitcake/laravel-cors` + custom `SecureHeaders` middleware |
| **Payload Validation** | `FormRequest` classes with Zod-like rules |
| **Password Hashing** | `Hash::make($password)` — bcrypt default, cost factor 12 |
| **XSS Sanitization** | `HTMLPurifier` + `strip_tags()` on text inputs |
| **TLS** | Enforced at Nginx level |

**Rate Limiting — `app/Providers/AppServiceProvider.php`**
```php
RateLimiter::for('auth', function (Request $request) {
    return Limit::perMinute(10)->by($request->ip());
});

RateLimiter::for('ai', function (Request $request) {
    return Limit::perMinute(20)->by($request->user()?->id ?: $request->ip());
});

RateLimiter::for('api', function (Request $request) {
    return Limit::perMinute(100)->by($request->user()?->id ?: $request->ip());
});
```

---

## 4. 🏗️ System Architecture & Data Flow

### Architectural Style: **Laravel Modular Monolith**

```
app/
├── Http/
│   ├── Controllers/
│   │   ├── Auth/          AuthController
│   │   ├── Course/        CourseController, LessonController, EnrollmentController
│   │   ├── Exam/          ExamController, AttemptController
│   │   ├── Gamification/  MascotController, AchievementController, LeaderboardController
│   │   ├── Social/        StudyRoomController, RoomMessageController
│   │   ├── Ai/            AiController
│   │   ├── Admin/         AdminController
│   │   └── UserController
│   ├── Requests/          (FormRequest validation per endpoint)
│   ├── Resources/         (API Resources — JSON transformers)
│   └── Middleware/        RoleMiddleware, CorrelationId, ForceJsonResponse
│
├── Models/                (Eloquent models)
├── Services/              (Business logic — AiService, GamificationService, LeaderboardService)
├── Jobs/                  (Queue jobs — SendWelcomeEmail, ProcessExamResult, ResetLeaderboard)
├── Events/                (Broadcasting — StudyRoomMessageSent, etc.)
├── Listeners/             (Event listeners)
├── Policies/              (Authorization — CoursePolicy, ExamPolicy)
├── Console/Commands/      (Artisan — ResetWeeklyLeaderboard, RecalcLevels)
└── Observers/             (Model observers — UserObserver for XP level-up)
```

---

### Request Flow: Student Takes Exam

```
1.  Student   → POST /v1/exams/{exam}/attempts
2.  Sanctum   → resolves auth()->user()
3.  Policy    → ExamAttemptPolicy::create() checks enrollment + attempt count
4.  Controller → AttemptController@start
5.  Service   → ExamService::startAttempt() — creates ExamAttempt, shuffles questions
6.  Resource  → AttemptResource (hides correct_answer)
7.  Response  → 201 { attempt_id, questions, expires_at }

8.  Student   → POST /v1/exams/{exam}/attempts/{attempt}/submit
9.  FormReq   → SubmitAttemptRequest validates answers array
10. Service   → ExamService::grade() — scores answers
11. Service   → GamificationService::award($user, $xp, $pearls)
12. Redis     → LeaderboardService::update($user)
13. Job       → ProcessExamResult::dispatch() → email + certificate (async)
14. Response  → 200 { score, passed, xp_earned, pearls_earned, results }
```

---

### Async Queue Jobs (`app/Jobs/`)

```php
// Queue connection: redis
// Queues: default, emails, gamification, certificates, ai
```

| Job Class | Trigger | Queue |
|---|---|---|
| `SendWelcomeEmail` | User registered | `emails` |
| `SendExamResultEmail` | Exam submitted | `emails` |
| `AwardXpAndPearls` | Lesson completed | `gamification` |
| `ResetWeeklyLeaderboard` | Scheduled (Mon 00:00 WIB) | `default` (scheduled) |
| `GenerateCertificate` | Course completed | `certificates` |
| `ProcessAiResponse` | AI chat message | `ai` |

**Running Workers**
```bash
php artisan queue:work redis --queue=emails,gamification,certificates,ai,default
```

**Scheduler (`routes/console.php` — Laravel 11)**
```php
Schedule::job(new ResetWeeklyLeaderboard)->weeklyOn(1, '00:00')->timezone('Asia/Jakarta');
Schedule::command('users:recalc-levels')->daily();
```

---

## 5. 📦 Standardized Response & Error Handling

### API Response Trait — `app/Http/Traits/ApiResponse.php`

```php
trait ApiResponse
{
    protected function success(mixed $data, string $message = '', int $status = 200): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data'    => $data,
            'error'   => null,
            'meta'    => null,
        ], $status);
    }

    protected function paginated(LengthAwarePaginator $paginator, $resource): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data'    => $resource::collection($paginator),
            'error'   => null,
            'meta'    => [
                'current_page' => $paginator->currentPage(),
                'per_page'     => $paginator->perPage(),
                'total'        => $paginator->total(),
                'total_pages'  => $paginator->lastPage(),
            ],
        ]);
    }

    protected function error(string $code, string $message, int $status = 400, array $details = []): JsonResponse
    {
        return response()->json([
            'success' => false,
            'data'    => null,
            'error'   => compact('code', 'message', 'details'),
            'meta'    => ['request_id' => request()->header('X-Request-ID')],
        ], $status);
    }
}
```

### Global Exception Handler — `bootstrap/app.php` (Laravel 11)

```php
->withExceptions(function (Exceptions $exceptions) {

    $exceptions->render(function (AuthenticationException $e, Request $request) {
        return response()->json([
            'success' => false,
            'error'   => ['code' => 'AUTH_TOKEN_INVALID', 'message' => 'Unauthenticated.'],
        ], 401);
    });

    $exceptions->render(function (ValidationException $e, Request $request) {
        $details = collect($e->errors())->flatMap(fn($msgs, $field) =>
            collect($msgs)->map(fn($msg) => ['field' => $field, 'issue' => $msg])
        )->values()->all();

        return response()->json([
            'success' => false,
            'error'   => ['code' => 'VALIDATION_ERROR', 'message' => 'Validasi gagal.', 'details' => $details],
        ], 422);
    });

    $exceptions->render(function (ModelNotFoundException $e, Request $request) {
        $model = class_basename($e->getModel());
        return response()->json([
            'success' => false,
            'error'   => ['code' => strtoupper($model) . '_NOT_FOUND', 'message' => "$model tidak ditemukan."],
        ], 404);
    });

})
```

### HTTP Status Code Standard

| Code | Meaning | Used When |
|---|---|---|
| `200` | OK | Successful GET, PUT |
| `201` | Created | Successful POST |
| `204` | No Content | Successful DELETE |
| `400` | Bad Request | Malformed request |
| `401` | Unauthorized | Missing/invalid Sanctum token |
| `403` | Forbidden | Valid token, wrong role |
| `404` | Not Found | Model not found |
| `409` | Conflict | Duplicate enrollment, max attempts |
| `422` | Unprocessable Entity | FormRequest validation failed |
| `429` | Too Many Requests | Throttle middleware |
| `500` | Internal Server Error | Unhandled exception |
| `503` | Service Unavailable | AI/external service down |

### Error Code Registry

| Code | HTTP | Description |
|---|---|---|
| `AUTH_INVALID_CREDENTIALS` | 401 | Wrong email/password |
| `AUTH_TOKEN_INVALID` | 401 | Sanctum token invalid/missing |
| `AUTH_FORBIDDEN` | 403 | Role not permitted |
| `USER_NOT_FOUND` | 404 | User ID does not exist |
| `COURSE_NOT_FOUND` | 404 | Course ID does not exist |
| `ENROLLMENT_DUPLICATE` | 409 | Already enrolled |
| `ENROLLMENT_REQUIRED` | 403 | Must enroll to access |
| `EXAM_ATTEMPT_LIMIT` | 409 | Max attempts reached |
| `EXAM_TIME_EXPIRED` | 422 | Submission window passed |
| `VALIDATION_ERROR` | 422 | FormRequest validation failed |
| `RATE_LIMIT_EXCEEDED` | 429 | Throttle limit hit |
| `AI_SERVICE_UNAVAILABLE` | 503 | OpenAI unreachable |
| `INTERNAL_ERROR` | 500 | Unhandled exception |

---

## 6. 🚀 Deployment, Configuration & Observability

### `.env` (Laravel conventions)

```bash
# ── App ──────────────────────────────────────────
APP_NAME="EduWave API"
APP_ENV=production
APP_KEY=base64:generated_by_artisan_key_generate
APP_DEBUG=false
APP_URL=https://api.eduwave.id
FRONTEND_URL=https://eduwave.id

# ── Database ──────────────────────────────────────
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=eduwave_db
DB_USERNAME=eduwave_user
DB_PASSWORD=your_password

# ── Cache & Queue ─────────────────────────────────
CACHE_STORE=redis
QUEUE_CONNECTION=redis
SESSION_DRIVER=redis
REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379

# ── Sanctum ───────────────────────────────────────
SANCTUM_STATEFUL_DOMAINS=eduwave.id,localhost:5173

# ── Email ─────────────────────────────────────────
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=noreply@eduwave.id
MAIL_PASSWORD=your-smtp-app-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@eduwave.id
MAIL_FROM_NAME="EduWave 🌊"

# ── File Storage (Cloudflare R2 / S3) ─────────────
FILESYSTEM_DISK=s3
AWS_ACCESS_KEY_ID=your-r2-access-key
AWS_SECRET_ACCESS_KEY=your-r2-secret-key
AWS_DEFAULT_REGION=auto
AWS_BUCKET=eduwave-assets
AWS_ENDPOINT=https://<account_id>.r2.cloudflarestorage.com
AWS_URL=https://assets.eduwave.id

# ── AI (OpenAI) ───────────────────────────────────
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini
OPENAI_MAX_TOKENS=1024

# ── Laravel Reverb (WebSocket) ────────────────────
REVERB_APP_ID=eduwave
REVERB_APP_KEY=your-reverb-app-key
REVERB_APP_SECRET=your-reverb-app-secret
REVERB_HOST=0.0.0.0
REVERB_PORT=8080
REVERB_SCHEME=https

# ── Monitoring ────────────────────────────────────
LOG_CHANNEL=stack
LOG_LEVEL=debug
SENTRY_LARAVEL_DSN=https://...@sentry.io/...
```

---

### Structured Logging (Laravel Log + Monolog)

```php
// config/logging.php — custom channel
'channels' => [
    'json' => [
        'driver'    => 'daily',
        'path'      => storage_path('logs/laravel.json'),
        'formatter' => Monolog\Formatter\JsonFormatter::class,
    ],
]

// Log with context
Log::channel('json')->info('Exam attempt started', [
    'request_id' => request()->header('X-Request-ID'),
    'user_id'    => auth()->id(),
    'exam_id'    => $exam->id,
    'method'     => request()->method(),
    'path'       => request()->path(),
    'ip'         => request()->ip(),
    'duration_ms'=> $durationMs,
]);
```

---

### CI/CD Pipeline

```
Developer → GitHub PR
         ↓
GitHub Actions:
  ├── composer install --no-dev
  ├── php artisan config:clear
  ├── ./vendor/bin/pest (PHPUnit / Pest tests)
  ├── php artisan migrate --force --dry-run (schema validation)
  └── Build Docker image → push to ghcr.io
         ↓
Staging   → Railway (auto-deploy on merge to `develop`)
Production → VPS via Docker Compose (on merge to `main`)
```

**Docker Compose Services**

| Service | Image | Purpose |
|---|---|---|
| `app` | `php:8.3-fpm-alpine` | Laravel API (PHP-FPM) |
| `worker` | `php:8.3-fpm-alpine` | `queue:work` process |
| `scheduler` | `php:8.3-fpm-alpine` | `schedule:work` process |
| `reverb` | `php:8.3-fpm-alpine` | `reverb:start` WebSocket server |
| `postgres` | `postgres:16-alpine` | Primary database |
| `redis` | `redis:7-alpine` | Cache + queue + pub/sub |
| `nginx` | `nginx:alpine` | Reverse proxy + SSL |

---

## 7. 📋 Laravel Tech Stack Summary

| Layer | Technology |
|---|---|
| **Language** | PHP 8.3 |
| **Framework** | Laravel 11 |
| **ORM** | Eloquent ORM |
| **Auth** | Laravel Sanctum (Personal Access Tokens) |
| **Validation** | Laravel Form Requests |
| **Authorization** | Laravel Policies + Role Middleware |
| **Primary DB** | PostgreSQL 16 |
| **Cache** | Redis 7 (`CACHE_STORE=redis`) |
| **Queue** | Laravel Queues + Redis driver |
| **WebSocket** | Laravel Reverb (first-party) |
| **Email** | Laravel Mail + Blade/Markdown templates |
| **File Storage** | Laravel Storage — Cloudflare R2 (S3 driver) |
| **AI** | `openai-php/laravel` package |
| **Response Format** | `ApiResponse` trait + API Resources |
| **Logging** | Laravel Log (Monolog) + Sentry (`sentry/sentry-laravel`) |
| **API Docs** | `darkaonline/l5-swagger` |
| **Testing** | Pest PHP + Laravel HTTP test helpers |
| **Containerization** | Docker + Docker Compose |
| **CI/CD** | GitHub Actions |

### Key Composer Packages

```json
{
  "require": {
    "laravel/framework":        "^11.0",
    "laravel/sanctum":          "^4.0",
    "laravel/reverb":           "^1.0",
    "openai-php/laravel":       "^0.10",
    "sentry/sentry-laravel":    "^4.0",
    "darkaonline/l5-swagger":   "^8.6",
    "spatie/laravel-query-builder": "^5.0",
    "predis/predis":            "^2.0"
  },
  "require-dev": {
    "pestphp/pest":             "^2.0",
    "pestphp/pest-plugin-laravel": "^2.0",
    "fakerphp/faker":           "^1.23",
    "laravel/pint":             "^1.0"
  }
}
```

---

*EduWave Backend Blueprint — Laravel 11 edition. Derived from frontend preview scan at https://readdy.cc/preview/f67b2574-4295-4338-838c-c8e5123529e6/12935612*
