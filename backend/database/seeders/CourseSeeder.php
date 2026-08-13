<?php

namespace Database\Seeders;

use App\Models\Course;
use App\Models\User;
use Illuminate\Database\Seeder;

class CourseSeeder extends Seeder
{
    public function run(): void
    {
        $instructor = User::where('email', 'instructor@eduwave.id')->first();

        Course::create([
            'id'               => '44444444-4444-4444-4444-444444444444',
            'title'            => 'Dasar-Dasar Oceanografi & Navigasi Laut',
            'description'      => 'Pelajari sains kelautan, ekosistem maritim, dan teknik dasar navigasi.',
            'instructor_id'    => $instructor?->id,
            'category'         => 'marine',
            'difficulty'       => 'beginner',
            'thumbnail_url'    => 'https://api.eduwave.id/courses/oceanography.jpg',
            'trailer_url'      => 'https://api.eduwave.id/trailers/ocean.mp4',
            'status'           => 'published',
            'pearls_reward'    => 50,
            'duration_minutes' => 120,
        ]);

        Course::create([
            'id'               => '55555555-5555-5555-5555-555555555555',
            'title'            => 'Draft: Navigasi Kapal Selam Modern',
            'description'      => 'Materi khusus teknologi kapal selam modern (DRAFT).',
            'instructor_id'    => $instructor?->id,
            'category'         => 'technology',
            'difficulty'       => 'advanced',
            'thumbnail_url'    => 'https://api.eduwave.id/courses/submarine.jpg',
            'status'           => 'draft',
            'pearls_reward'    => 100,
            'duration_minutes' => 180,
        ]);
    }
}
