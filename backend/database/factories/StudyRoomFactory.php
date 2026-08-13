<?php

namespace Database\Factories;

use App\Models\StudyRoom;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<StudyRoom>
 */
class StudyRoomFactory extends Factory
{
    protected $model = StudyRoom::class;

    public function definition(): array
    {
        return [
            'id' => (string) Str::uuid(),
            'name' => fake()->sentence(3),
            'topic' => fake()->optional()->sentence(),
            'host_user_id' => User::factory(),
            'max_capacity' => fake()->numberBetween(5, 50),
            'is_public' => fake()->boolean(),
            'status' => fake()->randomElement(['active', 'closed']),
        ];
    }
}
