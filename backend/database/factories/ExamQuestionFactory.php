<?php

namespace Database\Factories;

use App\Models\Exam;
use App\Models\ExamQuestion;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<ExamQuestion>
 */
class ExamQuestionFactory extends Factory
{
    protected $model = ExamQuestion::class;

    public function definition(): array
    {
        $options = [fake()->word(), fake()->word(), fake()->word(), fake()->word()];

        return [
            'id' => (string) Str::uuid(),
            'exam_id' => Exam::factory(),
            'question_text' => fake()->sentence(10),
            'type' => fake()->randomElement(['multiple_choice', 'short_answer']),
            'options' => $options,
            'correct_answer' => 'A',
            'explanation' => fake()->optional()->sentence(),
            'points' => fake()->numberBetween(1, 10),
            'order' => fake()->numberBetween(1, 20),
        ];
    }
}
