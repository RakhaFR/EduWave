<?php

namespace Database\Factories;

use App\Models\Achievement;
use App\Models\User;
use App\Models\UserAchievement;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<UserAchievement>
 */
class UserAchievementFactory extends Factory
{
    protected $model = UserAchievement::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'achievement_id' => Achievement::factory(),
            'earned_at' => now()->subDays(fake()->numberBetween(1, 30)),
        ];
    }
}
