<?php

namespace Database\Seeders;

use App\Models\Course;
use App\Models\User;
use Illuminate\Database\Seeder;

class CourseSeeder extends Seeder
{
    public function run(): void
    {
        $kapten = User::where('email', 'instructor@eduwave.id')->first();
        $nautilus = User::where('email', 'nautilus@eduwave.id')->first();
        $sonar = User::where('email', 'sonar@eduwave.id')->first();
        $maritim = User::where('email', 'maritim@eduwave.id')->first();

        $courses = [
            [
                'id' => '44444444-4444-4444-4444-444444444444',
                'title' => 'Dasar-Dasar Oceanografi & Navigasi Laut',
                'description' => 'Pelajari sains kelautan, ekosistem maritim, dan teknik dasar navigasi peta dan kompas laut.',
                'instructor_id' => $kapten?->id,
                'category' => 'marine',
                'difficulty' => 'beginner',
                'thumbnail_url' => 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800',
                'trailer_url' => 'https://api.eduwave.id/trailers/ocean.mp4',
                'status' => 'published',
                'pearls_reward' => 50,
                'duration_minutes' => 120,
            ],
            [
                'id' => '44444444-4444-4444-4444-444444444445',
                'title' => 'Sistem Pemetaan Laut & GIS Maritim',
                'description' => 'Memahami pemetaan kartografi digital, teknologi sonar 3D, dan pemodelan dasar laut berbasis GIS.',
                'instructor_id' => $nautilus?->id,
                'category' => 'technology',
                'difficulty' => 'intermediate',
                'thumbnail_url' => 'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800',
                'trailer_url' => 'https://api.eduwave.id/trailers/gis.mp4',
                'status' => 'published',
                'pearls_reward' => 80,
                'duration_minutes' => 180,
            ],
            [
                'id' => '44444444-4444-4444-4444-444444444446',
                'title' => 'Keselamatan Pelayaran & Standar SOLAS',
                'description' => 'Prosedur keselamatan maritim internasional, manajemen darurat kapal, dan regulasi SOLAS.',
                'instructor_id' => $maritim?->id,
                'category' => 'marine',
                'difficulty' => 'beginner',
                'thumbnail_url' => 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800',
                'trailer_url' => null,
                'status' => 'published',
                'pearls_reward' => 60,
                'duration_minutes' => 150,
            ],
            [
                'id' => '44444444-4444-4444-4444-444444444447',
                'title' => 'Ekologi & Pelestarian Terumbu Karang',
                'description' => 'Mengenal keanekaragaman hayati terumbu karang, ancaman pemutihan karang, dan konservasi laut.',
                'instructor_id' => $sonar?->id,
                'category' => 'science',
                'difficulty' => 'beginner',
                'thumbnail_url' => 'https://images.unsplash.com/photo-1544551763-77ef2d0cfc6c?w=800',
                'trailer_url' => null,
                'status' => 'published',
                'pearls_reward' => 70,
                'duration_minutes' => 140,
            ],
            [
                'id' => '44444444-4444-4444-4444-444444444448',
                'title' => 'Navigasi Astronomi & Penentuan Posisi Kapal',
                'description' => 'Teknik kuno dan modern menggunakan sekstan, lintang, bujur, serta rasi bintang untuk navigasi.',
                'instructor_id' => $kapten?->id,
                'category' => 'marine',
                'difficulty' => 'advanced',
                'thumbnail_url' => 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=800',
                'trailer_url' => null,
                'status' => 'published',
                'pearls_reward' => 120,
                'duration_minutes' => 240,
            ],
            [
                'id' => '44444444-4444-4444-4444-444444444449',
                'title' => 'Bahasa Inggris Maritim (SMCP Standard)',
                'description' => 'Kuasai Standard Marine Communication Phrases (SMCP) untuk komunikasi radio antar-kapal dan pelabuhan.',
                'instructor_id' => $maritim?->id,
                'category' => 'language',
                'difficulty' => 'intermediate',
                'thumbnail_url' => 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800',
                'trailer_url' => null,
                'status' => 'published',
                'pearls_reward' => 90,
                'duration_minutes' => 160,
            ],
            [
                'id' => '44444444-4444-4444-4444-444444444450',
                'title' => 'Teknologi Radar & ARPA Pelayaran',
                'description' => 'Operasi radar maritim, pencacahan ARPA, penanganan persimpangan kapal, dan pencegahan tubrukan laut.',
                'instructor_id' => $nautilus?->id,
                'category' => 'technology',
                'difficulty' => 'advanced',
                'thumbnail_url' => 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800',
                'trailer_url' => null,
                'status' => 'published',
                'pearls_reward' => 150,
                'duration_minutes' => 200,
            ],
            [
                'id' => '44444444-4444-4444-4444-444444444451',
                'title' => 'Meteorologi Maritim & Prediksi Badai Samudra',
                'description' => 'Mempelajari pola angin pasat, siklon tropis, tekanan udara, dan cara membaca peta cuaca pelayaran.',
                'instructor_id' => $sonar?->id,
                'category' => 'science',
                'difficulty' => 'intermediate',
                'thumbnail_url' => 'https://images.unsplash.com/photo-1454789548928-9efd52dc4031?w=800',
                'trailer_url' => null,
                'status' => 'published',
                'pearls_reward' => 85,
                'duration_minutes' => 170,
            ],
            [
                'id' => '44444444-4444-4444-4444-444444444452',
                'title' => 'Dasar-Dasar Robotika Bawah Air (ROV)',
                'description' => 'Pengenalan Remotely Operated Vehicles (ROV), sensor hidroakustik, dan eksplorasi palung laut.',
                'instructor_id' => $nautilus?->id,
                'category' => 'technology',
                'difficulty' => 'intermediate',
                'thumbnail_url' => 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800',
                'trailer_url' => null,
                'status' => 'published',
                'pearls_reward' => 110,
                'duration_minutes' => 210,
            ],
            [
                'id' => '44444444-4444-4444-4444-444444444453',
                'title' => 'Manajemen Pelabuhan & Logistik Maritime Modern',
                'description' => 'Pengelolaan dermaga kontainer, lalu lintas bongkar muat, dan rantai pasok maritim global.',
                'instructor_id' => $maritim?->id,
                'category' => 'business',
                'difficulty' => 'intermediate',
                'thumbnail_url' => 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=800',
                'trailer_url' => null,
                'status' => 'published',
                'pearls_reward' => 95,
                'duration_minutes' => 190,
            ],
            // Draft Courses
            [
                'id' => '55555555-5555-5555-5555-555555555555',
                'title' => 'Draft: Navigasi Kapal Selam Modern',
                'description' => 'Materi khusus teknologi propulsi dan sonar kapal selam generasi terbaru (DRAFT).',
                'instructor_id' => $kapten?->id,
                'category' => 'technology',
                'difficulty' => 'advanced',
                'thumbnail_url' => 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800',
                'trailer_url' => null,
                'status' => 'draft',
                'pearls_reward' => 100,
                'duration_minutes' => 180,
            ],
            [
                'id' => '55555555-5555-5555-5555-555555555556',
                'title' => 'Draft: Energi Terbarukan Gelombang & Angin Laut',
                'description' => 'Studi komprehensif pembangkit listrik tenaga gelombang dan turbin angin lepas pantai (DRAFT).',
                'instructor_id' => $sonar?->id,
                'category' => 'science',
                'difficulty' => 'advanced',
                'thumbnail_url' => 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=800',
                'trailer_url' => null,
                'status' => 'draft',
                'pearls_reward' => 130,
                'duration_minutes' => 220,
            ],
        ];

        foreach ($courses as $c) {
            Course::create($c);
        }
    }
}
