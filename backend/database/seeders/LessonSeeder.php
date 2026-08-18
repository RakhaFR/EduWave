<?php

namespace Database\Seeders;

use App\Models\Lesson;
use Illuminate\Database\Seeder;

class LessonSeeder extends Seeder
{
    public function run(): void
    {
        Lesson::create([
            'id' => '66666666-6666-6666-6666-666666666661',
            'course_id' => '44444444-4444-4444-4444-444444444444',
            'title' => 'Pelajaran 1: Pengantar Ekosistem Terumbu Karang',
            'type' => 'video',
            'content' => '# Ekosistem Terumbu Karang\nTerumbu karang adalah tempat tinggal ribuan spesies laut.',
            'video_url' => 'https://api.eduwave.id/lessons/lesson1.mp4',
            'duration_minutes' => 15,
            'order' => 1,
            'xp_reward' => 20,
            'is_preview' => true,
        ]);

        Lesson::create([
            'id' => '66666666-6666-6666-6666-666666666662',
            'course_id' => '44444444-4444-4444-4444-444444444444',
            'title' => 'Pelajaran 2: Zona Kedalaman Samudra',
            'type' => 'text',
            'content' => "# Zona Kedalaman Samudra\n1. Epipelagis\n2. Mesopelagis\n3. Batipelagis\n4. Hadapelagis.",
            'video_url' => null,
            'duration_minutes' => 25,
            'order' => 2,
            'xp_reward' => 30,
            'is_preview' => false,
        ]);

        Lesson::create([
            'id' => '66666666-6666-6666-6666-666666666663',
            'course_id' => '44444444-4444-4444-4444-444444444444',
            'title' => 'Pelajaran 3: Kuis Pemahaman Arus Laut',
            'type' => 'quiz',
            'content' => 'Jawab kuis singkat mengenai fenomena Upwelling.',
            'duration_minutes' => 10,
            'order' => 3,
            'xp_reward' => 25,
            'is_preview' => false,
        ]);
    }
}
