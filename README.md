# EduWave

EduWave adalah platform Learning Management System (LMS) interaktif bertema laut dan bawah laut. Platform ini menggabungkan pembelajaran berbasis course, ujian online, tracking progres, gamifikasi XP dan mutiara, maskot yang dapat dikustomisasi, kolaborasi study room, komunikasi sosial, serta AI Study Assistant.

Repository ini berisi dua aplikasi yang berjalan terpisah:

- `frontend`: aplikasi web Next.js untuk pelajar, pembimbing/instructor, dan admin.
- `backend`: REST API Laravel, autentikasi, database, queue, broadcasting, dan integrasi layanan eksternal.

## Fitur

### Pelajar

- Registrasi, login, logout, reset password, dan autentikasi berbasis token.
- Menjelajahi course publik, mencari/filter course, enrollment, dan unenrollment.
- Membaca lesson dengan sequential locking dan menyelesaikan lesson untuk memperoleh reward.
- Mengikuti ujian dengan batas waktu, maksimum percobaan, auto-grading, passing score, dan riwayat attempt.
- Pencatatan pelanggaran fullscreen/tab dan auto-submit pada pelanggaran ketiga.
- Melihat XP, level, streak, mutiara, leaderboard global/mingguan, dan progress belajar.
- Membeli serta mengatur maskot dan accessories.
- Melihat dan mengklaim achievement.
- Membuat atau bergabung ke public/private study room.
- Mengirim pesan dan attachment di study room.
- Follow user, mengelola pertemanan, dan private chat dengan teman.
- Menggunakan AI Study Assistant dengan konteks course atau lesson yang diizinkan.

### Pembimbing / Instructor

- Mengelola course milik sendiri.
- Membuat, mengubah, dan menghapus lesson.
- Membuat dan mengelola exam serta pertanyaan exam.
- Import pertanyaan pilihan ganda dari PDF.
- Mengelola profil dan melihat course yang dimiliki.

### Admin

- Dashboard overview dan analytics platform.
- Mengelola user, role, status aktif, dan data pengguna.
- Melihat ringkasan gamifikasi pengguna.
- Mengelola course, lesson, exam, dan pertanyaan.
- Moderasi status course: `draft`, `published`, dan `archived`.

### Status fitur

Halaman `Live Class` sudah tersedia di frontend sebagai bagian dari navigasi pelajar, tetapi implementasinya masih berupa placeholder dan belum menjadi layanan kelas live yang terhubung ke backend.

## Arsitektur

```text
Browser
  |-- Next.js frontend (port 3000)
  |      |-- Axios REST API
  |      `-- Laravel Echo / Reverb untuk realtime
  |
  `-- Laravel backend (port 8000, API /api/v1)
         |-- Sanctum Bearer token
         |-- MySQL/MariaDB atau SQLite
         |-- Database queue/cache dan Redis opsional
         |-- Laravel Reverb
         |-- Cloudinary untuk attachment
         `-- Xkiro OpenAI-compatible API untuk AI
