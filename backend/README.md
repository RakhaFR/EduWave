# EduWave API Backend

EduWave is an interactive maritime and technology e-learning platform featuring gamification (pearls & XP economy), AI study assistance, mascot customization, real-time study rooms, and comprehensive course progression.

This backend is built using **Laravel 11**, **Laravel Sanctum** for token-based authentication, and **SQLite / MariaDB**.

---

## 🛠️ Technology Stack

* **Framework:** Laravel 11
* **Authentication:** Laravel Sanctum (Bearer Token)
* **Database:** SQLite (Testing / Local), MariaDB / MySQL (Production)
* **Testing:** PHPUnit / Pest (`php artisan test`)

---

## 🚀 Getting Started

### 1. Requirements
* PHP ^8.2
* Composer
* SQLite or MariaDB / MySQL

### 2. Installation & Setup
```bash
# Install PHP dependencies
composer install

# Environment configuration
cp .env.example .env
php artisan key:generate

# Run database migrations
php artisan migrate

# Start development server
php artisan serve
```

### 3. Running Tests
```bash
php artisan test
```

---

## 📡 Standard API Response Format

All API responses follow a consistent JSON structure:

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "error": null,
  "meta": null
}
```

### Error Response
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "AUTH_INVALID_CREDENTIALS",
    "message": "Email atau password salah.",
    "details": null
  },
  "meta": null
}
```

---

## 🔑 Authentication

Endpoints requiring authentication expect a standard HTTP `Authorization` header:

```http
Authorization: Bearer <sanctum_plain_text_token>
```

---

## 📚 API Endpoints Documentation

Base URL: `/api/v1`

| Group | Method | Endpoint | Auth | Description | Tested? |
|---|---|---|---|---|---|
| **Auth** | `POST` | `/api/v1/auth/register` | No | Register a new user account | ✓ |
| **Auth** | `POST` | `/api/v1/auth/login` | No | Authenticate user & issue Bearer token | ☐ |
| **Auth** | `POST` | `/api/v1/auth/forgot-password` | No | Request password reset link | ☐ |
| **Auth** | `POST` | `/api/v1/auth/reset-password` | No | Reset password using reset token | ☐ |
| **Auth** | `POST` | `/api/v1/auth/logout` | Yes | Revoke current authenticated token | ☐ |
| **Auth** | `GET` | `/api/v1/auth/me` | Yes | Fetch basic auth user state | ☐ |
| **User** | `GET` | `/api/v1/users/me` | Yes | Get detailed authenticated user profile | ☐ |
| **User** | `PUT` | `/api/v1/users/me` | Yes | Update user profile details | ☐ |
| **User** | `PUT` | `/api/v1/users/me/password` | Yes | Change user password (revokes tokens) | ☐ |
| **User** | `GET` | `/api/v1/users/me/stats` | Yes | Get gamification stats (pearls, xp, level, streak) | ☐ |
| **User** | `PUT` | `/api/v1/users/me/mascot` | Yes | Equip mascot and update custom accessories | ☐ |
| **User** | `GET` | `/api/v1/users/me/achievements` | Yes | Fetch list of unlocked user achievements | ☐ |
| **Course** | `GET` | `/api/v1/courses` | No | List published courses (filterable by category, difficulty, search, sort) | ☐ |
| **Course** | `GET` | `/api/v1/courses/{course}` | No | Show course details with lesson outline | ☐ |
| **Course** | `POST` | `/api/v1/courses` | Instructor/Admin | Create a new course | ☐ |
| **Course** | `PUT` | `/api/v1/courses/{course}` | Instructor/Admin | Update course details | ☐ |
| **Course** | `DELETE` | `/api/v1/courses/{course}` | Instructor/Admin | Soft-delete a course | ☐ |
| **Enrollment** | `POST` | `/api/v1/courses/{course}/enroll` | Yes | Enroll authenticated user in a course | ☐ |
| **Enrollment** | `DELETE` | `/api/v1/courses/{course}/enroll` | Yes | Unenroll user from a course | ☐ |
| **Enrollment** | `GET` | `/api/v1/courses/{course}/progress` | Yes | Get course enrollment and lesson completion status | ☐ |
| **Lesson** | `GET` | `/api/v1/courses/{course}/lessons` | Yes | List lessons for a course (preview-filtered for non-enrolled) | ☐ |
| **Lesson** | `GET` | `/api/v1/lessons/{lesson}` | Yes | Show lesson details (gated by enrollment or preview flag) | ☐ |
| **Lesson** | `POST` | `/api/v1/lessons/{lesson}/complete` | Yes | Complete lesson, award XP & course completion pearls | ☐ |
| **Lesson** | `POST` | `/api/v1/lessons` | Instructor/Admin | Create a new lesson | ☐ |
| **Lesson** | `PUT` | `/api/v1/lessons/{lesson}` | Instructor/Admin | Update lesson content and metadata | ☐ |
| **Lesson** | `DELETE` | `/api/v1/lessons/{lesson}` | Instructor/Admin | Delete a lesson | ☐ |
| **Exam** | `GET` | `/api/v1/exams/{exam}` | Yes | Show exam details & questions (security suppressed) | ☐ |
| **Exam** | `POST` | `/api/v1/exams` | Instructor/Admin | Create a new exam | ☐ |
| **Exam** | `PUT` | `/api/v1/exams/{exam}` | Instructor/Admin | Update exam details | ☐ |
| **Exam** | `DELETE` | `/api/v1/exams/{exam}` | Instructor/Admin | Delete an exam | ☐ |
| **Attempt** | `POST` | `/api/v1/exams/{exam}/attempts` | Yes | Start a new attempt or resume active in-progress attempt | ☐ |
| **Attempt** | `POST` | `/api/v1/exams/{exam}/attempts/{attempt}/submit` | Yes | Submit attempt for auto-grading & reward calculation | ☐ |
| **Attempt** | `GET` | `/api/v1/exams/{exam}/attempts` | Yes | List authenticated user's attempt history for an exam | ☐ |
| **Attempt** | `GET` | `/api/v1/exams/{exam}/attempts/{attempt}` | Yes | View attempt details (suppressed for in-progress, review for completed) | ☐ |
| **Leaderboard** | `GET` | `/api/v1/leaderboard` | Yes | Get global all-time leaderboard rankings | ☐ |
| **Leaderboard** | `GET` | `/api/v1/leaderboard/weekly` | Yes | Get current week leaderboard rankings | ☐ |
| **Leaderboard** | `GET` | `/api/v1/leaderboard/me` | Yes | Get authenticated user's rank and neighboring users | ☐ |

