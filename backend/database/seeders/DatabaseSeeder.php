<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     * FOR LOCAL/TESTING USE ONLY.
     */
    public function run(): void
    {
        $this->call([
            UserSeeder::class,
            MascotSeeder::class,
            AchievementSeeder::class,
            CourseSeeder::class,
            LessonSeeder::class,
            ExamSeeder::class,
        ]);
    }
}
