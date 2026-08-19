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

*Dibuat oleh: Tim Frontend — `r\RAKHA`*
*Tanggal: 19 Agustus 2026*
