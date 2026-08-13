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