```

Komunikasi utama frontend ke backend menggunakan base URL `/api/v1`. Realtime study room dan private chat menggunakan Laravel Broadcasting/Reverb. Backend memakai UUID untuk primary key domain dan mengembalikan response dalam envelope API yang konsisten.

## Tech Stack

### Frontend

- Next.js `16.3.0` dengan App Router
- React `19.2.8`
- TypeScript
- Tailwind CSS v4
- Axios
- Laravel Echo dan Pusher JS client
- Motion, AOS, Marked, Lucide React, dan React Icons

### Backend

- PHP `8.2+`
- Laravel `12`
- Laravel Sanctum `4` untuk personal access token
- Laravel Reverb `1.11` untuk realtime broadcasting
- MySQL/MariaDB untuk deployment dan SQLite in-memory untuk test
- Predis/Redis untuk kebutuhan leaderboard bila diaktifkan
- Cloudinary PHP SDK untuk upload attachment
- Smalot PDF Parser untuk import soal dari PDF
- PHPUnit `11` dan Laravel Pint

## Struktur Repository

```text
.
├── README.md
├── render.yaml                 # Konfigurasi deployment backend di Render
├── backend/
│   ├── app/
│   │   ├── Http/Controllers/   # Controller API dan controller admin
│   │   ├── Http/Requests/       # Validasi request
│   │   ├── Models/              # Model Eloquent
│   │   ├── Policies/            # Authorization/ownership
│   │   └── Services/            # Logic leaderboard dan AI, dll.
│   ├── database/
│   │   ├── migrations/
│   │   └── seeders/
│   ├── routes/api.php           # Semua endpoint di bawah /api/v1
│   ├── tests/Feature/
│   ├── Dockerfile
│   ├── composer.json
│   └── .env.example
├── frontend/
│   ├── src/app/                 # Route Next.js
│   ├── src/components/          # Komponen UI dan dashboard
│   ├── src/hooks/
│   ├── src/lib/                 # Axios, Echo, security, dan utility
│   ├── src/services/            # Client service untuk API
│   ├── src/types/
│   └── package.json
└── docs/postman/                # Koleksi/dokumentasi API tambahan
```

## Prasyarat

- Node.js dan npm yang kompatibel dengan Next.js `16.3.0`.
- PHP `8.2` atau lebih baru.
- Composer.
- MySQL/MariaDB untuk konfigurasi lokal yang menyerupai deployment, atau SQLite untuk setup sederhana.
- Redis diperlukan agar leaderboard global dan mingguan berfungsi penuh; proses lain tetap dapat berjalan tanpanya.
- Cloudinary diperlukan untuk upload attachment.
- Xkiro API key diperlukan untuk AI Study Assistant.

## Menjalankan Secara Lokal

Backend harus dijalankan sebelum frontend.

### 1. Backend

Pada Windows PowerShell:

```powershell
cd backend
composer install
Copy-Item .env.example .env
php artisan key:generate
```

Atur koneksi database di `backend/.env`, kemudian jalankan migration:

```powershell
php artisan migrate
```

Untuk database lokal baru dengan data contoh:

```powershell
php artisan migrate:fresh --seed
```

Jalankan API:

```powershell
php artisan serve
```

API tersedia di `http://localhost:8000` dengan base endpoint `http://localhost:8000/api/v1`.

Di Linux/macOS, gunakan `cp .env.example .env` sebagai pengganti `Copy-Item`.

### 2. Frontend

Buka terminal lain:

```bash
cd frontend
npm install
```

Buat `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_REVERB_APP_KEY=your-key
NEXT_PUBLIC_REVERB_HOST="localhost"
NEXT_PUBLIC_REVERB_PORT=8080
NEXT_PUBLIC_REVERB_SCHEME=http
```

Jalankan frontend:

```bash
npm run dev
```

Buka `http://localhost:3000`.

### Development dengan queue, log, dan Vite backend

Dari direktori `backend`, `composer dev` menjalankan server Laravel, queue listener, Pail logs, dan Vite backend secara bersamaan:

```bash
composer dev
```

Next.js frontend tetap dijalankan terpisah dari direktori `frontend` dengan `npm run dev`.

## Environment Variables

