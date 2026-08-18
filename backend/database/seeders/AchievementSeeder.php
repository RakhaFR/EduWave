<?php

namespace Database\Seeders;

use App\Models\Achievement;
use Illuminate\Database\Seeder;

class AchievementSeeder extends Seeder
{
    public function run(): void
    {
        Achievement::create([
            'id' => '33333333-3333-3333-3333-333333333333',
            'name' => 'Penyelam Pertama',
            'description' => 'Menyelesaikan pelajaran pertama Anda',
            'icon_url' => 'https://api.eduwave.id/badges/diver.png',
            'condition_type' => 'lesson_completion',
            'condition_value' => 1,
            'pearls_reward' => 25,
        ]);
    }
}
