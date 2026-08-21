# EduWave API Backend

EduWave is an interactive maritime and technology e-learning platform featuring gamification (pearls & XP economy), AI study assistance, mascot customization, real-time study rooms, and comprehensive course progression.

This backend is built using **Laravel 12**, **Laravel Sanctum** for token-based authentication, and **SQLite / MariaDB**.

---

## 🛠️ Technology Stack

* **Framework:** Laravel 12
* **Authentication:** Laravel Sanctum (Bearer Token)
* **Database:** SQLite (Testing / Local), MariaDB / MySQL (Production)
* **Cache / Realtime Leaderboard:** Redis (Memurai on Windows local environment)
* **Realtime Server:** Laravel Reverb (`study-room.{roomId}`)
* **Testing:** PHPUnit / Pest (`composer test` or `php artisan test`)

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

### Test Suite Status

All implemented non-deferred endpoints are covered by feature tests in `tests/Feature/` passing in automated runs: **157 tests, 728 assertions**.

The table below reflects confirmed implementation status and auth boundaries:

| Group | Method | Endpoint | Auth | Description | Tested |
|---|---|---|---|---|---|
| **Auth** | `POST` | `/api/v1/auth/register` | Public | Register a student or instructor account and issue a Bearer token | Yes |
| **Auth** | `POST` | `/api/v1/auth/login` | Public | Authenticate user via email or username & issue Bearer token | Yes |
| **Auth** | `POST` | `/api/v1/auth/forgot-password` | Public | Request password reset link | Yes |
| **Auth** | `POST` | `/api/v1/auth/reset-password` | Public | Reset password using reset token & revoke existing tokens | Yes |
| **Auth** | `POST` | `/api/v1/auth/logout` | Bearer | Revoke current authenticated token | Yes |
| **Auth** | `GET` | `/api/v1/auth/me` | Bearer | Fetch basic auth user state | Yes |
| **User** | `GET` | `/api/v1/users/me` | Bearer | Get detailed authenticated user profile | Yes |
| **User** | `PUT` | `/api/v1/users/me` | Bearer | Update user profile details | Yes |
| **User** | `PUT` | `/api/v1/users/me/password` | Bearer | Change user password | Yes |
| **User** | `GET` | `/api/v1/users/me/stats` | Bearer | Get gamification stats (pearls, xp, level, streak) | Yes |
| **User** | `PUT` | `/api/v1/users/me/mascot` | Bearer | Equip mascot and update custom accessories | Yes |
| **User** | `GET` | `/api/v1/users/me/achievements` | Bearer | Fetch list of unlocked user achievements | Yes |
| **User** | `GET` | `/api/v1/users/me/courses` | Bearer | List authenticated user's enrolled courses with progress | Yes |
| **Enrollment** | `GET` | `/api/v1/users/me/course-progress` | Bearer | List progress for all active enrollments in one request | Yes |
| **Course** | `GET` | `/api/v1/courses` | Public | List published courses (drafts included for owner/admin if authenticated) | Yes |
| **Course** | `GET` | `/api/v1/courses/{course}` | Public | Show course details with lesson outline | Yes |
| **Course** | `POST` | `/api/v1/courses` | Admin/Instructor | Create a new course | Yes |
| **Course** | `PUT` | `/api/v1/courses/{course}` | Admin/Instructor | Update course details | Yes |
| **Course** | `DELETE` | `/api/v1/courses/{course}` | Admin/Instructor | Soft-delete a course | Yes |
| **Enrollment** | `POST` | `/api/v1/courses/{course}/enroll` | Bearer | Enroll authenticated user in a course | Yes |
| **Enrollment** | `DELETE` | `/api/v1/courses/{course}/enroll` | Bearer | Unenroll user from a course (marks status dropped) | Yes |
| **Enrollment** | `GET` | `/api/v1/courses/{course}/progress` | Bearer | Get course enrollment and lesson completion status | Yes |
| **Lesson** | `GET` | `/api/v1/courses/{course}/lessons` | Bearer | List lessons for a course | Yes |
| **Lesson** | `GET` | `/api/v1/lessons/{lesson}` | Bearer | Show lesson details | Yes |
| **Lesson** | `POST` | `/api/v1/lessons/{lesson}/complete` | Bearer | Complete lesson, award XP & course completion pearls | Yes |
| **Lesson** | `POST` | `/api/v1/lessons` | Admin/Instructor | Create a new lesson | Yes |
| **Lesson** | `PUT` | `/api/v1/lessons/{lesson}` | Admin/Instructor | Update lesson content and metadata | Yes |
| **Lesson** | `DELETE` | `/api/v1/lessons/{lesson}` | Admin/Instructor | Delete a lesson | Yes |
| **Exam** | `GET` | `/api/v1/exams/{exam}` | Bearer | Show exam details & questions (answers suppressed) | Yes |
| **Exam** | `POST` | `/api/v1/exams` | Admin/Instructor | Create a new exam | Yes |
| **Exam** | `PUT` | `/api/v1/exams/{exam}` | Admin/Instructor | Update exam details | Yes |
| **Exam** | `DELETE` | `/api/v1/exams/{exam}` | Admin/Instructor | Delete an exam | Yes |
| **Attempt** | `POST` | `/api/v1/exams/{exam}/attempts` | Bearer | Start a new attempt or resume active attempt | Yes |
| **Attempt** | `POST` | `/api/v1/exams/{exam}/attempts/{attempt}/submit` | Bearer | Submit attempt for auto-grading & reward calculation | Yes |
| **Attempt** | `GET` | `/api/v1/exams/{exam}/attempts` | Bearer | List authenticated user's attempt history for an exam | Yes |
| **Attempt** | `GET` | `/api/v1/exams/{exam}/attempts/{attempt}` | Bearer | View attempt details | Yes |
| **Leaderboard** | `GET` | `/api/v1/leaderboard` | Public | Get global all-time leaderboard rankings | Yes |
| **Leaderboard** | `GET` | `/api/v1/leaderboard/weekly` | Public | Get current week leaderboard rankings | Yes |
| **Leaderboard** | `GET` | `/api/v1/leaderboard/me` | Bearer | Get authenticated user's rank and neighboring users | Yes |
| **Study Room** | `GET` | `/api/v1/study-rooms` | Bearer | List active study rooms | Yes |
| **Study Room** | `POST` | `/api/v1/study-rooms` | Bearer | Create a new study room | Yes |
| **Study Room** | `GET` | `/api/v1/study-rooms/{room}` | Bearer | Get study room details with participants | Yes |
| **Study Room** | `POST` | `/api/v1/study-rooms/{room}/join` | Bearer | Join an active study room | Yes |
| **Study Room** | `DELETE` | `/api/v1/study-rooms/{room}/leave` | Bearer | Leave a study room | Yes |
| **Study Room** | `DELETE` | `/api/v1/study-rooms/{room}` | Bearer | Close a study room (host/admin only) | Yes |
| **Study Room** | `GET` | `/api/v1/study-rooms/{room}/messages` | Bearer | Get message history for a study room | Yes |
| **Study Room** | `POST` | `/api/v1/study-rooms/{room}/messages` | Bearer | Send a message to a study room | Yes |
| **Mascot** | `GET` | `/api/v1/mascots` | Bearer | List all available mascots in catalog | Yes |
| **Mascot** | `GET` | `/api/v1/mascots/inventory` | Bearer | Get authenticated user's owned mascots | Yes |
| **Mascot** | `POST` | `/api/v1/mascots/{mascot}/purchase` | Bearer | Purchase a mascot using pearls | Yes |
| **Mascot** | `PUT` | `/api/v1/mascots/equip` | Bearer | Equip a mascot and customize accessories | Yes |
| **Achievement** | `GET` | `/api/v1/achievements` | Bearer | List all available achievements | Yes |
| **Achievement** | `GET` | `/api/v1/achievements/me` | Bearer | Get authenticated user's earned achievements | Yes |
| **Achievement** | `POST` | `/api/v1/achievements/check` | Bearer | Evaluate progress and auto-award all newly completed achievements | Yes |
| **Achievement** | `POST` | `/api/v1/achievements/claim` | Bearer | Manually claim a specific achievement and receive pearls reward | Yes |
| **Achievement** | `GET` | `/api/v1/achievements/{achievement}` | Bearer | Get achievement details with progress | Yes |
| **Public** | `GET` | `/api/v1/public/stats` | Public | Get high-level platform stats (active students, published courses, enrollments) | Yes |
| **Instructor** | `GET` | `/api/v1/instructors` | Public | List active instructors directory with course & student counts | Yes |
| **Instructor** | `GET` | `/api/v1/instructor/courses` | Instructor | List all courses owned by authenticated instructor | Yes |
| **Exam** | `GET` | `/api/v1/exams` | Admin/Instructor | List all exams (filtered by ownership for instructors) | Yes |
| **Exam Question** | `GET` | `/api/v1/exams/{exam}/questions` | Admin/Instructor | List questions for an exam with full answer keys | Yes |
| **Exam Question** | `POST` | `/api/v1/exams/{exam}/questions` | Admin/Instructor | Add a new question to an exam | Yes |
| **Exam Question** | `GET` | `/api/v1/exams/{exam}/questions/{question}` | Admin/Instructor | Get single question details with answer key | Yes |
| **Exam Question** | `PUT` | `/api/v1/exams/{exam}/questions/{question}` | Admin/Instructor | Update an individual exam question | Yes |
| **Exam Question** | `DELETE` | `/api/v1/exams/{exam}/questions/{question}` | Admin/Instructor | Delete an individual exam question | Yes |
| **Admin** | `GET` | `/api/v1/admin/users` | Admin | List all users with filters and pagination | Yes |
| **Admin** | `PUT` | `/api/v1/admin/users/{user}` | Admin | Update user details (full_name, email, username, role, is_active) | Yes |
| **Admin** | `PUT` | `/api/v1/admin/users/{user}/role` | Admin | Update user role and synchronize student gamification data in DB transaction | Yes |
| **Admin** | `GET` | `/api/v1/admin/users/{user}/gamification` | Admin | Get user's gamification statistics summary | Yes |
| **Admin** | `DELETE` | `/api/v1/admin/users/{user}` | Admin | Soft-delete a user (except admins) | Yes |
| **Admin** | `GET` | `/api/v1/admin/courses` | Admin | List all courses with moderation filters | Yes |
| **Admin** | `PUT` | `/api/v1/admin/courses/{course}/status` | Admin | Update course status (draft/published/archived) | Yes |
| **Admin** | `GET` | `/api/v1/admin/analytics/overview` | Admin | Get platform analytics and statistics | Yes |