### Frontend

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_REVERB_APP_KEY=
NEXT_PUBLIC_REVERB_HOST=
NEXT_PUBLIC_REVERB_PORT=
NEXT_PUBLIC_REVERB_SCHEME=http
NEXT_PUBLIC_APP_VERSION=
```

Variable Reverb diperlukan untuk fitur realtime. Jangan menaruh secret backend di frontend.

### Backend

Salin `backend/.env.example` sebagai titik awal. Variable penting:

```env
APP_URL=http://localhost:8000
CORS_ALLOWED_ORIGINS=http://localhost:3000
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=eduwave
DB_USERNAME=root
DB_PASSWORD=
SESSION_DRIVER=database
CACHE_STORE=database
QUEUE_CONNECTION=database
BROADCAST_CONNECTION=log
FILESYSTEM_DISK=public
CLOUDINARY_URL=
XKIRO_BASE_URL=https://api.xkiro.com/v1
XKIRO_API_KEY=
XKIRO_MODEL=qwen/qwen3.7-plus:free
XKIRO_TIMEOUT=60
```

Untuk deployment Reverb, gunakan `BROADCAST_CONNECTION=reverb` dan isi variable `REVERB_APP_ID`, `REVERB_APP_KEY`, `REVERB_APP_SECRET`, `REVERB_HOST`, `REVERB_PORT`, dan `REVERB_SCHEME` di environment backend. Detail variable tambahan tersedia di `backend/.env.example` dan `render.yaml`.

API key Xkiro dan `CLOUDINARY_URL` hanya boleh disimpan di backend. Setelah mengubah konfigurasi Laravel, jalankan:

```bash
php artisan config:clear
```

## Command Penting

### Frontend

```bash
npm run dev       # Development server
npm run build     # Production build
npm run start     # Jalankan hasil production build
npm run lint      # ESLint
```

### Backend

```bash
composer setup                         # Install, env, key, migration, dan asset build
composer dev                           # Server, queue, log, dan Vite backend
composer test                          # Bersihkan config lalu jalankan semua test
php artisan test                       # Jalankan test PHPUnit
php artisan test --filter=NamaTest     # Jalankan test berdasarkan filter
php artisan queue:work                  # Jalankan worker queue
php artisan reverb:start                # Jalankan server Reverb
php artisan users:recalc-levels         # Sinkronisasi level dari XP
vendor/bin/pint                        # Format kode PHP
```

`composer setup` menjalankan migration dengan `--force`, sehingga gunakan hanya pada environment/database yang sesuai.

## Testing

Backend memiliki test unit dan feature di `backend/tests/`. Konfigurasi PHPUnit menggunakan SQLite in-memory, cache/session array, queue synchronous, dan broadcasting nonaktif agar test tidak membutuhkan service eksternal.

```bash
cd backend
composer test
```

Frontend saat ini memiliki lint dan production build, tetapi belum memiliki script unit test, integration test, atau end-to-end test.

## API

Semua route API berada di bawah `/api/v1` dan didefinisikan di `backend/routes/api.php`. Endpoint utama meliputi:

- Auth: `/auth/register`, `/auth/login`, `/auth/logout`, `/auth/me`, password reset.
- User: `/users/me`, statistik, course aktif, progress, mascot, dan achievement.
- Course dan lesson: `/courses`, `/lessons`, enrollment, dan progress.
- Exam: exam, questions, attempt, submit, violation, dan import PDF.
- Gamifikasi: `/leaderboard`, `/mascots`, dan `/achievements`.
- Kolaborasi: `/study-rooms`, room messages, dan attachments.
- Sosial: `/friends` dan `/private-chats`.
- AI: `POST /ai/chat`.
- Admin: `/admin/users`, `/admin/courses`, dan `/admin/analytics/overview`.

Endpoint yang membutuhkan autentikasi menggunakan:

```http
Authorization: Bearer <sanctum_token>
```

Response API menggunakan format:

```json
{
  "success": true,
  "data": {},
  "error": null,
  "meta": null
}
```

Spesifikasi endpoint, field request, response detail, dan status test tersedia di [`backend/README.md`](backend/README.md). Koleksi Postman tersedia di [`docs/postman`](docs/postman/).

## Upload Attachment

Study room dan private chat mendukung satu attachment per request melalui Cloudinary.

- Endpoint study room: `POST /api/v1/study-rooms/{room}/attachments`
- Endpoint private chat: `POST /api/v1/private-chats/{conversation}/attachments`
- Field multipart: `file`
- Batas ukuran: 10 MB
- Tipe: JPEG, PNG, GIF, WebP, MP4, WebM, MOV, PDF, TXT, DOC/DOCX, XLS/XLSX, PPT/PPTX

Upload tidak otomatis menjadi pesan. URL hasil upload kemudian dikirim ke endpoint message terkait. Jangan pernah mengekspos API secret Cloudinary ke frontend.

## Deployment

### Backend

Backend menyediakan `backend/Dockerfile` yang menjalankan PHP-FPM, Nginx, Supervisor, queue, dan konfigurasi runtime Laravel. `render.yaml` mengatur deployment service Docker backend di Render, termasuk health check `/up`, migration, database, CORS, dan Reverb.

Variable `RUN_MIGRATIONS`, `RUN_SEEDERS`, `RUN_LEADERBOARD_SEEDER`, `RUN_RECALC_LEVELS`, dan `RUN_MIGRATE_FRESH` mengontrol operasi database saat container start. Aktifkan `RUN_MIGRATE_FRESH` hanya pada database disposable karena akan menghapus data yang ada.

### Frontend

Frontend dapat dideploy ke Vercel dengan `frontend` sebagai Root Directory. Setidaknya isi:

```env
NEXT_PUBLIC_API_URL=https://<backend-host>/api/v1
```

Jika realtime digunakan, tambahkan variable `NEXT_PUBLIC_REVERB_*` yang sesuai dengan konfigurasi Reverb backend.

## Catatan Keamanan

- Jangan commit `.env`, API key, password database, secret Reverb, atau kredensial Cloudinary.
- `APP_DEBUG` harus `false` di production.
- CORS production harus dibatasi ke origin frontend yang benar.
- Client-side validation/rate limiting bukan pengganti validasi dan rate limiting backend.
- Perintah `migrate:fresh --seed` bersifat destruktif terhadap database.

## Lisensi

Proyek ini dikembangkan untuk kebutuhan proyek EduWave dan Kompetisi OSCAR 3.0 mata lomba Web Development.
