<?php

namespace Database\Factories;

use App\Models\Course;
use App\Models\Exam;
use App\Models\Lesson;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Exam>
 */
class ExamFactory extends Factory
{
    protected $model = Exam::class;

    public function definition(): array
    {
        return [
            'id' => (string) Str::uuid(),
            'course_id' => Course::factory(),
            'lesson_id' => Lesson::factory(),
            'title' => fake()->sentence(4),
            'time_limit_sec' => fake()->randomElement([300, 600, 900, 1800, 3600]),
            'passing_score' => fake()->numberBetween(50, 90),
            'max_attempts' => fake()->numberBetween(1, 5),
            'pearls_reward' => fake()->numberBetween(10, 120),
        ];
    }
}
