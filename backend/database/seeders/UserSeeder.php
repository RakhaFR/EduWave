<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        User::create([
            'username' => 'admin_wave',
            'email' => 'admin@eduwave.id',
            'password' => Hash::make('password123'),
            'full_name' => 'Administrator Wave',
            'role' => 'admin',
            'avatar_url' => 'https://api.eduwave.id/avatars/admin.png',
            'pearls' => 1000,
            'xp' => 5000,
            'level' => 10,
            'streak_days' => 30,
            'is_active' => true,
        ]);

        User::create([
            'username' => 'kapten_ocean',
            'email' => 'instructor@eduwave.id',
            'password' => Hash::make('password123'),
            'full_name' => 'Kapten Bahari',
            'role' => 'instructor',
            'avatar_url' => 'https://api.eduwave.id/avatars/instructor.png',
            'pearls' => 500,
            'xp' => 2500,
            'level' => 5,
            'streak_days' => 14,
            'is_active' => true,
        ]);

        User::create([
            'username' => 'penjelajah_bahari',
            'email' => 'student@eduwave.id',
            'password' => Hash::make('password123'),
            'full_name' => 'Penjelajah Samudra',
            'role' => 'student',
            'avatar_url' => 'https://api.eduwave.id/avatars/student.png',
            'pearls' => 100,
            'xp' => 500,
            'level' => 2,
            'streak_days' => 3,
            'is_active' => true,
        ]);
    }
}
