# Laporan Frontend → Backend

File ini berisi catatan hal-hal yang perlu dikonfirmasi atau diperbaiki di sisi backend, ditemukan saat integrasi frontend.

---

## 1. [EXAM] `GET /api/v1/exams/{exam}/attempts` — Format Response Tidak Konsisten

**Endpoint:** `GET /api/v1/exams/{exam}/attempts`

**Masalah:**
README menyebut endpoint ini ada (`List authenticated user's attempt history for an exam`), tapi tidak mendokumentasikan format response-nya secara detail.

**Yang dibutuhkan frontend:**
```json
{
  "success": true,
  "data": [
    {
      "id": "a1f2e3d4-...",
      "score": 85.00,
      "passed": true,
      "submitted_at": "2026-08-13T14:00:00.000000Z",
      "started_at": "2026-08-13T13:40:00.000000Z"
    }
  ],
  "error": null,
  "meta": null
}
```

**Keperluan frontend:**
- Menghitung berapa kali user sudah mencoba (`completedAttempts.length`)
- Menampilkan nilai terbaik (`bestScore`)
- Menentukan apakah tombol "Mulai Ujian" perlu di-disable (jika sudah mencapai `max_attempts`)

**Tolong konfirmasi:** apakah `data` berupa array langsung atau dibungkus objek seperti `{ attempts: [...] }`?

---

## 2. [EXAM] `GET /api/v1/courses/{course}` — Lesson Tidak Menyertakan `exam_id`

**Endpoint:** `GET /api/v1/courses/{course}`

**Masalah:**
Response lesson outline di dalam course detail tidak menyertakan `exam_id`. Contoh response saat ini:
```json
{
  "id": "l1f2e...",
  "title": "Pengantar Zona Laut",
  "type": "video",
  "duration_minutes": 15,
  "order": 1,
  "xp_reward": 30,
  "is_preview": true
}
```

**Yang dibutuhkan frontend:**
```json
{
  "id": "l1f2e...",
  "title": "Pengantar Zona Laut",
  "type": "video",
  "duration_minutes": 15,
  "order": 1,
  "xp_reward": 30,
  "is_preview": true,
  "exam_id": "x1f2e3d4-..." 
}
```

**Keperluan frontend:**
- Menampilkan tombol "Kerjakan Ujian" di bawah setiap lesson yang punya exam
- Navigasi langsung ke `/pelajar/exam/{exam_id}` dari halaman course detail

**Tolong tambahkan `exam_id` (nullable) ke tiap item lesson di response `GET /courses/{course}`.**

---

## 3. [EXAM] `POST /api/v1/exams/{exam}/attempts` — Apakah Perlu Enroll Dulu?

**Masalah:**
Belum jelas apakah user harus enroll ke course terlebih dahulu sebelum bisa mulai attempt exam, atau exam bisa diakses bebas jika punya `exam_id`.

**Tolong konfirmasi:** policy akses exam — apakah cukup authenticated saja, atau harus enrolled ke course terkait?

---

*Dibuat oleh: Tim Frontend — `r\RAKHA`*
*Tanggal: 19 Agustus 2026*
