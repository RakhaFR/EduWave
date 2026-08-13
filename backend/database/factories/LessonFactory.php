<?php

namespace Database\Factories;

use App\Models\Course;
use App\Models\Lesson;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Lesson>
 */
class LessonFactory extends Factory
{
    protected $model = Lesson::class;

    public function definition(): array
    {
        return [
            'id' => (string) Str::uuid(),
            'course_id' => Course::factory(),
            'title' => fake()->sentence(4),
            'type' => fake()->randomElement(['video', 'text', 'quiz']),
            'content' => fake()->optional()->paragraphs(3, true),
            'video_url' => fake()->optional()->url(),
            'duration_minutes' => fake()->numberBetween(5, 60),
            'order' => fake()->numberBetween(1, 20),
            'xp_reward' => fake()->numberBetween(10, 100),
            'is_preview' => fake()->boolean(),
        ];
    }
}
