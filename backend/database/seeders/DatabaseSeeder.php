<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        if (User::query()->exists()) {
            return;
        }

        $this->call([
            UserSeeder::class,
            MascotSeeder::class,
            AchievementSeeder::class,
            CourseSeeder::class,
            LessonSeeder::class,
            ExamSeeder::class,
            StudyRoomSeeder::class,
            EnrollmentAndActivitySeeder::class,
            LeaderboardSeeder::class,
        ]);
    }
}
