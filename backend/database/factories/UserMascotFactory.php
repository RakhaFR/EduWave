<?php

namespace Database\Factories;

use App\Models\Mascot;
use App\Models\User;
use App\Models\UserMascot;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<UserMascot>
 */
class UserMascotFactory extends Factory
{
    protected $model = UserMascot::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'mascot_id' => Mascot::factory(),
            'is_active' => fake()->boolean(),
            'accessories' => [
                'hat' => fake()->word(),
                'glasses' => fake()->randomElement(['none', 'sun', 'round']),
            ],
            'unlocked_at' => now()->subDays(fake()->numberBetween(1, 30)),
        ];
    }
}
