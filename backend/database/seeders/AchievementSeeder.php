<?php

namespace Database\Seeders;

use App\Models\Achievement;
use App\Models\User;
use App\Models\UserAchievement;
use Illuminate\Database\Seeder;

class AchievementSeeder extends Seeder
{
    public function run(): void
    {
        $achievements = [
            [
                'id' => '33333333-3333-3333-3333-333333333333',
                'name' => 'Penyelam Pertama',
                'description' => 'Menyelesaikan pelajaran pertama Anda di EduWave.',
                'icon_url' => 'https://api.eduwave.id/badges/first-lesson.png',
                'condition_type' => 'lesson_completion',
                'condition_value' => 1,
                'pearls_reward' => 25,
            ],
            [
                'id' => '33333333-3333-3333-3333-333333333334',
                'name' => 'Kapten Bahari Muda',
                'description' => 'Menyelesaikan 5 pelajaran.',
                'icon_url' => 'https://api.eduwave.id/badges/five-lessons.png',
                'condition_type' => 'lesson_completion',
                'condition_value' => 5,
                'pearls_reward' => 50,
            ],
            [
                'id' => '33333333-3333-3333-3333-333333333335',
                'name' => 'Master Pelajaran',
                'description' => 'Menyelesaikan 20 pelajaran.',
                'icon_url' => 'https://api.eduwave.id/badges/twenty-lessons.png',
                'condition_type' => 'lesson_completion',
                'condition_value' => 20,
                'pearls_reward' => 150,
            ],
            [
                'id' => '33333333-3333-3333-3333-333333333336',
                'name' => 'Pelaut Pemula',
                'description' => 'Menyelesaikan kursus pertama Anda.',
                'icon_url' => 'https://api.eduwave.id/badges/first-course.png',
                'condition_type' => 'course_completion',
                'condition_value' => 1,
                'pearls_reward' => 100,
            ],
            [
                'id' => '33333333-3333-3333-3333-333333333337',
                'name' => 'Navigator Ulung',
                'description' => 'Menyelesaikan 5 kursus maritim dan teknologi.',
                'icon_url' => 'https://api.eduwave.id/badges/five-courses.png',
                'condition_type' => 'course_completion',
                'condition_value' => 5,
                'pearls_reward' => 300,
            ],
            [
                'id' => '33333333-3333-3333-3333-333333333338',
                'name' => 'Lulus Ujian Perdana',
                'description' => 'Berhasil lulus dari ujian evaluasi pertama.',
                'icon_url' => 'https://api.eduwave.id/badges/first-exam.png',
                'condition_type' => 'exam_pass',
                'condition_value' => 1,
                'pearls_reward' => 50,
            ],
            [
                'id' => '33333333-3333-3333-3333-333333333339',
                'name' => 'Ahli Teori Samudra',
                'description' => 'Lulus 5 ujian evaluasi.',
                'icon_url' => 'https://api.eduwave.id/badges/five-exams.png',
                'condition_type' => 'exam_pass',
                'condition_value' => 5,
                'pearls_reward' => 200,
            ],
            [
                'id' => '33333333-3333-3333-3333-333333333340',
                'name' => 'Pencari XP',
                'description' => 'Mencapai total 1.000 XP.',
                'icon_url' => 'https://api.eduwave.id/badges/xp-1000.png',
                'condition_type' => 'xp_milestone',
                'condition_value' => 1000,
                'pearls_reward' => 75,
            ],
            [
                'id' => '33333333-3333-3333-3333-333333333341',
                'name' => 'Legenda Samudra',
                'description' => 'Mencapai total 5.000 XP.',
                'icon_url' => 'https://api.eduwave.id/badges/xp-5000.png',
                'condition_type' => 'xp_milestone',
                'condition_value' => 5000,
                'pearls_reward' => 250,
            ],
            [
                'id' => '33333333-3333-3333-3333-333333333342',
                'name' => 'Konsisten 3 Hari',
                'description' => 'Menjaga streak belajar selama 3 hari berturut-turut.',
                'icon_url' => 'https://api.eduwave.id/badges/streak-3.png',
                'condition_type' => 'streak_days',
                'condition_value' => 3,
                'pearls_reward' => 30,
            ],
            [
                'id' => '33333333-3333-3333-3333-333333333343',
                'name' => 'Konsisten Seminggu',
                'description' => 'Belajar 7 hari berturut-turut tanpa terputus.',
                'icon_url' => 'https://api.eduwave.id/badges/streak-7.png',
                'condition_type' => 'streak_days',
                'condition_value' => 7,
                'pearls_reward' => 80,
            ],
            [
                'id' => '33333333-3333-3333-3333-333333333344',
                'name' => 'Dedikasi Sebulan',
                'description' => 'Menjaga streak belajar selama 30 hari.',
                'icon_url' => 'https://api.eduwave.id/badges/streak-30.png',
                'condition_type' => 'streak_days',
                'condition_value' => 30,
                'pearls_reward' => 300,
            ],
        ];

        $created = [];
        foreach ($achievements as $data) {
            $created[] = Achievement::create($data);
        }

        // Award achievements to users matching thresholds
        $users = User::all();
        foreach ($users as $u) {
            foreach ($created as $ach) {
                $earned = false;
                if ($ach->condition_type === 'xp_milestone' && $u->xp >= $ach->condition_value) {
                    $earned = true;
                } elseif ($ach->condition_type === 'streak_days' && $u->streak_days >= $ach->condition_value) {
                    $earned = true;
                }

                if ($earned) {
                    UserAchievement::firstOrCreate([
                        'user_id' => $u->id,
                        'achievement_id' => $ach->id,
                    ], [
                        'earned_at' => now()->subDays(rand(1, 15)),
                    ]);
                }
            }
        }
    }
}
