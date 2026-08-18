<?php

namespace Database\Seeders;

use App\Models\Mascot;
use App\Models\User;
use App\Models\UserMascot;
use Illuminate\Database\Seeder;

class MascotSeeder extends Seeder
{
    public function run(): void
    {
        $mascotsData = [
            [
                'id' => '11111111-1111-1111-1111-111111111111',
                'name' => 'Lumba-Lumba Cerdas',
                'avatar_url' => 'https://api.eduwave.id/mascots/dolphin.png',
                'description' => 'Penjelajah samudra yang ceria dan siap membantu belajar setiap hari.',
                'unlock_cost' => 50,
                'rarity' => 'common',
                'category' => 'marine',
            ],
            [
                'id' => '22222222-2222-2222-2222-222222222222',
                'name' => 'Penyu Bijak',
                'avatar_url' => 'https://api.eduwave.id/mascots/turtle.png',
                'description' => 'Penjaga pengetahuan samudra purba yang penuh wawasan dan ketenangan.',
                'unlock_cost' => 100,
                'rarity' => 'rare',
                'category' => 'marine',
            ],
            [
                'id' => '33333333-3333-3333-3333-333333333331',
                'name' => 'Kepiting Gesit',
                'avatar_url' => 'https://api.eduwave.id/mascots/crab.png',
                'description' => 'Ahli strategi pantai yang cepat, gesit, dan tangguh menyelesaikan kuis.',
                'unlock_cost' => 200,
                'rarity' => 'common',
                'category' => 'marine',
            ],
            [
                'id' => '44444444-4444-4444-4444-444444444441',
                'name' => 'Hiu Samudra',
                'avatar_url' => 'https://api.eduwave.id/mascots/shark.png',
                'description' => 'Pemimpin puncak rantai makanan samudra dengan fokus tinggi.',
                'unlock_cost' => 450,
                'rarity' => 'epic',
                'category' => 'marine',
            ],
            [
                'id' => '55555555-5555-5555-5555-555555555551',
                'name' => 'Gurita Maestro',
                'avatar_url' => 'https://api.eduwave.id/mascots/octopus.png',
                'description' => 'Master multitalenta yang bisa menyelesaikan 8 pelajaran sekaligus.',
                'unlock_cost' => 600,
                'rarity' => 'epic',
                'category' => 'technology',
            ],
            [
                'id' => '66666666-6666-6666-6666-666666666661',
                'name' => 'Pari Manta Anggun',
                'avatar_url' => 'https://api.eduwave.id/mascots/manta.png',
                'description' => 'Penjelajah arus laut dalam yang tenang dan penuh keanggunan.',
                'unlock_cost' => 750,
                'rarity' => 'rare',
                'category' => 'marine',
            ],
            [
                'id' => '77777777-7777-7777-7777-777777777771',
                'name' => 'Paus Abisal',
                'avatar_url' => 'https://api.eduwave.id/mascots/whale.png',
                'description' => 'Raksasa laut dalam pembawa semangat pantang menyerah.',
                'unlock_cost' => 1000,
                'rarity' => 'legendary',
                'category' => 'marine',
            ],
            [
                'id' => '88888888-8888-8888-8888-888888888888',
                'name' => 'Kraken Legend',
                'avatar_url' => 'https://api.eduwave.id/mascots/kraken.png',
                'description' => 'Legenda samudra purba yang membimbing penjelajah nomor satu di leaderboard.',
                'unlock_cost' => 2500,
                'rarity' => 'legendary',
                'category' => 'special',
            ],
        ];

        $createdMascots = [];
        foreach ($mascotsData as $data) {
            $createdMascots[] = Mascot::create($data);
        }

        // Unlock default mascot for student@eduwave.id
        $student = User::where('email', 'student@eduwave.id')->first();
        if ($student && isset($createdMascots[0])) {
            UserMascot::create([
                'user_id' => $student->id,
                'mascot_id' => $createdMascots[0]->id,
                'is_active' => true,
                'accessories' => ['hat' => 'hat-captain', 'glasses' => 'sunglasses-cool'],
                'unlocked_at' => now()->subDays(10),
            ]);
            UserMascot::create([
                'user_id' => $student->id,
                'mascot_id' => $createdMascots[1]->id,
                'is_active' => false,
                'accessories' => null,
                'unlocked_at' => now()->subDays(2),
            ]);
        }

        // Unlock random mascots for other active students
        $students = User::where('role', 'student')->where('email', '!=', 'student@eduwave.id')->get();
        foreach ($students as $index => $u) {
            $unlockedCount = min(count($createdMascots), rand(1, 3));
            for ($i = 0; $i < $unlockedCount; $i++) {
                UserMascot::firstOrCreate([
                    'user_id' => $u->id,
                    'mascot_id' => $createdMascots[$i]->id,
                ], [
                    'is_active' => ($i === 0),
                    'accessories' => $i === 0 ? ['hat' => 'captain_hat'] : null,
                    'unlocked_at' => now()->subDays(rand(1, 20)),
                ]);
            }
        }
    }
}