---

### Detailed Endpoint Specifications

### 1. Authentication Endpoints (`/api/v1/auth`)

#### `POST /api/v1/auth/register`
Register a new student account.

* **Request Body:**
```json
{
  "username": "penjelajah_baru",
  "email": "user@example.com",
  "password": "password123",
  "password_confirmation": "password123",
  "full_name": "Budi Santoso"
}
```
* **Success Response (`201 Created`):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
      "username": "penjelajah_baru",
      "email": "user@example.com",
      "full_name": "Budi Santoso",
      "role": "student",
      "avatar_url": null,
      "pearls": 0,
      "xp": 0,
      "level": 1,
      "created_at": "2026-08-13T12:00:00.000000Z"
    },
    "token": "1|sanctum_plain_text_token_string",
    "token_type": "Bearer"
  },
  "error": null,
  "meta": null
}
```

---

#### `POST /api/v1/auth/login`
Authenticate using email or username.

* **Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```
* **Success Response (`200 OK`):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
      "username": "penjelajah_baru",
      "email": "user@example.com",
      "full_name": "Budi Santoso",
      "role": "student",
      "avatar_url": null,
      "pearls": 150,
      "xp": 500,
      "level": 3,
      "created_at": "2026-08-13T12:00:00.000000Z"
    },
    "token": "2|sanctum_plain_text_token_string",
    "token_type": "Bearer"
  },
  "error": null,
  "meta": null
}
```

---

#### `POST /api/v1/auth/forgot-password`
Send password reset link to user email.

* **Request Body:**
```json
{
  "email": "user@example.com"
}
```
* **Success Response (`200 OK`):**
```json
{
  "success": true,
  "data": null,
  "error": null,
  "meta": null
}
```

---

#### `POST /api/v1/auth/reset-password`
Reset password with a valid token.

* **Request Body:**
```json
{
  "email": "user@example.com",
  "token": "valid_reset_token_string",
  "password": "newpassword123",
  "password_confirmation": "newpassword123"
}
```
* **Success Response (`200 OK`):**
```json
{
  "success": true,
  "data": null,
  "error": null,
  "meta": null
}
```

---

#### `POST /api/v1/auth/logout`
Revoke current authenticated Sanctum access token.

* **Headers:** `Authorization: Bearer <token>`
* **Success Response (`200 OK`):**
```json
{
  "success": true,
  "data": null,
  "error": null,
  "meta": null
}
```

---

#### `GET /api/v1/auth/me`
Retrieve authenticated user auth state payload.

* **Headers:** `Authorization: Bearer <token>`
* **Success Response (`200 OK`):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
      "username": "penjelajah_baru",
      "email": "user@example.com",
      "full_name": "Budi Santoso",
      "role": "student",
      "avatar_url": null,
      "pearls": 150,
      "xp": 500,
      "level": 3,
      "bio": "Maritime technology enthusiast",
      "last_active": "2026-08-13T12:00:00.000000Z",
      "created_at": "2026-08-13T12:00:00.000000Z"
    }
  },
  "error": null,
  "meta": null
}
```