---

### Detailed Endpoint Specifications

### 1. Authentication Endpoints (`/api/v1/auth`)

#### `POST /api/v1/auth/register`
Register a new student or instructor account and receive a Sanctum Bearer token. This endpoint is public.

The `role` field is optional. Omit it to register a student, or set it to `instructor` to register an instructor account. Public registration cannot create an `admin` account.

| Field | Type | Required | Rules |
|---|---|---|---|
| `username` | string | Yes | Unique; maximum 50 characters |
| `email` | string | Yes | Valid email address; unique; maximum 255 characters |
| `password` | string | Yes | Minimum 8 characters; must match `password_confirmation` |
| `password_confirmation` | string | Yes | Must match `password` |
| `full_name` | string | Yes | Maximum 100 characters |
| `role` | string | No | `student` or `instructor`; defaults to `student` |

* **Instructor registration request:**
```json
{
  "username": "pengajar_baru",
  "email": "instructor@example.com",
  "password": "password123",
  "password_confirmation": "password123",
  "full_name": "Siti Pengajar",
  "role": "instructor"
}
```
* **Student registration request:**
```json
{
  "username": "penjelajah_baru",
  "email": "student@example.com",
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
      "username": "pengajar_baru",
      "email": "instructor@example.com",
      "full_name": "Siti Pengajar",
      "role": "instructor",
      "is_active": true,
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
* **Validation Error (`422 Unprocessable Content`):** Returned for invalid input, including an unsupported role such as `admin`.
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validasi gagal.",
    "details": {
      "role": ["Validasi gagal."]
    }
  },
  "meta": null
}
```

---

#### `POST /api/v1/auth/login`
Authenticate using email or username.

> **Single Active Session Guard:** Upon successful login, all previously issued access tokens for the account are automatically revoked. If the account is accessed from another device/browser using an old token, backend returns `401 Unauthorized` with error code `SESSION_EXPIRED`.

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
      "is_active": true,
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
* **Account Inactive Response (`403 Forbidden`):**
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "AUTH_ACCOUNT_INACTIVE",
    "message": "Akun anda sedang nonaktif. Silakan hubungi administrator."
  },
  "meta": null
}
```
* **Session Expired Response (`401 Unauthorized` on old device):**
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "SESSION_EXPIRED",
    "message": "Sesi tidak valid atau akun sedang dipakai di perangkat lain. Silakan login kembali."
  },
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
  "avatar_url": "https://example.com/new_avatar.jpg",
  "current_password": "password123"
}
```

**Note:** `current_password` is **required** when changing `email` or `username`. It is not required when only updating `full_name`, `bio`, or `avatar_url`.

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

