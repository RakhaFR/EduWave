# 🌊 EduWave — Interactive Ocean-Themed Learning Platform

EduWave adalah platform pembelajaran interaktif bertema bawah laut yang mengintegrasikan sistem gamifikasi mutiara, AI Study Assistant, ruang kolaborasi real-time, serta penyesuaian maskot untuk meningkatkan pengalaman belajar pengguna.

---

## 🛠️ Tech Stack

- **Frontend:** Next.js (App Router), TypeScript, Tailwind CSS, Axios
- **Backend:** Laravel (RESTful API), MySQL / PostgreSQL

---

## 📁 Repository Structure

```text
eduwave/
├── frontend/                     # Next.js Application
│   ├── src/
│   │   ├── app/                 # App Router Pages
│   │   │   ├── (auth)/          # Login & Register Routes
│   │   │   ├── admin/           # Admin Dashboard
│   │   │   ├── course/[id]/     # Course Detail & Modules
│   │   │   ├── dashboard/       # Student Dashboard
│   │   │   ├── exam/[id]/       # Examination Page
│   │   │   ├── leaderboard/     # Student Ranking
│   │   │   ├── mascot-customize/# Mascot Customization
│   │   │   ├── profile/         # User Profile
│   │   │   └── study-room/      # Real-time Collaboration Room
│   │   ├── components/          # Reusable UI Components
│   │   ├── lib/                 # Axios & Utility Configs
│   │   ├── services/            # API Call Handlers
│   │   └── types/               # TypeScript Definitions
│   └── package.json
│
└── backend/                      # Laravel REST API
    ├── app/                     # Controllers, Models, Middleware
    ├── database/                # Migrations & Seeders
    ├── routes/                  # API Endpoints (`api.php`)
    └── composer.json
```

---

## 🚀 Getting Started

### Prerequisites

Pastikan perangkat Anda sudah terinstal:
- **Node.js** (v18.x atau lebih baru)
- **PHP** (v8.2 atau lebih baru) & **Composer**
- **MySQL** / **PostgreSQL**

---

### 1. Setup Frontend (Next.js)

```bash
# Pindah ke direktori frontend
cd frontend

# Install dependencies
npm install

# Konfigurasi Environment Variables
# Buat file .env.local di dalam folder frontend
```

Isi file `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

Jalankan development server:
```bash
npm run dev
```
Aplikasi frontend akan berjalan di `http://localhost:3000`.

---

### 2. Setup Backend (Laravel)

```bash
# Pindah ke direktori backend
cd ../backend

# Install dependencies
composer install

# Salin file konfigurasi environment
cp .env.example .env

# Generate Application Key
php artisan key:generate

# Jalankan migrasi database
php artisan migrate --seed
```

Jalankan server Laravel:
```bash
php artisan serve
```
API backend akan berjalan di `http://localhost:8000`.

---

## 🤖 AI Study Assistant

Backend menyediakan endpoint chat yang meneruskan request ke API OpenAI-compatible Xkiro. API key hanya disimpan di backend, bukan di frontend.

### Konfigurasi Backend

Tambahkan ke `backend/.env`, lalu bersihkan cache konfigurasi:

```env
XKIRO_BASE_URL=https://api.xkiro.com/v1
XKIRO_API_KEY=your-xkiro-api-key
XKIRO_MODEL=qwen/qwen3.7-plus:free
XKIRO_TIMEOUT=60
```

Hasil pengujian langsung ke Xkiro pada 26 Agustus 2026 tanpa header `Authorization` adalah **HTTP 401**. Jadi, meskipun model bertanda `:free`, environment ini tetap memerlukan API key Xkiro.

```bash
cd backend
php artisan config:clear
```

### Endpoint Chat

```http
POST /api/v1/ai/chat
Authorization: Bearer {eduwave_token}
Content-Type: application/json
Accept: application/json
```

Body minimal:

```json
{
  "message": "Jelaskan fotosintesis dengan singkat"
}
```

