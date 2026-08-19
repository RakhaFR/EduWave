# Laporan Frontend → Backend

File ini berisi catatan hal-hal yang perlu dikonfirmasi atau diperbaiki di sisi backend, ditemukan saat integrasi frontend.

---

## 1. [LEADERBOARD] Endpoint `GET /api/v1/leaderboard/weekly` Internal Server Error (500)

**Endpoint:** `GET /api/v1/leaderboard/weekly`

**Masalah:**
Pemanggilan endpoint `/leaderboard/weekly` mengembalikan HTTP Status `500 Internal Server Error`.
Sebaliknya, endpoint `GET /api/v1/leaderboard` (global) dan `GET /api/v1/leaderboard/me` bekerja secara normal.

**Solusi Sementara di Frontend:**
Frontend menambahkan fallback otomatis: Jika `GET /leaderboard/weekly` melempar HTTP 500 error, frontend secara transparan mengambil data dari `GET /leaderboard` agar halaman tidak blank/crash.

**Tolong perbaiki:** Query/Logic kalkulasi weekly leaderboard di backend Laravel controller agar tidak crash 500.

---

## 2. [COURSES] Public Request `GET /api/v1/courses` Tanpa Token Mengembalikan 500 Internal Server Error

**Endpoint:** `GET /api/v1/courses` (tanpa Header `Authorization: Bearer <token>`)

**Masalah:**
Saat diakses secara anonim (public/guest), endpoint `/api/v1/courses` di `CourseController.php` melempar HTTP Status 500 Internal Server Error.

**Penyebab di Backend Controller:**
Pada `CourseController.php` baris 24:
```php
$user = $request->user();
if (! $user || ! in_array($user->role, ['admin', 'instructor'])) { ... }
```
Jika request bersifat public (unauthenticated / guest), `$user` adalah `null`, sehingga mencoba mengakses properti `$user->role` menyebabkan PHP error: `Attempt to read property "role" on null`.

**Solusi / Perbaikan di Backend:**
Perbarui kondisi role-check pada `CourseController.php`:
```php
$user = $request->user();
if (! $user || ! in_array($user?->role, ['admin', 'instructor'])) {
    $query->where('status', 'published');
}
```

---

## 3. [ENROLLMENTS] Tidak Ada Endpoint `GET /api/v1/user/enrollments` untuk Mengambil Daftar Kursus yang Diikuti User

**Endpoint yang dibutuhkan:** `GET /api/v1/user/enrollments` (atau `GET /api/v1/my-courses`)

**Masalah (N+1 Request Issue):**
Saat ini tidak ada endpoint tunggal untuk mengambil daftar kursus yang sedang diikuti oleh user yang login.
Akibatnya, frontend terpaksa melakukan loop request `GET /api/v1/courses/{id}/progress` secara individual untuk setiap kursus hanya demi mengecek apakah user terdaftar atau belum. Hal ini menyebabkan puluhan network request simultan (N+1 query) yang memperlambat performa secara signifikan.

**Solusi / Rekomendasi di Backend:**
Tolong sediakan endpoint `GET /api/v1/user/enrollments` yang mengembalikan daftar kursus beserta progresnya sekaligus (`progress_pct`), contoh response:
```json
{
  "success": true,
  "data": [
    {
      "course_id": "44444444-...",
      "course_title": "Web Dev Dasar",
      "progress_pct": 75.00,
      "status": "active"
    }
  ]
}
```

---

*Dibuat oleh: Tim Frontend — `r\RAKHA`*
*Tanggal: 19 Agustus 2026*