* **Headers:** `Authorization: Bearer <token>`
* **Request Body:** All fields are optional. Instructors cannot change `instructor_id`.
```json
{
  "title": "Pemrograman Laravel untuk Pemula",
  "description": "Panduan lengkap membangun API modern.",
  "category": "technology",
  "difficulty": "beginner",
  "thumbnail_url": "https://example.com/thumb.jpg",
  "trailer_url": "https://example.com/trailer.mp4",
  "status": "published",
  "pearls_reward": 100,
  "duration_minutes": 180
}
```
* **Success Response (`200 OK`):** Returns the updated course object in `data`, using the same shape as `POST /api/v1/courses`.

---

#### `DELETE /api/v1/courses/{course}`
Soft-delete a course (Admin or course owner instructor).

* **Headers:** `Authorization: Bearer <token>`
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
Drop the authenticated user from a course. The enrollment record is retained with a `dropped` status and can be reactivated by enrolling again.

* **Headers:** `Authorization: Bearer <token>`
* **Error Response:** `404 NOT_ENROLLED` when the user has no enrollment record for the course.
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

#### `GET /api/v1/courses/{course}/progress`
Get current user's enrollment status and completed lesson checklist.

* **Headers:** `Authorization: Bearer <token>`
* **Error Response:** `404 NOT_ENROLLED` when the user is not actively enrolled in the course.
* **Success Response (`200 OK`):**
```json
{
  "success": true,
  "data": {
    "enrollment": {
      "id": "e1f2e3d4-5678-90ab-cdef-1234567890ab",
      "course_id": "c1f2e3d4-5678-90ab-cdef-1234567890ab",
      "course_title": "Pengenalan Oceanografi",
      "user_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
      "progress_pct": 40.0,
      "status": "enrolled",
      "enrolled_at": "2026-08-13T13:00:00.000000Z",
      "completed_at": null
    },
    "lessons_progress": [
      {
        "id": "l1f2e3d4-5678-90ab-cdef-1234567890ab",
        "title": "Pengantar Zona Laut",
        "order": 1,
        "is_completed": true
      }
    ]
  },
  "error": null,
  "meta": null
}
```

---

#### `GET /api/v1/users/me/course-progress`
Get the authenticated user's active course enrollments and aggregate progress in one request. Use this endpoint for dashboards and course-list pages instead of requesting `GET /api/v1/courses/{course}/progress` once per course. It does not include lesson-level progress; request the per-course endpoint only on a course detail page.

* **Headers:** `Authorization: Bearer <token>`
* **Success Response (`200 OK`):**
```json
{
  "success": true,
  "data": {
    "enrollments": [
      {
        "id": "e1f2e3d4-5678-90ab-cdef-1234567890ab",
        "course_id": "c1f2e3d4-5678-90ab-cdef-1234567890ab",
        "course_title": "Pengenalan Oceanografi",
        "user_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
        "progress_pct": 40.0,
        "status": "enrolled",
        "enrolled_at": "2026-08-13T13:00:00.000000Z",
        "completed_at": null
      }
    ]
  },
  "error": null,
  "meta": null
}
```

---

### 5. Lesson Endpoints (`/api/v1/lessons`)

#### `GET /api/v1/lessons/{lesson}`
View lesson content. Access granted if lesson `is_preview` is `true`, user is enrolled, or user is staff (`admin`/`instructor`). Enforces sequential prerequisite ordering (all prior lessons must be completed).

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
* **Error Response (`403 Forbidden` if prior lesson not completed):**
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "LESSON_LOCKED",
    "message": "Selesaikan lesson sebelumnya terlebih dahulu sebelum mengakses lesson ini.",
    "details": null
  },
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

#### `POST /api/v1/lessons`
Create a lesson (Requires `instructor` or `admin` role). An instructor can only add lessons to a course they own; an admin can add lessons to any course.