---

### 2. User Self-Service Endpoints (`/api/v1/users/me`)

#### `GET /api/v1/users/me`
Get full profile payload of current user.

* **Headers:** `Authorization: Bearer <token>`
* **Success Response (`200 OK`):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
      "username": "penjelajah_baru",
      "email": "user@example.com",
      "full_name": "Budi Santoso",
      "role": "student",
      "avatar_url": "https://example.com/avatar.jpg",
      "bio": "Learning web & maritime tech",
      "pearls": 250,
      "xp": 1200,
      "level": 5,
      "streak_days": 7,
      "last_active": "2026-08-13T12:00:00.000000Z",
      "created_at": "2026-08-13T12:00:00.000000Z"
    }
  },
  "error": null,
  "meta": null
}
```

---

#### `PUT /api/v1/users/me`
Update user profile information.

* **Headers:** `Authorization: Bearer <token>`
* **Request Body:**
```json
{
  "full_name": "Budi Santoso Updated",
  "username": "penjelajah_baru",
  "email": "user@example.com",
  "bio": "New bio content",
  "avatar_url": "https://example.com/new_avatar.jpg"
}
```
* **Success Response (`200 OK`):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
      "username": "penjelajah_baru",
      "email": "user@example.com",
      "full_name": "Budi Santoso Updated",
      "role": "student",
      "avatar_url": "https://example.com/new_avatar.jpg",
      "bio": "New bio content",
      "pearls": 250,
      "xp": 1200,
      "level": 5,
      "updated_at": "2026-08-13T12:15:00.000000Z"
    }
  },
  "error": null,
  "meta": null
}
```

---

#### `PUT /api/v1/users/me/password`
Update user password. Automatically revokes all existing access tokens.

* **Headers:** `Authorization: Bearer <token>`
* **Request Body:**
```json
{
  "current_password": "oldpassword123",
  "password": "newpassword123",
  "password_confirmation": "newpassword123"
}
```
* **Success Response (`200 OK`):**
```json
{
  "success": true,
  "data": [],
  "error": null,
  "meta": null
}
```

---

#### `GET /api/v1/users/me/stats`
Retrieve user gamification statistics.

* **Headers:** `Authorization: Bearer <token>`
* **Success Response (`200 OK`):**
```json
{
  "success": true,
  "data": {
    "stats": {
      "pearls": 250,
      "xp": 1200,
      "level": 5,
      "streak_days": 7,
      "is_active": true
    }
  },
  "error": null,
  "meta": null
}
```

---

#### `PUT /api/v1/users/me/mascot`
Equip an owned mascot and customize accessories. Automatically deactivates other owned mascots on the `user_mascots` pivot.

