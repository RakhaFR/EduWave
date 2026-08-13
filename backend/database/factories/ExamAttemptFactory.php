<?php

namespace Database\Factories;

use App\Models\Exam;
use App\Models\ExamAttempt;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<ExamAttempt>
 */
class ExamAttemptFactory extends Factory
{
    protected $model = ExamAttempt::class;

    public function definition(): array
    {
        return [
            'id' => (string) Str::uuid(),
            'user_id' => User::factory(),
            'exam_id' => Exam::factory(),
            'score' => fake()->randomFloat(2, 0, 100),
            'passed' => fake()->boolean(),
            'answers' => [
                'Q1' => fake()->randomElement(['A', 'B', 'C', 'D']),
                'Q2' => fake()->randomElement(['A', 'B', 'C', 'D']),
            ],
            'started_at' => now()->subMinutes(fake()->numberBetween(5, 120)),
            'submitted_at' => fake()->optional()->dateTimeBetween('-2 days', 'now'),
            'expires_at' => now()->addMinutes(fake()->numberBetween(30, 300)),
        ];
    }
}