* **Headers:** `Authorization: Bearer <token>`
* **Request Body:** `course_id`, `title`, and `order` are required. Other fields are optional and use database defaults when omitted.
```json
{
  "course_id": "c1f2e3d4-5678-90ab-cdef-1234567890ab",
  "title": "Pengantar Zona Laut",
  "type": "video",
  "content": "Materi pengantar...",
  "video_url": "https://example.com/video.mp4",
  "duration_minutes": 15,
  "order": 1,
  "xp_reward": 30,
  "is_preview": true
}
```
* **Validation:** `course_id` must be a UUID; `type` must be `video`, `text`, or `quiz`; `video_url` must be a valid URL; `duration_minutes` must be between `0` and `10000`; `order` must be between `1` and `10000`; and `xp_reward` must be between `0` and `1000000`.
* **Success Response (`201 Created`):**
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
      "created_at": "2026-08-13T13:00:00.000000Z",
      "updated_at": "2026-08-13T13:00:00.000000Z"
    }
  },
  "error": null,
  "meta": null
}
```

---

#### `PUT /api/v1/lessons/{lesson}`
Update a lesson (Admin or instructor who owns the lesson's parent course). An instructor may move the lesson only to another course they own; an admin may move it to any course.

* **Headers:** `Authorization: Bearer <token>`
* **Request Body:** All fields are optional. Only include fields that should change.
```json
{
  "title": "Zona Laut dan Kedalamannya",
  "content": "Materi yang telah diperbarui...",
  "video_url": "https://example.com/updated-video.mp4",
  "duration_minutes": 20,
  "order": 2,
  "xp_reward": 40,
  "is_preview": false
}
```
* **Validation:** Uses the same field constraints as `POST /api/v1/lessons`. If supplied, `course_id` must be a UUID.
* **Success Response (`200 OK`):** Returns the updated lesson in `data.lesson`, using the same shape as the create response.

---

#### `DELETE /api/v1/lessons/{lesson}`
Delete a lesson (Admin or instructor who owns the lesson's parent course). Related lesson progress records are deleted through a database cascade; a linked exam is retained with its `lesson_id` set to `null`.

* **Headers:** `Authorization: Bearer <token>`
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

* **Headers:** `Authorization: Bearer <token>`
* **Access:** Students must be enrolled in the exam's published course. Admins and instructors can access exams without enrollment.
* **Success Response (`200 OK`):**
```json
{
  "success": true,
  "data": [
    {
      "id": "a1f2e3d4-5678-90ab-cdef-1234567890ab",
      "score": 85.0,
      "passed": true,
      "started_at": "2026-08-13T13:40:00.000000Z",
      "submitted_at": "2026-08-13T14:00:00.000000Z",
      "expires_at": "2026-08-13T14:10:00.000000Z"
    }
  ],
  "error": null,
  "meta": null
}
```

---

#### `GET /api/v1/exams/{exam}/attempts/{attempt}`
View a specific attempt owned by the authenticated user. Admins may view any attempt. The `{attempt}` must belong to the specified `{exam}`.

* **Headers:** `Authorization: Bearer <token>`
* **Access:** Attempt owner or admin. Returns `403` for another user's attempt and `400` with `INVALID_ATTEMPT` when the attempt belongs to another exam.
* **Success Response (`200 OK`) for an in-progress attempt:** The response has the same shape as `POST /api/v1/exams/{exam}/attempts`. Question objects do not include `correct_answer` or `explanation`.
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
        "options": [{ "key": "A", "value": "Pelagis" }],
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
* **Success Response (`200 OK`) for a submitted attempt:** The response has the same shape as `POST /api/v1/exams/{exam}/attempts/{attempt}/submit`. Its `pearls_earned` is always `0` because rewards were granted during submission; `xp_earned` is the score multiplied by `2`.

---

### 7. Public Platform Endpoints

#### `GET /api/v1/public/stats`
Get public platform totals for landing pages and dashboards. No authentication is required.

* **Success Response (`200 OK`):**
```json
{
  "success": true,
  "data": {
    "active_students": 120,
    "published_courses": 24,
    "total_enrollments": 560
  },
  "error": null,
  "meta": null
}
```

---

#### `GET /api/v1/instructors`
List active instructors for the public instructor directory. No authentication is required.

* **Query Parameters:**
  - `category` (optional): Include instructors who own at least one published course in the category.
  - `search` (optional): Search instructor `full_name`, `username`, or `bio`.
* **Success Response (`200 OK`):**
```json
{
  "success": true,
  "data": [
    {
      "id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
      "full_name": "Kapten Bahari",
      "username": "kapten_ocean",
      "bio": "Instruktur navigasi laut.",
      "avatar_url": "https://example.com/avatar.jpg",
      "courses_count": 3,
      "enrolled_students_count": 120,
      "categories": ["Navigasi", "Oceanografi"]
    }
  ],
  "error": null,
  "meta": null
}
```

---

#### `GET /api/v1/instructor/courses`
List all courses owned by the authenticated instructor, including non-published courses.

* **Headers:** `Authorization: Bearer <token>`
* **Authorization:** Instructor only.
* **Success Response (`200 OK`):** Returns the standard response envelope with `data` as an array of course objects, using the same course fields as `GET /api/v1/courses`.

---

#### `GET /api/v1/exams`
List exams for management screens.

* **Headers:** `Authorization: Bearer <token>`
* **Authorization:** Admin or instructor. Instructors receive only exams belonging to their own courses.
* **Success Response (`200 OK`):**
```json
{
  "success": true,
  "data": [
    {
      "id": "x1f2e3d4-5678-90ab-cdef-1234567890ab",
      "title": "Ujian Akhir: Oceanografi Dasar",
      "course_id": "c1f2e3d4-5678-90ab-cdef-1234567890ab",
      "course_title": "Dasar Oceanografi",
      "lesson_id": null,
      "time_limit_sec": 3600,
      "passing_score": 70,
      "max_attempts": 3,
      "pearls_reward": 30
    }
  ],
  "error": null,
  "meta": null
}
```

---

#### `GET /api/v1/exams/{exam}/questions`
List questions for a specific exam with full answer keys (Management view).

* **Headers:** `Authorization: Bearer <token>`
* **Authorization:** Admin or course owner instructor.
* **Success Response (`200 OK`):**
```json
{
  "success": true,
  "data": [
    {
      "id": "q1f2e3d4-5678-90ab-cdef-1234567890ab",
      "exam_id": "x1f2e3d4-5678-90ab-cdef-1234567890ab",
      "question_text": "Apa zona laut yang paling dalam?",
      "type": "multiple_choice",
      "options": ["Pelagis", "Hadapelagis", "Mesopelagis"],
      "correct_answer": "Hadapelagis",
      "explanation": "Zona Hadapelagis (Palung Laut) adalah zona terdalam.",
      "points": 10,
      "order": 1
    }
  ],
  "error": null,
  "meta": null
}
```

---

#### `POST /api/v1/exams/{exam}/questions`
Add a new question to an exam.

* **Headers:** `Authorization: Bearer <token>`
* **Authorization:** Admin or course owner instructor.
* **Request Body:**
```json
{
  "question_text": "Apa fungsi middleware di Laravel?",
  "type": "multiple_choice",
  "options": ["Filtering HTTP request", "Query database", "Styling UI"],
  "correct_answer": "Filtering HTTP request",
  "explanation": "Middleware menyaring HTTP request yang masuk ke aplikasi.",
  "points": 10,
  "order": 1
}
```
* **Success Response (`201 Created`):**
```json
{
  "success": true,
  "data": {
    "id": "q2f3e4d5-6789-01ab-cdef-2345678901bc",
    "exam_id": "x1f2e3d4-5678-90ab-cdef-1234567890ab",
    "question_text": "Apa fungsi middleware di Laravel?",
    "type": "multiple_choice",
    "options": ["Filtering HTTP request", "Query database", "Styling UI"],
    "correct_answer": "Filtering HTTP request",
    "explanation": "Middleware menyaring HTTP request yang masuk ke aplikasi.",
    "points": 10,
    "order": 1
  },
  "error": null,
  "meta": null
}
```

---

#### `GET /api/v1/exams/{exam}/questions/{question}`
Get single question details with answer key.

* **Headers:** `Authorization: Bearer <token>`
* **Authorization:** Admin or course owner instructor.
* **Success Response (`200 OK`):**
```json
{
  "success": true,
  "data": {
    "id": "q1f2e3d4-5678-90ab-cdef-1234567890ab",
    "exam_id": "x1f2e3d4-5678-90ab-cdef-1234567890ab",
    "question_text": "Apa zona laut yang paling dalam?",
    "type": "multiple_choice",
    "options": ["Pelagis", "Hadapelagis", "Mesopelagis"],
    "correct_answer": "Hadapelagis",
    "explanation": "Zona Hadapelagis (Palung Laut) adalah zona terdalam.",
    "points": 10,
    "order": 1
  },
  "error": null,
  "meta": null
}
```

---

#### `PUT /api/v1/exams/{exam}/questions/{question}`
Update an individual exam question.

* **Headers:** `Authorization: Bearer <token>`
* **Authorization:** Admin or course owner instructor.
* **Request Body:**
```json
{
  "question_text": "Apa zona laut terdalam di samudra?",
  "correct_answer": "Hadapelagis",
  "points": 15
}
```
* **Success Response (`200 OK`):**
```json
{
  "success": true,
  "data": {
    "id": "q1f2e3d4-5678-90ab-cdef-1234567890ab",
    "exam_id": "x1f2e3d4-5678-90ab-cdef-1234567890ab",
    "question_text": "Apa zona laut terdalam di samudra?",
    "type": "multiple_choice",
    "options": ["Pelagis", "Hadapelagis", "Mesopelagis"],
    "correct_answer": "Hadapelagis",
    "explanation": "Zona Hadapelagis (Palung Laut) adalah zona terdalam.",
    "points": 15,
    "order": 1
  },
  "error": null,
  "meta": null
}
```

---

#### `DELETE /api/v1/exams/{exam}/questions/{question}`
Delete an individual exam question.

* **Headers:** `Authorization: Bearer <token>`
* **Authorization:** Admin or course owner instructor.
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

### 8. Leaderboard Endpoints (`/api/v1/leaderboard`)

#### `GET /api/v1/leaderboard`
Get global all-time leaderboard rankings. Rankings are calculated and cached in Redis sorted sets for performance.

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
        "user_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
        "xp": 25000,
        "rank_change": 2,
        "user": {
          "id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
          "username": "coral_explorer",
          "full_name": "Rina Kartika",
          "avatar_url": "https://example.com/avatar.jpg",
          "level": 18,
          "streak_days": 7,
          "completed_courses_count": 4
        },
        "pearls": 4800
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

---

### 9. Study Room Endpoints (`/api/v1/study-rooms`)

Real-time collaborative study rooms with WebSocket support via Laravel Reverb.

#### `GET /api/v1/study-rooms`
List all active study rooms with filtering options.

* **Request Query Parameters:**
  - `status` (optional): Filter by status (`active` or `closed`). Default: `active`
  - `is_public` (optional): Filter by visibility (`true` or `false`)

* **Response (`200 OK`):**
```json
{
  "success": true,
  "data": {
    "rooms": [
      {
        "id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
        "name": "Laravel Study Group",
        "topic": "Building REST APIs with Laravel",
        "host": {
          "id": "uuid",
          "username": "john_doe",
          "avatar_url": "https://example.com/avatar.jpg"
        },
        "max_capacity": 10,
        "current_capacity": 3,
        "is_public": true,
        "status": "active",
        "created_at": "2026-08-18T05:00:00.000000Z"
      }
    ]
  },
  "error": null,
  "meta": null
}
```

---

#### `POST /api/v1/study-rooms`
Create a new study room. The authenticated user becomes the host and is automatically joined as the first participant.

* **Request Body:**
```json
{
  "name": "Laravel Study Group",
  "topic": "Building REST APIs with Laravel",
  "max_capacity": 10,
  "is_public": true
}
```

* **Validation:**
  - `name`: Required, string, max 100 characters
  - `topic`: Optional, string
  - `max_capacity`: Optional, integer, min 2, max 100 (default: 20)
  - `is_public`: Optional, boolean (default: true)

* **Response (`201 Created`):**
```json
{
  "success": true,
  "data": {
    "room": {
      "id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
      "name": "Laravel Study Group",
      "topic": "Building REST APIs with Laravel",
      "host": {
        "id": "uuid",
        "username": "john_doe",
        "avatar_url": "https://example.com/avatar.jpg"
      },
      "max_capacity": 10,
      "current_capacity": 1,
      "is_public": true,
      "status": "active",
      "created_at": "2026-08-18T05:00:00.000000Z"
    }
  },
  "error": null,
  "meta": null
}
```

---

#### `GET /api/v1/study-rooms/{room}`
Get detailed information about a study room, including full participant list.

* **Response (`200 OK`):**
```json
{
  "success": true,
  "data": {
    "room": {
      "id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
      "name": "Laravel Study Group",
      "topic": "Building REST APIs with Laravel",
      "host": {
        "id": "uuid",
        "username": "john_doe",
        "full_name": "John Doe",
        "avatar_url": "https://example.com/avatar.jpg"
      },
      "max_capacity": 10,
      "current_capacity": 3,
      "is_public": true,
      "status": "active",
      "participants": [
        {
          "id": "uuid",
          "username": "john_doe",
          "avatar_url": "https://example.com/avatar.jpg"
        },
        {
          "id": "uuid",
          "username": "jane_smith",
          "avatar_url": "https://example.com/avatar2.jpg"
        },
        {
          "id": "uuid",
          "username": "bob_jones",
          "avatar_url": null
        }
      ],
      "created_at": "2026-08-18T05:00:00.000000Z",
      "updated_at": "2026-08-18T05:00:00.000000Z"
    }
  },
  "error": null,
  "meta": null
}
```

---

#### `POST /api/v1/study-rooms/{room}/join`
Join a study room. Enforces capacity limits and room status via `StudyRoomPolicy`.

* **Response (`200 OK`):**
```json
{
  "success": true,
  "data": {
    "room_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
    "user": {
      "id": "uuid",
      "username": "jane_smith",
      "avatar_url": "https://example.com/avatar2.jpg"
    }
  },
  "error": null,
  "meta": null
}
```

* **Error Responses:**
  - `409 Conflict` - Already joined: `ALREADY_JOINED`
  - `403 Forbidden` - Room full: `ROOM_FULL`
  - `403 Forbidden` - Room closed: `ROOM_CLOSED`

* **WebSocket Event Broadcast:**
  - Event: `user_joined` on channel `private-study-room.{room_id}`
  - Sent to all participants except the joining user

---

#### `DELETE /api/v1/study-rooms/{room}/leave`
Leave a study room. If the host leaves, the room is automatically closed.

* **Response (`200 OK`):**
```json
{
  "success": true,
  "data": null,
  "error": null,
  "meta": null
}
```

* **Error Response:**
  - `404 Not Found` - Not a participant: `NOT_A_PARTICIPANT`

* **WebSocket Event Broadcast:**
  - Event: `user_left` on channel `private-study-room.{room_id}`
  - If host leaves, also broadcasts `room_closed` event

---

#### `DELETE /api/v1/study-rooms/{room}`
Close a study room (host or admin only). This is a soft-close that preserves message history.

* **Authorization:** Host or admin only (enforced via `StudyRoomPolicy`)

* **Response (`200 OK`):**
```json
{
  "success": true,
  "data": null,
  "error": null,
  "meta": null
}
```

* **Error Response:**
  - `403 Forbidden` - Not authorized: `FORBIDDEN`

* **WebSocket Event Broadcast:**
  - Event: `room_closed` on channel `private-study-room.{room_id}`

---

#### `GET /api/v1/study-rooms/{room}/messages`
Get message history for a study room with cursor-based pagination.

* **Authorization:** Must be a participant of the room

* **Request Query Parameters:**
  - `limit` (optional): Number of messages to fetch (10-100, default: 50)
  - `before` (optional): Timestamp cursor for pagination (ISO 8601 format)

* **Response (`200 OK`):**
```json
{
  "success": true,
  "data": {
    "messages": [
      {
        "id": "uuid",
        "content": "Hello everyone! Ready to learn?",
        "type": "text",
        "user": {
          "id": "uuid",
          "username": "john_doe",
          "avatar_url": "https://example.com/avatar.jpg"
        },
        "sent_at": "2026-08-18T05:02:00.000000Z"
      },
      {
        "id": "uuid",
        "content": "Yes, let's start with controllers!",
        "type": "text",
        "user": {
          "id": "uuid",
          "username": "jane_smith",
          "avatar_url": "https://example.com/avatar2.jpg"
        },
        "sent_at": "2026-08-18T05:01:30.000000Z"
      }
    ]
  },
  "error": null,
  "meta": null
}
```

* **Error Response:**
  - `403 Forbidden` - Not a participant: `NOT_A_PARTICIPANT`

---

#### `POST /api/v1/study-rooms/{room}/messages`
Send a message to a study room. This endpoint serves as an HTTP fallback; in production, messages are typically sent via WebSocket client events.

* **Authorization:** Must be a participant of the room

* **Request Body:**
```json
{
  "content": "Hello everyone! Ready to learn?",
  "type": "text"
}
```

* **Validation:**
  - `content`: Required, string, max 2000 characters
  - `type`: Optional, enum (`text`, `file`, `ai`), default: `text`

* **Response (`201 Created`):**
```json
{
  "success": true,
  "data": {
    "message": {
      "id": "uuid",
      "content": "Hello everyone! Ready to learn?",
      "type": "text",
      "user": {
        "id": "uuid",
        "username": "john_doe",
        "avatar_url": "https://example.com/avatar.jpg"
      },
      "sent_at": "2026-08-18T05:02:00.000000Z"
    }
  },
  "error": null,
  "meta": null
}
```

* **Error Responses:**
  - `403 Forbidden` - Not a participant: `NOT_A_PARTICIPANT`
  - `403 Forbidden` - Room closed: `ROOM_CLOSED`

* **WebSocket Event Broadcast:**
  - Event: `message` on channel `private-study-room.{room_id}`
  - Sent to all participants except the sender

---

### WebSocket (Laravel Reverb) Configuration

**Channel Authorization:** `routes/channels.php`
```php
Broadcast::channel('study-room.{roomId}', function ($user, $roomId) {
    $room = StudyRoom::find($roomId);
    return $room && $room->participants()->where('user_id', $user->id)->exists();
});
```

**Events Broadcast:**
- `message` - New message sent (`StudyRoomMessageSent`)
- `user_joined` - User joined room (`StudyRoomUserJoined`)
- `user_left` - User left room (`StudyRoomUserLeft`)
- `room_closed` - Room closed (`StudyRoomClosed`)

**Frontend Setup Example:**
```javascript
Echo.private(`study-room.${roomId}`)
    .listen('.message', (e) => console.log('New message:', e))
    .listen('.user_joined', (e) => console.log('User joined:', e.user))
    .listen('.user_left', (e) => console.log('User left:', e.user))
    .listen('.room_closed', (e) => console.log('Room closed'));
