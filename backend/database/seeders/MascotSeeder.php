<?php

namespace Database\Seeders;

use App\Models\Mascot;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Storage;

class MascotSeeder extends Seeder
{
    public function run(): void
    {
        $colors = [
            'biru' => 'Biru',
            'biru-muda' => 'Biru Muda',
            'biru-tua' => 'Biru Tua',
            'hijau' => 'Hijau',
            'kuning' => 'Kuning',
            'merah' => 'Merah',
            'pink' => 'Pink',
            'putih' => 'Putih',
        ];
        $prices = [1 => 50, 2 => 150, 3 => 350, 4 => 700];
        $rarities = [1 => 'common', 2 => 'rare', 3 => 'epic', 4 => 'legendary'];

        Mascot::query()->delete();

        foreach ($colors as $colorIndex => $color) {
            $index = array_search($colorIndex, array_keys($colors), true) + 1;

            foreach ($prices as $level => $price) {
                Mascot::create([
                    'id' => sprintf('1000000%d-0000-4000-8000-%012d', $index, $level),
                    'name' => "Ubur-ubur {$color} {$level}",
                    'avatar_url' => Storage::disk('public')->url("mascots/{$colorIndex}/level-{$level}.webp"),
                    'description' => "Ubur-ubur {$color} level {$level} yang menemani perjalanan belajar di EduWave.",
                    'unlock_cost' => $price,
                    'rarity' => $rarities[$level],
                    'category' => 'ubur-ubur',
                ]);
            }
        }

        $defaultMascot = Mascot::findOrFail(Mascot::DEFAULT_ID);

        User::query()->each(function (User $user) use ($defaultMascot): void {
            $user->mascots()->attach($defaultMascot->id, [
                'is_active' => true,
                'accessories' => null,
                'unlocked_at' => now(),
            ]);
        });
    }
}
