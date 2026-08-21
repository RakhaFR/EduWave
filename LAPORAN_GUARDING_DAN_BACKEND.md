# LAPORAN PERBAIKAN GUARDING & REKOMENDASI BACKEND (CONCURRENT LOGIN)

## 1. Perbaikan Role Guarding Frontend (Selesai)
- **Pelajar (`/pelajar/*`)**: Hanya dapat diakses oleh user dengan role `student`. Mencoba masuk menggunakan akun `instructor` atau `admin` akan otomatis dialihkan (*redirect*) ke dashboard masing-masing (`/pembimbing` atau `/admin`).
- **Pembimbing (`/pembimbing/*`)**: Hanya dapat diakses oleh user dengan role `instructor`. Mencoba masuk dengan role `student` atau `admin` akan dialihkan ke dashboard sesungguhnya.
- **Admin (`/admin/*`)**: Hanya dapat diakses oleh user dengan role `admin`. Role lain akan dialihkan.
- **Multi-Tab Browser Guard**: Ditambahkan listener `storage` pada `AuthGuard` sehingga jika pengguna mengganti akun atau melakukan logout pada salah satu tab, tab lain yang terbuka di browser yang sama akan otomatis tersinkronisasi dan me-redirect ke login.

---

## 2. Catatan Arsitektur: Multi-Device / Concurrent Login Guard
> **Pertanyaan**: *"Jika ada orang login di akun yang sama tapi beda device/browser maka lempar error 'Akun sedang dipakai, mohon coba lagi' — apakah ini masalah Frontend atau Backend?"*

**Jawaban**: Ini adalah tanggung jawab **Backend (Laravel RESTful API)**. 

### Alasan Teknis:
Frontend (browser A) tidak dapat berkomunikasi secara langsung dengan browser B pada komputer/perangkat lain tanpa adanya server backend sebagai perantara (State Provider). 

### Solusi Rekomendasi untuk Tim Backend (Laravel):
Untuk menerapkan penguncian sesi tunggal (*Single Active Session*):
1. **Sanctum Token Invalidation**: Saat user berhasil login di `POST /api/v1/auth/login`, hapus/revokasi semua token lama user tersebut (`$user->tokens()->delete()`) sebelum memunculkan token baru.
2. **Custom Error Response (401)**: Jika request masuk menggunakan token lama yang sudah di-revoke, Laravel Sanctum akan mengembalikan status `401 Unauthorized`. Ubah pesan error di `app/Exceptions/Handler.php` atau Middleware Sanctum menjadi:
   ```jsonn
   {
     "success": false,
     "data": null,
     "error": {
       "code": "SESSION_EXPIRED",
       "message": "Akun sedang dipakai di perangkat lain, mohon login kembali."
     }
   }
   ```
3. Frontend EduWave telah dilengkapi Axios Interceptor yang secara otomatis menangkap status `401` ini dan mengarahkan pengguna kembali ke halaman login dengan pesan peringatan yang sesuai.