```

> **Implementation Note**: Study rooms use Laravel Reverb for real-time WebSocket communication. Install with `composer require laravel/reverb` and configure `.env` with Reverb credentials. Start the server with `php artisan reverb:start`.

---

### 10. Mascot Endpoints (`/api/v1/mascots`)

Mascots are collectible companions that users can purchase with pearls and customize with accessories.

#### `GET /api/v1/mascots`
List all available mascots in the catalog.

* **Headers:** `Authorization: Bearer <token>`
* **Query Parameters:**
  - `rarity` (optional): Filter by rarity (`common`, `rare`, `epic`, `legendary`)
  - `category` (optional): Filter by category
  - `sort` (optional): Sort order by unlock_cost (`asc` or `desc`, default: `asc`)
* **Success Response (`200 OK`):**
```json
{
  "success": true,
  "data": {
    "mascots": [
      {
        "id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
        "name": "Kapten Lumba-Lumba",
        "avatar_url": "https://example.com/mascots/dolphin.png",
        "description": "Lumba-lumba pemberani yang siap menemani petualangan belajar Anda!",
        "unlock_cost": 500,
        "rarity": "rare",
        "category": "marine",
        "is_owned": false
      }
    ],
    "count": 15
  },
  "error": null,
  "meta": null
}
```

---

#### `GET /api/v1/mascots/inventory`
Get authenticated user's owned mascots.

* **Headers:** `Authorization: Bearer <token>`
* **Success Response (`200 OK`):**
```json
{
  "success": true,
  "data": {
    "mascots": [
      {
        "id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
        "name": "Kapten Lumba-Lumba",
        "avatar_url": "https://example.com/mascots/dolphin.png",
        "description": "Lumba-lumba pemberani yang siap menemani petualangan belajar Anda!",
        "rarity": "rare",
        "category": "marine",
        "is_active": true,
        "accessories": {
          "hat": "captain-hat",
          "glasses": "sunglasses"
        },
        "unlocked_at": "2026-08-15T10:30:00.000000Z"
      }
    ],
    "count": 3
  },
  "error": null,
  "meta": null
}
```

---

#### `POST /api/v1/mascots/{mascot}/purchase`
Purchase a mascot using pearls.

* **Headers:** `Authorization: Bearer <token>`
* **Success Response (`201 Created`):**
```json
{
  "success": true,
  "data": {
    "mascot": {
      "id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
      "name": "Kapten Lumba-Lumba",
      "avatar_url": "https://example.com/mascots/dolphin.png",
      "description": "Lumba-lumba pemberani yang siap menemani petualangan belajar Anda!",
      "rarity": "rare",
      "category": "marine",
      "unlocked_at": "2026-08-18T05:57:00.000000Z"
    },
    "pearls_spent": 500,
    "pearls_remaining": 1200
  },
  "error": null,
  "meta": null
}
```

* **Error Response (`403 Forbidden` - Insufficient pearls):**
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "INSUFFICIENT_PEARLS",
    "message": "Mutiara Anda tidak cukup untuk membeli maskot ini.",
    "details": {
      "required": 500,
      "available": 300,
      "shortage": 200
    }
  },
  "meta": null
}
```