Body dengan konteks pembelajaran:

```json
{
  "message": "Buatkan ringkasan materi ini",
  "course_context_id": "COURSE_UUID",
  "lesson_context_id": "LESSON_UUID",
  "conversation_id": "OPTIONAL_CLIENT_CONVERSATION_UUID"
}
```

`message` maksimal 4.000 karakter. Student hanya dapat mengirim konteks kursus yang published dan sudah di-enroll; admin/instructor dapat menggunakan konteks kursus apa pun. `conversation_id` saat ini hanya dikembalikan sebagai identifier client dan belum disimpan server.

Contoh penggunaan dari frontend menggunakan `fetch`:

```ts
const response = await fetch(`${API_URL}/v1/ai/chat`, {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json",
    "Accept": "application/json",
  },
  body: JSON.stringify({ message: "Apa inti lesson ini?", lesson_context_id: lessonId }),
});

const result = await response.json();
if (!response.ok) throw new Error(result.error?.message ?? "AI tidak tersedia");
console.log(result.data.message);
```

Respons berhasil mengikuti envelope API EduWave:

```json
{
  "success": true,
  "data": {
    "message": "Fotosintesis adalah ...",
    "conversation_id": null,
    "model": "qwen/qwen3.7-plus:free",
    "usage": { "prompt_tokens": 30, "completion_tokens": 20, "total_tokens": 50 }
  },
  "error": null,
  "meta": null
}
```

Error upstream atau key yang belum dikonfigurasi menghasilkan HTTP `503` dengan `error.code` `AI_SERVICE_UNAVAILABLE`.

---

## 📎 Chat Attachments (Cloudinary)

Fitur ini menyediakan upload gambar, video, dan dokumen untuk study room chat serta private friend chat. File diunggah oleh backend ke Cloudinary dan endpoint mengembalikan URL HTTPS yang dapat dikirim sebagai isi pesan. Frontend belum diubah oleh implementasi ini.

### A. Setup Cloudinary

