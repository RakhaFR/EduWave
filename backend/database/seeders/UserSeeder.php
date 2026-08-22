<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Fixed Core Accounts for manual testing and predictable credentials
        User::create([
            'username' => 'admin_wave',
            'email' => 'admin@eduwave.id',
            'password' => Hash::make('password123'),
            'full_name' => 'Administrator Wave',
            'role' => 'admin',
            'avatar_url' => 'https://api.dicebear.com/7.x/bottts/svg?seed=admin_wave',
            'pearls' => 2500,
            'xp' => 12500,
            'level' => 15,
            'streak_days' => 45,
            'is_active' => true,
        ]);

        User::create([
            'username' => 'kapten_ocean',
            'email' => 'instructor@eduwave.id',
            'password' => Hash::make('password123'),
            'full_name' => 'Kapten Bahari',
            'role' => 'instructor',
            'avatar_url' => 'https://api.dicebear.com/7.x/avataaars/svg?seed=kapten_ocean',
            'pearls' => 1200,
            'xp' => 8400,
            'level' => 10,
            'streak_days' => 21,
            'is_active' => true,
        ]);

        User::create([
            'username' => 'penjelajah_bahari',
            'email' => 'student@eduwave.id',
            'password' => Hash::make('password123'),
            'full_name' => 'Penjelajah Samudra',
            'role' => 'student',
            'avatar_url' => 'https://api.dicebear.com/7.x/avataaars/svg?seed=penjelajah_bahari',
            'pearls' => 350,
            'xp' => 1850,
            'level' => 4,
            'streak_days' => 7,
            'is_active' => true,
        ]);

        // Additional Instructors
        $instructors = [
            [
                'username' => 'dr_nautilus',
                'email' => 'nautilus@eduwave.id',
                'full_name' => 'Dr. Nautilus Oceanus',
                'pearls' => 1500,
                'xp' => 9200,
                'level' => 11,
                'streak_days' => 14,
            ],
            [
                'username' => 'prof_sonar',
                'email' => 'sonar@eduwave.id',
                'full_name' => 'Prof. Marina Sonar',
                'pearls' => 1800,
                'xp' => 11000,
                'level' => 13,
                'streak_days' => 30,
            ],
            [
                'username' => 'kapten_maritim',
                'email' => 'maritim@eduwave.id',
                'full_name' => 'Kapten Surya Maritim',
                'pearls' => 950,
                'xp' => 6500,
                'level' => 8,
                'streak_days' => 10,
            ],
        ];

        foreach ($instructors as $inst) {
            User::create([
                'username' => $inst['username'],
                'email' => $inst['email'],
                'password' => Hash::make('password123'),
                'full_name' => $inst['full_name'],
                'role' => 'instructor',
                'avatar_url' => "https://api.dicebear.com/7.x/avataaars/svg?seed={$inst['username']}",
                'pearls' => $inst['pearls'],
                'xp' => $inst['xp'],
                'level' => $inst['level'],
                'streak_days' => $inst['streak_days'],
                'is_active' => true,
            ]);
        }

        // Generate 40 active student accounts for leaderboard & study rooms
        $indonesianNames = [
            'Aditya Pratama', 'Budi Santoso', 'Citra Dewi', 'Dian Sastro', 'Eko Prasetyo',
            'Fajar Nugraha', 'Gita Gutawa', 'Hendra Wijaya', 'Indah Permata', 'Joko Widodo',
            'Kartika Sari', 'Lestari Putri', 'Mulyadi Kurniawan', 'Nadia Safitri', 'Oki Setiana',
            'Putri Ayu', 'Qori Sandioriva', 'Rahmat Hidayat', 'Siti Rahmawati', 'Taufik Hidayat',
            'Utami Lestari', 'Vina Panduwinata', 'Wahyu Hidayat', 'Xavier Pratama', 'Yuni Shara',
            'Zainal Abidin', 'Ahmad Dahlan', 'Bambang Pamungkas', 'Chandra Wijaya', 'Dewi Sandra',
            'Endang Soekamti', 'Firman Utina', 'Ginanjar Rahayu', 'Hasan Basri', 'Irfan Bachdim',
            'Julia Perez', 'Katon Bagaskara', 'Lukman Sardi', 'Megawati Soekarno', 'Nining Meida',
        ];

        foreach ($indonesianNames as $index => $name) {
            $username = strtolower(str_replace(' ', '_', $name)).'_'.($index + 1);
            $xp = rand(100, 15000);
            $level = max(1, (int) floor($xp / 500) + 1);
            $pearls = rand(50, 3000);
            $streak = rand(0, 40);

            User::create([
                'username' => $username,
                'email' => "{$username}@student.eduwave.id",
                'password' => Hash::make('password123'),
                'full_name' => $name,
                'role' => 'student',
                'avatar_url' => "https://api.dicebear.com/7.x/avataaars/svg?seed={$username}",
                'pearls' => $pearls,
                'xp' => $xp,
                'level' => $level,
                'streak_days' => $streak,
                'is_active' => true,
            ]);
        }
    }
}