* **Error Response (`409 Conflict` - Already owned):**
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "MASCOT_ALREADY_OWNED",
    "message": "Anda sudah memiliki maskot ini.",
    "details": null
  },
  "meta": null
}
```

---

#### `PUT /api/v1/mascots/equip`
Equip a mascot and customize accessories. Automatically deactivates other mascots.

* **Headers:** `Authorization: Bearer <token>`
* **Request Body:**
```json
{
  "mascot_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
  "accessories": {
    "hat": "captain-hat",
    "glasses": "sunglasses",
    "outfit": "navy-uniform",
    "background": "ocean-blue"
  }
}
```

* **Success Response (`200 OK`):**
```json
{
  "success": true,
  "data": {
    "mascot_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
    "name": "Kapten Lumba-Lumba",
    "avatar_url": "https://example.com/mascots/dolphin.png",
    "accessories": {
      "hat": "captain-hat",
      "glasses": "sunglasses",
      "outfit": "navy-uniform",
      "background": "ocean-blue"
    },
    "is_active": true
  },
  "error": null,
  "meta": null
}
```

* **Error Response (`403 Forbidden` - Not owned):**
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

### 11. Admin Endpoints (`/api/v1/admin`)

Admin-only endpoints for user management, course moderation, and platform analytics. All endpoints require `admin` role.

#### `GET /api/v1/admin/users`
List all users with filtering and pagination.

* **Headers:** `Authorization: Bearer <token>` (admin only)
* **Query Parameters:**
  - `page` (optional): Page number (default: `1`)
  - `per_page` (optional): Items per page (default: `20`, max: `100`)
  - `role` (optional): Filter by role (`student`, `instructor`, `admin`)
  - `search` (optional): Search username, email, or full_name
  - `is_active` (optional): Filter by active status (`true` or `false`)
* **Success Response (`200 OK`):**
```json
{
  "success": true,
  "data": [
    {
      "id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
      "username": "penjelajah_baru",
      "email": "user@example.com",
      "full_name": "Budi Santoso",
      "role": "student",
      "avatar_url": "https://example.com/avatar.jpg",
      "pearls": 250,
      "xp": 1200,
      "level": 5,
      "is_active": true,
      "created_at": "2026-08-13T12:00:00.000000Z"
    }
  ],
  "error": null,
  "meta": {
    "current_page": 1,
    "per_page": 20,
    "total": 50,
    "last_page": 3
  }
}
```

---

#### `PUT /api/v1/admin/users/{user}`
Update user details (Admin only). All request body fields are optional.

* **Headers:** `Authorization: Bearer <token>` (admin only)
* **Request Body:**
```json
{
  "full_name": "Budi Santoso Updated",
  "username": "budi_baru",
  "email": "budi_baru@example.com",
  "role": "instructor",
  "is_active": true
}
```
* **Success Response (`200 OK`):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
      "username": "budi_baru",
      "email": "budi_baru@example.com",
      "full_name": "Budi Santoso Updated",
      "role": "instructor",
      "is_active": true
    }
  },
  "error": null,
  "meta": null
}
```
* **Error Response (`422 Unprocessable Content` if trying to demote last admin):**
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "LAST_ADMIN",
    "message": "Tidak dapat mengubah role admin terakhir."
  },
  "meta": null
}
```

---

#### `PUT /api/v1/admin/users/{user}/role`
Update a user's role and synchronize student gamification state within a database transaction.

* **Headers:** `Authorization: Bearer <token>` (admin only)
* **Request Body:**
```json
{
  "role": "instructor"
}
```
* **Success Response (`200 OK` when converting student to instructor):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
      "username": "penjelajah_baru",
      "email": "user@example.com",
      "full_name": "Budi Santoso",
      "role": "instructor"
    },
    "previous_role": "student",
    "new_role": "instructor",
    "gamification_action": "destroyed",
    "gamification": null
  },
  "error": null,
  "meta": null
}
```
* **Success Response (`200 OK` when converting instructor to student):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
      "username": "penjelajah_baru",
      "email": "user@example.com",
      "full_name": "Budi Santoso",
      "role": "student"
    },
    "previous_role": "instructor",
    "new_role": "student",
    "gamification_action": "initialized",
    "gamification": {
      "xp": 0,
      "pearls": 0,
      "level": 1,
      "streak_days": 0
    }
  },
  "error": null,
  "meta": null
}
```
* **Error Response (`422 Unprocessable Content` if invalid role):**
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "INVALID_ROLE",
    "message": "Role yang dipilih tidak valid.",
    "details": {
      "allowed_roles": ["student", "instructor", "admin"]
    }
  },
  "meta": null
}
```
* **Error Response (`422 Unprocessable Content` if editing own role):**
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "CANNOT_CHANGE_OWN_ROLE",
    "message": "Admin tidak dapat mengubah role akunnya sendiri."
  },
  "meta": null
}
```

---

#### `GET /api/v1/admin/users/{user}/gamification`
Get user's gamification statistics summary for admin management.

* **Headers:** `Authorization: Bearer <token>` (admin only)
* **Success Response (`200 OK`):**
```json
{
  "success": true,
  "data": {
    "user_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
    "role": "student",
    "xp": 0,
    "pearls": 0,
    "level": 1,
    "streak_days": 0,
    "completed_courses_count": 0,
    "completed_lessons_count": 0,
    "achievement_count": 0,
    "mascot_count": 1
  },
  "error": null,
  "meta": null
}
```

---

#### `DELETE /api/v1/admin/users/{user}`
Soft-delete a user. Admin accounts cannot be deleted.

* **Headers:** `Authorization: Bearer <token>` (admin only)
* **Success Response (`200 OK`):**
```json
{
  "success": true,
  "data": null,
  "error": null,
  "meta": null
}
```
* **Error Response (`403 Forbidden` - Cannot delete admin):**
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "CANNOT_DELETE_ADMIN",
    "message": "Akun admin tidak dapat dihapus."
  },
  "meta": null
}
```