* **Headers:** `Authorization: Bearer <token>`
* **Request Body:**
```json
{
  "mascot_id": "b45d85c5-fdd3-4c28-88fb-9b6e32d76b97",
  "accessories": {
    "hat": "hat-captain",
    "glasses": "glasses-sun",
    "outfit": "outfit-navy",
    "background": "bg-ocean"
  }
}
```
* **Success Response (`200 OK`):**
```json
{
  "success": true,
  "data": {
    "mascot_id": "b45d85c5-fdd3-4c28-88fb-9b6e32d76b97",
    "accessories": {
      "hat": "hat-captain",
      "glasses": "glasses-sun",
      "outfit": "outfit-navy",
      "background": "bg-ocean"
    },
    "is_active": true
  },
  "error": null,
  "meta": null
}
```
* **Error Response (`403 Forbidden` if mascot is not owned):**
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "MASCOT_NOT_OWNED",
    "message": "Anda tidak memiliki maskot ini.",
    "details": null
  },
  "meta": null
}
```

---

#### `GET /api/v1/users/me/achievements`
Fetch list of user earned achievements.

* **Headers:** `Authorization: Bearer <token>`
* **Success Response (`200 OK`):**
```json
{
  "success": true,
  "data": {
    "achievements": [
      {
        "id": "ach-01",
        "name": "First Course Completed",
        "description": "Completed your first course on EduWave",
        "icon_url": "https://example.com/badge1.png",
        "condition_type": "course_completion",
        "condition_value": 1,
        "pearls_reward": 50,
        "earned_at": "2026-08-10T10:00:00.000000Z"
      }
    ],
    "count": 1
  },
  "error": null,
  "meta": null
}
```

---

### 3. Course Endpoints (`/api/v1/courses`)

#### `GET /api/v1/courses`
List published courses (public or authenticated). Instructors and Admins see all course statuses.

* **Query Parameters:**
  - `page`: Page number (default: `1`)
  - `per_page`: Items per page (default: `12`, max: `50`)
  - `category`: Filter by category (`technology`, `design`, `marine`, `language`, `science`, `business`)
  - `difficulty`: Filter by difficulty (`beginner`, `intermediate`, `advanced`)
  - `search`: Search title and description
  - `sort`: `newest` (default) or `popular`
* **Success Response (`200 OK`):**
```json
{
  "success": true,
  "data": [
    {
      "id": "c1f2e3d4-5678-90ab-cdef-1234567890ab",
      "title": "Pengenalan Oceanografi & Ekosistem Laut",
      "description": "Pelajari dasar-dasar ilmu kelautan dan ekosistem terumbu karang.",
      "instructor": {
        "id": "u1f2e3d4-5678-90ab-cdef-1234567890ab",
        "full_name": "Dr. Aris Ocean",
        "avatar_url": "https://example.com/instructor.jpg"
      },
      "category": "marine",
      "difficulty": "beginner",
      "thumbnail_url": "https://example.com/thumb.jpg",
      "trailer_url": "https://example.com/trailer.mp4",
      "duration_minutes": 120,
      "lesson_count": 5,
      "enrolled_count": 42,
      "status": "published",
      "pearls_reward": 50,
      "created_at": "2026-08-13T12:00:00.000000Z",
      "updated_at": "2026-08-13T12:00:00.000000Z"
    }
  ],
  "error": null,
  "meta": {
    "current_page": 1,
    "per_page": 12,
    "total": 1,
    "last_page": 1
  }
}
```

---

#### `GET /api/v1/courses/{course}`
Get course details along with lesson outline list.

* **Success Response (`200 OK`):**
```json
{
  "success": true,
  "data": {
    "id": "c1f2e3d4-5678-90ab-cdef-1234567890ab",
    "title": "Pengenalan Oceanografi",
    "lessons": [
      {
        "id": "l1f2e3d4-5678-90ab-cdef-1234567890ab",
        "title": "Pengantar Zona Laut",
        "type": "video",
        "duration_minutes": 15,
        "order": 1,
        "xp_reward": 30,
        "is_preview": true
      }
    ]
  },
  "error": null,
  "meta": null
}
```

---

#### `POST /api/v1/courses`
Create a new course (Requires `instructor` or `admin` role).

* **Headers:** `Authorization: Bearer <token>`
* **Request Body:**
```json
{
  "title": "Pemrograman Laravel 11 untuk Pemula",
  "description": "Panduan lengkap membangun API modern.",
  "category": "technology",
  "difficulty": "beginner",
  "pearls_reward": 100,
  "duration_minutes": 180,
  "status": "published"
}
```

---

#### `PUT /api/v1/courses/{course}`
Update course details (Admin or course owner instructor).

---

#### `DELETE /api/v1/courses/{course}`
Soft-delete a course (Admin or course owner instructor).

---

### 4. Enrollment Endpoints (`/api/v1/courses/{course}/enroll`)

#### `POST /api/v1/courses/{course}/enroll`
Enroll the authenticated user in a published course. Prevents duplicate enrollment (`409 Conflict`).

* **Headers:** `Authorization: Bearer <token>`
* **Success Response (`201 Created`):**
```json
{
  "success": true,
  "data": {
    "enrollment": {
      "id": "e1f2e3d4-5678-90ab-cdef-1234567890ab",
      "course_id": "c1f2e3d4-5678-90ab-cdef-1234567890ab",
      "course_title": "Pengenalan Oceanografi",
      "user_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
      "progress_pct": 0,
      "status": "enrolled",
      "enrolled_at": "2026-08-13T13:00:00.000000Z",
      "completed_at": null
    }
  },
  "error": null,
  "meta": null
}
```

---

#### `DELETE /api/v1/courses/{course}/enroll`
Unenroll / drop user from course.

---

#### `GET /api/v1/courses/{course}/progress`
Get current user's enrollment status and completed lesson checklist.

---

### 5. Lesson Endpoints (`/api/v1/lessons`)

#### `GET /api/v1/lessons/{lesson}`
View lesson content. Access granted if lesson `is_preview` is `true`, user is enrolled, or user is staff (`admin`/`instructor`).

* **Headers:** `Authorization: Bearer <token>`
* **Success Response (`200 OK`):**
```json
{
  "success": true,
  "data": {
    "lesson": {
      "id": "l1f2e3d4-5678-90ab-cdef-1234567890ab",
      "course_id": "c1f2e3d4-5678-90ab-cdef-1234567890ab",
      "title": "Pengantar Zona Laut",
      "type": "video",
      "duration_minutes": 15,
      "order": 1,
      "xp_reward": 30,
      "is_preview": true,
      "content": "Materi pengantar...",
      "video_url": "https://example.com/video.mp4"
    }
  },
  "error": null,
  "meta": null
}
```

---

#### `POST /api/v1/lessons/{lesson}/complete`
Mark a lesson completed. Idempotently awards XP on first completion, recalculates course progress percentage, and awards course pearls if progress hits 100%.

* **Headers:** `Authorization: Bearer <token>`
* **Request Body (Optional):** `{"watch_seconds": 900}`
* **Success Response (`200 OK`):**
```json
{
  "success": true,
  "data": {
    "lesson_id": "l1f2e3d4-5678-90ab-cdef-1234567890ab",
    "is_first_completion": true,
    "xp_awarded": 30,
    "progress": {
      "watch_seconds": 900,
      "completed_at": "2026-08-13T13:05:00.000000Z"
    },
    "enrollment": {
      "progress_pct": 100,
      "status": "completed",
      "transitioned_to_completed": true,
      "pearls_awarded": 50
    }
  },
  "error": null,
  "meta": null
}
```

---

### 6. Exam & Attempt Endpoints (`/api/v1/exams`, `/api/v1/exams/{exam}/attempts`)

#### `GET /api/v1/exams/{exam}`
Retrieve exam metadata and question outline.
> **Security Requirement:** Questions strictly suppress `correct_answer` and `explanation` to prevent answer key leakage.

* **Headers:** `Authorization: Bearer <token>`
* **Success Response (`200 OK`):**
```json
{
  "success": true,
  "data": {
    "id": "x1f2e3d4-5678-90ab-cdef-1234567890ab",
    "course_id": "c1f2e3d4-5678-90ab-cdef-1234567890ab",
    "lesson_id": null,
    "title": "Ujian Akhir: Oceanografi Dasar",
    "time_limit_sec": 3600,
    "passing_score": 70,
    "max_attempts": 3,
    "pearls_reward": 30,
    "questions": [
      {
        "id": "q1f2e3d4-5678-90ab-cdef-1234567890ab",
        "question_text": "Apa zona laut yang paling dalam?",
        "type": "multiple_choice",
        "options": [
          { "key": "A", "value": "Pelagis" },
          { "key": "B", "value": "Hadapelagis" },
          { "key": "C", "value": "Mesopelagis" }
        ],
        "points": 10,
        "order": 1
      }
    ]
  },
  "error": null,
  "meta": null
}
```

---

#### `POST /api/v1/exams/{exam}/attempts`
Start a new exam attempt or resume an active `in_progress` attempt. Enforces `max_attempts` limit via `ExamAttemptPolicy`.

* **Headers:** `Authorization: Bearer <token>`
* **Success Response (`201 Created` / `200 OK`):**
```json
{
  "success": true,
  "data": {
    "attempt_id": "a1f2e3d4-5678-90ab-cdef-1234567890ab",
    "exam": {
      "id": "x1f2e3d4-5678-90ab-cdef-1234567890ab",
      "title": "Ujian Akhir: Oceanografi Dasar",
      "time_limit_sec": 3600,
      "question_count": 10,
      "passing_score": 70
    },
    "questions": [
      {
        "id": "q1f2e3d4-5678-90ab-cdef-1234567890ab",
        "question_text": "Apa zona laut yang paling dalam?",
        "type": "multiple_choice",
        "options": [
          { "key": "A", "value": "Pelagis" },
          { "key": "B", "value": "Hadapelagis" }
        ],
        "points": 10,
        "order": 1
      }
    ],
    "started_at": "2026-08-13T13:40:00.000000Z",
    "expires_at": "2026-08-13T14:40:00.000000Z"
  },
  "error": null,
  "meta": null
}
```
* **Error Response (`403 Forbidden` if max attempts exceeded):**
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "MAX_ATTEMPTS_EXCEEDED",
    "message": "Anda telah mencapai batas maksimal percobaan ujian.",
    "details": null
  },
  "meta": null
}
```

