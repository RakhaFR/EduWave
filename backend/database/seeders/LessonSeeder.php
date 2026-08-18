<?php

namespace Database\Seeders;

use App\Models\Course;
use App\Models\Lesson;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class LessonSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Specific fixed lessons for course 44444444-4444-4444-4444-444444444444 (retains existing test compatibility)
        $course1Id = '44444444-4444-4444-4444-444444444444';

        Lesson::create([
            'id' => '66666666-6666-6666-6666-666666666661',
            'course_id' => $course1Id,
            'title' => 'Pelajaran 1: Pengantar Ekosistem Terumbu Karang',
            'type' => 'video',
            'content' => "# Ekosistem Terumbu Karang\nTerumbu karang adalah rumah bagi lebih dari 25% biota laut dunia. Di pelajaran ini kita akan membahas keanekaragaman hayati dan peran zooxanthellae.",
            'video_url' => 'https://api.eduwave.id/lessons/lesson1.mp4',
            'duration_minutes' => 15,
            'order' => 1,
            'xp_reward' => 20,
            'is_preview' => true,
        ]);

        Lesson::create([
            'id' => '66666666-6666-6666-6666-666666666662',
            'course_id' => $course1Id,
            'title' => 'Pelajaran 2: Zona Kedalaman Samudra',
            'type' => 'text',
            'content' => "# Zona Kedalaman Samudra\n1. **Epipelagis (0-200m)**: Zona terang matahari tempat fotosintesis terjadi.\n2. **Mesopelagis (200-1000m)**: Zona remang-remang (twilight zone).\n3. **Batipelagis (1000-4000m)**: Zona gelap gulita tanpa sinar matahari.\n4. **Abisalpelagis (4000-6000m)**: Dataran dasar laut yang sangat dingin.\n5. **Hadapelagis (>6000m)**: Palung laut terdalam.",
            'video_url' => null,
            'duration_minutes' => 25,
            'order' => 2,
            'xp_reward' => 30,
            'is_preview' => false,
        ]);

        Lesson::create([
            'id' => '66666666-6666-6666-6666-666666666663',
            'course_id' => $course1Id,
            'title' => 'Pelajaran 3: Arus Laut & Fenomena Upwelling',
            'type' => 'quiz',
            'content' => "# Arus Laut & Upwelling\nFenomena naik air laut dingin bermassa nutrisi tinggi dari dasar ke permukaan dinamakan Upwelling. Proses ini mendorong kelimpahan ikan.",
            'duration_minutes' => 10,
            'order' => 3,
            'xp_reward' => 25,
            'is_preview' => false,
        ]);

        Lesson::create([
            'id' => '66666666-6666-6666-6666-666666666664',
            'course_id' => $course1Id,
            'title' => 'Pelajaran 4: Navigasi Peta Laut & Skala Mercator',
            'type' => 'video',
            'content' => "# Navigasi Peta Laut\nMemahami proyeksi Mercator, penentuan koordinat Lintang (Latitude) dan Bujur (Longitude), serta konversi mil laut (Nautical Mile).",
            'video_url' => 'https://api.eduwave.id/lessons/lesson4.mp4',
            'duration_minutes' => 20,
            'order' => 4,
            'xp_reward' => 35,
            'is_preview' => false,
        ]);

        // 2. Generate lessons for all other courses dynamically
        $otherCourses = Course::where('id', '!=', $course1Id)->get();

        $lessonTemplates = [
            'Pemahaman Konsep & Teori Dasar',
            'Prinsip Operasional & Analisis Kasus',
            'Simulasi & Praktikum Komunikasi',
            'Studi Kasus & Penanganan Kondisi Darurat',
            'Evaluasi Kritis & Penerapan Lapangan',
        ];

        foreach ($otherCourses as $course) {
            $lessonCount = rand(4, 6);
            for ($i = 1; $i <= $lessonCount; $i++) {
                $type = match ($i % 3) {
                    1 => 'video',
                    2 => 'text',
                    0 => 'quiz',
                };

                $templateTitle = $lessonTemplates[($i - 1) % count($lessonTemplates)];

                Lesson::create([
                    'id' => (string) Str::uuid(),
                    'course_id' => $course->id,
                    'title' => "Modul {$i}: {$templateTitle} {$course->title}",
                    'type' => $type,
                    'content' => "# Modul {$i}: {$templateTitle}\n\nMateri perkuliahan mendalam mengenai aspek **{$course->category}** dengan tingkat kesulitan **{$course->difficulty}**.\n\n- Memahami standar keselamatan dan regulasi internasional.\n- Menguasai pemetaan serta kalkulasi matematis terkait.\n- Mengaplikasikan teori ke dalam modul simulasi praktis.",
                    'video_url' => $type === 'video' ? "https://api.eduwave.id/videos/course-{$course->id}-{$i}.mp4" : null,
                    'duration_minutes' => rand(15, 45),
                    'order' => $i,
                    'xp_reward' => rand(20, 50),
                    'is_preview' => ($i === 1),
                ]);
            }
        }
    }
}