---

#### `GET /api/v1/admin/courses`
List all courses with moderation filters. Includes instructor info and enrollment/lesson counts.

* **Headers:** `Authorization: Bearer <token>` (admin only)
* **Query Parameters:**
  - `page` (optional): Page number (default: `1`)
  - `per_page` (optional): Items per page (default: `20`, max: `100`)
  - `status` (optional): Filter by status (`draft`, `published`, `archived`)
  - `category` (optional): Filter by category
  - `instructor_id` (optional): Filter by instructor
  - `search` (optional): Search title or description
* **Success Response (`200 OK`):**
```json
{
  "success": true,
  "data": [
    {
      "id": "c1f2e3d4-5678-90ab-cdef-1234567890ab",
      "title": "Pengenalan Oceanografi",
      "description": "Pelajari dasar-dasar ilmu kelautan.",
      "instructor": {
        "id": "uuid",
        "full_name": "Dr. Aris Ocean",
        "email": "aris@eduwave.id"
      },
      "category": "marine",
      "difficulty": "beginner",
      "status": "published",
      "thumbnail_url": "https://example.com/thumb.jpg",
      "duration_minutes": 120,
      "pearls_reward": 50,
      "enrollments_count": 42,
      "lessons_count": 5,
      "created_at": "2026-08-13T12:00:00.000000Z",
      "updated_at": "2026-08-13T12:00:00.000000Z"
    }
  ],
  "error": null,
  "meta": {
    "current_page": 1,
    "per_page": 20,
    "total": 15,
    "last_page": 1
  }
}
```

---