---

#### `POST /api/v1/exams/{exam}/attempts/{attempt}/submit`
Submit answers for auto-grading. Calculates percentage score, determines pass/fail status, and idempotently awards `pearls_reward` on pass.

* **Headers:** `Authorization: Bearer <token>`
* **Request Body:**
```json
{
  "answers": [
    { "question_id": "q1f2e3d4-5678-90ab-cdef-1234567890ab", "selected_key": "B" }
  ]
}
```
* **Success Response (`200 OK`):**
```json
{
  "success": true,
  "data": {
    "attempt_id": "a1f2e3d4-5678-90ab-cdef-1234567890ab",
    "score": 85.00,
    "passed": true,
    "passing_score": 70,
    "pearls_earned": 30,
    "xp_earned": 170,
    "correct_count": 8,
    "total_count": 10,
    "time_taken_seconds": 1800,
    "results": [
      {
        "question_id": "q1f2e3d4-5678-90ab-cdef-1234567890ab",
        "is_correct": true,
        "your_answer": "B",
        "correct_answer": "B",
        "explanation": "Zona Hadapelagis (t Palung Laut) adalah zona terdalam."
      }
    ]
  },
  "error": null,
  "meta": null
}
```

---

#### `GET /api/v1/exams/{exam}/attempts`
List history of attempt submissions for current user.

