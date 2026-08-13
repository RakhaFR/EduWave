<?php

namespace Database\Factories;

use App\Models\Mascot;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Mascot>
 */
class MascotFactory extends Factory
{
    protected $model = Mascot::class;

    public function definition(): array
    {
        $rarity = fake()->randomElement(['common', 'rare', 'epic', 'legendary']);

        return [
            'id' => (string) Str::uuid(),
            'name' => fake()->words(2, true),
            'avatar_url' => fake()->imageUrl(200, 200, 'animals'),
            'description' => fake()->sentence(),
            'unlock_cost' => fake()->numberBetween(0, 500),
            'rarity' => $rarity,
            'category' => fake()->randomElement(['forest', 'ocean', 'space', 'tech', 'classic']),
        ];
    }
}