#### `PUT /api/v1/admin/courses/{course}/status`
Update a course's publication status.

* **Headers:** `Authorization: Bearer <token>` (admin only)
* **Request Body:**
```json
{
  "status": "published"
}
```
* **Success Response (`200 OK`):**
```json
{
  "success": true,
  "data": {
    "course": {
      "id": "c1f2e3d4-5678-90ab-cdef-1234567890ab",
      "title": "Pengenalan Oceanografi",
      "status": "published",
      "updated_at": "2026-08-18T06:00:00.000000Z"
    }
  },
  "error": null,
  "meta": null
}
```

---

#### `GET /api/v1/admin/analytics/overview`
Get platform-wide analytics including user, course, enrollment, and exam statistics.

* **Headers:** `Authorization: Bearer <token>` (admin only)
* **Success Response (`200 OK`):**
```json
{
  "success": true,
  "data": {
    "users": {
      "total": 150,
      "active": 140,
      "students": 120,
      "instructors": 25
    },
    "courses": {
      "total": 30,
      "published": 20,
      "draft": 10
    },
    "enrollments": {
      "total": 500,
      "active": 350,
      "completed": 150
    },
    "exams": {
      "total_attempts": 300,
      "passed_attempts": 240,
      "average_score": 78.50
    },
    "recent_users": [
      {
        "id": "uuid",
        "username": "new_user",
        "email": "new@example.com",
        "role": "student",
        "created_at": "2026-08-18T05:00:00.000000Z"
      }
    ],
    "top_courses": [
      {
        "id": "uuid",
        "title": "Pengenalan Oceanografi",
        "category": "marine",
        "enrollments_count": 42
      }
    ]
  },
  "error": null,
  "meta": null
}
```

---

### 12. Achievement Endpoints (`/api/v1/achievements`)

Achievements are milestones that users can unlock by completing various tasks. Each achievement awards pearls upon completion.

#### `GET /api/v1/achievements`
List all available achievements.

* **Headers:** `Authorization: Bearer <token>`
* **Query Parameters:**
  - `type` (optional): Filter by condition type (`course_completion`, `lesson_completion`, `exam_pass`, `xp_milestone`, `streak_days`)
  - `sort` (optional): Sort by field (`pearls_reward`, `created_at`, `condition_value`, default: `created_at`)
  - `order` (optional): Sort order (`asc` or `desc`, default: `asc`)
* **Success Response (`200 OK`):**
```json
{
  "success": true,
  "data": {
    "achievements": [
      {
        "id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
        "name": "Pelaut Pemula",
        "description": "Selesaikan kursus pertama Anda",
        "icon_url": "https://example.com/badges/first-course.png",
        "condition_type": "course_completion",
        "condition_value": 1,
        "pearls_reward": 50,
        "is_earned": true,
        "earned_at": "2026-08-10T12:00:00.000000Z"
      },
      {
        "id": "8a2cdb3c-2b6c-3cad-8bcc-1a0c6b2cb5c",
        "name": "Navigator Ulung",
        "description": "Selesaikan 10 kursus",
        "icon_url": "https://example.com/badges/ten-courses.png",
        "condition_type": "course_completion",
        "condition_value": 10,
        "pearls_reward": 500,
        "is_earned": false,
        "earned_at": null
      }
    ],
    "count": 25
  },
  "error": null,
  "meta": null
}
```

---

#### `GET /api/v1/achievements/me`
Get authenticated user's earned achievements.

* **Headers:** `Authorization: Bearer <token>`
* **Success Response (`200 OK`):**
```json
{
  "success": true,
  "data": {
    "achievements": [
      {
        "id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
        "name": "Pelaut Pemula",
        "description": "Selesaikan kursus pertama Anda",
        "icon_url": "https://example.com/badges/first-course.png",
        "condition_type": "course_completion",
        "condition_value": 1,
        "pearls_reward": 50,
        "earned_at": "2026-08-10T12:00:00.000000Z"
      }
    ],
    "count": 5,
    "total_pearls_earned": 350
  },
  "error": null,
  "meta": null
}
```

---

#### `POST /api/v1/achievements/check`
Evaluate user progress across all categories (`course_completion`, `lesson_completion`, `exam_pass`, `xp_milestone`, `streak_days`) and automatically award any newly completed achievements and pearls rewards.

* **Headers:** `Authorization: Bearer <token>`
* **Success Response (`200 OK`):**
```json
{
  "success": true,
  "data": {
    "newly_awarded": [
      {
        "id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
        "name": "Master XP",
        "description": "Mencapai 500 XP",
        "icon_url": "https://example.com/badges/xp-500.png",
        "pearls_reward": 200
      }
    ],
    "count": 1,
    "pearls_earned": 200,
    "current_pearls": 250
  },
  "error": null,
  "meta": null
}
```

---

#### `POST /api/v1/achievements/{achievement}/claim`
Manually claim a specific achievement when its condition is met and receive its pearls reward.

* **Headers:** `Authorization: Bearer <token>`
* **Success Response (`200 OK`):**
```json
{
  "success": true,
  "data": {
    "achievement": {
      "id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
      "name": "Master XP",
      "description": "Mencapai 500 XP",
      "icon_url": "https://example.com/badges/xp-500.png",
      "pearls_reward": 200,
      "earned_at": "2026-08-20T05:00:00.000000Z"
    },
    "pearls_earned": 200,
    "current_pearls": 250
  },
  "error": null,
  "meta": null
}
```
* **Error Response (`400 Bad Request` if requirements not met):**
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "ACHIEVEMENT_NOT_UNLOCKED",
    "message": "Persyaratan achievement belum terpenuhi.",
    "details": {
      "current": 50,
      "target": 500,
      "percentage": 10.0
    }
  },
  "meta": null
}
```
* **Error Response (`400 Bad Request` if already claimed):**
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "ACHIEVEMENT_ALREADY_CLAIMED",
    "message": "Achievement ini sudah pernah diklaim.",
    "details": null
  },
  "meta": null
}
```

---

#### `GET /api/v1/achievements/{achievement}`
Get achievement details with user's current progress.

* **Headers:** `Authorization: Bearer <token>`
* **Success Response (`200 OK`):**
```json
{
  "success": true,
  "data": {
    "id": "8a2cdb3c-2b6c-3cad-8bcc-1a0c6b2cb5c",
    "name": "Navigator Ulung",
    "description": "Selesaikan 10 kursus",
    "icon_url": "https://example.com/badges/ten-courses.png",
    "condition_type": "course_completion",
    "condition_value": 10,
    "pearls_reward": 500,
    "is_earned": false,
    "earned_at": null,
    "progress": {
      "current": 3,
      "target": 10,
      "percentage": 30.0
    }
  },
  "error": null,
  "meta": null
}
```

---