---

#### `GET /api/v1/exams/{exam}/attempts/{attempt}`
View attempt payload. Returns in-progress state (with suppressed answer keys) if `submitted_at` is null, or review payload (with score & explanations) if completed.

---

### 7. Leaderboard Endpoints (`/api/v1/leaderboard`)

#### `GET /api/v1/leaderboard`
Get global all-time leaderboard rankings. Rankings are calculated and cached in Redis sorted sets for performance.

* **Headers:** `Authorization: Bearer <token>`
* **Query Parameters:**
  - `page`: Page number (default: `1`)
  - `per_page`: Items per page (default: `50`, max: `100`)
* **Success Response (`200 OK`):**
```json
{
  "success": true,
  "data": {
    "rankings": [
      {
        "rank": 1,
        "user": {
          "id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
          "username": "coral_explorer",
          "full_name": "Rina Kartika",
          "avatar_url": "https://example.com/avatar.jpg",
          "level": 18
        },
        "xp": 25000,
        "pearls": 4800
      },
      {
        "rank": 2,
        "user": {
          "id": "8a2cdb3c-2b6c-3cad-8bcc-1a0c6b2cb5c",
          "username": "ocean_scholar",
          "full_name": "Ahmad Wijaya",
          "avatar_url": "https://example.com/avatar2.jpg",
          "level": 16
        },
        "xp": 22000,
        "pearls": 4200
      }
    ]
  },
  "error": null,
  "meta": {
    "scope": "global",
    "current_page": 1,
    "per_page": 50
  }
}
```

---

