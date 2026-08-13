<?php

namespace Database\Factories;

use App\Models\RoomMessage;
use App\Models\StudyRoom;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<RoomMessage>
 */
class RoomMessageFactory extends Factory
{
    protected $model = RoomMessage::class;

    public function definition(): array
    {
        return [
            'id' => (string) Str::uuid(),
            'room_id' => StudyRoom::factory(),
            'user_id' => User::factory(),
            'content' => fake()->sentence(),
            'type' => fake()->randomElement(['text', 'file', 'ai']),
            'sent_at' => now()->subMinutes(fake()->numberBetween(1, 1440)),
        ];
    }
}
