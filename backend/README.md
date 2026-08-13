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

| Group | Method | Endpoint | Auth | Description |
|---|---|---|---|---|
| **Auth** | `POST` | `/api/v1/auth/register` | No | Register a new user account |
| **Auth** | `POST` | `/api/v1/auth/login` | No | Authenticate user & issue Bearer token |
| **Auth** | `POST` | `/api/v1/auth/forgot-password` | No | Request password reset link |
| **Auth** | `POST` | `/api/v1/auth/reset-password` | No | Reset password using reset token |
| **Auth** | `POST` | `/api/v1/auth/logout` | Yes | Revoke current authenticated token |
| **Auth** | `GET` | `/api/v1/auth/me` | Yes | Fetch basic auth user state |
| **User** | `GET` | `/api/v1/users/me` | Yes | Get detailed authenticated user profile |
| **User** | `PUT` | `/api/v1/users/me` | Yes | Update user profile details |
| **User** | `PUT` | `/api/v1/users/me/password` | Yes | Change user password (revokes tokens) |
| **User** | `GET` | `/api/v1/users/me/stats` | Yes | Get gamification stats (pearls, xp, level, streak) |
| **User** | `PUT` | `/api/v1/users/me/mascot` | Yes | Equip mascot and update custom accessories |
| **User** | `GET` | `/api/v1/users/me/achievements` | Yes | Fetch list of unlocked user achievements |

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
  "data": [],
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
  "data": [],
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
  "data": [],
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
