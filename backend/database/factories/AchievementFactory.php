<?php

namespace Database\Factories;

use App\Models\Achievement;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Achievement>
 */
class AchievementFactory extends Factory
{
    protected $model = Achievement::class;

    public function definition(): array
    {
        return [
            'id' => (string) Str::uuid(),
            'name' => fake()->sentence(3),
            'description' => fake()->sentence(),
            'icon_url' => fake()->imageUrl(64, 64, 'sports'),
            'condition_type' => fake()->randomElement(['streak', 'xp', 'course_completion', 'lesson_count']),
            'condition_value' => fake()->numberBetween(1, 100),
            'pearls_reward' => fake()->numberBetween(10, 200),
        ];
    }
}