#### `GET /api/v1/leaderboard/weekly`
Get current week leaderboard rankings (week format: ISO 8601 year-week, e.g., `2026-W33`).

* **Headers:** `Authorization: Bearer <token>`
* **Query Parameters:**
  - `page`: Page number (default: `1`)
  - `per_page`: Items per page (default: `50`, max: `100`)
* **Success Response (`200 OK`):**
```json
{
  "success": true,
  "data": {
    "rankings": [
      {
        "rank": 1,
        "user": {
          "id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
          "username": "weekly_champion",
          "full_name": "Sarah Andini",
          "avatar_url": "https://example.com/avatar3.jpg",
          "level": 12
        },
        "xp": 5000,
        "pearls": 800
      }
    ]
  },
  "error": null,
  "meta": {
    "scope": "weekly",
    "week": "2026-W33",
    "current_page": 1,
    "per_page": 50
  }
}
```

---

#### `GET /api/v1/leaderboard/me`
Get authenticated user's rank and neighboring users (context leaderboard). Returns user's position with a few users above and below for social comparison.

* **Headers:** `Authorization: Bearer <token>`
* **Query Parameters:**
  - `scope`: Scope of leaderboard (`global` | `weekly`, default: `global`)
  - `neighbors`: Number of users to show above/below current user (default: `3`, max: `10`)
* **Success Response (`200 OK`):**
```json
{
  "success": true,
  "data": {
    "user_rank": 42,
    "neighbors": [
      {
        "rank": 39,
        "user": {
          "id": "7a1bca2b-1a5b-2bad-7acc-0a0b6a1ba4b",
          "username": "user_above_3",
          "full_name": "Dewi Lestari",
          "avatar_url": null,
          "level": 10
        },
        "xp": 3200,
        "pearls": 550
      },
      {
        "rank": 40,
        "user": {
          "id": "6a0ab19a-0a4a-1a9c-6abb-9a9a5a0a93a",
          "username": "user_above_2",
          "full_name": "Rudi Hermawan",
          "avatar_url": null,
          "level": 10
        },
        "xp": 3150,
        "pearls": 540
      },
      {
        "rank": 41,
        "user": {
          "id": "5a9aa08a-9a3a-0a8b-5aaa-8a8a4a9a82a",
          "username": "user_above_1",
          "full_name": "Nina Kusuma",
          "avatar_url": null,
          "level": 10
        },
        "xp": 3100,
        "pearls": 535
      },
      {
        "rank": 42,
        "user": {
          "id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
          "username": "penjelajah_baru",
          "full_name": "Budi Santoso",
          "avatar_url": null,
          "level": 10
        },
        "xp": 3050,
        "pearls": 530
      },
      {
        "rank": 43,
        "user": {
          "id": "4a8a97a-8a2a-9a7a-4aa9-7a7a3a8a71a",
          "username": "user_below_1",
          "full_name": "Eka Prasetyo",
          "avatar_url": null,
          "level": 9
        },
        "xp": 3000,
        "pearls": 520
      },
      {
        "rank": 44,
        "user": {
          "id": "3a7a86a-7a1a-8a6a-3aa8-6a6a2a7a60a",
          "username": "user_below_2",
          "full_name": "Fitri Amalia",
          "avatar_url": null,
          "level": 9
        },
        "xp": 2950,
        "pearls": 515
      },
      {
        "rank": 45,
        "user": {
          "id": "2a6a75a-6a0a-7a5a-2aa7-5a5a1a6a5fa",
          "username": "user_below_3",
          "full_name": "Andi Setiawan",
          "avatar_url": null,
          "level": 9
        },
        "xp": 2900,
        "pearls": 510
      }
    ]
  },
  "error": null,
  "meta": {
    "scope": "global"
  }
}
```

* **Response for user with no XP (`200 OK`):**
```json
{
  "success": true,
  "data": {
    "user_rank": null,
    "neighbors": [],
    "message": "Anda belum memiliki XP atau belum terdaftar di leaderboard."
  },
  "error": null,
  "meta": {
    "scope": "global"
  }
}
```

> **Implementation Note**: Leaderboard rankings are calculated using **Redis Sorted Sets** (`ZREVRANK`, `ZREVRANGE`) for O(log N) performance. XP awards automatically update both global and weekly leaderboards via the `XpAwarded` event and `UpdateLeaderboardOnXpAwarded` listener.
