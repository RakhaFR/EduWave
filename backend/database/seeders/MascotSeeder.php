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
        $mascot1 = Mascot::create([
            'id' => '11111111-1111-1111-1111-111111111111',
            'name' => 'Lumba-Lumba Cerdas',
            'avatar_url' => 'https://api.eduwave.id/mascots/dolphin.png',
            'description' => 'Maskot lumba-lumba penjelajah samudra',
            'unlock_cost' => 50,
            'rarity' => 'common',
            'category' => 'marine',
        ]);

        Mascot::create([
            'id' => '22222222-2222-2222-2222-222222222222',
            'name' => 'Penyu Bijak',
            'avatar_url' => 'https://api.eduwave.id/mascots/turtle.png',
            'description' => 'Maskot penyu bijak pembawa pengetahuan',
            'unlock_cost' => 100,
            'rarity' => 'rare',
            'category' => 'marine',
        ]);

        // Add a cheap mascot for testing purchase with insufficient pearls
        Mascot::create([
            'id' => '33333333-3333-3333-3333-333333333331',
            'name' => 'Kepiting Gesit',
            'avatar_url' => 'https://api.eduwave.id/mascots/crab.png',
            'description' => 'Maskot kepiting yang lincah dan ceria',
            'unlock_cost' => 500,
            'rarity' => 'epic',
            'category' => 'marine',
        ]);

        $student = User::where('email', 'student@eduwave.id')->first();
        if ($student) {
            UserMascot::create([
                'user_id' => $student->id,
                'mascot_id' => $mascot1->id,
                'is_active' => true,
                'accessories' => ['hat' => 'hat-captain'],
                'unlocked_at' => now(),
            ]);
        }
    }
}