1. Buat akun gratis di [Cloudinary](https://cloudinary.com/) dan buka **Dashboard**.
2. Salin **API Environment Variable** dengan format berikut.
3. Tambahkan nilainya ke `backend/.env`:

```env
CLOUDINARY_URL=cloudinary://API_KEY:API_SECRET@CLOUD_NAME
```

Jangan menaruh `API_SECRET` di frontend, `frontend/.env.local`, atau repository. Setelah mengubah environment, jalankan:

```bash
cd backend
php artisan config:clear
```

Dependensi PHP sudah didefinisikan sebagai `cloudinary/cloudinary_php` di `backend/composer.json`. Jika checkout dari repository baru, jalankan `composer install`.

### B. Aturan Upload

- Maksimal satu file per request.
- Ukuran maksimal: **10 MB** (`10240 KB`).
- Gambar: JPEG, PNG, GIF, WebP.
- Video: MP4, WebM, MOV/QuickTime.
- Dokumen: PDF, TXT, DOC/DOCX, XLS/XLSX, PPT/PPTX.
- Upload harus menggunakan `multipart/form-data` dengan nama field `file`.
- Semua endpoint memerlukan header `Authorization: Bearer {token}`.
- File tidak otomatis menjadi pesan. Setelah upload berhasil, frontend mengirim URL hasil upload melalui endpoint message yang sudah ada.

### C. Endpoint Study Room

```http
POST /api/v1/study-rooms/{room}/attachments
```

Syarat akses: user harus menjadi peserta room dan room harus berstatus `active`.

Contoh request:

```bash
curl -X POST "http://localhost:8000/api/v1/study-rooms/ROOM_ID/attachments" \
  -H "Authorization: Bearer TOKEN" \
  -H "Accept: application/json" \
  -F "file=@/path/to/photo.jpg"
```

### D. Endpoint Private Friend Chat

```http
POST /api/v1/private-chats/{conversation}/attachments
```

Syarat akses: user harus merupakan salah satu anggota conversation tersebut.

Contoh request:

```bash
curl -X POST "http://localhost:8000/api/v1/private-chats/CONVERSATION_ID/attachments" \
  -H "Authorization: Bearer TOKEN" \
  -H "Accept: application/json" \
  -F "file=@/path/to/document.pdf"
```

### E. Respons Berhasil

Kedua endpoint memakai format respons API EduWave:

```json
{
  "success": true,
  "data": {
    "attachment": {
      "url": "https://res.cloudinary.com/.../upload/.../photo.jpg",
      "public_id": "chat/study-rooms/ROOM_ID/photo_abc123",
      "resource_type": "image",
      "format": "jpg",
      "mime_type": "image/jpeg",
      "size": 245678,
      "original_name": "photo.jpg"
    }
  },
  "error": null,
  "meta": null
}
```

`resource_type` bernilai `image`, `video`, atau `raw` untuk dokumen. URL yang dipakai untuk pesan adalah `data.attachment.url`.

### F. Panduan Implementasi Frontend

Frontend dapat memakai alur berikut tanpa membocorkan kredensial Cloudinary:

1. Saat user memilih file, tolak file jika `file.size > 10 * 1024 * 1024` dan tampilkan tipe file yang diperbolehkan.
2. Buat `FormData`, lalu append file dengan key `file`.
3. POST `FormData` ke endpoint attachment sesuai konteks chat menggunakan Bearer token. Jangan set header `Content-Type` secara manual jika memakai Axios/fetch; browser akan menambahkan boundary multipart.
4. Ambil `data.attachment` dari respons.
5. Kirim pesan melalui endpoint yang sudah ada:
   - Study room: `POST /api/v1/study-rooms/{room}/messages` dengan `{ "content": attachment.url, "type": "file" }`.
   - Private chat: `POST /api/v1/private-chats/{conversation}/messages` dengan `{ "content": attachment.url }`.
6. Render berdasarkan MIME/resource type. Untuk gambar gunakan `<img>`, video `<video controls>`, sedangkan dokumen gunakan link download/open pada `attachment.url`.
7. Simpan metadata attachment dari respons pada state pesan jika UI memerlukan nama file, ukuran, atau preview. Backend saat ini menyimpan URL sebagai `content`, jadi perubahan model/database belum diperlukan untuk endpoint upload tahap pertama.

Contoh fungsi client-side:

```ts
const form = new FormData();
form.append("file", file);

const upload = await api.post(
  `/study-rooms/${roomId}/attachments`,
  form,
  { headers: { Authorization: `Bearer ${token}` } }
);

await api.post(`/study-rooms/${roomId}/messages`, {
  content: upload.data.data.attachment.url,
  type: "file",
});
```

### G. Error Utama

- `401`: token tidak ada atau tidak valid.
- `403 NOT_A_PARTICIPANT` / `UNAUTHORIZED_CONVERSATION`: user tidak memiliki akses chat.
- `422`: field `file` kosong, tipe file tidak diperbolehkan, atau ukuran lebih dari 10 MB.
- `502 UPLOAD_FAILED`: Cloudinary gagal menerima file.
- `503 CLOUDINARY_NOT_CONFIGURED`: `CLOUDINARY_URL` belum diisi di backend.

---

## 🌐 Deployment Configuration (Vercel)

Jika melakukan *deployment* platform frontend ke **Vercel**:

1. Hubungkan repositori Git ini ke Vercel.
2. Di bagian **Project Settings > Root Directory**, atur nilainya ke:
   ```text
   frontend
   ```
3. Tambahkan Environment Variable di Vercel:
   - `NEXT_PUBLIC_API_URL`: URL API Laravel yang sudah terisolasi/online.

---

## 📝 License

Proyek ini dikembangkan untuk perlombaan **EduWave**. Hak cipta dilindungi undang-undang.
