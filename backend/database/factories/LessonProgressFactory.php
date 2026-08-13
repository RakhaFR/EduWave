<?php

namespace Database\Factories;

use App\Models\Lesson;
use App\Models\LessonProgress;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<LessonProgress>
 */
class LessonProgressFactory extends Factory
{
    protected $model = LessonProgress::class;

    public function definition(): array
    {
        return [
            'id' => (string) Str::uuid(),
            'user_id' => User::factory(),
            'lesson_id' => Lesson::factory(),
            'watch_seconds' => fake()->numberBetween(0, 3600),
            'completed_at' => fake()->optional()->dateTimeBetween('-30 days', 'now'),
        ];
    }
}
